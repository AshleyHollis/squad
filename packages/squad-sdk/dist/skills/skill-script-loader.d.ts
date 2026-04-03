/**
 * Skill Script Loader
 *
 * Runtime loader for executable skill handlers from backend skill directories.
 * Backend skills in `.copilot/skills/{name}/scripts/` contain `.js` handler files
 * that replace built-in tool handlers in ToolRegistry.
 *
 * Supports:
 * - Loading concern-specific handler scripts (tasks, decisions, memories, logging)
 * - Dynamic import() of handler scripts with lifecycle hooks
 * - Path containment validation for security
 * - Partial implementations (missing handlers are silently skipped)
 */
import type { LoadResult } from './handler-types.js';
/**
 * Resolve a skill path relative to project/team roots with containment validation.
 *
 * Algorithm:
 * 1. Absolute paths used as-is
 * 2. With teamRoot: resolve `.copilot/` paths from projectRoot and strip legacy `.squad/` paths relative to teamRoot
 * 3. Without teamRoot: resolve relative to projectRoot
 * 4. Path containment check: final path must be within projectRoot or teamRoot
 * 5. Reject paths with `..` segments that escape the boundary (throw Error)
 *
 * @param skillPath - Path from skill configuration (absolute or relative)
 * @param projectRoot - Project root directory (absolute)
 * @param teamRoot - Team root directory (absolute, optional)
 * @returns Resolved absolute path
 * @throws Error if path escapes containment boundaries
 */
export declare function resolveSkillPath(skillPath: string, projectRoot: string, teamRoot?: string): string;
export declare class SkillScriptLoader {
    private getToolSchema;
    constructor(getToolSchema: (toolName: string) => {
        description: string;
        parameters: Record<string, unknown>;
    } | undefined);
    /**
     * Load handler scripts from a backend skill directory by scanning `scripts/` for `.js` files.
     *
     * Algorithm:
     * 1. Check for `scripts/` directory — return null if missing (triggers markdown fallback)
     * 2. Scan scripts/ for all .js files (excluding lifecycle.js)
     * 3. For each file, derive tool name: prepend 'squad_' to the filename stem
     *    a. import() the script using toFileUrl (with Windows path normalization)
     *    b. Validate: module.default must be a function — if not, THROW (not silent skip)
     *    c. Get the tool's schema via this.getToolSchema(toolName)
     *    d. If schema not found → skip with warning (tool not registered in ToolRegistry)
     *    e. Produce a SquadTool entry with wrapSkillHandler()
     * 4. Load scripts/lifecycle.js if present (import() it)
     *    Extract init and dispose named exports if they are functions
     * 5. Return { tools, lifecycle } or { tools } if no lifecycle
     *
     * @param skillPath - Resolved absolute path to the skill directory
     * @param backendConfig - Backend configuration to pass to handlers
     * @returns LoadResult with tools and optional lifecycle, or null if no scripts/ directory
     *
     * @warning **Security note:** `backendConfig` is for non-secret runtime configuration (URLs, feature
     * flags, timeouts). Do NOT put credentials, tokens, or secrets in `backendConfig` — this config is
     * part of the skill definition and will be committed to the repository. Handler scripts run with full
     * process trust and can access the filesystem and the network. Only load skills from trusted sources.
     */
    load(skillPath: string, backendConfig: Record<string, unknown>): Promise<LoadResult | null>;
}
//# sourceMappingURL=skill-script-loader.d.ts.map