/**
 * Telemetry & Update Notifications (M4-7, Issue #108)
 *
 * Privacy-first, opt-in telemetry collection for Squad.
 * No PII, no code content — only aggregate usage metrics.
 *
 * @module runtime/telemetry
 */
// ============================================================================
// Default (no-op) transport
// ============================================================================
let _transport = async () => {
    // no-op until consumer provides a real transport
};
/** Register a custom transport for flushing events. */
export function setTelemetryTransport(fn) {
    _transport = fn;
}
// ============================================================================
// TelemetryCollector
// ============================================================================
/**
 * Opt-in, privacy-respecting telemetry collector.
 *
 * Events are queued in memory and only sent when `flush()` is called.
 * The collector respects the consent flag and never transmits when disabled.
 *
 * ```ts
 * const telemetry = new TelemetryCollector({ enabled: false });
 * telemetry.setConsent(true);
 * telemetry.collectEvent({ name: 'squad.init' });
 * await telemetry.flush();
 * ```
 */
export class TelemetryCollector {
    queue = [];
    config;
    constructor(config) {
        this.config = {
            enabled: false,
            endpoint: '',
            anonymize: false,
            excludeEvents: [],
            ...config,
        };
    }
    // --------------------------------------------------------------------------
    // Consent management
    // --------------------------------------------------------------------------
    /** Returns the current consent (enabled) status. */
    getConsentStatus() {
        return this.config.enabled;
    }
    /** Set consent status. When false, collectEvent becomes a no-op. */
    setConsent(enabled) {
        this.config.enabled = enabled;
    }
    // --------------------------------------------------------------------------
    // Event collection
    // --------------------------------------------------------------------------
    /**
     * Queue a telemetry event.
     *
     * Does nothing when consent is not given or the event name is excluded.
     */
    collectEvent(event) {
        if (!this.config.enabled)
            return;
        if (this.config.excludeEvents?.includes(event.name))
            return;
        const stored = {
            name: event.name,
            properties: this.config.anonymize
                ? undefined
                : event.properties ? { ...event.properties } : undefined,
            timestamp: event.timestamp ?? Date.now(),
        };
        this.queue.push(stored);
    }
    /**
     * Send all queued events via the configured transport, then clear the queue.
     * Returns the number of events flushed.
     */
    async flush() {
        if (!this.config.enabled || this.queue.length === 0)
            return 0;
        const endpoint = this.config.endpoint ?? '';
        const batch = [...this.queue];
        this.queue = [];
        await _transport(batch, endpoint);
        return batch.length;
    }
    /** Return the number of queued (unflushed) events. */
    get pendingCount() {
        return this.queue.length;
    }
    /** Discard all queued events without sending. */
    drain() {
        this.queue = [];
    }
    /** Return a copy of the current config. */
    getConfig() {
        return { ...this.config };
    }
}
// ============================================================================
// Update notification helpers
// ============================================================================
/**
 * Decide whether the user should be notified about available updates.
 *
 * @param lastCheck - Timestamp of the last update check
 * @param intervalMs - Minimum milliseconds between notifications
 * @returns true if enough time has elapsed since the last check
 */
export function shouldNotifyUpdate(lastCheck, intervalMs) {
    const elapsed = Date.now() - lastCheck.getTime();
    return elapsed >= intervalMs;
}
//# sourceMappingURL=telemetry.js.map