/**
 * Resilient @opentelemetry/api wrapper (Issue #247)
 *
 * Re-exports the subset of @opentelemetry/api that Squad uses, with
 * automatic no-op fallbacks when the package is not installed.  This
 * makes telemetry truly optional at runtime — the SDK never crashes
 * due to a missing OpenTelemetry dependency.
 *
 * @module runtime/otel-api
 */
declare const _noopTracer: any;
declare const _noopMeter: any;
/** Span status codes. */
export declare const SpanStatusCode: {
    readonly UNSET: 0;
    readonly OK: 1;
    readonly ERROR: 2;
};
/** Trace API entry point. */
export declare const trace: import("@opentelemetry/api").TraceAPI | {
    getTracer(): typeof _noopTracer;
};
/** Metrics API entry point. */
export declare const metrics: import("@opentelemetry/api").MetricsAPI | {
    getMeter(): typeof _noopMeter;
};
/** Diagnostics API. */
export declare const diag: any;
/** Diagnostics console logger class. */
export declare const DiagConsoleLogger: any;
/** Diagnostics log level enum. */
export declare const DiagLogLevel: any;
/** Whether @opentelemetry/api was successfully loaded. */
export declare const otelApiAvailable: boolean;
export type Tracer = import('@opentelemetry/api').Tracer;
export type Meter = import('@opentelemetry/api').Meter;
export {};
//# sourceMappingURL=otel-api.d.ts.map