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
import { DirectResponseHandler, } from './direct-response.js';
import { matchRoute, compileRoutingRules, } from '../config/routing.js';
import { spawnParallel } from './fan-out.js';
import { trace, SpanStatusCode } from '../runtime/otel-api.js';
const tracer = trace.getTracer('squad-sdk');
// --- Coordinator Class ---
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
export class SquadCoordinator {
    config;
    eventBus;
    directHandler;
    compiledRouter;
    fanOutDeps;
    constructor(options) {
        this.config = options.config;
        this.eventBus = options.eventBus;
        this.fanOutDeps = options.fanOutDeps;
        this.directHandler = options.directHandler ?? new DirectResponseHandler();
        // Compile routing rules from config or use provided router
        if (options.compiledRouter) {
            this.compiledRouter = options.compiledRouter;
        }
        else {
            this.compiledRouter = this.compileRouter(this.config);
        }
    }
    /**
     * Main dispatch — handle an incoming user message.
     */
    async handleMessage(message, context) {
        const span = tracer.startSpan('squad.coordinator.handleMessage');
        span.setAttribute('message.length', message.length);
        try {
            const start = Date.now();
            // Emit coordinator.route event
            await this.emit('coordinator:routing', context.sessionId, {
                phase: 'start',
                messageLength: message.length,
            });
            // --- Step 1: Direct response check ---
            if (this.directHandler.shouldHandleDirectly(message, this.config)) {
                const directResult = this.directHandler.handleDirect(message, context);
                await this.emit('coordinator:routing', context.sessionId, {
                    phase: 'complete',
                    strategy: 'direct',
                    category: directResult.category,
                });
                span.setAttribute('routing.strategy', 'direct');
                return {
                    strategy: 'direct',
                    directResponse: directResult,
                    durationMs: Date.now() - start,
                };
            }
            // --- Step 2: Route analysis ---
            const routing = matchRoute(message, this.compiledRouter);
            await this.emit('coordinator:routing', context.sessionId, {
                phase: 'routed',
                agents: routing.agents,
                confidence: routing.confidence,
                reason: routing.reason,
            });
            span.setAttribute('target.agents', routing.agents.join(','));
            span.setAttribute('routing.confidence', routing.confidence);
            // --- Step 3: Determine spawn strategy ---
            const strategy = this.determineStrategy(routing);
            span.setAttribute('routing.strategy', strategy);
            // --- Step 4: Spawn agents ---
            let spawnResults;
            if (this.fanOutDeps && (strategy === 'single' || strategy === 'multi')) {
                const spawnConfigs = this.buildSpawnConfigs(routing, message, context);
                await this.emit('coordinator:routing', context.sessionId, {
                    phase: 'spawning',
                    strategy,
                    agentCount: spawnConfigs.length,
                });
                spawnResults = await spawnParallel(spawnConfigs, this.fanOutDeps);
                // If all spawns failed in single mode, mark as fallback
                if (strategy === 'single' && spawnResults.every(r => r.status === 'failed')) {
                    return {
                        strategy: 'fallback',
                        routing,
                        spawnResults,
                        durationMs: Date.now() - start,
                    };
                }
            }
            // --- Step 5: Complete ---
            await this.emit('coordinator:routing', context.sessionId, {
                phase: 'complete',
                strategy,
                spawnCount: spawnResults?.length ?? 0,
                successCount: spawnResults?.filter(r => r.status === 'success').length ?? 0,
            });
            return {
                strategy,
                routing,
                spawnResults,
                durationMs: Date.now() - start,
            };
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
    /**
     * Get the compiled router (for inspection / testing).
     */
    getRouter() {
        return this.compiledRouter;
    }
    /**
     * Get the direct response handler (for inspection / testing).
     */
    getDirectHandler() {
        return this.directHandler;
    }
    /**
     * Update configuration at runtime.
     */
    updateConfig(config) {
        this.config = config;
        this.compiledRouter = this.compileRouter(config);
    }
    // --- Private helpers ---
    determineStrategy(routing) {
        if (routing.agents.length === 0)
            return 'fallback';
        if (routing.agents.length === 1)
            return 'single';
        return 'multi';
    }
    buildSpawnConfigs(routing, message, context) {
        return routing.agents.map((agentName) => ({
            agentName: agentName.replace(/^@/, ''),
            task: message,
            priority: routing.confidence === 'high' ? 'normal' : 'low',
            context: context.metadata ? JSON.stringify(context.metadata) : undefined,
        }));
    }
    compileRouter(config) {
        // Convert config routing rules → runtime routing rules for the compiler
        const runtimeRules = (config.routing?.rules ?? []).map((rule) => ({
            workType: rule.workType ?? rule.pattern ?? 'unknown',
            agents: rule.agents,
            examples: rule.examples,
            confidence: rule.confidence,
        }));
        const routingConfig = {
            rules: runtimeRules,
            governance: config.routing?.governance,
        };
        return compileRoutingRules(routingConfig);
    }
    async emit(type, sessionId, payload) {
        if (!this.eventBus)
            return;
        await this.eventBus.emit({
            type: type,
            sessionId,
            payload,
            timestamp: new Date(),
        });
    }
}
//# sourceMappingURL=coordinator.js.map