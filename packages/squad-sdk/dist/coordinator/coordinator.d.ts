/**
 * Squad Coordinator (M3-1, Issue #135)
 *
 * The brain of Squad — receives user messages, decides how to handle them,
 * and orchestrates agent spawning. Wires together:
 *   - DirectResponseHandler (no-spawn fast path)
 *   - Routing rules (matchRoute / compileRoutingRules)
 *   - Charter compilation (compileCharter)
 *   - Model selection (resolveModel)
 *   - Fan-out spawning (spawnParallel)
 *   - Event bus (observability)
 */
import type { EventBus } from '../runtime/event-bus.js';
import type { SquadConfig } from '../runtime/config.js';
import { DirectResponseHandler, type CoordinatorContext, type DirectResponseResult } from './direct-response.js';
import { type CompiledRouter, type RoutingMatch } from '../config/routing.js';
import { type SpawnResult, type FanOutDependencies } from './fan-out.js';
export type { CoordinatorContext } from './direct-response.js';
export type SpawnStrategy = 'direct' | 'single' | 'multi' | 'fallback';
export interface CoordinatorResult {
    /** How the message was handled */
    strategy: SpawnStrategy;
    /** Direct response (if strategy is 'direct') */
    directResponse?: DirectResponseResult;
    /** Routing match info */
    routing?: RoutingMatch;
    /** Spawn results (if agents were spawned) */
    spawnResults?: SpawnResult[];
    /** Time taken to handle the message in ms */
    durationMs: number;
}
export interface SquadCoordinatorOptions {
    /** Squad configuration */
    config: SquadConfig;
    /** Event bus for observability */
    eventBus?: EventBus;
    /** Fan-out dependencies (charter compiler, model resolver, session creator) */
    fanOutDeps?: FanOutDependencies;
    /** Custom direct-response handler */
    directHandler?: DirectResponseHandler;
    /** Custom compiled router (skips compilation from config) */
    compiledRouter?: CompiledRouter;
}
/**
 * Main coordinator entry point.
 *
 * Pipeline:
 * 1. Direct response check (no-spawn fast path)
 * 2. Route analysis (message → routing rules → agent selection)
 * 3. Spawn strategy (single vs multi vs fallback)
 * 4. Fan-out spawn
 * 5. Collect results + emit events
 */
export declare class SquadCoordinator {
    private config;
    private eventBus?;
    private directHandler;
    private compiledRouter;
    private fanOutDeps?;
    constructor(options: SquadCoordinatorOptions);
    /**
     * Main dispatch — handle an incoming user message.
     */
    handleMessage(message: string, context: CoordinatorContext): Promise<CoordinatorResult>;
    /**
     * Get the compiled router (for inspection / testing).
     */
    getRouter(): CompiledRouter;
    /**
     * Get the direct response handler (for inspection / testing).
     */
    getDirectHandler(): DirectResponseHandler;
    /**
     * Update configuration at runtime.
     */
    updateConfig(config: SquadConfig): void;
    private determineStrategy;
    private buildSpawnConfigs;
    private compileRouter;
    private emit;
}
//# sourceMappingURL=coordinator.d.ts.map