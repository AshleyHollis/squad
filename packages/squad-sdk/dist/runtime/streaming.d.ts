/**
 * Streaming Event Pipeline
 *
 * Processes streaming events from Copilot SDK sessions including message deltas,
 * reasoning deltas, and usage/cost tracking.
 *
 * @module runtime/streaming
 */
/** A chunk of assistant message content. */
export interface StreamDelta {
    type: 'message_delta';
    sessionId: string;
    agentName?: string;
    content: string;
    /** Monotonically increasing index within the message. */
    index: number;
    timestamp: Date;
}
/** Token usage and cost data for a completed turn. */
export interface UsageEvent {
    type: 'usage';
    sessionId: string;
    agentName?: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    /** Estimated cost in USD (may be 0 if pricing unavailable). */
    estimatedCost: number;
    timestamp: Date;
}
/** A chunk of model reasoning/thinking content. */
export interface ReasoningDelta {
    type: 'reasoning_delta';
    sessionId: string;
    agentName?: string;
    content: string;
    index: number;
    timestamp: Date;
}
/** Union of all streaming event types. */
export type StreamingEvent = StreamDelta | UsageEvent | ReasoningDelta;
export type DeltaHandler = (event: StreamDelta) => void | Promise<void>;
export type UsageHandler = (event: UsageEvent) => void | Promise<void>;
export type ReasoningHandler = (event: ReasoningDelta) => void | Promise<void>;
export interface UsageSummary {
    totalInputTokens: number;
    totalOutputTokens: number;
    estimatedCost: number;
    byAgent: Map<string, AgentUsage>;
}
export interface AgentUsage {
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
    model: string;
    turnCount: number;
}
/**
 * Processes streaming events from SDK sessions.
 *
 * Allows registration of handlers for message deltas, reasoning deltas,
 * and usage events. Aggregates token counts across all active sessions.
 */
export declare class StreamingPipeline {
    /** Cap usage history to prevent unbounded memory growth in long sessions. */
    static readonly MAX_USAGE_EVENTS = 1000;
    private deltaHandlers;
    private usageHandlers;
    private reasoningHandlers;
    private attachedSessions;
    private usageData;
    /** Per-session message start timestamps for latency tracking. */
    private messageStartTimes;
    /** Per-session flag tracking whether first token has been recorded. */
    private firstTokenRecorded;
    /** Register a handler for message deltas. */
    onDelta(handler: DeltaHandler): () => void;
    /** Register a handler for token usage/cost data. */
    onUsage(handler: UsageHandler): () => void;
    /** Register a handler for reasoning deltas. */
    onReasoning(handler: ReasoningHandler): () => void;
    /**
     * Mark the start of a new message for a session.
     * Call this before sending a message to enable TTFT and duration tracking.
     */
    markMessageStart(sessionId: string): void;
    /** Wire up handlers to a session's event stream. */
    attachToSession(sessionId: string): void;
    /** Clean up handlers for a session. */
    detachFromSession(sessionId: string): void;
    /** Check whether a session is currently attached. */
    isAttached(sessionId: string): boolean;
    /** Returns all currently attached session IDs. */
    getAttachedSessions(): ReadonlySet<string>;
    /**
     * Process an incoming streaming event.
     * Dispatches to the correct set of handlers based on event type.
     */
    processEvent(event: StreamingEvent): Promise<void>;
    /** Aggregate token counts and cost across all sessions. */
    getUsageSummary(): UsageSummary;
    /** Remove all handlers and detach all sessions. */
    clear(): void;
    private dispatchDelta;
    private dispatchUsage;
    private dispatchReasoning;
}
//# sourceMappingURL=streaming.d.ts.map