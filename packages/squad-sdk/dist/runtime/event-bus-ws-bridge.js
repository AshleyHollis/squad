/**
 * EventBus to WebSocket Bridge (Issue #304)
 *
 * Broadcasts EventBus events over a WebSocket server so external
 * consumers (e.g., SquadOffice visualization) can subscribe to
 * real-time SDK events without coupling to OTel.
 *
 * @module runtime/event-bus-ws-bridge
 */
import { WebSocketServer, WebSocket } from 'ws';
/**
 * Start a WebSocket server that broadcasts every EventBus event
 * as a JSON message to all connected clients.
 *
 * Message format matches the SquadOffice WSMessage envelope:
 * ```json
 * { "kind": "event", "payload": { ...SquadEvent... } }
 * ```
 *
 * @returns A handle to close the bridge.
 */
export function startWSBridge(bus, options = {}) {
    const port = options.port ?? 6277;
    const host = options.host ?? '127.0.0.1';
    const wss = new WebSocketServer({ port, host });
    const unsubscribe = bus.subscribeAll((event) => {
        const message = JSON.stringify({
            kind: 'event',
            payload: serializeEvent(event),
        });
        for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    });
    return {
        port,
        close: () => new Promise((resolve, reject) => {
            unsubscribe();
            wss.close((err) => (err ? reject(err) : resolve()));
        }),
    };
}
/** Serialize a SquadEvent for JSON transport (Date to ISO string). */
function serializeEvent(event) {
    return {
        type: event.type,
        sessionId: event.sessionId,
        agentName: event.agentName,
        payload: event.payload,
        timestamp: event.timestamp.toISOString(),
    };
}
//# sourceMappingURL=event-bus-ws-bridge.js.map