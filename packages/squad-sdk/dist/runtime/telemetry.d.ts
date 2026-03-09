/**
 * Telemetry & Update Notifications (M4-7, Issue #108)
 *
 * Privacy-first, opt-in telemetry collection for Squad.
 * No PII, no code content — only aggregate usage metrics.
 *
 * @module runtime/telemetry
 */
/** Recognised telemetry event names. */
export type TelemetryEventName = 'squad.init' | 'squad.run' | 'squad.agent.spawn' | 'squad.error' | 'squad.upgrade';
/** A single telemetry event. */
export interface TelemetryEvent {
    /** Event name */
    name: TelemetryEventName;
    /** Arbitrary metadata (must not contain PII or code) */
    properties?: Record<string, string | number | boolean>;
    /** Timestamp (defaults to Date.now()) */
    timestamp?: number;
}
/** Configuration for telemetry. */
export interface TelemetryConfig {
    /** Master switch — disabled by default */
    enabled: boolean;
    /** HTTP endpoint for flushing events */
    endpoint?: string;
    /** Whether to strip identifying data even from properties */
    anonymize?: boolean;
    /** Event names to exclude from collection */
    excludeEvents?: TelemetryEventName[];
}
/** Pluggable transport — how events are actually sent. */
export type TelemetryTransport = (events: TelemetryEvent[], endpoint: string) => Promise<void>;
/** Register a custom transport for flushing events. */
export declare function setTelemetryTransport(fn: TelemetryTransport): void;
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
export declare class TelemetryCollector {
    private queue;
    private config;
    constructor(config?: Partial<TelemetryConfig>);
    /** Returns the current consent (enabled) status. */
    getConsentStatus(): boolean;
    /** Set consent status. When false, collectEvent becomes a no-op. */
    setConsent(enabled: boolean): void;
    /**
     * Queue a telemetry event.
     *
     * Does nothing when consent is not given or the event name is excluded.
     */
    collectEvent(event: TelemetryEvent): void;
    /**
     * Send all queued events via the configured transport, then clear the queue.
     * Returns the number of events flushed.
     */
    flush(): Promise<number>;
    /** Return the number of queued (unflushed) events. */
    get pendingCount(): number;
    /** Discard all queued events without sending. */
    drain(): void;
    /** Return a copy of the current config. */
    getConfig(): Readonly<TelemetryConfig>;
}
/**
 * Decide whether the user should be notified about available updates.
 *
 * @param lastCheck - Timestamp of the last update check
 * @param intervalMs - Minimum milliseconds between notifications
 * @returns true if enough time has elapsed since the last check
 */
export declare function shouldNotifyUpdate(lastCheck: Date, intervalMs: number): boolean;
//# sourceMappingURL=telemetry.d.ts.map