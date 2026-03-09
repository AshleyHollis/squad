/**
 * Parallel Fan-Out Session Spawning (M1-10, Issue #130)
 *
 * Spawns multiple agent sessions concurrently using Promise.allSettled
 * for maximum throughput. Each spawn compiles charter → resolves model
 * → creates session → sends initial message. Event aggregation collects
 * all session events into coordinator's event bus. Error isolation ensures
 * one session failure doesn't affect others.
 */
import type { AgentCharter } from '../agents/index.js';
import type { EventBus } from '../client/event-bus.js';
import type { SessionPool } from '../client/session-pool.js';
export interface AgentSpawnConfig {
    /** Agent name to spawn */
    agentName: string;
    /** Task description for the agent */
    task: string;
    /** Priority level */
    priority?: 'low' | 'normal' | 'high' | 'critical';
    /** Additional context to pass */
    context?: string;
    /** Model override (skips resolution) */
    modelOverride?: string;
}
export interface SpawnResult {
    /** Agent name that was spawned */
    agentName: string;
    /** Session ID if spawn succeeded */
    sessionId?: string;
    /** Spawn outcome */
    status: 'success' | 'failed';
    /** Error message if failed */
    error?: string;
    /** Start time */
    startTime: Date;
    /** End time */
    endTime: Date;
}
export interface FanOutDependencies {
    /** Charter compilation function */
    compileCharter: (agentName: string) => Promise<AgentCharter>;
    /** Model resolution function */
    resolveModel: (charter: AgentCharter, override?: string) => Promise<string>;
    /** Session creation function */
    createSession: (config: any) => Promise<{
        sessionId: string;
        sendMessage: (opts: any) => Promise<void>;
    }>;
    /** Session pool for tracking */
    sessionPool: SessionPool;
    /** Event bus for aggregation */
    eventBus: EventBus;
}
/**
 * Spawn multiple agents in parallel using Promise.allSettled.
 *
 * Each spawn:
 * 1. Compile charter.md → AgentCharter
 * 2. Resolve model (override or charter or auto-select)
 * 3. Create session via SquadClient
 * 4. Send initial message with task and context
 * 5. Aggregate events to coordinator's event bus
 *
 * Error isolation: one failure doesn't block others.
 * Returns SpawnResult[] with outcomes for each agent.
 *
 * @param configs - Array of agent spawn configurations
 * @param deps - Injected dependencies (charter compiler, model resolver, client)
 * @returns Promise resolving to array of spawn results
 */
export declare function spawnParallel(configs: AgentSpawnConfig[], deps: FanOutDependencies): Promise<SpawnResult[]>;
/**
 * Subscribe to all events from a spawned session and forward them
 * to the coordinator's event bus with agent context.
 *
 * @param sessionId - Session ID to subscribe to
 * @param agentName - Agent name for context
 * @param sessionEventEmitter - Session's event emitter (if available)
 * @param coordinatorEventBus - Coordinator's event bus
 */
export declare function aggregateSessionEvents(sessionId: string, agentName: string, sessionEventEmitter: any, // SquadSession
coordinatorEventBus: EventBus): void;
//# sourceMappingURL=fan-out.d.ts.map