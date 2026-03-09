/**
 * Hook Pipeline — Hooks & Policy Enforcement (PRD 3)
 *
 * Programmatic enforcement of governance policies via SDK hooks.
 * Replaces prompt-level rules with deterministic, testable handlers.
 *
 * Hook types:
 *   - onPreToolUse:  Intercept tool calls before execution (block/allow/modify)
 *   - onPostToolUse: Inspect tool results after execution (scrub PII, log)
 *   - onSessionStart: Inject context at session creation
 *   - onSessionEnd:  Cleanup at session teardown
 *   - onErrorOccurred: Handle errors from SDK or tools
 */
export type HookAction = 'allow' | 'block' | 'modify';
export interface PreToolUseContext {
    /** Name of the tool being called */
    toolName: string;
    /** Arguments passed to the tool */
    arguments: Record<string, unknown>;
    /** Agent name that invoked the tool */
    agentName: string;
    /** Session ID */
    sessionId: string;
}
export interface PreToolUseResult {
    action: HookAction;
    /** Modified arguments (only if action === 'modify') */
    modifiedArguments?: Record<string, unknown>;
    /** Reason for blocking (only if action === 'block') */
    reason?: string;
}
export interface PostToolUseContext {
    toolName: string;
    arguments: Record<string, unknown>;
    result: unknown;
    agentName: string;
    sessionId: string;
}
export interface PostToolUseResult {
    /** Scrubbed or modified result */
    result: unknown;
}
export type PreToolUseHook = (ctx: PreToolUseContext) => PreToolUseResult | Promise<PreToolUseResult>;
export type PostToolUseHook = (ctx: PostToolUseContext) => PostToolUseResult | Promise<PostToolUseResult>;
export interface PolicyConfig {
    /** File paths agents are allowed to write to (glob patterns) */
    allowedWritePaths?: string[];
    /** Shell commands that are always blocked */
    blockedCommands?: string[];
    /** Maximum ask_user calls per session */
    maxAskUserPerSession?: number;
    /** Enable PII scrubbing on tool outputs */
    scrubPii?: boolean;
    /** Enable reviewer lockout protocol */
    reviewerLockout?: boolean;
}
export declare const DEFAULT_BLOCKED_COMMANDS: string[];
export declare class HookPipeline {
    private preToolHooks;
    private postToolHooks;
    private config;
    private askUserCallCount;
    private reviewerLockout;
    constructor(config?: PolicyConfig);
    /** Register a pre-tool-use hook */
    addPreToolHook(hook: PreToolUseHook): void;
    /** Register a post-tool-use hook */
    addPostToolHook(hook: PostToolUseHook): void;
    /** Run all pre-tool hooks in order. First 'block' wins. */
    runPreToolHooks(ctx: PreToolUseContext): Promise<PreToolUseResult>;
    /** Run all post-tool hooks in order */
    runPostToolHooks(ctx: PostToolUseContext): Promise<PostToolUseResult>;
    /** Create file-write guard hook */
    private createFileWriteGuard;
    /** Create shell command restriction hook */
    private createShellCommandRestriction;
    /** Create ask_user rate limiter hook */
    private createAskUserRateLimiter;
    /** Create PII scrubbing hook */
    private createPiiScrubber;
    /** Recursively scrub PII from object */
    private scrubObjectRecursive;
    /** Simple glob matcher (supports * and **) */
    private matchGlob;
    /** Get the reviewer lockout hook instance */
    getReviewerLockout(): ReviewerLockoutHook;
}
export declare class ReviewerLockoutHook {
    private lockoutRegistry;
    /** Lock out an agent from an artifact */
    lockout(artifactId: string, agentName: string): void;
    /** Check if an agent is locked out of an artifact */
    isLockedOut(artifactId: string, agentName: string): boolean;
    /** Clear lockout for an artifact */
    clearLockout(artifactId: string): void;
    /** Get all lockouts for an artifact */
    getLockedAgents(artifactId: string): string[];
    /** Clear all lockouts */
    clearAll(): void;
    /** Create pre-tool-use hook for reviewer lockout */
    createHook(): PreToolUseHook;
}
//# sourceMappingURL=index.d.ts.map