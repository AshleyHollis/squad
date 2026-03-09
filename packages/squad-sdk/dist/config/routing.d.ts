/**
 * Routing Configuration Module
 *
 * Parses routing.md markdown format into typed RoutingConfig and compiles routing rules
 * for fast pattern matching. Supports both markdown (legacy) and typed config (new).
 *
 * @module config/routing
 */
import type { RoutingConfig } from '../runtime/config.js';
/**
 * Compiled routing matcher with regex patterns.
 */
export interface CompiledRouter {
    /** Compiled work type rules */
    workTypeRules: CompiledWorkTypeRule[];
    /** Compiled issue routing rules */
    issueRules?: CompiledIssueRule[];
    /** Fallback agent if no match */
    fallbackAgent?: string;
    /** Governance settings */
    governance?: {
        eagerByDefault?: boolean;
        scribeAutoRuns?: boolean;
        allowRecursiveSpawn?: boolean;
        [key: string]: unknown;
    };
}
/**
 * Compiled work type rule with regex patterns.
 */
export interface CompiledWorkTypeRule {
    /** Original work type */
    workType: string;
    /** Agents to route to */
    agents: string[];
    /** Compiled regex patterns for matching */
    patterns: RegExp[];
    /** Examples for LLM understanding */
    examples?: string[];
    /** Confidence level */
    confidence?: 'high' | 'medium' | 'low';
    /** Priority (higher = more specific) */
    priority: number;
}
/**
 * Compiled issue routing rule.
 */
export interface CompiledIssueRule {
    /** Label pattern (regex) */
    labelPattern: RegExp;
    /** Action to take */
    action: 'assign' | 'route' | 'evaluate';
    /** Target agent */
    target?: string;
    /** Required labels (all must match) */
    requiredLabels?: RegExp[];
    /** Excluded labels (none can match) */
    excludedLabels?: RegExp[];
    /** Issue state filter */
    state?: 'open' | 'closed' | 'all';
}
/**
 * Routing match result.
 */
export interface RoutingMatch {
    /** Matched agents */
    agents: string[];
    /** Match confidence */
    confidence: 'high' | 'medium' | 'low';
    /** Matched rule */
    rule?: CompiledWorkTypeRule;
    /** Match reason */
    reason: string;
}
/**
 * Parses routing.md markdown table format into typed RoutingConfig.
 *
 * Expected format:
 * ```markdown
 * ## Routing Table
 *
 * | Work Type | Route To | Examples |
 * |-----------|----------|----------|
 * | feature-dev | Lead | New features, enhancements |
 * | bug-fix | Developer | Bug fixes, patches |
 * ```
 *
 * @param content - Markdown content from routing.md
 * @returns Parsed routing configuration
 */
export declare function parseRoutingMarkdown(content: string): RoutingConfig;
/**
 * Compiles routing rules for fast pattern matching.
 *
 * Creates regex patterns from work types and assigns priority scores
 * based on specificity. More specific patterns get higher priority.
 *
 * @param config - Routing configuration to compile
 * @returns Compiled router with regex patterns
 */
export declare function compileRoutingRules(config: RoutingConfig): CompiledRouter;
/**
 * Matches a message to routing rules.
 *
 * @param message - User message to match
 * @param router - Compiled router
 * @returns Best routing match
 */
export declare function matchRoute(message: string, router: CompiledRouter): RoutingMatch;
/**
 * Matches issue labels to routing rules.
 *
 * @param labels - Issue labels to match
 * @param rules - Compiled issue routing rules
 * @returns Matching rule if found
 */
export declare function matchIssueLabels(labels: string[], rules: CompiledIssueRule[]): CompiledIssueRule | undefined;
//# sourceMappingURL=routing.d.ts.map