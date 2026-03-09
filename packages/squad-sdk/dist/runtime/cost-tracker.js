/**
 * Cost Tracker
 *
 * Accumulates cost and token data across a squad run with per-agent and
 * per-session breakdowns. Wires into EventBus for real-time updates.
 *
 * @module runtime/cost-tracker
 */
// ============================================================================
// CostTracker
// ============================================================================
/**
 * Accumulates cost/token data across the squad run.
 *
 * Can be wired to an EventBus to receive live usage events or fed
 * data manually via `recordUsage()`.
 */
export class CostTracker {
    agents = new Map();
    sessions = new Map();
    unsubscribe = null;
    /**
     * Record a single usage event.
     */
    recordUsage(opts) {
        const agentKey = opts.agentName ?? 'unknown';
        // Per-agent
        const agent = this.agents.get(agentKey);
        if (agent) {
            agent.inputTokens += opts.inputTokens;
            agent.outputTokens += opts.outputTokens;
            agent.estimatedCost += opts.estimatedCost;
            agent.turnCount += 1;
            agent.model = opts.model;
            if (opts.isFallback)
                agent.fallbackCount += 1;
        }
        else {
            this.agents.set(agentKey, {
                agentName: agentKey,
                model: opts.model,
                inputTokens: opts.inputTokens,
                outputTokens: opts.outputTokens,
                estimatedCost: opts.estimatedCost,
                turnCount: 1,
                fallbackCount: opts.isFallback ? 1 : 0,
            });
        }
        // Per-session
        const session = this.sessions.get(opts.sessionId);
        if (session) {
            session.inputTokens += opts.inputTokens;
            session.outputTokens += opts.outputTokens;
            session.estimatedCost += opts.estimatedCost;
            session.turnCount += 1;
        }
        else {
            this.sessions.set(opts.sessionId, {
                sessionId: opts.sessionId,
                agentName: opts.agentName,
                inputTokens: opts.inputTokens,
                outputTokens: opts.outputTokens,
                estimatedCost: opts.estimatedCost,
                turnCount: 1,
            });
        }
    }
    /** Record a model fallback for an agent (increments fallback counter). */
    recordFallback(agentName) {
        const agent = this.agents.get(agentName);
        if (agent) {
            agent.fallbackCount += 1;
        }
    }
    /** Get the full cost summary. */
    getSummary() {
        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        let totalEstimatedCost = 0;
        for (const entry of this.agents.values()) {
            totalInputTokens += entry.inputTokens;
            totalOutputTokens += entry.outputTokens;
            totalEstimatedCost += entry.estimatedCost;
        }
        return {
            totalInputTokens,
            totalOutputTokens,
            totalEstimatedCost,
            agents: new Map(this.agents),
            sessions: new Map(this.sessions),
        };
    }
    /** Get formatted summary string suitable for terminal output. */
    formatSummary() {
        const summary = this.getSummary();
        const lines = [];
        lines.push('=== Squad Cost Summary ===');
        lines.push(`Total input tokens:  ${summary.totalInputTokens.toLocaleString()}`);
        lines.push(`Total output tokens: ${summary.totalOutputTokens.toLocaleString()}`);
        lines.push(`Estimated cost:      $${summary.totalEstimatedCost.toFixed(4)}`);
        if (summary.agents.size > 0) {
            lines.push('');
            lines.push('--- By Agent ---');
            for (const [name, entry] of summary.agents) {
                lines.push(`  ${name}: ${entry.inputTokens.toLocaleString()}in / ${entry.outputTokens.toLocaleString()}out` +
                    ` ($${entry.estimatedCost.toFixed(4)}) [${entry.turnCount} turns, model: ${entry.model}` +
                    `${entry.fallbackCount > 0 ? `, ${entry.fallbackCount} fallbacks` : ''}]`);
            }
        }
        if (summary.sessions.size > 0) {
            lines.push('');
            lines.push('--- By Session ---');
            for (const [id, entry] of summary.sessions) {
                lines.push(`  ${id}: ${entry.inputTokens.toLocaleString()}in / ${entry.outputTokens.toLocaleString()}out` +
                    ` ($${entry.estimatedCost.toFixed(4)}) [${entry.turnCount} turns]`);
            }
        }
        return lines.join('\n');
    }
    /** Clear all accumulated data. */
    reset() {
        this.agents.clear();
        this.sessions.clear();
    }
    /**
     * Wire into an EventBus to receive real-time `session:message` events
     * that carry usage payloads. Returns an unsubscribe function.
     */
    wireToEventBus(bus) {
        const handler = (event) => {
            const payload = event.payload;
            if (!payload)
                return;
            // Accept events with usage data in the payload
            if (typeof payload.inputTokens === 'number' &&
                typeof payload.outputTokens === 'number') {
                this.recordUsage({
                    sessionId: event.sessionId ?? 'unknown',
                    agentName: event.agentName,
                    model: payload.model ?? 'unknown',
                    inputTokens: payload.inputTokens,
                    outputTokens: payload.outputTokens,
                    estimatedCost: payload.estimatedCost ?? 0,
                    isFallback: payload.isFallback ?? false,
                });
            }
        };
        this.unsubscribe = bus.subscribe('session:message', handler);
        return () => {
            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = null;
            }
        };
    }
}
//# sourceMappingURL=cost-tracker.js.map