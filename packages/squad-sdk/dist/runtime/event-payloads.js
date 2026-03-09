/**
 * Typed Event Payloads for SquadEventType (Issue #304)
 *
 * Canonical payload types for every EventBus event type.
 * These are the SDK-owned contracts that downstream consumers
 * (e.g., SquadOffice visualization) depend on.
 *
 * @module runtime/event-payloads
 */
/**
 * Type guard: narrows a SquadEvent to a specific typed event.
 */
export function isSquadEventOfType(event, type) {
    return event.type === type;
}
/**
 * Helper to construct a typed SquadEvent with payload validation at compile time.
 */
export function createSquadEvent(type, payload, options) {
    return {
        type,
        sessionId: options?.sessionId,
        agentName: options?.agentName,
        payload,
        timestamp: new Date(),
    };
}
//# sourceMappingURL=event-payloads.js.map