/**
 * Cross-Squad Orchestration — discovery, delegation, and manifest support.
 *
 * Enables squads to discover each other via manifests, delegate work
 * across repository boundaries, and track cross-squad issue completion.
 *
 * @module runtime/cross-squad
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
// ============================================================================
// Manifest Operations
// ============================================================================
/** Validate a manifest object has all required fields. */
export function validateManifest(data) {
    if (typeof data !== 'object' || data === null)
        return false;
    const obj = data;
    if (typeof obj['name'] !== 'string' || obj['name'].length === 0)
        return false;
    if (!Array.isArray(obj['capabilities']))
        return false;
    if (!Array.isArray(obj['accepts']))
        return false;
    if (typeof obj['contact'] !== 'object' || obj['contact'] === null)
        return false;
    const contact = obj['contact'];
    if (typeof contact['repo'] !== 'string' || contact['repo'].length === 0)
        return false;
    // Validate accepts values
    const validAccepts = new Set(['issues', 'prs']);
    for (const a of obj['accepts']) {
        if (typeof a !== 'string' || !validAccepts.has(a))
            return false;
    }
    return true;
}
/**
 * Read and parse a squad manifest from a directory path.
 * Looks for `.squad/manifest.json` relative to the given root.
 */
export function readManifest(repoPath) {
    const manifestPath = join(repoPath, '.squad', 'manifest.json');
    if (!existsSync(manifestPath))
        return null;
    try {
        const raw = readFileSync(manifestPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (!validateManifest(parsed))
            return null;
        return parsed;
    }
    catch {
        return null;
    }
}
/**
 * Discover squads from upstream sources.
 * Reads `.squad/upstream.json` and checks each upstream for a manifest.
 */
export function discoverFromUpstreams(squadDir) {
    const upstreamPath = join(squadDir, 'upstream.json');
    if (!existsSync(upstreamPath))
        return [];
    let config;
    try {
        config = JSON.parse(readFileSync(upstreamPath, 'utf8'));
    }
    catch {
        return [];
    }
    if (!Array.isArray(config.upstreams))
        return [];
    const discovered = [];
    for (const upstream of config.upstreams) {
        if (upstream.type === 'local' && upstream.source) {
            const manifest = readManifest(upstream.source);
            if (manifest) {
                discovered.push({
                    manifest,
                    source: 'upstream',
                    sourceRef: upstream.name,
                });
            }
        }
        else if (upstream.type === 'git') {
            // For git upstreams, check the cached clone directory
            const cloneDir = join(squadDir, '_upstream_repos', upstream.name);
            const manifest = readManifest(cloneDir);
            if (manifest) {
                discovered.push({
                    manifest,
                    source: 'upstream',
                    sourceRef: upstream.name,
                });
            }
        }
    }
    return discovered;
}
/**
 * Discover squads from a registry file.
 * A registry is a JSON file listing repo paths to check for manifests.
 */
export function discoverFromRegistry(registryPath) {
    if (!existsSync(registryPath))
        return [];
    let entries;
    try {
        const raw = readFileSync(registryPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed))
            return [];
        entries = parsed;
    }
    catch {
        return [];
    }
    const discovered = [];
    for (const entry of entries) {
        if (typeof entry.path === 'string') {
            const manifest = readManifest(entry.path);
            if (manifest) {
                discovered.push({
                    manifest,
                    source: 'registry',
                    sourceRef: entry.name || entry.path,
                });
            }
        }
    }
    return discovered;
}
/**
 * Discover all squads from all available sources.
 * Checks upstreams first, then a registry file if present.
 */
export function discoverSquads(squadDir) {
    const fromUpstreams = discoverFromUpstreams(squadDir);
    const registryPath = join(squadDir, 'squad-registry.json');
    const fromRegistry = discoverFromRegistry(registryPath);
    // Deduplicate by manifest name (upstreams take priority)
    const seen = new Set(fromUpstreams.map(d => d.manifest.name));
    const merged = [...fromUpstreams];
    for (const d of fromRegistry) {
        if (!seen.has(d.manifest.name)) {
            seen.add(d.manifest.name);
            merged.push(d);
        }
    }
    return merged;
}
// ============================================================================
// Delegation
// ============================================================================
/**
 * Build the CLI args for creating a cross-squad issue via `gh issue create`.
 * Returns the argument array (does not execute — callers run the command).
 */
export function buildDelegationArgs(options) {
    const title = options.title.startsWith('[cross-squad]')
        ? options.title
        : `[cross-squad] ${options.title}`;
    const args = [
        'issue', 'create',
        '--repo', options.targetRepo,
        '--title', title,
        '--body', options.body,
    ];
    const labels = [...(options.labels || [])];
    if (!labels.includes('squad:cross-squad')) {
        labels.push('squad:cross-squad');
    }
    for (const label of labels) {
        args.push('--label', label);
    }
    return args;
}
/**
 * Build the CLI args for checking a cross-squad issue status via `gh`.
 * Parses an issue URL into --repo and issue number.
 */
export function buildStatusCheckArgs(issueUrl) {
    // Parse GitHub issue URL: https://github.com/owner/repo/issues/123
    const match = /github\.com\/([^/]+\/[^/]+)\/issues\/(\d+)/.exec(issueUrl);
    if (!match)
        return null;
    const repo = match[1];
    const number = match[2];
    return ['issue', 'view', '--repo', repo, number, '--json', 'state,title'];
}
/**
 * Parse the JSON output from `gh issue view --json state,title`.
 */
export function parseIssueStatus(jsonOutput, issueUrl) {
    try {
        const data = JSON.parse(jsonOutput);
        return {
            url: issueUrl,
            state: data.state === 'CLOSED' ? 'closed' : data.state === 'OPEN' ? 'open' : 'unknown',
            title: data.title,
        };
    }
    catch {
        return { url: issueUrl, state: 'unknown', error: 'Failed to parse issue status' };
    }
}
// ============================================================================
// Display Helpers
// ============================================================================
/** Format discovered squads for terminal display. */
export function formatDiscoveryTable(squads) {
    if (squads.length === 0) {
        return 'No squads discovered. Add upstreams with "squad upstream add" or create a squad-registry.json.';
    }
    const lines = ['\nDiscovered squads:\n'];
    for (const s of squads) {
        const caps = s.manifest.capabilities.slice(0, 5).join(', ');
        const capsSuffix = s.manifest.capabilities.length > 5 ? `, +${s.manifest.capabilities.length - 5} more` : '';
        const accepts = s.manifest.accepts.join(', ');
        lines.push(`  ${s.manifest.name}  →  ${s.manifest.contact.repo}  (${caps}${capsSuffix})`);
        lines.push(`    Accepts: ${accepts}  |  Source: ${s.source} (${s.sourceRef})`);
        if (s.manifest.description) {
            lines.push(`    ${s.manifest.description}`);
        }
    }
    lines.push('');
    return lines.join('\n');
}
/** Find a squad by name from a list of discovered squads. */
export function findSquadByName(squads, name) {
    return squads.find(s => s.manifest.name === name);
}
//# sourceMappingURL=cross-squad.js.map