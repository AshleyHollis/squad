/**
 * Skill Loader (M3-3, Issue #141)
 *
 * Reads SKILL.md files from a directory and parses them into
 * SkillDefinition objects. Handles missing / malformed files gracefully.
 *
 * SKILL.md format:
 * ```
 * ---
 * name: TypeScript Testing
 * domain: testing
 * triggers: [vitest, jest, test, spec]
 * roles: [tester, developer]
 * ---
 * Markdown body content…
 * ```
 */
export interface SkillDefinition {
    /** Unique identifier (derived from directory name) */
    id: string;
    /** Human-readable name */
    name: string;
    /** Knowledge domain */
    domain: string;
    /** Markdown content body */
    content: string;
    /** Keyword patterns that trigger this skill */
    triggers: string[];
    /** Agent roles that have affinity for this skill */
    agentRoles: string[];
}
/**
 * Parse simple YAML-like frontmatter from a SKILL.md string.
 * Returns the parsed fields and the remaining body content.
 */
export declare function parseFrontmatter(raw: string): {
    meta: Record<string, string | string[]>;
    body: string;
};
/**
 * Load all skill definitions from a directory.
 *
 * Expected structure:
 *   dir/
 *     skill-a/SKILL.md
 *     skill-b/SKILL.md
 *
 * Malformed or missing files are silently skipped.
 */
export declare function loadSkillsFromDirectory(dir: string): SkillDefinition[];
/**
 * Parse a single SKILL.md raw string into a SkillDefinition.
 * Returns undefined if required fields are missing.
 */
export declare function parseSkillFile(id: string, raw: string): SkillDefinition | undefined;
//# sourceMappingURL=skill-loader.d.ts.map