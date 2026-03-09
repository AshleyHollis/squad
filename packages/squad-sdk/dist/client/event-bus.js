/**
 * Cross-Session Event Bus (PRD 1)
 *
 * Pub/sub event bus for session lifecycle events. Enables the coordinator
 * to observe all agent sessions from a single subscription point.
 * Decouples event producers (sessions) from consumers (coordinator, Ralph, UI).
 */
// --- Event Bus ---
export class EventBus {
    handlers = new Map();
    allHandlers = new Set();
    /** Subscribe to a specific event type */
    on(type, handler) {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Set());
        }
        this.handlers.get(type).add(handler);
        // Return unsubscribe function
        return () => {
            this.handlers.get(type)?.delete(handler);
        };
    }
    /** Subscribe to all events */
    onAny(handler) {
        this.allHandlers.add(handler);
        return () => {
            this.allHandlers.delete(handler);
        };
    }
    /** Emit an event to all matching subscribers */
    async emit(event) {
        const typeHandlers = this.handlers.get(event.type) ?? new Set();
        const allPromises = [];
        for (const handler of typeHandlers) {
            const result = handler(event);
            if (result instanceof Promise)
                allPromises.push(result);
        }
        for (const handler of this.allHandlers) {
            const result = handler(event);
            if (result instanceof Promise)
                allPromises.push(result);
        }
        await Promise.all(allPromises);
    }
    /** Remove all handlers */
    clear() {
        this.handlers.clear();
        this.allHandlers.clear();
    }
}
//# sourceMappingURL=event-bus.js.map