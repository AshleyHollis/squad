/**
 * Coordinator Orchestrator (PRD 5)
 *
 * The central orchestration engine. Replaces the 32KB squad.agent.md
 * prompt-based coordinator with a TypeScript program that manages
 * agent sessions, routes work, and observes progress via SDK events.
 */
// --- M3-1 Coordinator ---
export { SquadCoordinator, } from './coordinator.js';
// --- M3-6 Direct Response ---
export { DirectResponseHandler, } from './direct-response.js';
// --- M1-10 Fan-Out ---
export { spawnParallel, aggregateSessionEvents, } from './fan-out.js';
// --- M3-4 Response Tiers ---
export { selectResponseTier, getTier, } from './response-tiers.js';
import { trace, SpanStatusCode } from '../runtime/otel-api.js';
const tracer = trace.getTracer('squad-sdk');
export class Coordinator {
    client = null;
    eventBus = null;
    agentManager = null;
    hookPipeline = null;
    toolRegistry = null;
    config;
    initialized = false;
    unsubscribers = [];
    constructor(config, deps) {
        this.config = config;
        if (deps) {
            this.client = deps.client ?? null;
            this.eventBus = deps.eventBus ?? null;
            this.agentManager = deps.agentManager ?? null;
            this.hookPipeline = deps.hookPipeline ?? null;
            this.toolRegistry = deps.toolRegistry ?? null;
        }
    }
    /** Initialize the coordinator: wire up event subscriptions and mark ready */
    async initialize() {
        const span = tracer.startSpan('squad.coordinator.initialize');
        try {
            if (this.eventBus) {
                this.unsubscribers.push(this.eventBus.subscribe('session:created', (event) => {
                    const s = tracer.startSpan('squad.coordinator.session.created');
                    s.setAttribute('session.id', event.sessionId ?? 'unknown');
                    s.end();
                }));
                this.unsubscribers.push(this.eventBus.subscribe('session:error', (event) => {
                    const s = tracer.startSpan('squad.coordinator.session.error');
                    s.setAttribute('session.id', event.sessionId ?? 'unknown');
                    s.end();
                }));
                this.unsubscribers.push(this.eventBus.subscribe('session:destroyed', (event) => {
                    const s = tracer.startSpan('squad.coordinator.session.destroyed');
                    s.setAttribute('session.id', event.sessionId ?? 'unknown');
                    s.end();
                }));
            }
            this.initialized = true;
        }
        catch (err) {
            span.setStatus({ code: SpanStatusCode.ERROR, message: err instanceof Error ? err.message : String(err) });
            span.recordException(err instanceof Error ? err : new Error(String(err)));
            throw err;
        }
        finally {
            span.end();
        }
    }
    /** Route an incoming user message to the appropriate agent(s) */
    async route(message) {
        const span = tracer.startSpan('squad.coordinator.route');
        span.setAttribute('message.length', message.length);
        try {
            const lower = message.toLowerCase().trim();
            let decision;
            // Direct response: status queries, factual questions
            if (/^(status|help|what is|who is|how many|show|list)\b/.test(lower)) {
                decision = {
                    tier: 'direct',
                    agents: [],
                    parallel: false,
                    rationale: `Direct response for informational query: "${message}"`,
                };
            }
            else {
                // Agent name mention — route to that specific agent
                const agentMention = lower.match(/@(\w+)/);
                if (agentMention) {
                    decision = {
                        tier: 'standard',
                        agents: [agentMention[1]],
                        parallel: false,
                        rationale: `Routed to mentioned agent: ${agentMention[1]}`,
                    };
                }
                else if (/\bteam\b/.test(lower)) {
                    // Team-wide task — fan-out to all agents
                    decision = {
                        tier: 'full',
                        agents: ['all'],
                        parallel: true,
                        rationale: 'Team-wide task detected — fan-out to all agents',
                    };
                }
                else {
                    // Default: route to lead agent (Keaton)
                    decision = {
                        tier: 'standard',
                        agents: ['lead'],
                        parallel: false,
                        rationale: 'Default routing to lead agent (Keaton)',
                    };
                }
            }
            span.setAttribute('routing.tier', decision.tier);
            span.setAttribute('target.agents', decision.agents.join(','));
            span.setAttribute('routing.reason', decision.rationale);
            return decision;
        }
        catch (err) {
            span.setStatus({ code: SpanStatusCode.ERROR, message: err instanceof Error ? err.message : String(err) });
            span.recordException(err instanceof Error ? err : new Error(String(err)));
            throw err;
        }
        finally {
            span.end();
        }
    }
    /** Execute a routing decision: emit routing event on EventBus */
    async execute(decision, message) {
        const span = tracer.startSpan('squad.coordinator.execute');
        span.setAttribute('routing.tier', decision.tier);
        span.setAttribute('target.agents', decision.agents.join(','));
        try {
            if (this.eventBus) {
                await this.eventBus.emit({
                    type: 'coordinator:routing',
                    payload: { decision, message },
                    timestamp: new Date(),
                });
            }
        }
        catch (err) {
            span.setStatus({ code: SpanStatusCode.ERROR, message: err instanceof Error ? err.message : String(err) });
            span.recordException(err instanceof Error ? err : new Error(String(err)));
            throw err;
        }
        finally {
            span.end();
        }
    }
    /** Graceful shutdown: unsubscribe from events and release references */
    async shutdown() {
        const span = tracer.startSpan('squad.coordinator.shutdown');
        try {
            for (const unsub of this.unsubscribers) {
                unsub();
            }
            this.unsubscribers = [];
            this.initialized = false;
            this.client = null;
            this.eventBus = null;
            this.agentManager = null;
            this.hookPipeline = null;
            this.toolRegistry = null;
        }
        catch (err) {
            span.setStatus({ code: SpanStatusCode.ERROR, message: err instanceof Error ? err.message : String(err) });
            span.recordException(err instanceof Error ? err : new Error(String(err)));
            throw err;
        }
        finally {
            span.end();
        }
    }
}
//# sourceMappingURL=index.js.map