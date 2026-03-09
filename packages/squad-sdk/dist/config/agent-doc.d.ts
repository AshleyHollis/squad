/**
 * Agent Documentation Parser (M2-12)
 *
 * Extracts structured metadata from .agent.md files so the markdown
 * becomes a reference document while typed config remains the runtime
 * source of truth.
 *
 * @module config/agent-doc
 */
/**
 * Structured metadata extracted from an agent .md file.
 */
export interface AgentDocMetadata {
    /** Agent name from the IDENTITY section or top-level heading */
    name?: string;
    /** One-line description / role */
    description?: string;
    /** Capability strings listed under CAPABILITIES */
    capabilities: string[];
    /** Routing hints (work-type patterns this agent handles) */
    routingHints: string[];
    /** Model preferences (e.g. "claude-sonnet-4.5") */
    modelPreferences: string[];
    /** Constraints / boundaries the agent must follow */
    constraints: string[];
    /** Tool names the agent is allowed to use */
    tools: string[];
    /** Extra sections not in the standard set, keyed by heading */
    extraSections: Record<string, string>;
}
/**
 * Parse an agent .agent.md file into structured metadata.
 *
 * Recognised top-level (##) sections:
 *   IDENTITY, CAPABILITIES, ROUTING, CONSTRAINTS, TOOLS
 *
 * Any other ## sections are captured in `extraSections`.
 *
 * @param markdown - Raw markdown content of the agent doc
 * @returns Parsed metadata
 */
export declare function parseAgentDoc(markdown: string): AgentDocMetadata;
//# sourceMappingURL=agent-doc.d.ts.map