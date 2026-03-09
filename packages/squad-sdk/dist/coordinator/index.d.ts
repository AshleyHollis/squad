/**
 * Coordinator Orchestrator (PRD 5)
 *
 * The central orchestration engine. Replaces the 32KB squad.agent.md
 * prompt-based coordinator with a TypeScript program that manages
 * agent sessions, routes work, and observes progress via SDK events.
 */
export { SquadCoordinator, type SquadCoordinatorOptions, type CoordinatorResult, type SpawnStrategy, type CoordinatorContext, } from './coordinator.js';
export { DirectResponseHandler, type DirectResponseResult, type DirectResponseCategory, type DirectResponsePattern, } from './direct-response.js';
export { spawnParallel, aggregateSessionEvents, type AgentSpawnConfig, type SpawnResult, type FanOutDependencies, } from './fan-out.js';
export { selectResponseTier, getTier, type TierName, type TierContext, type ModelTierSuggestion, } from './response-tiers.js';
import type { SquadClient } from '../client/index.js';
import type { EventBus } from '../runtime/event-bus.js';
import type { AgentSessionManager } from '../agents/index.js';
import type { HookPipeline } from '../hooks/index.js';
import type { ToolRegistry } from '../tools/index.js';
export type ResponseTier = 'direct' | 'lightweight' | 'standard' | 'full';
export interface RoutingDecision {
    /** Tier of response based on complexity */
    tier: ResponseTier;
    /** Target agent(s) for this request */
    agents: string[];
    /** Whether agents should run in parallel */
    parallel: boolean;
    /** Routing rationale (for observability) */
    rationale: string;
}
export interface CoordinatorConfig {
    /** Path to the team root (.squad/ directory) */
    teamRoot: string;
    /** Default model for routing decisions */
    model?: string;
    /** Enable parallel fan-out for multi-agent tasks */
    enableParallel?: boolean;
}
export interface CoordinatorDeps {
    client?: SquadClient;
    eventBus?: EventBus;
    agentManager?: AgentSessionManager;
    hookPipeline?: HookPipeline;
    toolRegistry?: ToolRegistry;
}
export declare class Coordinator {
    private client;
    private eventBus;
    private agentManager;
    private hookPipeline;
    private toolRegistry;
    private config;
    private initialized;
    private unsubscribers;
    constructor(config: CoordinatorConfig, deps?: CoordinatorDeps);
    /** Initialize the coordinator: wire up event subscriptions and mark ready */
    initialize(): Promise<void>;
    /** Route an incoming user message to the appropriate agent(s) */
    route(message: string): Promise<RoutingDecision>;
    /** Execute a routing decision: emit routing event on EventBus */
    execute(decision: RoutingDecision, message: string): Promise<void>;
    /** Graceful shutdown: unsubscribe from events and release references */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map