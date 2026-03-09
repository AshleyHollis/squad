/**
 * Conflict Resolution on Import (M5-9, Issue #133)
 */
import type { SquadConfig } from '../config/schema.js';
/** Incoming config bundle for conflict detection. */
export interface IncomingBundle {
    version: string;
    config: Partial<SquadConfig>;
    agents?: Array<{
        name: string;
        charter: string;
    }>;
    skills?: Array<{
        id: string;
        content: string;
    }>;
}
export type ConflictType = 'added' | 'modified' | 'removed';
export interface Conflict {
    path: string;
    existingValue: unknown;
    incomingValue: unknown;
    type: ConflictType;
}
export type ConflictStrategy = 'keep-existing' | 'use-incoming' | 'merge' | 'manual';
/** Detect conflicts between an existing config and an incoming bundle. */
export declare function detectConflicts(existing: SquadConfig, incoming: IncomingBundle): Conflict[];
/** Resolve conflicts using the given strategy. Returns a merged SquadConfig. */
export declare function resolveConflicts(existing: SquadConfig, conflicts: Conflict[], strategy: ConflictStrategy): SquadConfig;
/** Generate a human-readable markdown conflict report. */
export declare function generateConflictReport(conflicts: Conflict[]): string;
//# sourceMappingURL=conflicts.d.ts.map