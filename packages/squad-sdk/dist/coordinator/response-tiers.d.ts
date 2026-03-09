/**
 * Response Tier Selection (M3-4, Issue #143)
 *
 * Not all tasks need the same level of agent involvement. This module
 * selects one of four response tiers based on message complexity,
 * keyword patterns, config overrides, and history hints.
 *
 * Tiers:
 *   Direct      — Answer inline, no agent spawn
 *   Lightweight — Single fast-model agent
 *   Standard    — Single standard-model agent
 *   Full        — Multi-agent fan-out (premium models)
 */
import type { SquadConfig } from '../config/schema.js';
export type TierName = 'direct' | 'lightweight' | 'standard' | 'full';
export type ModelTierSuggestion = 'none' | 'fast' | 'standard' | 'premium';
export interface ResponseTier {
    /** Tier identifier */
    tier: TierName;
    /** Suggested model tier */
    modelTier: ModelTierSuggestion;
    /** Maximum agents to spawn */
    maxAgents: number;
    /** Per-agent timeout in seconds */
    timeout: number;
}
export interface TierContext {
    /** Recent conversation history (summaries) */
    recentHistory?: string[];
    /** Names of currently available agents */
    agentAvailability?: string[];
    /** Number of currently active sessions */
    currentLoad?: number;
}
/** Get a tier definition by name. */
export declare function getTier(name: TierName): ResponseTier;
/**
 * Select the appropriate response tier for an incoming message.
 *
 * Priority order:
 *  1. Config routing-rule tier overrides
 *  2. Full-tier keyword patterns
 *  3. Direct-tier keyword patterns (short / simple)
 *  4. Lightweight keyword patterns
 *  5. Context-based adjustments (load, history)
 *  6. Default → standard
 */
export declare function selectResponseTier(message: string, config: SquadConfig, context?: TierContext): ResponseTier;
//# sourceMappingURL=response-tiers.d.ts.map