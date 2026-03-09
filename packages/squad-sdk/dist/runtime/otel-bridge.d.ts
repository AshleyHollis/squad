/**
 * OTel Bridge for TelemetryCollector (Issue #256)
 *
 * Converts TelemetryEvents into OpenTelemetry spans, providing a
 * TelemetryTransport that can be registered via setTelemetryTransport().
 * Additive — the existing transport pipeline is unaffected.
 *
 * @module runtime/otel-bridge
 */
import type { TelemetryTransport } from './telemetry.js';
import type { EventBus, UnsubscribeFn } from './event-bus.js';
/**
 * Create a TelemetryTransport that emits OTel spans for each event.
 *
 * Usage:
 * ```ts
 * import { setTelemetryTransport } from './telemetry.js';
 * import { createOTelTransport } from './otel-bridge.js';
 *
 * setTelemetryTransport(createOTelTransport());
 * ```
 *
 * The bridge ignores the `endpoint` parameter — OTel exporter config is
 * managed by the OTel provider initialized via `initializeOTel()`.
 */
export declare function createOTelTransport(): TelemetryTransport;
/**
 * Subscribe an {@link EventBus} to OpenTelemetry, creating a span for every
 * event that flows through the bus.
 *
 * This is the **mid-level** OTel integration point — it wires the Squad
 * event bus directly into the OTel trace pipeline. If no `TracerProvider`
 * has been registered (e.g. via {@link initializeOTel}), all spans are
 * automatically no-ops with zero overhead.
 *
 * @param bus - The EventBus instance to bridge.
 * @returns An unsubscribe function. Call it to detach the bridge.
 *
 * @example
 * ```ts
 * import { EventBus, initializeOTel, bridgeEventBusToOTel } from 'squad-sdk';
 *
 * const bus = new EventBus();
 * initializeOTel({ endpoint: 'http://localhost:4318' });
 * const detach = bridgeEventBusToOTel(bus);
 *
 * // Later, to stop bridging:
 * detach();
 * ```
 */
export declare function bridgeEventBusToOTel(bus: EventBus): UnsubscribeFn;
//# sourceMappingURL=otel-bridge.d.ts.map