/**
 * Per-Agent Model Selection (M1-9) + Model Fallback (M3-5, Issue #145)
 */
import { MODELS } from '../runtime/constants.js';
import { applyEconomyMode } from '../config/models.js';
/**
 * Resolve the appropriate model using the 4-layer priority system.
 *
 * @param options - Model resolution options
 * @returns Resolved model with tier and fallback chain
 */
export function resolveModel(options) {
    const { userOverride, charterPreference, taskType, economyMode } = options;
    // Layer 1: User Override (explicit — economy does not apply)
    if (userOverride && userOverride.trim().length > 0) {
        const tier = inferTierFromModel(userOverride);
        return {
            model: userOverride,
            tier,
            source: 'user-override',
            fallbackChain: [...MODELS.FALLBACK_CHAINS[tier]],
        };
    }
    // Layer 2: Charter Preference (explicit — economy does not apply)
    if (charterPreference && charterPreference.trim().length > 0 && charterPreference !== 'auto') {
        const tier = inferTierFromModel(charterPreference);
        return {
            model: charterPreference,
            tier,
            source: 'charter',
            fallbackChain: [...MODELS.FALLBACK_CHAINS[tier]],
        };
    }
    // Layer 3: Task-Aware Auto-Selection (economy mode applies)
    const autoSelected = selectModelForTask(taskType, economyMode);
    if (autoSelected) {
        return autoSelected;
    }
    // Layer 4: Default (economy mode applies)
    const defaultModel = economyMode
        ? applyEconomyMode(MODELS.SELECTOR_DEFAULT)
        : MODELS.SELECTOR_DEFAULT;
    const defaultTier = inferTierFromModel(defaultModel);
    return {
        model: defaultModel,
        tier: defaultTier,
        source: 'default',
        fallbackChain: [...MODELS.FALLBACK_CHAINS[defaultTier]],
    };
}
/**
 * Select model based on task type, with optional economy mode substitution.
 *
 * @param taskType - Type of task being performed
 * @param economyMode - When true, downgrade model to cheaper alternative
 * @returns Resolved model or undefined if no match
 */
function selectModelForTask(taskType, economyMode) {
    let model;
    let tier;
    switch (taskType) {
        case 'code':
            model = 'claude-sonnet-4.6';
            tier = 'standard';
            break;
        case 'prompt':
            model = 'claude-sonnet-4.6';
            tier = 'standard';
            break;
        case 'visual':
            model = 'claude-opus-4.6';
            tier = 'premium';
            break;
        case 'docs':
        case 'planning':
        case 'mechanical':
            model = 'claude-haiku-4.5';
            tier = 'fast';
            break;
        default:
            return undefined;
    }
    if (economyMode) {
        model = applyEconomyMode(model);
        tier = inferTierFromModel(model);
    }
    return {
        model,
        tier,
        source: 'task-auto',
        fallbackChain: [...MODELS.FALLBACK_CHAINS[tier]],
    };
}
export function inferTierFromModel(model) {
    const lowerModel = model.toLowerCase();
    if (lowerModel.includes('opus')) {
        return 'premium';
    }
    if (lowerModel.includes('haiku') || lowerModel.includes('mini')) {
        return 'fast';
    }
    // Default to standard for sonnet, gpt-5.x, etc.
    return 'standard';
}
// ============================================================================
// Model Fallback Executor (M3-5, Issue #145)
// ============================================================================
const TIER_ORDER = { premium: 0, standard: 1, fast: 2 };
export function isTierFallbackAllowed(fromTier, toTier, allowCrossTier) {
    if (allowCrossTier)
        return true;
    if (fromTier === toTier)
        return true;
    return TIER_ORDER[toTier] <= TIER_ORDER[fromTier];
}
export class ModelFallbackExecutor {
    allowCrossTier;
    eventBus;
    history = new Map();
    constructor(config = {}) {
        this.allowCrossTier = config.allowCrossTier ?? false;
        this.eventBus = config.eventBus;
    }
    async execute(resolved, agentName, fn) {
        const attempts = [];
        const originalTier = resolved.tier;
        const candidates = this.buildCandidateList(resolved);
        for (const candidate of candidates) {
            const candidateTier = inferTierFromModel(candidate);
            if (!isTierFallbackAllowed(originalTier, candidateTier, this.allowCrossTier)) {
                continue;
            }
            try {
                const value = await fn(candidate);
                if (!this.history.has(agentName))
                    this.history.set(agentName, []);
                this.history.get(agentName).push(...attempts);
                return { value, model: candidate, tier: candidateTier, attempts, didFallback: attempts.length > 0 };
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                const attempt = { model: candidate, tier: candidateTier, error: errorMsg, timestamp: new Date() };
                attempts.push(attempt);
                await this.emitEvent('agent:milestone', { event: 'model.fallback', agentName, failedModel: candidate, failedTier: candidateTier, error: errorMsg, attemptNumber: attempts.length });
            }
        }
        if (!this.history.has(agentName))
            this.history.set(agentName, []);
        this.history.get(agentName).push(...attempts);
        await this.emitEvent('agent:milestone', { event: 'model.exhausted', agentName, originalModel: resolved.model, originalTier, totalAttempts: attempts.length });
        throw new Error(`All models exhausted for agent '${agentName}'. Tried ${attempts.length} model(s): ${attempts.map(a => a.model).join(', ')}`);
    }
    getHistory(agentName) {
        return this.history.get(agentName) ?? [];
    }
    clearHistory() {
        this.history.clear();
    }
    buildCandidateList(resolved) {
        const seen = new Set();
        const result = [];
        const add = (m) => { if (!seen.has(m)) {
            seen.add(m);
            result.push(m);
        } };
        add(resolved.model);
        for (const fb of resolved.fallbackChain)
            add(fb);
        return result;
    }
    async emitEvent(type, payload) {
        if (!this.eventBus)
            return;
        await this.eventBus.emit({ type: type, payload, timestamp: new Date() });
    }
}
//# sourceMappingURL=model-selector.js.map