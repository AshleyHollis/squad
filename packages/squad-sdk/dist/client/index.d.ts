/**
 * Squad Client — High-Level API with Session Pool Management (PRD 1)
 *
 * This module provides the main Squad client API that combines:
 * - SquadClient adapter (from adapter/client.ts) for connection management
 * - SessionPool for multi-session lifecycle management
 * - EventBus for cross-session event handling
 *
 * Applications should import from this module, not from adapter/ directly.
 */
export { SquadClient, type SquadClientOptions, type SquadConnectionState, } from '../adapter/client.js';
export type { SquadSession, SquadSessionConfig, SquadSessionMetadata, SquadGetStatusResponse, SquadGetAuthStatusResponse, SquadModelInfo, SquadClientEventType, SquadClientEvent, SquadClientEventHandler, SquadPermissionHandler, SquadPermissionRequest, SquadPermissionRequestResult, } from '../adapter/types.js';
export type SessionStatus = 'creating' | 'active' | 'idle' | 'error' | 'destroyed';
export { SessionPool, type SessionPoolConfig, type PoolEvent, DEFAULT_POOL_CONFIG } from './session-pool.js';
export { EventBus, type SquadEvent, type SquadEventType } from './event-bus.js';
import { type SquadClientOptions } from '../adapter/client.js';
import type { SquadSession, SquadSessionConfig, SquadClientEventType, SquadClientEvent, SquadClientEventHandler } from '../adapter/types.js';
import { SessionPool, type SessionPoolConfig } from './session-pool.js';
import { EventBus } from './event-bus.js';
export interface SquadClientWithPoolConfig extends SquadClientOptions {
    /** Session pool configuration */
    pool?: Partial<SessionPoolConfig>;
}
/**
 * Squad Client with integrated session pool management.
 *
 * This is the recommended client for applications that need to manage
 * multiple concurrent agent sessions. It provides:
 * - Connection lifecycle management (from SquadClient)
 * - Session pool with capacity limits and health checks
 * - Event bus for cross-session event handling
 *
 * @example
 * ```typescript
 * const client = new SquadClientWithPool({
 *   pool: { maxConcurrent: 5 }
 * });
 *
 * await client.connect();
 *
 * const session1 = await client.createSession({ model: 'claude-sonnet-4.5' });
 * const session2 = await client.createSession({ model: 'claude-haiku-4.5' });
 *
 * client.eventBus.on('session.created', (event) => {
 *   console.log('New session:', event.sessionId);
 * });
 *
 * await client.shutdown();
 * ```
 */
export declare class SquadClientWithPool {
    private baseClient;
    readonly pool: SessionPool;
    readonly eventBus: EventBus;
    constructor(config?: SquadClientWithPoolConfig);
    /** Connect to the Copilot CLI server */
    connect(): Promise<void>;
    /** Disconnect from the Copilot CLI server */
    disconnect(): Promise<Error[]>;
    /** Force disconnect without graceful cleanup */
    forceDisconnect(): Promise<void>;
    /** Get current connection state */
    getState(): import("../adapter/client.js").SquadConnectionState;
    /** Check if connected */
    isConnected(): boolean;
    /**
     * Create a new session and add it to the pool.
     * Throws if the pool is at capacity.
     */
    createSession(config?: SquadSessionConfig): Promise<SquadSession>;
    /**
     * Resume an existing session and add it to the pool if not present.
     */
    resumeSession(sessionId: string, config?: SquadSessionConfig): Promise<SquadSession>;
    /**
     * Delete a session and remove it from the pool.
     */
    deleteSession(sessionId: string): Promise<void>;
    /** List all sessions from the base client */
    listSessions(): Promise<import("../adapter/types.js").SquadSessionMetadata[]>;
    /** Send a ping to verify connectivity */
    ping(message?: string): Promise<{
        message: string;
        timestamp: number;
        protocolVersion?: number;
    }>;
    /** Get CLI status information */
    getStatus(): Promise<import("../adapter/types.js").SquadGetStatusResponse>;
    /** Get authentication status */
    getAuthStatus(): Promise<import("../adapter/types.js").SquadGetAuthStatusResponse>;
    /** List available models */
    listModels(): Promise<import("../adapter/types.js").SquadModelInfo[]>;
    /** Subscribe to client-level session lifecycle events */
    on<K extends SquadClientEventType>(eventType: K, handler: (event: SquadClientEvent & {
        type: K;
    }) => void): () => void;
    on(handler: SquadClientEventHandler): () => void;
    /**
     * Graceful shutdown — destroy all sessions and disconnect.
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map