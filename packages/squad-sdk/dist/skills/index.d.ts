/**
 * Skills System (M3-3, Issue #141)
 *
 * Domain-specific knowledge packages that agents load on-demand.
 * Skills are matched by keyword triggers and agent role affinity,
 * then injected into agent context as markdown.
 */
import type { SkillDefinition } from './skill-loader.js';
export { loadSkillsFromDirectory, parseFrontmatter, parseSkillFile } from './skill-loader.js';
export type { SkillDefinition } from './skill-loader.js';
export * from './skill-source.js';
export interface SkillMatch {
    /** The matched skill */
    skill: SkillDefinition;
    /** Relevance score (0–1) */
    score: number;
    /** Reason the skill matched */
    reason: string;
}
export declare class SkillRegistry {
    private skills;
    /** Register a skill definition. */
    registerSkill(skill: SkillDefinition): void;
    /** Unregister a skill by ID. */
    unregisterSkill(skillId: string): boolean;
    /** Get a skill by ID. */
    getSkill(skillId: string): SkillDefinition | undefined;
    /** Get all registered skills. */
    getAllSkills(): SkillDefinition[];
    /** Number of registered skills. */
    get size(): number;
    /**
     * Match skills relevant to a task for a given agent role.
     *
     * Scoring:
     *  - +0.5 for each trigger keyword found in the task text
     *  - +0.3 if the agent role matches the skill's agentRoles
     *  - Scores are clamped to [0, 1]
     *
     * Returns matches sorted by score descending, filtered to score > 0.
     */
    matchSkills(task: string, agentRole: string): SkillMatch[];
    /**
     * Load a skill's content for injection into an agent's context.
     * Returns the markdown content, or undefined if skill not found.
     */
    loadSkill(skillId: string): string | undefined;
}
export * from './handler-types.js';
export { SkillScriptLoader, resolveSkillPath } from './skill-script-loader.js';
export type { LoadResult } from './handler-types.js';
//# sourceMappingURL=index.d.ts.map