/**
 * OpenTelemetry Provider Initialization (Issue #255)
 *
 * Configures TracerProvider and MeterProvider with OTLP gRPC exporters.
 * Disabled by default — activates only when explicit config or
 * OTEL_EXPORTER_OTLP_ENDPOINT env var is present.
 *
 * @module runtime/otel
 */
import { type Tracer, type Meter } from './otel-api.js';
/** Configuration for OTel initialization. */
export interface OTelConfig {
    /** OTLP endpoint URL (e.g. http://localhost:4317) */
    endpoint?: string;
    /** Service name override (default: 'squad-sdk') */
    serviceName?: string;
    /** Enable debug diagnostics */
    debug?: boolean;
    /** Execution mode tag — added as `squad.mode` resource attribute (e.g. 'cli', 'copilot-agent') */
    mode?: string;
}
/**
 * Initialize the TracerProvider with an OTLP gRPC exporter.
 * Returns `true` if a provider was registered, `false` if disabled.
 */
export declare function initializeTracing(config?: OTelConfig): boolean;
/**
 * Initialize the MeterProvider with an OTLP gRPC exporter.
 * Returns `true` if a provider was registered, `false` if disabled.
 */
export declare function initializeMetrics(config?: OTelConfig): boolean;
/**
 * Convenience wrapper — initializes both tracing and metrics.
 * Returns an object indicating which subsystems were activated.
 */
export declare function initializeOTel(config?: OTelConfig): {
    tracing: boolean;
    metrics: boolean;
};
/**
 * Flush pending telemetry and shut down providers.
 * Safe to call even if OTel was never initialized.
 */
export declare function shutdownOTel(): Promise<void>;
/**
 * Return a Tracer instance. Falls back to the no-op tracer when
 * tracing has not been initialized.
 */
export declare function getTracer(name?: string): Tracer;
/**
 * Return a Meter instance. Falls back to the no-op meter when
 * metrics have not been initialized.
 */
export declare function getMeter(name?: string): Meter;
//# sourceMappingURL=otel.d.ts.map