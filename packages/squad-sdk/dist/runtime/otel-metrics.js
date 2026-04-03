/**
 * OTel Metrics (Issues #261, #262, #263, #264)
 *
 * Provides counters, histograms, and gauges for token usage,
 * agent performance, session pool, and response latency.
 * No-op when OTel is not configured (getMeter returns a no-op meter).
 *
 * @module runtime/otel-metrics
 */
import { getMeter } from './otel.js';
let _tokenMetrics;
function ensureTokenMetrics() {
    if (!_tokenMetrics) {
        const meter = getMeter('squad-sdk');
        _tokenMetrics = {
            inputCounter: meter.createCounter('squad.tokens.input', {
                description: 'Total input tokens consumed',
                unit: 'tokens',
            }),
            outputCounter: meter.createCounter('squad.tokens.output', {
                description: 'Total output tokens produced',
                unit: 'tokens',
            }),
            costCounter: meter.createCounter('squad.tokens.cost', {
                description: 'Estimated cost in USD',
                unit: 'USD',
            }),
            totalCounter: meter.createUpDownCounter('squad.tokens.total', {
                description: 'Running total of all tokens',
                unit: 'tokens',
            }),
        };
    }
    return _tokenMetrics;
}
/**
 * Record token usage from a UsageEvent.
 * Safe to call when OTel is not configured — metrics are no-ops.
 */
export function recordTokenUsage(event) {
    const m = ensureTokenMetrics();
    const attrs = {
        'agent.name': event.agentName ?? 'unknown',
        'model': event.model,
    };
    m.inputCounter.add(event.inputTokens, attrs);
    m.outputCounter.add(event.outputTokens, attrs);
    m.costCounter.add(event.estimatedCost, attrs);
    m.totalCounter.add(event.inputTokens + event.outputTokens, attrs);
}
let _agentMetrics;
function ensureAgentMetrics() {
    if (!_agentMetrics) {
        const meter = getMeter('squad-sdk');
        _agentMetrics = {
            spawnsCounter: meter.createCounter('squad.agent.spawns', {
                description: 'Total agent spawns',
            }),
            durationHistogram: meter.createHistogram('squad.agent.duration', {
                description: 'Agent task duration in milliseconds',
                unit: 'ms',
            }),
            errorsCounter: meter.createCounter('squad.agent.errors', {
                description: 'Total agent errors',
            }),
            activeGauge: meter.createUpDownCounter('squad.agent.active', {
                description: 'Currently active agent sessions',
            }),
        };
    }
    return _agentMetrics;
}
/** Record an agent spawn event. */
export function recordAgentSpawn(agentName, mode = 'sync') {
    const m = ensureAgentMetrics();
    m.spawnsCounter.add(1, { 'agent.name': agentName, mode });
    m.activeGauge.add(1, { 'agent.name': agentName });
}
/** Record agent task completion with duration. */
export function recordAgentDuration(agentName, durationMs, status = 'success') {
    const m = ensureAgentMetrics();
    m.durationHistogram.record(durationMs, { 'agent.name': agentName, status });
    if (status === 'error') {
        m.errorsCounter.add(1, { 'agent.name': agentName, 'error.type': 'task_failure' });
    }
}
/** Record an agent error. */
export function recordAgentError(agentName, errorType) {
    const m = ensureAgentMetrics();
    m.errorsCounter.add(1, { 'agent.name': agentName, 'error.type': errorType });
}
/** Record agent session destruction (decrements active count). */
export function recordAgentDestroy(agentName) {
    const m = ensureAgentMetrics();
    m.activeGauge.add(-1, { 'agent.name': agentName });
}
let _sessionPoolMetrics;
function ensureSessionPoolMetrics() {
    if (!_sessionPoolMetrics) {
        const meter = getMeter('squad-sdk');
        _sessionPoolMetrics = {
            activeCounter: meter.createUpDownCounter('squad.sessions.active', {
                description: 'Currently active sessions',
            }),
            idleCounter: meter.createUpDownCounter('squad.sessions.idle', {
                description: 'Currently idle pooled sessions',
            }),
            createdCounter: meter.createCounter('squad.sessions.created', {
                description: 'Total sessions created',
            }),
            closedCounter: meter.createCounter('squad.sessions.closed', {
                description: 'Total sessions closed',
            }),
            errorsCounter: meter.createCounter('squad.sessions.errors', {
                description: 'Session creation/streaming failures',
            }),
        };
    }
    return _sessionPoolMetrics;
}
/** Record a new session being created. */
export function recordSessionCreated() {
    const m = ensureSessionPoolMetrics();
    m.createdCounter.add(1);
    m.activeCounter.add(1);
}
/** Record a session becoming idle. */
export function recordSessionIdle() {
    const m = ensureSessionPoolMetrics();
    m.activeCounter.add(-1);
    m.idleCounter.add(1);
}
/** Record an idle session becoming active again. */
export function recordSessionReactivated() {
    const m = ensureSessionPoolMetrics();
    m.idleCounter.add(-1);
    m.activeCounter.add(1);
}
/** Record a session being closed. */
export function recordSessionClosed() {
    const m = ensureSessionPoolMetrics();
    m.activeCounter.add(-1);
    m.closedCounter.add(1);
}
/** Record a session error. */
export function recordSessionError() {
    const m = ensureSessionPoolMetrics();
    m.errorsCounter.add(1);
}
let _latencyMetrics;
function ensureLatencyMetrics() {
    if (!_latencyMetrics) {
        const meter = getMeter('squad-sdk');
        _latencyMetrics = {
            ttftHistogram: meter.createHistogram('squad.response.ttft', {
                description: 'Time to first token in milliseconds',
                unit: 'ms',
            }),
            durationHistogram: meter.createHistogram('squad.response.duration', {
                description: 'Total response duration in milliseconds',
                unit: 'ms',
            }),
            tokensPerSecGauge: meter.createGauge('squad.response.tokens_per_second', {
                description: 'Streaming throughput (tokens/second)',
                unit: 'tokens/s',
            }),
        };
    }
    return _latencyMetrics;
}
/** Record time to first token. */
export function recordTimeToFirstToken(ttftMs) {
    const m = ensureLatencyMetrics();
    m.ttftHistogram.record(ttftMs);
}
/** Record total response duration. */
export function recordResponseDuration(durationMs) {
    const m = ensureLatencyMetrics();
    m.durationHistogram.record(durationMs);
}
/** Record streaming throughput. */
export function recordTokensPerSecond(tokensPerSec) {
    const m = ensureLatencyMetrics();
    m.tokensPerSecGauge.record(tokensPerSec);
}
let _reworkMetrics;
function ensureReworkMetrics() {
    if (!_reworkMetrics) {
        const meter = getMeter('squad-sdk');
        _reworkMetrics = {
            rateGauge: meter.createGauge('squad.rework.rate', {
                description: 'Current rework rate percentage',
                unit: '%',
            }),
            cyclesHistogram: meter.createHistogram('squad.rework.cycles', {
                description: 'Review cycles per PR',
            }),
            rejectionRateGauge: meter.createGauge('squad.rework.rejection_rate', {
                description: 'Percentage of PRs with changes requested',
                unit: '%',
            }),
            timeHistogram: meter.createHistogram('squad.rework.time_ms', {
                description: 'Time spent in rework in milliseconds',
                unit: 'ms',
            }),
        };
    }
    return _reworkMetrics;
}
/** Record rework metrics for a single PR analysis result. */
export function recordReworkMetrics(result) {
    const m = ensureReworkMetrics();
    const attrs = {
        'pr.number': result.number,
        'pr.author': result.author,
    };
    m.rateGauge.record(result.reworkRate, attrs);
    m.cyclesHistogram.record(result.reviewCycles, attrs);
    if (result.reworkTimeMs !== null) {
        m.timeHistogram.record(result.reworkTimeMs, attrs);
    }
}
/** Record aggregate rework summary metrics across multiple PRs. */
export function recordReworkSummary(summary) {
    const m = ensureReworkMetrics();
    if (summary.avgReworkRate != null) {
        m.rateGauge.record(summary.avgReworkRate, { scope: 'summary' });
    }
    if (summary.rejectionRate != null) {
        m.rejectionRateGauge.record(summary.rejectionRate, { scope: 'summary' });
    }
    if (summary.avgReviewCycles != null) {
        m.cyclesHistogram.record(summary.avgReviewCycles, { scope: 'summary' });
    }
    if (summary.avgReworkTimeHours != null) {
        m.timeHistogram.record(summary.avgReworkTimeHours * 3_600_000, { scope: 'summary' });
    }
}
// ============================================================================
// Reset (for testing)
// ============================================================================
/** Reset all cached metric instances. Used in tests only. */
export function _resetMetrics() {
    _tokenMetrics = undefined;
    _agentMetrics = undefined;
    _sessionPoolMetrics = undefined;
    _latencyMetrics = undefined;
    _reworkMetrics = undefined;
}
//# sourceMappingURL=otel-metrics.js.map