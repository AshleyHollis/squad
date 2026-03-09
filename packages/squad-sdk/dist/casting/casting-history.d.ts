/**
 * Casting History (M3-10, Issue #151)
 *
 * Tracks casting decisions over time and makes them queryable.
 * Each record captures who was cast, when, and from which config.
 */
import type { CastMember, CastingConfig, UniverseId, AgentRole } from './casting-engine.js';
export interface CastingRecordMember {
    name: string;
    role: AgentRole;
}
export interface CastingRecord {
    /** When this cast was created */
    timestamp: string;
    /** Universe used for casting */
    universe: UniverseId;
    /** Number of agents cast */
    teamSize: number;
    /** Summary of each member */
    members: CastingRecordMember[];
    /** Snapshot of the config used */
    configSnapshot: CastingConfig;
}
export interface SerializedCastingHistory {
    version: 1;
    records: CastingRecord[];
}
export declare class CastingHistory {
    private records;
    /**
     * Record a casting decision.
     *
     * @param team - The cast team produced by CastingEngine
     * @param config - The CastingConfig that produced this team
     * @param timestamp - Optional override (defaults to now)
     */
    recordCast(team: CastMember[], config: CastingConfig, timestamp?: Date): CastingRecord;
    /** Return all casting records, oldest first. */
    getCastHistory(): CastingRecord[];
    /**
     * Return casting records that include a specific agent name.
     * Useful for answering "when was Verbal last cast?"
     */
    getAgentHistory(agentName: string): CastingRecord[];
    /** Number of recorded casts. */
    get size(): number;
    /** Clear all history. */
    clear(): void;
    /** Serialize history to a plain object suitable for JSON / config persistence. */
    serializeHistory(): SerializedCastingHistory;
    /** Restore history from a previously serialized object. Replaces current records. */
    deserializeHistory(data: SerializedCastingHistory): void;
}
//# sourceMappingURL=casting-history.d.ts.map