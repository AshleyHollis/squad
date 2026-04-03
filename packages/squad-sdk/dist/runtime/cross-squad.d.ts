/**
 * Cross-Squad Orchestration — discovery, delegation, and manifest support.
 *
 * Enables squads to discover each other via manifests, delegate work
 * across repository boundaries, and track cross-squad issue completion.
 *
 * @module runtime/cross-squad
 */
/** Contact information for reaching a squad. */
export interface SquadContact {
    /** GitHub repository in "owner/repo" format. */
    repo: string;
    /** Labels to apply when creating issues for this squad. */
    labels?: string[];
}
/** Work types a squad accepts from other squads. */
export type AcceptedWorkType = 'issues' | 'prs';
/**
 * Squad manifest — the public contract a squad exposes for discovery.
 * Stored at `.squad/manifest.json` in a squad's repository.
 */
export interface SquadManifest {
    /** Human-readable squad name (e.g., "platform-squad"). */
    name: string;
    /** Schema version for forward compatibility. */
    version?: string;
    /** One-line description of this squad's purpose. */
    description?: string;
    /** Capability tags (e.g., ["kubernetes", "helm", "monitoring"]). */
    capabilities: string[];
    /** How to reach this squad (repo + labels). */
    contact: SquadContact;
    /** Work types this squad accepts from other squads. */
    accepts: AcceptedWorkType[];
    /** Named skills this squad offers. */
    skills?: string[];
}
/** A discovered squad with its manifest and source location. */
export interface DiscoveredSquad {
    /** Manifest data. */
    manifest: SquadManifest;
    /** How this squad was discovered. */
    source: 'upstream' | 'registry' | 'local';
    /** Upstream name or registry path (for provenance). */
    sourceRef: string;
}
/** Options for creating a cross-squad issue. */
export interface CrossSquadIssueOptions {
    /** Target repo in "owner/repo" format. */
    targetRepo: string;
    /** Issue title (will be prefixed with [cross-squad]). */
    title: string;
    /** Issue body with context and acceptance criteria. */
    body: string;
    /** Labels to apply (squad labels are added automatically). */
    labels?: string[];
}
/** Result of creating a cross-squad issue. */
export interface CrossSquadIssueResult {
    /** Whether the issue was successfully created. */
    success: boolean;
    /** Issue URL if created, or error message if not. */
    url?: string;
    /** Error message if creation failed. */
    error?: string;
}
/** Status of a tracked cross-squad issue. */
export interface CrossSquadWorkStatus {
    /** Issue URL being tracked. */
    url: string;
    /** Current state. */
    state: 'open' | 'closed' | 'unknown';
    /** Issue title (from last poll). */
    title?: string;
    /** Error message if status check failed. */
    error?: string;
}
/** Validate a manifest object has all required fields. */
export declare function validateManifest(data: unknown): data is SquadManifest;
/**
 * Read and parse a squad manifest from a directory path.
 * Looks for `.squad/manifest.json` relative to the given root.
 */
export declare function readManifest(repoPath: string): SquadManifest | null;
/**
 * Discover squads from upstream sources.
 * Reads `.squad/upstream.json` and checks each upstream for a manifest.
 */
export declare function discoverFromUpstreams(squadDir: string): DiscoveredSquad[];
/**
 * Discover squads from a registry file.
 * A registry is a JSON file listing repo paths to check for manifests.
 */
export declare function discoverFromRegistry(registryPath: string): DiscoveredSquad[];
/**
 * Discover all squads from all available sources.
 * Checks upstreams first, then a registry file if present.
 */
export declare function discoverSquads(squadDir: string): DiscoveredSquad[];
/**
 * Build the CLI args for creating a cross-squad issue via `gh issue create`.
 * Returns the argument array (does not execute — callers run the command).
 */
export declare function buildDelegationArgs(options: CrossSquadIssueOptions): string[];
/**
 * Build the CLI args for checking a cross-squad issue status via `gh`.
 * Parses an issue URL into --repo and issue number.
 */
export declare function buildStatusCheckArgs(issueUrl: string): string[] | null;
/**
 * Parse the JSON output from `gh issue view --json state,title`.
 */
export declare function parseIssueStatus(jsonOutput: string, issueUrl: string): CrossSquadWorkStatus;
/** Format discovered squads for terminal display. */
export declare function formatDiscoveryTable(squads: DiscoveredSquad[]): string;
/** Find a squad by name from a list of discovered squads. */
export declare function findSquadByName(squads: DiscoveredSquad[], name: string): DiscoveredSquad | undefined;
//# sourceMappingURL=cross-squad.d.ts.map