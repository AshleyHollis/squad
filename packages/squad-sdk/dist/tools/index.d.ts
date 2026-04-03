/**
 * Tool Registry — Custom Tools API (PRD 2)
 *
 * Defines Squad's custom tools registered with the SDK via defineTool().
 * Tools provide agents with typed, validated orchestration primitives:
 *   - squad_route:  Route work to another agent via session pool
 *   - squad_decide: Write a typed decision to the inbox drop-box
 *   - squad_memory: Append to agent history (learnings, updates)
 *   - squad_status: Query session pool state
 *   - squad_skill:  Read/write agent skills
 */
import type { SquadTool, SquadToolResult } from '../adapter/types.js';
/**
 * Sanitize tool arguments for OTel span attributes.
 * Strips any field whose name matches sensitive patterns (case-insensitive).
 * Returns JSON string truncated to 1024 chars.
 */
export declare function sanitizeArgs(args: unknown): string;
export interface ToolResult {
    success: boolean;
    message: string;
    data?: unknown;
}
export interface RouteRequest {
    /** Target agent name */
    targetAgent: string;
    /** Task description for the target agent */
    task: string;
    /** Priority level */
    priority?: 'low' | 'normal' | 'high' | 'critical';
    /** Context to pass to the target session */
    context?: string;
}
export interface DecisionRecord {
    /** Decision author (agent name) */
    author: string;
    /** Decision summary */
    summary: string;
    /** Full decision body */
    body: string;
    /** Related agents or PRDs */
    references?: string[];
}
export interface MemoryEntry {
    /** Agent name */
    agent: string;
    /** Section to append to (learnings, updates, sessions) */
    section: 'learnings' | 'updates' | 'sessions';
    /** Content to append */
    content: string;
}
export interface StatusQuery {
    /** Filter by agent name */
    agentName?: string;
    /** Filter by session status */
    status?: string;
    /** Include detailed session metadata */
    verbose?: boolean;
}
export interface SkillRequest {
    /** Skill name (maps to .copilot/skills/{name}/SKILL.md) */
    skillName: string;
    /** Operation: read the skill or write/update it */
    operation: 'read' | 'write';
    /** Skill content (required for write) */
    content?: string;
    /** Confidence level (required for write) */
    confidence?: 'low' | 'medium' | 'high';
}
/**
 * Define a typed Squad tool with JSON schema parameters.
 * Creates a SquadTool object compatible with the adapter layer.
 */
export declare function defineTool<TArgs = unknown>(config: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    handler: (args: TArgs) => Promise<SquadToolResult> | SquadToolResult;
    /** Optional agent name for span attribution */
    agentName?: string;
}): SquadTool<TArgs>;
export declare class ToolRegistry {
    private tools;
    private squadRoot;
    private sessionPoolGetter?;
    constructor(squadRoot?: string, sessionPoolGetter?: () => any);
    private registerSquadTools;
    /** Get all registered tools for session config */
    getTools(): SquadTool<any>[];
    /** Get tools filtered by agent's allowed tool list */
    getToolsForAgent(allowedTools?: string[]): SquadTool<any>[];
    /** Get a specific tool by name */
    getTool(name: string): SquadTool<any> | undefined;
    /**
     * Replace built-in tool handlers with skill-backed versions.
     * Called post-construction after SkillScriptLoader has resolved handlers.
     * Only replaces tools that already exist — unknown tool names are silently ignored.
     * Once applied, handlers are immutable for the session.
     *
     * Skill handlers are already OTel-wrapped by SkillScriptLoader.load() — no re-wrapping here.
     */
    applySkillHandlers(tools: SquadTool<any>[]): void;
}
//# sourceMappingURL=index.d.ts.map