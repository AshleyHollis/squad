/**
 * Charter Compilation (M1-8 + M2-9)
 *
 * Transforms agent charter.md files into typed SDK CustomAgentConfig.
 * Parses charter sections and builds the complete agent prompt with team context.
 * Supports config-driven overrides that merge with charter content.
 */
import { SquadCustomAgentConfig } from '../adapter/types.js';
/**
 * Options for compiling a charter.
 */
export interface CharterCompileOptions {
    /** Agent name (e.g., 'verbal', 'fenster') */
    agentName: string;
    /** Full path to the agent's charter.md file */
    charterPath: string;
    /** Raw charter markdown content (if already loaded) */
    charterContent?: string;
    /** Content of team.md (team roster) */
    teamContext?: string;
    /** Routing rules content */
    routingRules?: string;
    /** Relevant decision records */
    decisions?: string;
    /** Config-driven overrides (config wins on conflict) */
    configOverrides?: CharterConfigOverrides;
}
/**
 * Config-driven overrides that merge with charter content.
 * Values from config take precedence over charter-parsed values.
 */
export interface CharterConfigOverrides {
    /** Override display name */
    displayName?: string;
    /** Override role */
    role?: string;
    /** Override or set model */
    model?: string;
    /** Override or set tools list */
    tools?: string[];
    /** Override or set status */
    status?: 'active' | 'inactive' | 'retired';
    /** Extra prompt content appended to charter */
    extraPrompt?: string;
}
/**
 * Parsed charter structure.
 */
export interface ParsedCharter {
    /** Identity section: name, role, expertise, style */
    identity: {
        name?: string;
        role?: string;
        expertise?: string[];
        style?: string;
    };
    /** What I Own section content */
    ownership?: string;
    /** Boundaries section content */
    boundaries?: string;
    /** Model preference from ## Model section */
    modelPreference?: string;
    /** Rationale for model preference from ## Model section */
    modelRationale?: string;
    /** Fallback model from ## Model section */
    modelFallback?: string;
    /** Collaboration section content */
    collaboration?: string;
    /** Full charter content */
    fullContent: string;
}
/**
 * Extended result from charter compilation, includes metadata beyond CustomAgentConfig.
 */
export interface CompiledCharter extends SquadCustomAgentConfig {
    /** Resolved model (from config override or charter preference) */
    resolvedModel?: string;
    /** Resolved tools list (from config override or charter) */
    resolvedTools?: string[];
    /** Parsed charter data */
    parsed: ParsedCharter;
}
/**
 * Compile a charter.md file into a CustomAgentConfig.
 *
 * @param options - Charter compilation options
 * @returns Squad CustomAgentConfig ready for SDK registration
 * @throws {ConfigurationError} If charter is missing or malformed
 */
export declare function compileCharter(options: CharterCompileOptions): SquadCustomAgentConfig;
/**
 * Compile a charter with full metadata including resolved model/tools.
 *
 * @param options - Charter compilation options
 * @returns CompiledCharter with full metadata
 * @throws {ConfigurationError} If charter is missing or malformed
 */
export declare function compileCharterFull(options: CharterCompileOptions): CompiledCharter;
/**
 * Parse charter markdown content into structured sections.
 *
 * @param content - Raw charter.md content
 * @returns Parsed charter structure
 */
export declare function parseCharterMarkdown(content: string): ParsedCharter;
//# sourceMappingURL=charter-compiler.d.ts.map