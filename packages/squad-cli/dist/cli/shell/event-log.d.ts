/**
 * Persistent event log — appends structured events to `.squad/log/squad-events.jsonl`.
 *
 * Survives session restarts. Used by `/logs` to show what happened in prior sessions.
 * All writes are non-fatal — logging must never crash the main flow.
 */
export type SquadEventType = 'coordinator_routed' | 'coordinator_routed_narrative' | 'coordinator_direct' | 'coordinator_fallback' | 'agent_spawn_start' | 'agent_spawn_complete' | 'agent_spawn_error' | 'agent_spawn_stub';
export interface SquadEvent {
    ts: string;
    type: SquadEventType;
    /** Agent name (lowercase) */
    agent?: string;
    /** First 200 chars of the task */
    task?: string;
    /** Duration in ms (spawn complete/error only) */
    durationMs?: number;
    /** Error message (spawn error only) */
    error?: string;
    /**
     * First 500 chars of the raw coordinator response.
     * Only present on coordinator_fallback so you can see what the LLM said vs. what was expected.
     */
    raw?: string;
}
/** Append a single event to `.squad/log/squad-events.jsonl`. */
export declare function writeEventLog(teamRoot: string, event: SquadEvent): void;
/** Read the last `limit` events from `.squad/log/squad-events.jsonl`. */
export declare function readRecentEvents(teamRoot: string, limit?: number): SquadEvent[];
//# sourceMappingURL=event-log.d.ts.map