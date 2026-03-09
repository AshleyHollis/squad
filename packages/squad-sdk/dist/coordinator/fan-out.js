/**
 * Parallel Fan-Out Session Spawning (M1-10, Issue #130)
 *
 * Spawns multiple agent sessions concurrently using Promise.allSettled
 * for maximum throughput. Each spawn compiles charter → resolves model
 * → creates session → sends initial message. Event aggregation collects
 * all session events into coordinator's event bus. Error isolation ensures
 * one session failure doesn't affect others.
 */
// --- Fan-Out Orchestrator ---
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
export async function spawnParallel(configs, deps) {
    const spawnPromises = configs.map(config => spawnSingle(config, deps));
    const settledResults = await Promise.allSettled(spawnPromises);
    return settledResults.map((result, index) => {
        if (result.status === 'fulfilled') {
            return result.value;
        }
        else {
            // Rejection from spawnSingle shouldn't happen (it catches internally),
            // but handle defensively
            return {
                agentName: configs[index].agentName,
                status: 'failed',
                error: result.reason?.message || String(result.reason),
                startTime: new Date(),
                endTime: new Date(),
            };
        }
    });
}
/**
 * Spawn a single agent session.
 * Catches all errors and returns a SpawnResult (never rejects).
 */
async function spawnSingle(config, deps) {
    const startTime = new Date();
    try {
        // Step 1: Compile charter
        const charter = await deps.compileCharter(config.agentName);
        // Step 2: Resolve model
        const model = config.modelOverride
            ? config.modelOverride
            : await deps.resolveModel(charter, config.modelOverride);
        // Step 3: Create session
        const session = await deps.createSession({
            model,
            clientName: `squad-agent-${config.agentName}`,
        });
        // Step 4: Register in session pool
        deps.sessionPool.add({
            id: session.sessionId,
            agentName: config.agentName,
            status: 'active',
            createdAt: startTime,
        });
        // Step 5: Send initial task message
        const initialPrompt = buildInitialPrompt(config);
        await session.sendMessage({
            prompt: initialPrompt,
            mode: 'immediate',
        });
        // Step 6: Emit spawn success event
        await deps.eventBus.emit({
            type: 'session.created',
            sessionId: session.sessionId,
            payload: { agentName: config.agentName, priority: config.priority || 'normal' },
            timestamp: new Date(),
        });
        return {
            agentName: config.agentName,
            sessionId: session.sessionId,
            status: 'success',
            startTime,
            endTime: new Date(),
        };
    }
    catch (error) {
        // Error isolation: one spawn failure doesn't affect others
        const errorMessage = error instanceof Error ? error.message : String(error);
        await deps.eventBus.emit({
            type: 'session.error',
            sessionId: undefined,
            payload: { agentName: config.agentName, error: errorMessage },
            timestamp: new Date(),
        });
        return {
            agentName: config.agentName,
            status: 'failed',
            error: errorMessage,
            startTime,
            endTime: new Date(),
        };
    }
}
/**
 * Build the initial prompt message for a spawned agent.
 * Includes task, priority, and optional context.
 */
function buildInitialPrompt(config) {
    const parts = [];
    if (config.priority && config.priority !== 'normal') {
        parts.push(`**Priority:** ${config.priority.toUpperCase()}`);
    }
    parts.push('', `**Task:**`, config.task);
    if (config.context) {
        parts.push('', `**Context:**`, config.context);
    }
    return parts.join('\n');
}
// --- Event Aggregation Helper ---
/**
 * Subscribe to all events from a spawned session and forward them
 * to the coordinator's event bus with agent context.
 *
 * @param sessionId - Session ID to subscribe to
 * @param agentName - Agent name for context
 * @param sessionEventEmitter - Session's event emitter (if available)
 * @param coordinatorEventBus - Coordinator's event bus
 */
export function aggregateSessionEvents(sessionId, agentName, sessionEventEmitter, // SquadSession
coordinatorEventBus) {
    // Forward all session events to coordinator's event bus
    const eventTypes = [
        'message.delta',
        'message.complete',
        'tool.start',
        'tool.complete',
        'session.error',
        'session.complete',
    ];
    for (const eventType of eventTypes) {
        if (sessionEventEmitter.on) {
            sessionEventEmitter.on(eventType, (event) => {
                coordinatorEventBus.emit({
                    type: eventType,
                    sessionId,
                    payload: { agentName, ...event },
                    timestamp: new Date(),
                });
            });
        }
    }
}
//# sourceMappingURL=fan-out.js.map