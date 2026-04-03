/**
 * Model Configuration & Registry
 *
 * Defines the full model catalog and provides model lookup, fallback chains,
 * and availability checking. Implements the model tier system from squad.agent.md.
 *
 * @module config/models
 */
import type { ModelId, ModelTier } from '../runtime/config.js';
/**
 * Per-token pricing in USD.
 */
export interface ModelPricing {
    /** Cost per input token in USD */
    inputPerToken: number;
    /** Cost per output token in USD */
    outputPerToken: number;
}
/**
 * Model capability information.
 */
export interface ModelInfo {
    /** Model identifier */
    id: ModelId;
    /** Model tier */
    tier: ModelTier;
    /** Provider (anthropic, openai, google) */
    provider: 'anthropic' | 'openai' | 'google';
    /** Model family */
    family: 'claude' | 'gpt' | 'gemini';
    /** Supports vision/multimodal input */
    vision?: boolean;
    /** Typical use cases */
    useCases?: string[];
    /** Relative cost (1-10 scale, 10 = most expensive) */
    cost?: number;
    /** Relative speed (1-10 scale, 10 = fastest) */
    speed?: number;
    /** Per-token pricing in USD (if known) */
    pricing?: ModelPricing;
}
/**
 * Full model catalog from squad.agent.md.
 */
export declare const MODEL_CATALOG: ModelInfo[];
/**
 * Default fallback chains per tier from squad.agent.md.
 */
export declare const DEFAULT_FALLBACK_CHAINS: Record<ModelTier, ModelId[]>;
/**
 * Model registry for lookups and availability checking.
 */
export declare class ModelRegistry {
    private catalog;
    private tierIndex;
    private providerIndex;
    constructor(catalog?: ModelInfo[]);
    /**
     * Gets model information by ID.
     *
     * @param id - Model identifier
     * @returns Model info if found, null otherwise
     */
    getModelInfo(id: ModelId): ModelInfo | null;
    /**
     * Checks if a model is available in the catalog.
     *
     * @param id - Model identifier
     * @returns True if model exists in catalog
     */
    isModelAvailable(id: ModelId): boolean;
    /**
     * Gets all models for a specific tier.
     *
     * @param tier - Model tier
     * @returns Array of models in that tier
     */
    getModelsByTier(tier: ModelTier): ModelInfo[];
    /**
     * Gets all models from a specific provider.
     *
     * @param provider - Provider name
     * @returns Array of models from that provider
     */
    getModelsByProvider(provider: string): ModelInfo[];
    /**
     * Gets the fallback chain for a specific tier.
     *
     * @param tier - Model tier
     * @param preferSameProvider - If true, prefer models from same provider
     * @param currentModel - Current model (for provider preference)
     * @returns Ordered array of fallback model IDs
     */
    getFallbackChain(tier: ModelTier, preferSameProvider?: boolean, currentModel?: ModelId): ModelId[];
    /**
     * Gets the next fallback model in the chain.
     *
     * @param currentModel - Current model that failed
     * @param tier - Model tier
     * @param attemptedModels - Models already attempted
     * @returns Next fallback model ID, or null if chain exhausted
     */
    getNextFallback(currentModel: ModelId, tier: ModelTier, attemptedModels?: Set<ModelId>): ModelId | null;
    /**
     * Gets model recommendations based on use case.
     *
     * @param useCase - Desired use case
     * @param tier - Optional tier constraint
     * @returns Recommended models sorted by relevance
     */
    getRecommendedModels(useCase: string, tier?: ModelTier): ModelInfo[];
    /**
     * Gets all model IDs in the catalog.
     *
     * @returns Array of all model IDs
     */
    getAllModelIds(): ModelId[];
    /**
     * Gets catalog statistics.
     *
     * @returns Catalog stats
     */
    getStats(): {
        total: number;
        byTier: Record<ModelTier, number>;
        byProvider: Record<string, number>;
    };
}
/**
 * Default model registry instance.
 */
export declare const defaultRegistry: ModelRegistry;
/**
 * Gets model information by ID (convenience function).
 */
export declare function getModelInfo(id: ModelId): ModelInfo | null;
/**
 * Gets fallback chain for a tier (convenience function).
 */
export declare function getFallbackChain(tier: ModelTier): ModelId[];
/**
 * Checks if model is available (convenience function).
 */
export declare function isModelAvailable(id: ModelId): boolean;
/**
 * Estimate the cost of a model invocation based on token counts and
 * the SDK's built-in pricing table.
 *
 * @returns Estimated cost in USD, or 0 if pricing is unavailable for the model.
 */
export declare function estimateCost(model: string, inputTokens: number, outputTokens: number): number;
/**
 * Economy mode model map: normal model → cheaper alternative.
 *
 * Applied at Layer 3 (task-aware auto) and Layer 4 (default) when
 * economy mode is active. Layers 0–2 (explicit preferences) are
 * never substituted — the user's explicit choice always wins.
 *
 * Table source: issue #500
 */
export declare const ECONOMY_MODEL_MAP: Record<string, string>;
/**
 * Applies economy mode substitution to a model ID.
 * Returns the cheaper economy alternative, or the original if no mapping exists.
 */
export declare function applyEconomyMode(model: string): string;
/**
 * Shape of model preference fields within `.squad/config.json`.
 */
export interface ModelPreferenceConfig {
    defaultModel?: string;
    agentModelOverrides?: Record<string, string>;
    economyMode?: boolean;
}
/**
 * Reads the economy mode setting from `.squad/config.json`.
 *
 * @param squadDir - Path to the `.squad/` directory
 * @returns True if economyMode is enabled, false otherwise
 */
export declare function readEconomyMode(squadDir: string): boolean;
/**
 * Writes the economy mode setting to `.squad/config.json`.
 * Merges with existing config — does not overwrite other fields.
 *
 * @param squadDir - Path to the `.squad/` directory
 * @param enabled - Whether economy mode should be enabled
 */
export declare function writeEconomyMode(squadDir: string, enabled: boolean): void;
/**
 * Reads the persistent model preference from `.squad/config.json`.
 *
 * @param squadDir - Path to the `.squad/` directory
 * @returns The defaultModel string if set, or null
 */
export declare function readModelPreference(squadDir: string): string | null;
/**
 * Reads per-agent model overrides from `.squad/config.json`.
 *
 * @param squadDir - Path to the `.squad/` directory
 * @returns Record of agent name → model ID, or empty object
 */
export declare function readAgentModelOverrides(squadDir: string): Record<string, string>;
/**
 * Writes a persistent model preference to `.squad/config.json`.
 * Merges with existing config — does not overwrite other fields.
 *
 * @param squadDir - Path to the `.squad/` directory
 * @param model - Model ID to persist, or null to clear
 */
export declare function writeModelPreference(squadDir: string, model: string | null): void;
/**
 * Writes per-agent model overrides to `.squad/config.json`.
 * Merges with existing config — does not overwrite other fields.
 *
 * @param squadDir - Path to the `.squad/` directory
 * @param overrides - Record of agent name → model ID, or null to clear
 */
export declare function writeAgentModelOverrides(squadDir: string, overrides: Record<string, string> | null): void;
/**
 * Resolves the effective model for an agent spawn using the 5-layer hierarchy:
 *   Layer 0: Persistent config (.squad/config.json defaultModel)
 *   Layer 1: Session-wide user directive ("always use opus")
 *   Layer 2: Charter preference (agent's ## Model section)
 *   Layer 3: Task-aware auto-selection (code → sonnet, docs → haiku)
 *   Layer 4: Default (claude-haiku-4.5)
 *
 * Per-agent overrides from config.json take priority over the global defaultModel.
 *
 * Economy mode modifier: when active (via economyMode option or config.json),
 * shifts model selection at Layer 3 and Layer 4 to cheaper alternatives per
 * ECONOMY_MODEL_MAP. Layers 0–2 (explicit user preferences) are never overridden.
 *
 * @param options - Resolution inputs
 * @returns Resolved model ID
 */
export declare function resolveModel(options: {
    agentName?: string;
    squadDir?: string;
    sessionDirective?: string | null;
    charterPreference?: string | null;
    taskModel?: string | null;
    /** When true, apply economy mode substitution at Layer 3/4. Overrides config. */
    economyMode?: boolean;
}): string;
//# sourceMappingURL=models.d.ts.map