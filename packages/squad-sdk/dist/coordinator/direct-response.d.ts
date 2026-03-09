/**
 * Direct Response Handler (M3-6, Issue #147)
 *
 * Handles simple queries that don't require agent spawning.
 * Acts as a first-pass check in the coordinator pipeline —
 * status queries, help requests, config questions, and team roster
 * queries are answered directly without consuming agent sessions.
 */
import type { SquadConfig } from '../runtime/config.js';
import type { EventBus } from '../runtime/event-bus.js';
/**
 * Context for coordinator message handling.
 */
export interface CoordinatorContext {
    /** Current session ID (coordinator session) */
    sessionId: string;
    /** Squad configuration */
    config: SquadConfig;
    /** Event bus for observability */
    eventBus?: EventBus;
    /** Team roster content (team.md) */
    teamRoster?: string;
    /** Active agent names */
    activeAgents?: string[];
    /** User-provided metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Result of a direct response.
 */
export interface DirectResponseResult {
    /** The response text to return to the user */
    response: string;
    /** Category of the matched pattern */
    category: DirectResponseCategory;
    /** Confidence in the match */
    confidence: 'high' | 'medium';
}
/**
 * Categories of messages handled directly.
 */
export type DirectResponseCategory = 'status' | 'help' | 'config' | 'roster' | 'greeting';
/**
 * A configurable pattern for direct response matching.
 */
export interface DirectResponsePattern {
    /** Category this pattern belongs to */
    category: DirectResponseCategory;
    /** Regex patterns that trigger this category */
    patterns: RegExp[];
    /** Handler that produces the response */
    handler: (message: string, context: CoordinatorContext) => string;
}
/**
 * Handles simple queries without spawning agents.
 *
 * The handler checks incoming messages against a set of configurable
 * patterns. If a match is found, it produces a direct response without
 * going through the routing → charter → spawn pipeline.
 */
export declare class DirectResponseHandler {
    private patterns;
    constructor(customPatterns?: DirectResponsePattern[]);
    /**
     * Check whether a message should be handled directly (no agent spawn).
     */
    shouldHandleDirectly(message: string, config?: SquadConfig): boolean;
    /**
     * Handle a message directly and return a response.
     * Should only be called after shouldHandleDirectly() returns true.
     */
    handleDirect(message: string, context: CoordinatorContext): DirectResponseResult;
    /**
     * Add a custom pattern at runtime.
     */
    addPattern(pattern: DirectResponsePattern): void;
    /**
     * Get all registered patterns.
     */
    getPatterns(): ReadonlyArray<DirectResponsePattern>;
    private matchPattern;
}
//# sourceMappingURL=direct-response.d.ts.map