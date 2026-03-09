/**
 * Casting History (M3-10, Issue #151)
 *
 * Tracks casting decisions over time and makes them queryable.
 * Each record captures who was cast, when, and from which config.
 */
// --- CastingHistory ---
export class CastingHistory {
    records = [];
    /**
     * Record a casting decision.
     *
     * @param team - The cast team produced by CastingEngine
     * @param config - The CastingConfig that produced this team
     * @param timestamp - Optional override (defaults to now)
     */
    recordCast(team, config, timestamp) {
        const record = {
            timestamp: (timestamp ?? new Date()).toISOString(),
            universe: config.universe,
            teamSize: team.length,
            members: team.map((m) => ({ name: m.name, role: m.role })),
            configSnapshot: { ...config },
        };
        this.records.push(record);
        return record;
    }
    /** Return all casting records, oldest first. */
    getCastHistory() {
        return [...this.records];
    }
    /**
     * Return casting records that include a specific agent name.
     * Useful for answering "when was Verbal last cast?"
     */
    getAgentHistory(agentName) {
        return this.records.filter((r) => r.members.some((m) => m.name === agentName));
    }
    /** Number of recorded casts. */
    get size() {
        return this.records.length;
    }
    /** Clear all history. */
    clear() {
        this.records = [];
    }
    // --- Serialization for config round-trip ---
    /** Serialize history to a plain object suitable for JSON / config persistence. */
    serializeHistory() {
        return {
            version: 1,
            records: this.records.map((r) => ({ ...r })),
        };
    }
    /** Restore history from a previously serialized object. Replaces current records. */
    deserializeHistory(data) {
        if (!data || data.version !== 1 || !Array.isArray(data.records)) {
            throw new Error('Invalid casting history data: expected version 1 with records array');
        }
        this.records = data.records.map((r) => ({ ...r }));
    }
}
//# sourceMappingURL=casting-history.js.map