/**
 * Cost Tracker
 *
 * Accumulates cost and token data across a squad run with per-agent and
 * per-session breakdowns. Wires into EventBus for real-time updates.
 *
 * @module runtime/cost-tracker
 */
import type { EventBus } from './event-bus.js';
/** Per-agent cost/token breakdown. */
export interface AgentCostEntry {
    agentName: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
    turnCount: number;
    fallbackCount: number;
}
/** Per-session cost/token breakdown. */
export interface SessionCostEntry {
    sessionId: string;
    agentName?: string;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
    turnCount: number;
}
/** Total summary across all agents and sessions. */
export interface CostSummary {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalEstimatedCost: number;
    agents: Map<string, AgentCostEntry>;
    sessions: Map<string, SessionCostEntry>;
}
/**
 * Accumulates cost/token data across the squad run.
 *
 * Can be wired to an EventBus to receive live usage events or fed
 * data manually via `recordUsage()`.
 */
export declare class CostTracker {
    private agents;
    private sessions;
    private unsubscribe;
    /**
     * Record a single usage event.
     */
    recordUsage(opts: {
        sessionId: string;
        agentName?: string;
        model: string;
        inputTokens: number;
        outputTokens: number;
        estimatedCost: number;
        isFallback?: boolean;
    }): void;
    /** Record a model fallback for an agent (increments fallback counter). */
    recordFallback(agentName: string): void;
    /** Get the full cost summary. */
    getSummary(): CostSummary;
    /** Get formatted summary string suitable for terminal output. */
    formatSummary(): string;
    /** Clear all accumulated data. */
    reset(): void;
    /**
     * Wire into an EventBus to receive real-time `session:message` events
     * that carry usage payloads. Returns an unsubscribe function.
     */
    wireToEventBus(bus: EventBus): () => void;
}
//# sourceMappingURL=cost-tracker.d.ts.map