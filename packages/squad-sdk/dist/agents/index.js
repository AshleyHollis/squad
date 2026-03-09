/**
 * Agent Session Lifecycle (PRD 4)
 *
 * Manages the full agent lifecycle: spawn → active → idle → cleanup.
 * Compiles charter.md files into SDK CustomAgentConfig objects.
 * Injects dynamic context via session hooks instead of string templates.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { randomUUID } from 'node:crypto';
import { parseCharterMarkdown } from './charter-compiler.js';
import { trace, SpanStatusCode } from '../runtime/otel-api.js';
import { recordAgentSpawn, recordAgentDuration, recordAgentError, recordAgentDestroy } from '../runtime/otel-metrics.js';
const tracer = trace.getTracer('squad-sdk');
// --- M1-8 Charter Compilation + M2-9 Config-driven ---
export { compileCharter, compileCharterFull, parseCharterMarkdown, } from './charter-compiler.js';
// --- M1-9 Model Selection + M3-5 Model Fallback ---
export { resolveModel, inferTierFromModel, isTierFallbackAllowed, ModelFallbackExecutor, } from './model-selector.js';
// --- M1-7 Agent Lifecycle ---
export { AgentLifecycleManager, } from './lifecycle.js';
// --- M1-11 History Shadows ---
export { createHistoryShadow, appendToHistory, readHistory, shadowExists, deleteHistoryShadow, } from './history-shadow.js';
// --- M2-10 Agent Onboarding ---
export { onboardAgent, addAgentToConfig, } from './onboarding.js';
// --- Charter Compiler ---
export class CharterCompiler {
    /**
     * Load and compile a charter.md file into an AgentCharter.
     * Parses identity/model sections from markdown.
     */
    async compile(charterPath) {
        const content = await readFile(charterPath, 'utf-8');
        const parsed = parseCharterMarkdown(content);
        const name = parsed.identity.name ?? basename(dirname(charterPath));
        const role = parsed.identity.role ?? '';
        const expertise = parsed.identity.expertise ?? [];
        const style = parsed.identity.style ?? '';
        const displayName = `${name} — ${role}`;
        return {
            name: name.toLowerCase(),
            displayName,
            role,
            expertise,
            style,
            prompt: content,
            modelPreference: parsed.modelPreference,
        };
    }
    /**
     * Load all charters from the team directory.
     * Scans .squad/agents/{name}/charter.md, skipping scribe and _alumni.
     */
    async compileAll(teamRoot) {
        const agentsDir = join(teamRoot, '.squad', 'agents');
        const entries = await readdir(agentsDir, { withFileTypes: true });
        const charters = [];
        for (const entry of entries) {
            if (!entry.isDirectory())
                continue;
            if (entry.name === 'scribe' || entry.name.startsWith('_'))
                continue;
            const charterPath = join(agentsDir, entry.name, 'charter.md');
            try {
                charters.push(await this.compile(charterPath));
            }
            catch {
                // Skip agents without a valid charter.md
            }
        }
        return charters;
    }
}
// --- Agent Session Manager ---
export class AgentSessionManager {
    agents = new Map();
    eventBus;
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    /** Spawn a new agent session from a charter */
    async spawn(charter, mode = 'standard') {
        const span = tracer.startSpan('squad.agent.spawn');
        span.setAttribute('agent.name', charter.name);
        span.setAttribute('agent.role', charter.role);
        span.setAttribute('spawn.mode', mode);
        try {
            const now = new Date();
            const info = {
                charter,
                sessionId: randomUUID(),
                state: 'active',
                createdAt: now,
                lastActiveAt: now,
                responseMode: mode,
            };
            this.agents.set(charter.name, info);
            recordAgentSpawn(charter.name, mode);
            if (this.eventBus) {
                await this.eventBus.emit({
                    type: 'session.created',
                    sessionId: info.sessionId ?? undefined,
                    agentName: charter.name,
                    payload: { mode },
                    timestamp: now,
                });
            }
            return info;
        }
        catch (err) {
            recordAgentError(charter.name, err instanceof Error ? err.constructor.name : 'unknown');
            span.setStatus({ code: SpanStatusCode.ERROR, message: err instanceof Error ? err.message : String(err) });
            span.recordException(err instanceof Error ? err : new Error(String(err)));
            throw err;
        }
        finally {
            span.end();
        }
    }
    /** Resume an existing agent session */
    async resume(agentName) {
        const span = tracer.startSpan('squad.agent.resume');
        span.setAttribute('agent.name', agentName);
        try {
            const agent = this.agents.get(agentName);
            if (!agent) {
                throw new Error(`Agent '${agentName}' not found`);
            }
            agent.state = 'active';
            agent.lastActiveAt = new Date();
            return agent;
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
    /** Get info about a specific agent */
    getAgent(name) {
        return this.agents.get(name);
    }
    /** Get all agent session info */
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    /** Destroy an agent session */
    async destroy(agentName) {
        const span = tracer.startSpan('squad.agent.destroy');
        span.setAttribute('agent.name', agentName);
        try {
            const agent = this.agents.get(agentName);
            if (!agent)
                return;
            if (this.eventBus) {
                await this.eventBus.emit({
                    type: 'session.destroyed',
                    sessionId: agent.sessionId ?? undefined,
                    agentName,
                    payload: {},
                    timestamp: new Date(),
                });
            }
            const durationMs = agent.createdAt ? Date.now() - agent.createdAt.getTime() : 0;
            recordAgentDuration(agentName, durationMs, 'success');
            recordAgentDestroy(agentName);
            agent.state = 'destroyed';
            this.agents.delete(agentName);
        }
        catch (err) {
            recordAgentError(agentName, err instanceof Error ? err.constructor.name : 'unknown');
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