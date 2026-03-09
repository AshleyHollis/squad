/**
 * Ralph — Work Monitor (PRD 8)
 *
 * Persistent SDK session that monitors agent work in real time.
 * Replaces ephemeral polling spawns with an event-driven observer
 * that accumulates knowledge across monitoring cycles.
 *
 * Three monitoring layers:
 *   1. In-session: Event subscriptions via EventBus
 *   2. Watchdog: Periodic health checks on session pool
 *   3. Cloud heartbeat: External health signal (future)
 */
import type { EventBus } from '../runtime/event-bus.js';
export interface MonitorConfig {
    /** Team root directory */
    teamRoot: string;
    /** Health check interval (ms, default: 30000) */
    healthCheckInterval?: number;
    /** Stale session threshold (ms, default: 300000) */
    staleSessionThreshold?: number;
    /** Path to persist monitor state for crash recovery */
    statePath?: string;
}
export interface AgentWorkStatus {
    agentName: string;
    sessionId: string;
    status: 'working' | 'idle' | 'stale' | 'error';
    lastActivity: Date;
    currentTask?: string;
    milestones: string[];
}
export interface MonitorState {
    /** Timestamp of last health check */
    lastHealthCheck: Date | null;
    /** Per-agent work status */
    agents: Map<string, AgentWorkStatus>;
    /** Accumulated observations across cycles */
    observations: string[];
}
export declare class RalphMonitor {
    private config;
    private state;
    private eventBus;
    private unsubscribers;
    private healthCheckTimer;
    constructor(config: MonitorConfig);
    /** Start monitoring — subscribe to EventBus and begin health checks */
    start(eventBus: EventBus): Promise<void>;
    /** Handle an incoming event from the EventBus */
    private handleEvent;
    /** Run a health check across all tracked agent sessions */
    healthCheck(): Promise<AgentWorkStatus[]>;
    /** Get current work status for all agents */
    getStatus(): AgentWorkStatus[];
    /** Stop monitoring and persist final state */
    stop(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map