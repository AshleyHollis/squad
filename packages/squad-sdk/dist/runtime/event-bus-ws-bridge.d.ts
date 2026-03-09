/**
 * EventBus to WebSocket Bridge (Issue #304)
 *
 * Broadcasts EventBus events over a WebSocket server so external
 * consumers (e.g., SquadOffice visualization) can subscribe to
 * real-time SDK events without coupling to OTel.
 *
 * @module runtime/event-bus-ws-bridge
 */
import type { EventBus } from './event-bus.js';
export interface WSBridgeOptions {
    /** WebSocket server port. Defaults to 6277. */
    port?: number;
    /** Optional host to bind to. Defaults to '127.0.0.1'. */
    host?: string;
}
export interface WSBridgeHandle {
    /** Stop the bridge and close the WebSocket server. */
    close: () => Promise<void>;
    /** The port the WebSocket server is listening on. */
    port: number;
}
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
export declare function startWSBridge(bus: EventBus, options?: WSBridgeOptions): WSBridgeHandle;
//# sourceMappingURL=event-bus-ws-bridge.d.ts.map