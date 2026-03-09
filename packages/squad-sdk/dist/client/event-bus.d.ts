/**
 * Cross-Session Event Bus (PRD 1)
 *
 * Pub/sub event bus for session lifecycle events. Enables the coordinator
 * to observe all agent sessions from a single subscription point.
 * Decouples event producers (sessions) from consumers (coordinator, Ralph, UI).
 */
export type SquadEventType = 'session.created' | 'session.destroyed' | 'session.status_changed' | 'session.message' | 'session.tool_call' | 'session.error' | 'agent.milestone' | 'coordinator.routing' | 'pool.health';
export interface SquadEvent {
    type: SquadEventType;
    sessionId?: string;
    agentName?: string;
    payload: unknown;
    timestamp: Date;
}
export type EventHandler = (event: SquadEvent) => void | Promise<void>;
export declare class EventBus {
    private handlers;
    private allHandlers;
    /** Subscribe to a specific event type */
    on(type: SquadEventType, handler: EventHandler): () => void;
    /** Subscribe to all events */
    onAny(handler: EventHandler): () => void;
    /** Emit an event to all matching subscribers */
    emit(event: SquadEvent): Promise<void>;
    /** Remove all handlers */
    clear(): void;
}
//# sourceMappingURL=event-bus.d.ts.map