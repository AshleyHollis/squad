/**
 * OTel Metrics (Issues #261, #262, #263, #264)
 *
 * Provides counters, histograms, and gauges for token usage,
 * agent performance, session pool, and response latency.
 * No-op when OTel is not configured (getMeter returns a no-op meter).
 *
 * @module runtime/otel-metrics
 */
import type { UsageEvent } from './streaming.js';
import type { PrReworkResult, ReworkSummary } from './rework.js';
/**
 * Record token usage from a UsageEvent.
 * Safe to call when OTel is not configured — metrics are no-ops.
 */
export declare function recordTokenUsage(event: UsageEvent): void;
/** Record an agent spawn event. */
export declare function recordAgentSpawn(agentName: string, mode?: string): void;
/** Record agent task completion with duration. */
export declare function recordAgentDuration(agentName: string, durationMs: number, status?: 'success' | 'error'): void;
/** Record an agent error. */
export declare function recordAgentError(agentName: string, errorType: string): void;
/** Record agent session destruction (decrements active count). */
export declare function recordAgentDestroy(agentName: string): void;
/** Record a new session being created. */
export declare function recordSessionCreated(): void;
/** Record a session becoming idle. */
export declare function recordSessionIdle(): void;
/** Record an idle session becoming active again. */
export declare function recordSessionReactivated(): void;
/** Record a session being closed. */
export declare function recordSessionClosed(): void;
/** Record a session error. */
export declare function recordSessionError(): void;
/** Record time to first token. */
export declare function recordTimeToFirstToken(ttftMs: number): void;
/** Record total response duration. */
export declare function recordResponseDuration(durationMs: number): void;
/** Record streaming throughput. */
export declare function recordTokensPerSecond(tokensPerSec: number): void;
/** Record rework metrics for a single PR analysis result. */
export declare function recordReworkMetrics(result: PrReworkResult): void;
/** Record aggregate rework summary metrics across multiple PRs. */
export declare function recordReworkSummary(summary: ReworkSummary): void;
/** Reset all cached metric instances. Used in tests only. */
export declare function _resetMetrics(): void;
//# sourceMappingURL=otel-metrics.d.ts.map