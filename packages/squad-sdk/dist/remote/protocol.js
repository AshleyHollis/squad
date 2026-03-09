/**
 * Squad Remote Control — Wire Protocol Types
 *
 * JSON-based protocol for WebSocket communication between
 * the RemoteBridge (server) and PWA clients.
 */
// ─── Protocol Version ────────────────────────────────────────
export const RC_PROTOCOL_VERSION = '1.0';
// ─── Serialization helpers ───────────────────────────────────
export function serializeEvent(event) {
    return JSON.stringify(event);
}
export function parseCommand(data) {
    try {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed.type === 'string') {
            return parsed;
        }
        return null;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=protocol.js.map