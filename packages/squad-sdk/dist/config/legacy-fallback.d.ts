/**
 * Legacy Fallback — Backwards Compatibility (M3-9, Issue #150)
 *
 * Reads legacy squad.agent.md files and .ai-team/ directory structures,
 * maps them to typed SquadConfig, and merges with any existing config
 * (typed config always wins, legacy fills gaps).
 *
 * @module config/legacy-fallback
 */
import type { SquadConfig, RoutingRule } from '../runtime/config.js';
/**
 * Legacy configuration extracted from squad.agent.md and .ai-team/ files.
 */
export interface LegacyConfig {
    /** System prompt extracted from the agent doc */
    systemPrompt?: string;
    /** Tool names referenced in the agent doc */
    tools: string[];
    /** Agent definitions extracted from agent sections */
    agents: LegacyAgentDef[];
    /** Routing hints extracted from routing sections */
    routingHints: string[];
    /** Routing rules parsed from routing.md */
    routingRules: RoutingRule[];
    /** Model preferences found in the document */
    modelPreferences: string[];
    /** Source path that was loaded */
    sourcePath: string;
    /** Whether .ai-team/ directory was found */
    hasAiTeamDir: boolean;
}
/**
 * Agent definition extracted from a legacy squad.agent.md.
 */
export interface LegacyAgentDef {
    name: string;
    role?: string;
    description?: string;
    tools?: string[];
    model?: string;
}
/**
 * Detect whether a project uses the legacy squad.agent.md format.
 *
 * Checks for:
 * - .github/agents/squad.agent.md
 * - .ai-team/squad.agent.md
 * - .ai-team/ directory with team.md or routing.md
 *
 * @param dir - Project root directory
 * @returns true if legacy format is detected
 */
export declare function detectLegacySetup(dir: string): boolean;
/**
 * Load and parse a legacy squad.agent.md file from the given directory.
 *
 * Search order:
 *  1. .github/agents/squad.agent.md
 *  2. .ai-team/squad.agent.md
 *
 * Also loads routing.md and team.md if present in .ai-team/ or .github/agents/.
 *
 * @param dir - Project root directory
 * @returns Parsed LegacyConfig, or undefined if no legacy file found
 */
export declare function loadLegacyAgentMd(dir: string): LegacyConfig | undefined;
/**
 * Merge a legacy configuration with a typed SquadConfig.
 *
 * The typed config **always wins** on conflict. Legacy values fill gaps
 * where the typed config has no data.
 *
 * @param legacy - Legacy configuration from squad.agent.md
 * @param config - Typed Squad configuration (takes precedence)
 * @returns Merged configuration
 */
export declare function mergeLegacyWithConfig(legacy: LegacyConfig, config: SquadConfig): SquadConfig;
/**
 * Emit a deprecation warning when legacy format is detected.
 * Uses console.warn so it's visible but non-blocking.
 */
export declare function emitDeprecationWarning(sourcePath: string): void;
//# sourceMappingURL=legacy-fallback.d.ts.map