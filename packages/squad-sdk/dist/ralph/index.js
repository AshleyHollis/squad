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
import { writeFile } from 'node:fs/promises';
// --- Ralph Monitor ---
export class RalphMonitor {
    config;
    state;
    eventBus = null;
    unsubscribers = [];
    healthCheckTimer = null;
    constructor(config) {
        this.config = config;
        this.state = {
            lastHealthCheck: null,
            agents: new Map(),
            observations: [],
        };
    }
    /** Start monitoring — subscribe to EventBus and begin health checks */
    async start(eventBus) {
        this.eventBus = eventBus;
        // Subscribe to session lifecycle events
        this.unsubscribers.push(eventBus.subscribe('session:created', (event) => this.handleEvent(event)));
        this.unsubscribers.push(eventBus.subscribe('session:destroyed', (event) => this.handleEvent(event)));
        this.unsubscribers.push(eventBus.subscribe('session:error', (event) => this.handleEvent(event)));
        this.unsubscribers.push(eventBus.subscribe('agent:milestone', (event) => this.handleEvent(event)));
        const interval = this.config.healthCheckInterval ?? 30_000;
        this.healthCheckTimer = setInterval(() => {
            void this.healthCheck();
        }, interval);
    }
    /** Handle an incoming event from the EventBus */
    handleEvent(event) {
        const agentName = event.agentName ?? 'unknown';
        const sessionId = event.sessionId ?? 'unknown';
        switch (event.type) {
            case 'session:created': {
                this.state.agents.set(agentName, {
                    agentName,
                    sessionId,
                    status: 'working',
                    lastActivity: event.timestamp,
                    milestones: [],
                });
                break;
            }
            case 'session:destroyed': {
                this.state.agents.delete(agentName);
                break;
            }
            case 'session:error': {
                const existing = this.state.agents.get(agentName);
                if (existing) {
                    existing.status = 'error';
                    existing.lastActivity = event.timestamp;
                }
                break;
            }
            case 'agent:milestone': {
                const agent = this.state.agents.get(agentName);
                if (agent) {
                    const payload = event.payload;
                    if (payload?.milestone) {
                        agent.milestones.push(payload.milestone);
                    }
                    if (payload?.task) {
                        agent.currentTask = payload.task;
                    }
                    agent.lastActivity = event.timestamp;
                    agent.status = 'working';
                }
                break;
            }
        }
    }
    /** Run a health check across all tracked agent sessions */
    async healthCheck() {
        const now = new Date();
        const staleThreshold = this.config.staleSessionThreshold ?? 300_000;
        for (const agent of this.state.agents.values()) {
            if (agent.status === 'error')
                continue;
            const elapsed = now.getTime() - agent.lastActivity.getTime();
            agent.status = elapsed > staleThreshold ? 'stale' : agent.status === 'stale' ? 'idle' : agent.status;
        }
        this.state.lastHealthCheck = now;
        return Array.from(this.state.agents.values());
    }
    /** Get current work status for all agents */
    getStatus() {
        return Array.from(this.state.agents.values());
    }
    /** Stop monitoring and persist final state */
    async stop() {
        // Unsubscribe from EventBus
        for (const unsub of this.unsubscribers) {
            unsub();
        }
        this.unsubscribers = [];
        // Stop health check timer
        if (this.healthCheckTimer !== null) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
        }
        // Persist state if statePath is configured
        if (this.config.statePath) {
            const serializable = {
                lastHealthCheck: this.state.lastHealthCheck?.toISOString() ?? null,
                agents: Array.from(this.state.agents.entries()),
                observations: this.state.observations,
            };
            await writeFile(this.config.statePath, JSON.stringify(serializable, null, 2), 'utf-8');
        }
        this.eventBus = null;
    }
}
export { loadCapabilities, canHandleIssue, filterByCapabilities, extractNeeds, getDeploymentMode, getPodId, generatePodCapabilitiesPath, KNOWN_CAPABILITIES } from './capabilities.js';
export { getTrafficLight, shouldProceed, getRetryDelay, PredictiveCircuitBreaker, canUseQuota, loadRatePool } from './rate-limiting.js';
//# sourceMappingURL=index.js.map