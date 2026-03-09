/**
 * Streaming Event Pipeline
 *
 * Processes streaming events from Copilot SDK sessions including message deltas,
 * reasoning deltas, and usage/cost tracking.
 *
 * @module runtime/streaming
 */
import { recordTokenUsage, recordTimeToFirstToken, recordResponseDuration, recordTokensPerSecond, } from './otel-metrics.js';
// ============================================================================
// StreamingPipeline
// ============================================================================
/**
 * Processes streaming events from SDK sessions.
 *
 * Allows registration of handlers for message deltas, reasoning deltas,
 * and usage events. Aggregates token counts across all active sessions.
 */
export class StreamingPipeline {
    deltaHandlers = new Set();
    usageHandlers = new Set();
    reasoningHandlers = new Set();
    attachedSessions = new Set();
    usageData = [];
    /** Per-session message start timestamps for latency tracking. */
    messageStartTimes = new Map();
    /** Per-session flag tracking whether first token has been recorded. */
    firstTokenRecorded = new Map();
    /** Register a handler for message deltas. */
    onDelta(handler) {
        this.deltaHandlers.add(handler);
        return () => this.deltaHandlers.delete(handler);
    }
    /** Register a handler for token usage/cost data. */
    onUsage(handler) {
        this.usageHandlers.add(handler);
        return () => this.usageHandlers.delete(handler);
    }
    /** Register a handler for reasoning deltas. */
    onReasoning(handler) {
        this.reasoningHandlers.add(handler);
        return () => this.reasoningHandlers.delete(handler);
    }
    /**
     * Mark the start of a new message for a session.
     * Call this before sending a message to enable TTFT and duration tracking.
     */
    markMessageStart(sessionId) {
        this.messageStartTimes.set(sessionId, Date.now());
        this.firstTokenRecorded.set(sessionId, false);
    }
    /** Wire up handlers to a session's event stream. */
    attachToSession(sessionId) {
        if (this.attachedSessions.has(sessionId)) {
            throw new Error(`Session ${sessionId} is already attached`);
        }
        this.attachedSessions.add(sessionId);
    }
    /** Clean up handlers for a session. */
    detachFromSession(sessionId) {
        this.attachedSessions.delete(sessionId);
    }
    /** Check whether a session is currently attached. */
    isAttached(sessionId) {
        return this.attachedSessions.has(sessionId);
    }
    /** Returns all currently attached session IDs. */
    getAttachedSessions() {
        return this.attachedSessions;
    }
    /**
     * Process an incoming streaming event.
     * Dispatches to the correct set of handlers based on event type.
     */
    async processEvent(event) {
        if (!this.attachedSessions.has(event.sessionId)) {
            return; // Ignore events from unattached sessions
        }
        switch (event.type) {
            case 'message_delta':
                // Record TTFT on first delta (index === 0) for this message
                if (event.index === 0 && !this.firstTokenRecorded.get(event.sessionId)) {
                    this.firstTokenRecorded.set(event.sessionId, true);
                    const startTime = this.messageStartTimes.get(event.sessionId);
                    if (startTime !== undefined) {
                        recordTimeToFirstToken(Date.now() - startTime);
                    }
                }
                await this.dispatchDelta(event);
                break;
            case 'usage': {
                this.usageData.push(event);
                await this.dispatchUsage(event);
                recordTokenUsage(event);
                // Record response duration and tokens/sec when usage arrives
                const msgStart = this.messageStartTimes.get(event.sessionId);
                if (msgStart !== undefined) {
                    const durationMs = Date.now() - msgStart;
                    recordResponseDuration(durationMs);
                    if (durationMs > 0 && event.outputTokens > 0) {
                        recordTokensPerSecond((event.outputTokens / durationMs) * 1000);
                    }
                    this.messageStartTimes.delete(event.sessionId);
                    this.firstTokenRecorded.delete(event.sessionId);
                }
                break;
            }
            case 'reasoning_delta':
                await this.dispatchReasoning(event);
                break;
        }
    }
    /** Aggregate token counts and cost across all sessions. */
    getUsageSummary() {
        const byAgent = new Map();
        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        let estimatedCost = 0;
        for (const event of this.usageData) {
            totalInputTokens += event.inputTokens;
            totalOutputTokens += event.outputTokens;
            estimatedCost += event.estimatedCost;
            const agentKey = event.agentName ?? 'unknown';
            const existing = byAgent.get(agentKey);
            if (existing) {
                existing.inputTokens += event.inputTokens;
                existing.outputTokens += event.outputTokens;
                existing.estimatedCost += event.estimatedCost;
                existing.turnCount += 1;
                existing.model = event.model; // keep latest model
            }
            else {
                byAgent.set(agentKey, {
                    inputTokens: event.inputTokens,
                    outputTokens: event.outputTokens,
                    estimatedCost: event.estimatedCost,
                    model: event.model,
                    turnCount: 1,
                });
            }
        }
        return { totalInputTokens, totalOutputTokens, estimatedCost, byAgent };
    }
    /** Remove all handlers and detach all sessions. */
    clear() {
        this.deltaHandlers.clear();
        this.usageHandlers.clear();
        this.reasoningHandlers.clear();
        this.attachedSessions.clear();
        this.usageData = [];
        this.messageStartTimes.clear();
        this.firstTokenRecorded.clear();
    }
    // ---------- Private ----------
    async dispatchDelta(event) {
        for (const handler of this.deltaHandlers) {
            try {
                const result = handler(event);
                if (result instanceof Promise)
                    await result;
            }
            catch {
                // Isolate handler errors
            }
        }
    }
    async dispatchUsage(event) {
        for (const handler of this.usageHandlers) {
            try {
                const result = handler(event);
                if (result instanceof Promise)
                    await result;
            }
            catch {
                // Isolate handler errors
            }
        }
    }
    async dispatchReasoning(event) {
        for (const handler of this.reasoningHandlers) {
            try {
                const result = handler(event);
                if (result instanceof Promise)
                    await result;
            }
            catch {
                // Isolate handler errors
            }
        }
    }
}
//# sourceMappingURL=streaming.js.map