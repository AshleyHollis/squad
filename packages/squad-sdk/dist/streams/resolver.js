/**
 * SubSquad Resolver — Resolves which SubSquad is active.
 *
 * Resolution order:
 *   1. SQUAD_TEAM env var → look up in SubSquads config
 *   2. .squad-workstream file (gitignored) → contains SubSquad name
 *   3. If exactly one SubSquad is defined in the config, auto-select that SubSquad
 *   4. null (no active SubSquad — single-squad mode / no SubSquads)
 *
 * @module streams/resolver
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
/**
 * Load SubSquads configuration from .squad/workstreams.json.
 *
 * @param squadRoot - Root directory of the project (where .squad/ lives)
 * @returns Parsed SubSquadConfig or null if not found / invalid
 */
export function loadSubSquadsConfig(squadRoot) {
    const configPath = join(squadRoot, '.squad', 'workstreams.json');
    if (!existsSync(configPath)) {
        return null;
    }
    try {
        const raw = readFileSync(configPath, 'utf-8');
        const rawConfig = JSON.parse(raw);
        if (!rawConfig || typeof rawConfig !== 'object') {
            return null;
        }
        const configLike = rawConfig;
        // Derive a sane defaultWorkflow value
        const validWorkflows = ['branch-per-issue', 'direct'];
        const rawWorkflow = typeof configLike.defaultWorkflow === 'string' && configLike.defaultWorkflow.trim() !== ''
            ? configLike.defaultWorkflow
            : 'branch-per-issue';
        const defaultWorkflow = validWorkflows.includes(rawWorkflow)
            ? rawWorkflow
            : 'branch-per-issue';
        const workstreamsRaw = configLike.workstreams;
        if (!Array.isArray(workstreamsRaw)) {
            return null;
        }
        const workstreams = workstreamsRaw
            .filter(entry => entry && typeof entry === 'object')
            .map(entry => {
            const e = entry;
            if (typeof e.name !== 'string' || typeof e.labelFilter !== 'string') {
                return null;
            }
            const normalized = {
                name: e.name,
                labelFilter: e.labelFilter,
            };
            if (Array.isArray(e.folderScope) && e.folderScope.every(item => typeof item === 'string')) {
                normalized.folderScope = e.folderScope;
            }
            if (typeof e.workflow === 'string' && e.workflow.trim() !== '') {
                normalized.workflow = e.workflow;
            }
            else {
                normalized.workflow = defaultWorkflow;
            }
            if (typeof e.description === 'string') {
                normalized.description = e.description;
            }
            return normalized;
        })
            .filter((s) => s !== null);
        if (workstreams.length === 0) {
            return null;
        }
        return { defaultWorkflow, workstreams };
    }
    catch {
        return null;
    }
}
/** @deprecated Use loadSubSquadsConfig instead */
export const loadWorkstreamsConfig = loadSubSquadsConfig;
/** @deprecated Use loadSubSquadsConfig instead */
export const loadStreamsConfig = loadSubSquadsConfig;
/**
 * Find a SubSquad definition by name in a config.
 */
function findSubSquad(config, name) {
    return config.workstreams.find(s => s.name === name);
}
/**
 * Resolve which SubSquad is active for the current environment.
 *
 * @param squadRoot - Root directory of the project
 * @returns ResolvedSubSquad or null if no SubSquad is active
 */
export function resolveSubSquad(squadRoot) {
    const config = loadSubSquadsConfig(squadRoot);
    // 1. SQUAD_TEAM env var
    const envTeam = process.env.SQUAD_TEAM;
    if (envTeam) {
        if (config) {
            const def = findSubSquad(config, envTeam);
            if (def) {
                return { name: envTeam, definition: def, source: 'env' };
            }
        }
        // Env var set but no matching SubSquad config — synthesize a minimal definition
        return {
            name: envTeam,
            definition: {
                name: envTeam,
                labelFilter: `team:${envTeam}`,
            },
            source: 'env',
        };
    }
    // 2. .squad-workstream file
    const workstreamFilePath = join(squadRoot, '.squad-workstream');
    if (existsSync(workstreamFilePath)) {
        try {
            const subsquadName = readFileSync(workstreamFilePath, 'utf-8').trim();
            if (subsquadName) {
                if (config) {
                    const def = findSubSquad(config, subsquadName);
                    if (def) {
                        return { name: subsquadName, definition: def, source: 'file' };
                    }
                }
                // File exists but no config — synthesize
                return {
                    name: subsquadName,
                    definition: {
                        name: subsquadName,
                        labelFilter: `team:${subsquadName}`,
                    },
                    source: 'file',
                };
            }
        }
        catch {
            // Ignore read errors
        }
    }
    // 3. If exactly one SubSquad is defined, auto-select it
    if (config && config.workstreams.length === 1) {
        const def = config.workstreams[0];
        return { name: def.name, definition: def, source: 'config' };
    }
    // 4. No SubSquad detected
    return null;
}
/** @deprecated Use resolveSubSquad instead */
export const resolveWorkstream = resolveSubSquad;
/** @deprecated Use resolveSubSquad instead */
export const resolveStream = resolveSubSquad;
/**
 * Get the GitHub label filter string for a resolved SubSquad.
 *
 * @param subsquad - The resolved SubSquad
 * @returns Label filter string (e.g., "team:ui")
 */
export function getSubSquadLabelFilter(subsquad) {
    return subsquad.definition.labelFilter;
}
/** @deprecated Use getSubSquadLabelFilter instead */
export const getWorkstreamLabelFilter = getSubSquadLabelFilter;
/** @deprecated Use getSubSquadLabelFilter instead */
export const getStreamLabelFilter = getSubSquadLabelFilter;
//# sourceMappingURL=resolver.js.map