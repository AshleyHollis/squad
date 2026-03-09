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
export const DEFAULT_BLOCKED_COMMANDS = [
    'rm -rf',
    'git push --force',
    'git rebase',
    'git reset --hard',
];
// --- Hook Pipeline ---
export class HookPipeline {
    preToolHooks = [];
    postToolHooks = [];
    config;
    askUserCallCount = new Map();
    reviewerLockout;
    constructor(config = {}) {
        this.config = config;
        this.reviewerLockout = new ReviewerLockoutHook();
        // Register file-write guard hook
        if (config.allowedWritePaths && config.allowedWritePaths.length > 0) {
            this.addPreToolHook(this.createFileWriteGuard(config.allowedWritePaths));
        }
        // Register shell command restriction hook
        const blockedCommands = config.blockedCommands || DEFAULT_BLOCKED_COMMANDS;
        if (blockedCommands.length > 0) {
            this.addPreToolHook(this.createShellCommandRestriction(blockedCommands));
        }
        // Register ask_user rate limiter
        if (config.maxAskUserPerSession !== undefined && config.maxAskUserPerSession > 0) {
            this.addPreToolHook(this.createAskUserRateLimiter(config.maxAskUserPerSession));
        }
        // Register reviewer lockout hook
        if (config.reviewerLockout) {
            this.addPreToolHook(this.reviewerLockout.createHook());
        }
        // Register PII scrubbing hook
        if (config.scrubPii) {
            this.addPostToolHook(this.createPiiScrubber());
        }
    }
    /** Register a pre-tool-use hook */
    addPreToolHook(hook) {
        this.preToolHooks.push(hook);
    }
    /** Register a post-tool-use hook */
    addPostToolHook(hook) {
        this.postToolHooks.push(hook);
    }
    /** Run all pre-tool hooks in order. First 'block' wins. */
    async runPreToolHooks(ctx) {
        for (const hook of this.preToolHooks) {
            const result = await hook(ctx);
            if (result.action === 'block')
                return result;
            if (result.action === 'modify' && result.modifiedArguments) {
                ctx = { ...ctx, arguments: result.modifiedArguments };
            }
        }
        return { action: 'allow' };
    }
    /** Run all post-tool hooks in order */
    async runPostToolHooks(ctx) {
        let result = ctx.result;
        for (const hook of this.postToolHooks) {
            const hookResult = await hook({ ...ctx, result });
            result = hookResult.result;
        }
        return { result };
    }
    /** Create file-write guard hook */
    createFileWriteGuard(allowedPaths) {
        return (ctx) => {
            const writeTools = ['edit', 'create', 'write_file', 'create_file'];
            if (!writeTools.includes(ctx.toolName)) {
                return { action: 'allow' };
            }
            const filePath = ctx.arguments.path || ctx.arguments.file_path;
            if (!filePath || typeof filePath !== 'string') {
                return { action: 'allow' };
            }
            const isAllowed = allowedPaths.some(pattern => this.matchGlob(filePath, pattern));
            if (!isAllowed) {
                console.warn('[HookPipeline] File write blocked', {
                    agent: ctx.agentName,
                    tool: ctx.toolName,
                    path: filePath,
                    allowedPaths,
                });
                return {
                    action: 'block',
                    reason: `File write blocked: "${filePath}" does not match allowed paths. Allowed patterns: ${allowedPaths.join(', ')}`,
                };
            }
            return { action: 'allow' };
        };
    }
    /** Create shell command restriction hook */
    createShellCommandRestriction(blockedCommands) {
        return (ctx) => {
            const shellTools = ['powershell', 'bash', 'shell', 'exec'];
            if (!shellTools.includes(ctx.toolName)) {
                return { action: 'allow' };
            }
            const command = ctx.arguments.command || ctx.arguments.cmd;
            if (!command || typeof command !== 'string') {
                return { action: 'allow' };
            }
            for (const blocked of blockedCommands) {
                if (command.includes(blocked)) {
                    console.warn('[HookPipeline] Shell command blocked', {
                        agent: ctx.agentName,
                        tool: ctx.toolName,
                        command,
                        blockedPattern: blocked,
                    });
                    return {
                        action: 'block',
                        reason: `Shell command blocked: Command contains prohibited pattern "${blocked}". Blocked commands: ${blockedCommands.join(', ')}`,
                    };
                }
            }
            return { action: 'allow' };
        };
    }
    /** Create ask_user rate limiter hook */
    createAskUserRateLimiter(maxCalls) {
        return (ctx) => {
            if (ctx.toolName !== 'ask_user') {
                return { action: 'allow' };
            }
            const currentCount = this.askUserCallCount.get(ctx.sessionId) || 0;
            if (currentCount >= maxCalls) {
                console.warn('[HookPipeline] ask_user rate limit exceeded', {
                    agent: ctx.agentName,
                    sessionId: ctx.sessionId,
                    currentCount,
                    maxCalls,
                });
                return {
                    action: 'block',
                    reason: `ask_user rate limit exceeded: ${currentCount}/${maxCalls} calls used for this session. The agent should proceed without user input.`,
                };
            }
            this.askUserCallCount.set(ctx.sessionId, currentCount + 1);
            return { action: 'allow' };
        };
    }
    /** Create PII scrubbing hook */
    createPiiScrubber() {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        return (ctx) => {
            let result = ctx.result;
            if (typeof result === 'string') {
                const scrubbed = result.replace(emailRegex, '[EMAIL_REDACTED]');
                if (scrubbed !== result) {
                    console.warn('[HookPipeline] PII scrubbed from tool output', {
                        tool: ctx.toolName,
                        agent: ctx.agentName,
                        sessionId: ctx.sessionId,
                    });
                    result = scrubbed;
                }
            }
            else if (result && typeof result === 'object') {
                result = this.scrubObjectRecursive(result, emailRegex);
            }
            return { result };
        };
    }
    /** Recursively scrub PII from object */
    scrubObjectRecursive(obj, regex) {
        if (typeof obj === 'string') {
            return obj.replace(regex, '[EMAIL_REDACTED]');
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.scrubObjectRecursive(item, regex));
        }
        if (obj && typeof obj === 'object') {
            const scrubbed = {};
            for (const [key, value] of Object.entries(obj)) {
                scrubbed[key] = this.scrubObjectRecursive(value, regex);
            }
            return scrubbed;
        }
        return obj;
    }
    /** Simple glob matcher (supports * and **) */
    matchGlob(path, pattern) {
        // Normalize path separators
        const normalizedPath = path.replace(/\\/g, '/');
        const normalizedPattern = pattern.replace(/\\/g, '/');
        // Convert glob pattern to regex (escape . first, then handle wildcards)
        let regexPattern = normalizedPattern
            .replace(/\./g, '\\.') // Escape literal dots first
            .replace(/\*\*/g, '___DOUBLESTAR___') // Placeholder for **
            .replace(/\*/g, '[^/]*') // Single * matches within path segment
            .replace(/___DOUBLESTAR___/g, '.*') // ** matches across segments
            .replace(/\?/g, '.'); // ? matches single char
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(normalizedPath);
    }
    /** Get the reviewer lockout hook instance */
    getReviewerLockout() {
        return this.reviewerLockout;
    }
}
// --- Reviewer Lockout Hook ---
export class ReviewerLockoutHook {
    lockoutRegistry = new Map();
    /** Lock out an agent from an artifact */
    lockout(artifactId, agentName) {
        if (!this.lockoutRegistry.has(artifactId)) {
            this.lockoutRegistry.set(artifactId, new Set());
        }
        this.lockoutRegistry.get(artifactId).add(agentName);
    }
    /** Check if an agent is locked out of an artifact */
    isLockedOut(artifactId, agentName) {
        const lockedAgents = this.lockoutRegistry.get(artifactId);
        return lockedAgents ? lockedAgents.has(agentName) : false;
    }
    /** Clear lockout for an artifact */
    clearLockout(artifactId) {
        this.lockoutRegistry.delete(artifactId);
    }
    /** Get all lockouts for an artifact */
    getLockedAgents(artifactId) {
        const lockedAgents = this.lockoutRegistry.get(artifactId);
        return lockedAgents ? Array.from(lockedAgents) : [];
    }
    /** Clear all lockouts */
    clearAll() {
        this.lockoutRegistry.clear();
    }
    /** Create pre-tool-use hook for reviewer lockout */
    createHook() {
        return (ctx) => {
            const writeTools = ['edit', 'create', 'write_file', 'create_file'];
            if (!writeTools.includes(ctx.toolName)) {
                return { action: 'allow' };
            }
            const filePath = ctx.arguments.path || ctx.arguments.file_path;
            if (!filePath || typeof filePath !== 'string') {
                return { action: 'allow' };
            }
            // Check all artifacts to see if this agent is locked out
            for (const [artifactId, lockedAgents] of this.lockoutRegistry.entries()) {
                if (lockedAgents.has(ctx.agentName)) {
                    // Agent is locked out of this artifact — check if file belongs to it
                    // Simple heuristic: artifact ID is typically a file path or pattern
                    if (filePath.includes(artifactId) || artifactId.includes(filePath)) {
                        console.warn('[HookPipeline] Reviewer lockout triggered', {
                            agent: ctx.agentName,
                            artifactId,
                            filePath,
                        });
                        return {
                            action: 'block',
                            reason: `Reviewer lockout: Agent "${ctx.agentName}" is locked out of artifact "${artifactId}". Another reviewer must handle this artifact.`,
                        };
                    }
                }
            }
            return { action: 'allow' };
        };
    }
}
//# sourceMappingURL=index.js.map