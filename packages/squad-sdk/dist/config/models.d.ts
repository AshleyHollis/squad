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
//# sourceMappingURL=models.d.ts.map