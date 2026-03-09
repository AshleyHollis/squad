/**
 * Agent Versioning — commit SHA pinning (M5-6, Issue #129)
 */
import type { AgentDefinition } from '../config/agent-source.js';
export interface VersionPin {
    agentId: string;
    sha: string;
    timestamp: number;
    source: 'local' | 'github';
}
export interface VersionDiff {
    agentId: string;
    from: VersionPin;
    to: VersionPin;
    fields: string[];
}
/** Resolver callback: given agentId + SHA, return the agent at that version. */
export type AgentVersionResolver = (agentId: string, sha: string) => Promise<AgentDefinition | null>;
/** Pin an agent to a specific commit SHA. */
export declare function pinAgentVersion(agentId: string, sha: string, source?: 'local' | 'github'): VersionPin;
/**
 * Resolve a version pin to an agent definition.
 * "latest" SHA resolves via the headResolver callback.
 */
export declare function resolveVersion(pin: VersionPin, resolver: AgentVersionResolver, headResolver?: (agentId: string) => Promise<string>): Promise<AgentDefinition | null>;
/** Compare two version pins and return a diff summary. */
export declare function compareAgentVersions(a: VersionPin, b: VersionPin, resolver: AgentVersionResolver): Promise<VersionDiff>;
/** Get the full version history for an agent. */
export declare function getVersionHistory(agentId: string): VersionPin[];
/** Clear all stored version pins (useful in tests). */
export declare function clearVersionStore(): void;
//# sourceMappingURL=versioning.d.ts.map