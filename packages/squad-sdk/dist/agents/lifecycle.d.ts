/**
 * Agent Session Lifecycle (M1-7)
 *
 * Orchestrates the complete lifecycle of agent sessions:
 * - Spawning: charter compilation, model selection, session creation
 * - Management: status tracking, message handling
 * - Destruction: graceful shutdown and history saving
 */
import { SquadClientWithPool } from '../client/index.js';
import { type TaskType } from './model-selector.js';
/**
 * Agent handle status.
 */
export type AgentStatus = 'spawning' | 'active' | 'idle' | 'error' | 'destroyed';
/**
 * Handle to a spawned agent session.
 * Provides control and communication interface to the agent.
 */
export interface AgentHandle {
    /** Agent name (e.g., 'verbal', 'fenster') */
    agentName: string;
    /** Underlying session ID from Squad Client */
    sessionId: string;
    /** Model being used for this agent */
    model: string;
    /** Current agent status */
    status: AgentStatus;
    /** Timestamp when agent was spawned */
    createdAt: Date;
    /** Last activity timestamp (for idle timeout) */
    lastActivityAt: Date;
    /**
     * Send a message to the agent.
     * @param prompt - User message or task prompt
     */
    sendMessage(prompt: string): Promise<void>;
    /**
     * Destroy the agent session gracefully.
     * Saves history and cleans up resources.
     */
    destroy(): Promise<void>;
}
/**
 * Options for spawning an agent.
 */
export interface SpawnAgentOptions {
    /** Agent name (e.g., 'verbal', 'fenster') */
    agentName: string;
    /** Task prompt to send to the agent */
    task: string;
    /** Task type for model selection */
    taskType?: TaskType;
    /** User-specified model override */
    modelOverride?: string;
    /** Team context content (team.md) */
    teamContext?: string;
    /** Routing rules content */
    routingRules?: string;
    /** Relevant decision records */
    decisions?: string;
    /** Idle timeout in milliseconds (default: 5 minutes) */
    idleTimeout?: number;
}
/**
 * Configuration for the lifecycle manager.
 */
export interface LifecycleManagerConfig {
    /** Squad client instance */
    client: SquadClientWithPool;
    /** Path to team root directory */
    teamRoot: string;
    /** Default idle timeout (default: 5 minutes) */
    defaultIdleTimeout?: number;
}
/**
 * Manages the full lifecycle of agent sessions.
 *
 * Coordinates charter compilation, model selection, session creation,
 * and graceful shutdown with history persistence.
 */
export declare class AgentLifecycleManager {
    private client;
    private teamRoot;
    private defaultIdleTimeout;
    private agents;
    private idleCheckTimer;
    constructor(config: LifecycleManagerConfig);
    /**
     * Spawn a new agent with full lifecycle setup.
     *
     * Pipeline:
     * 1. Read charter.md from team root
     * 2. Compile charter with team context
     * 3. Resolve model using 4-layer priority
     * 4. Create session via Squad Client
     * 5. Set up event handlers
     * 6. Return AgentHandle
     *
     * @param options - Spawn options
     * @returns Agent handle for control and communication
     */
    spawnAgent(options: SpawnAgentOptions): Promise<AgentHandle>;
    /**
     * Destroy an agent gracefully.
     * Saves history and cleans up session.
     *
     * @param handle - Agent handle to destroy
     */
    destroyAgent(handle: AgentHandle): Promise<void>;
    /**
     * List all active agent sessions.
     *
     * @returns Array of active agent handles
     */
    listActive(): AgentHandle[];
    /**
     * Get agent handle by session ID.
     *
     * @param sessionId - Session ID to look up
     * @returns Agent handle or undefined
     */
    getAgent(sessionId: string): AgentHandle | undefined;
    /**
     * Shutdown all agents gracefully.
     */
    shutdown(): Promise<void>;
    /**
     * Start periodic idle timeout checker.
     * @private
     */
    private startIdleChecker;
    /**
     * Extract model preference from charter content.
     * @private
     */
    private extractModelPreference;
}
//# sourceMappingURL=lifecycle.d.ts.map