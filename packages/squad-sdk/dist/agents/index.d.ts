/**
 * Agent Session Lifecycle (PRD 4)
 *
 * Manages the full agent lifecycle: spawn → active → idle → cleanup.
 * Compiles charter.md files into SDK CustomAgentConfig objects.
 * Injects dynamic context via session hooks instead of string templates.
 */
import { EventBus } from '../client/event-bus.js';
export { compileCharter, compileCharterFull, parseCharterMarkdown, type CharterCompileOptions, type CharterConfigOverrides, type ParsedCharter, type CompiledCharter, } from './charter-compiler.js';
export { resolveModel, inferTierFromModel, isTierFallbackAllowed, ModelFallbackExecutor, type ModelResolutionOptions, type ResolvedModel, type TaskType, type ModelTier, type ModelResolutionSource, type FallbackExecutorConfig, type FallbackAttempt, type FallbackResult, } from './model-selector.js';
export { AgentLifecycleManager, type AgentHandle, type AgentStatus, type SpawnAgentOptions, type LifecycleManagerConfig, } from './lifecycle.js';
export { createHistoryShadow, appendToHistory, readHistory, shadowExists, deleteHistoryShadow, type HistorySection, type ParsedHistory, } from './history-shadow.js';
export { onboardAgent, addAgentToConfig, type OnboardOptions, type OnboardResult, } from './onboarding.js';
export interface AgentCharter {
    /** Agent name (e.g., 'fenster', 'verbal') */
    name: string;
    /** Display name (e.g., 'Fenster — Core Dev') */
    displayName: string;
    /** Role description */
    role: string;
    /** Expertise areas */
    expertise: string[];
    /** Working style */
    style: string;
    /** Full charter prompt content */
    prompt: string;
    /** Allowed tools for this agent */
    allowedTools?: string[];
    /** Excluded tools for this agent */
    excludedTools?: string[];
    /** Model preference from charter */
    modelPreference?: string;
}
export type AgentLifecycleState = 'pending' | 'spawning' | 'active' | 'idle' | 'error' | 'destroyed';
export interface AgentSessionInfo {
    charter: AgentCharter;
    sessionId: string | null;
    state: AgentLifecycleState;
    createdAt: Date | null;
    lastActiveAt: Date | null;
    /** Response mode: lightweight (no history), standard, full */
    responseMode: 'lightweight' | 'standard' | 'full';
}
export declare class CharterCompiler {
    /**
     * Load and compile a charter.md file into an AgentCharter.
     * Parses identity/model sections from markdown.
     */
    compile(charterPath: string): Promise<AgentCharter>;
    /**
     * Load all charters from the team directory.
     * Scans .squad/agents/{name}/charter.md, skipping scribe and _alumni.
     */
    compileAll(teamRoot: string): Promise<AgentCharter[]>;
}
export declare class AgentSessionManager {
    private agents;
    private eventBus?;
    constructor(eventBus?: EventBus);
    /** Spawn a new agent session from a charter */
    spawn(charter: AgentCharter, mode?: 'lightweight' | 'standard' | 'full'): Promise<AgentSessionInfo>;
    /** Resume an existing agent session */
    resume(agentName: string): Promise<AgentSessionInfo>;
    /** Get info about a specific agent */
    getAgent(name: string): AgentSessionInfo | undefined;
    /** Get all agent session info */
    getAllAgents(): AgentSessionInfo[];
    /** Destroy an agent session */
    destroy(agentName: string): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map