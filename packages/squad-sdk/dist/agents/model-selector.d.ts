/**
 * Per-Agent Model Selection (M1-9) + Model Fallback (M3-5, Issue #145)
 */
import type { EventBus } from '../runtime/event-bus.js';
/**
 * Task types that influence model selection.
 */
export type TaskType = 'code' | 'prompt' | 'docs' | 'visual' | 'planning' | 'mechanical';
/**
 * Model tier classification.
 */
export type ModelTier = 'premium' | 'standard' | 'fast';
/**
 * Source of the model resolution.
 */
export type ModelResolutionSource = 'user-override' | 'charter' | 'task-auto' | 'default';
/**
 * Options for model resolution.
 */
export interface ModelResolutionOptions {
    /** User-specified model override */
    userOverride?: string;
    /** Model preference from agent's charter (## Model section) */
    charterPreference?: string;
    /** Type of task being performed */
    taskType: TaskType;
    /** Agent role (for context) */
    agentRole?: string;
}
/**
 * Result of model resolution.
 */
export interface ResolvedModel {
    /** Selected model identifier */
    model: string;
    /** Model tier classification */
    tier: ModelTier;
    /** Source that determined the model */
    source: ModelResolutionSource;
    /** Fallback chain for this tier */
    fallbackChain: string[];
}
/**
 * Resolve the appropriate model using the 4-layer priority system.
 *
 * @param options - Model resolution options
 * @returns Resolved model with tier and fallback chain
 */
export declare function resolveModel(options: ModelResolutionOptions): ResolvedModel;
export declare function inferTierFromModel(model: string): ModelTier;
export declare function isTierFallbackAllowed(fromTier: ModelTier, toTier: ModelTier, allowCrossTier: boolean): boolean;
export interface FallbackAttempt {
    model: string;
    tier: ModelTier;
    error: string;
    timestamp: Date;
}
export interface FallbackResult<T> {
    value: T;
    model: string;
    tier: ModelTier;
    attempts: FallbackAttempt[];
    didFallback: boolean;
}
export interface FallbackExecutorConfig {
    allowCrossTier?: boolean;
    eventBus?: EventBus;
}
export declare class ModelFallbackExecutor {
    private allowCrossTier;
    private eventBus?;
    private history;
    constructor(config?: FallbackExecutorConfig);
    execute<T>(resolved: ResolvedModel, agentName: string, fn: (model: string) => Promise<T>): Promise<FallbackResult<T>>;
    getHistory(agentName: string): FallbackAttempt[];
    clearHistory(): void;
    private buildCandidateList;
    private emitEvent;
}
//# sourceMappingURL=model-selector.d.ts.map