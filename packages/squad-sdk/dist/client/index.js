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
// Re-export core types and classes from adapter layer
export { SquadClient, } from '../adapter/client.js';
// Re-export pool and event bus
export { SessionPool, DEFAULT_POOL_CONFIG } from './session-pool.js';
export { EventBus } from './event-bus.js';
// --- High-Level Client with Pool Management ---
import { SquadClient as BaseSquadClient } from '../adapter/client.js';
import { SessionPool } from './session-pool.js';
import { EventBus } from './event-bus.js';
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
export class SquadClientWithPool {
    baseClient;
    pool;
    eventBus;
    constructor(config = {}) {
        this.baseClient = new BaseSquadClient(config);
        this.pool = new SessionPool(config.pool);
        this.eventBus = new EventBus();
        // Wire pool events to event bus via type mapping
        const poolToSquadEvent = {
            'session.added': 'session.created',
            'session.removed': 'session.destroyed',
            'session.status_changed': 'session.status_changed',
            'pool.at_capacity': 'pool.health',
            'pool.health_check': 'pool.health',
        };
        this.pool.on((event) => {
            const mappedType = poolToSquadEvent[event.type];
            if (mappedType) {
                this.eventBus.emit({
                    type: mappedType,
                    sessionId: event.sessionId,
                    payload: event,
                    timestamp: event.timestamp,
                });
            }
        });
    }
    /** Connect to the Copilot CLI server */
    async connect() {
        return this.baseClient.connect();
    }
    /** Disconnect from the Copilot CLI server */
    async disconnect() {
        await this.pool.shutdown();
        return this.baseClient.disconnect();
    }
    /** Force disconnect without graceful cleanup */
    async forceDisconnect() {
        await this.pool.shutdown();
        return this.baseClient.forceDisconnect();
    }
    /** Get current connection state */
    getState() {
        return this.baseClient.getState();
    }
    /** Check if connected */
    isConnected() {
        return this.baseClient.isConnected();
    }
    /**
     * Create a new session and add it to the pool.
     * Throws if the pool is at capacity.
     */
    async createSession(config = {}) {
        const session = await this.baseClient.createSession(config);
        // Convert to pool-compatible session format
        const poolSession = {
            id: session.sessionId,
            agentName: config.model ?? 'default',
            status: 'active',
            createdAt: new Date(),
        };
        this.pool.add(poolSession);
        await this.eventBus.emit({
            type: 'session.created',
            sessionId: session.sessionId,
            payload: { session },
            timestamp: new Date(),
        });
        return session;
    }
    /**
     * Resume an existing session and add it to the pool if not present.
     */
    async resumeSession(sessionId, config = {}) {
        const session = await this.baseClient.resumeSession(sessionId, config);
        if (!this.pool.get(sessionId)) {
            const poolSession = {
                id: session.sessionId,
                agentName: config.model ?? 'resumed',
                status: 'active',
                createdAt: new Date(),
            };
            this.pool.add(poolSession);
        }
        return session;
    }
    /**
     * Delete a session and remove it from the pool.
     */
    async deleteSession(sessionId) {
        await this.baseClient.deleteSession(sessionId);
        this.pool.remove(sessionId);
        await this.eventBus.emit({
            type: 'session.destroyed',
            sessionId,
            payload: null,
            timestamp: new Date(),
        });
    }
    /** List all sessions from the base client */
    async listSessions() {
        return this.baseClient.listSessions();
    }
    /** Send a ping to verify connectivity */
    async ping(message) {
        return this.baseClient.ping(message);
    }
    /** Get CLI status information */
    async getStatus() {
        return this.baseClient.getStatus();
    }
    /** Get authentication status */
    async getAuthStatus() {
        return this.baseClient.getAuthStatus();
    }
    /** List available models */
    async listModels() {
        return this.baseClient.listModels();
    }
    on(eventTypeOrHandler, handler) {
        if (typeof eventTypeOrHandler === "string" && handler) {
            return this.baseClient.on(eventTypeOrHandler, handler);
        }
        return this.baseClient.on(eventTypeOrHandler);
    }
    /**
     * Graceful shutdown — destroy all sessions and disconnect.
     */
    async shutdown() {
        await this.pool.shutdown();
        await this.baseClient.disconnect();
    }
}
//# sourceMappingURL=index.js.map