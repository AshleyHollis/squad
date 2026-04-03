/**
 * Machine Capability Discovery & Label-Based Routing
 *
 * Enables Ralph to filter issues by machine capabilities.
 * Issues with `needs:*` labels are only processed if the
 * local machine has those capabilities.
 *
 * @see https://github.com/bradygaster/squad/issues/514
 */
/** Deployment mode for capability routing */
export type DeploymentMode = 'agent-per-node' | 'squad-per-pod';
/** Machine capability manifest */
export interface MachineCapabilities {
    machine: string;
    capabilities: string[];
    missing: string[];
    lastUpdated: string;
    /** Pod identifier when running in squad-per-pod mode */
    podId?: string;
}
/** Well-known capability identifiers */
export declare const KNOWN_CAPABILITIES: readonly ["browser", "gpu", "personal-gh", "emu-gh", "azure-cli", "docker", "onedrive", "teams-mcp"];
export type KnownCapability = typeof KNOWN_CAPABILITIES[number];
/**
 * Get the deployment mode from the `SQUAD_DEPLOYMENT_MODE` env var.
 * Defaults to `'agent-per-node'` when unset.
 */
export declare function getDeploymentMode(): DeploymentMode;
/**
 * Get the pod identifier from the `SQUAD_POD_ID` env var.
 * Returns `undefined` when unset.
 */
export declare function getPodId(): string | undefined;
/**
 * Build the path for a pod-specific capabilities manifest.
 *
 * @example
 *   generatePodCapabilitiesPath('/app', 'squad-worker-7b4f6')
 *   // → '/app/.squad/machine-capabilities-squad-worker-7b4f6.json'
 */
export declare function generatePodCapabilitiesPath(teamRoot: string, podId: string): string;
/**
 * Load machine capabilities from the standard location.
 *
 * When `SQUAD_POD_ID` is set **and** `SQUAD_DEPLOYMENT_MODE` is
 * `squad-per-pod`, the search order becomes:
 *   1. `.squad/machine-capabilities-{podId}.json` (pod-specific)
 *   2. `.squad/machine-capabilities.json` (shared fallback)
 *   3. `~/.squad/machine-capabilities.json` (user home fallback)
 *
 * Otherwise (default `agent-per-node` mode):
 *   1. `.squad/machine-capabilities.json` in the team root
 *   2. `~/.squad/machine-capabilities.json` in the user home
 *
 * Returns null if no capabilities file exists (all issues pass through).
 */
export declare function loadCapabilities(teamRoot?: string): Promise<MachineCapabilities | null>;
/**
 * Extract `needs:*` requirements from issue labels.
 *
 * @example
 *   extractNeeds(['bug', 'needs:gpu', 'needs:browser', 'squad:picard'])
 *   // → ['gpu', 'browser']
 */
export declare function extractNeeds(labels: string[]): string[];
/**
 * Check if the machine can handle an issue based on `needs:*` labels.
 *
 * Returns `{ canHandle: true }` if:
 *   - The issue has no `needs:*` labels (any machine can handle it)
 *   - All `needs:*` requirements are in the machine's capabilities
 *
 * Returns `{ canHandle: false, missing: [...] }` if any are missing.
 */
export declare function canHandleIssue(issueLabels: string[], capabilities: MachineCapabilities | null): {
    canHandle: true;
} | {
    canHandle: false;
    missing: string[];
};
/**
 * Filter issues to only those this machine can handle.
 * Issues without `needs:*` labels always pass through.
 */
export declare function filterByCapabilities<T extends {
    labels: {
        name: string;
    }[];
}>(issues: T[], capabilities: MachineCapabilities | null): {
    handled: T[];
    skipped: {
        issue: T;
        missing: string[];
    }[];
};
//# sourceMappingURL=capabilities.d.ts.map