/**
 * Central constants — single source of truth for model names, timeouts, roles.
 * All magic values live here. Environment variables override where noted.
 *
 * @module runtime/constants
 */
export declare const MODELS: {
    /** Default model for config files and new projects (env-overridable) */
    readonly DEFAULT: string;
    /** Default model for model-selector Layer 4 — cost-first */
    readonly SELECTOR_DEFAULT: "claude-haiku-4.5";
    /** Default tier for the model-selector Layer 4 fallback */
    readonly SELECTOR_DEFAULT_TIER: "fast";
    /** Fallback chains by tier — ordered by preference */
    readonly FALLBACK_CHAINS: {
        readonly premium: readonly ["claude-opus-4.6", "claude-opus-4.6-fast", "claude-opus-4.5", "claude-sonnet-4.6"];
        readonly standard: readonly ["claude-sonnet-4.6", "gpt-5.4", "claude-sonnet-4.5", "gpt-5.3-codex", "claude-sonnet-4", "gpt-5.2"];
        readonly fast: readonly ["claude-haiku-4.5", "gpt-5.1-codex-mini", "gpt-4.1", "gpt-5-mini"];
    };
    /** Nuclear fallback model when all chains are exhausted */
    readonly NUCLEAR_FALLBACK: "claude-haiku-4.5";
    /** Maximum retries before nuclear fallback engages */
    readonly NUCLEAR_MAX_RETRIES: 3;
};
export declare const TIMEOUTS: {
    /** Health check timeout in milliseconds */
    readonly HEALTH_CHECK_MS: number;
    /** Git clone timeout in milliseconds */
    readonly GIT_CLONE_MS: number;
    /** Plugin/marketplace fetch timeout in milliseconds */
    readonly PLUGIN_FETCH_MS: number;
    /** Session response timeout in milliseconds (env-overridable, default 10 min) */
    readonly SESSION_RESPONSE_MS: number;
};
export declare const AGENT_ROLES: readonly ["lead", "developer", "tester", "designer", "scribe", "coordinator"];
export type AgentRole = typeof AGENT_ROLES[number];
//# sourceMappingURL=constants.d.ts.map