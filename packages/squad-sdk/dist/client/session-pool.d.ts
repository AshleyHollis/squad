/**
 * Session Pool Manager (PRD 1)
 *
 * Manages the lifecycle of multiple concurrent agent sessions.
 * Tracks session state, enforces concurrency limits, and handles
 * cleanup of idle/errored sessions.
 */
export type SessionStatus = 'creating' | 'active' | 'idle' | 'error' | 'destroyed';
export interface SquadSession {
    id: string;
    agentName: string;
    status: SessionStatus;
    createdAt: Date;
}
export interface SessionPoolConfig {
    /** Maximum concurrent sessions */
    maxConcurrent: number;
    /** Idle timeout before auto-cleanup (ms) */
    idleTimeout: number;
    /** Health check interval (ms) */
    healthCheckInterval: number;
}
export declare const DEFAULT_POOL_CONFIG: SessionPoolConfig;
export type PoolEventType = 'session.added' | 'session.removed' | 'session.status_changed' | 'pool.at_capacity' | 'pool.health_check';
export interface PoolEvent {
    type: PoolEventType;
    sessionId?: string;
    oldStatus?: SessionStatus;
    newStatus?: SessionStatus;
    timestamp: Date;
}
export declare class SessionPool {
    private config;
    private sessions;
    private healthCheckTimer;
    private cleanupTimer;
    private listeners;
    constructor(config?: Partial<SessionPoolConfig>);
    /** Add a session to the pool */
    add(session: SquadSession): void;
    /** Remove a session from the pool */
    remove(sessionId: string): boolean;
    /** Get a session by ID */
    get(sessionId: string): SquadSession | undefined;
    /** Find a session by agent name */
    findByAgent(agentName: string): SquadSession | undefined;
    /** Get all active sessions */
    active(): SquadSession[];
    /** Update session status and emit event */
    updateStatus(sessionId: string, newStatus: SessionStatus): void;
    /** Current pool size */
    get size(): number;
    /** Whether the pool is at capacity */
    get atCapacity(): boolean;
    /** Destroy all sessions and stop timers */
    shutdown(): Promise<void>;
    /** Subscribe to pool events */
    on(handler: (event: PoolEvent) => void): () => void;
    /** Emit a pool event to all listeners */
    private emitEvent;
    /** Start the health check timer */
    private startHealthCheckTimer;
    /** Start the idle session cleanup timer */
    private startCleanupTimer;
}
//# sourceMappingURL=session-pool.d.ts.map