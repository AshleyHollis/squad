/**
 * Skill Source Interface & Implementations (M5-5, Issue #128)
 *
 * Pluggable skill discovery from local filesystem or GitHub repos.
 */
import { type SkillDefinition } from './skill-loader.js';
import type { GitHubFetcher } from '../config/agent-source.js';
export interface SkillSource {
    readonly name: string;
    readonly type: 'local' | 'github';
    readonly priority: number;
    listSkills(): Promise<SkillManifest[]>;
    getSkill(id: string): Promise<SkillDefinition | null>;
    getContent(id: string): Promise<string | null>;
}
export interface SkillManifest {
    id: string;
    name: string;
    domain: string;
    source: string;
}
export declare class LocalSkillSource implements SkillSource {
    private basePath;
    readonly name = "local";
    readonly type: "local";
    readonly priority: number;
    constructor(basePath: string, priority?: number);
    private get skillsDir();
    listSkills(): Promise<SkillManifest[]>;
    getSkill(id: string): Promise<SkillDefinition | null>;
    getContent(id: string): Promise<string | null>;
}
export declare class GitHubSkillSource implements SkillSource {
    readonly name = "github";
    readonly type: "github";
    readonly priority: number;
    private owner;
    private repoName;
    private branch?;
    private pathPrefix;
    private fetcher;
    constructor(repo: string, options?: {
        ref?: string;
        pathPrefix?: string;
        fetcher?: GitHubFetcher;
        priority?: number;
    });
    listSkills(): Promise<SkillManifest[]>;
    getSkill(id: string): Promise<SkillDefinition | null>;
    getContent(id: string): Promise<string | null>;
}
export declare class SkillSourceRegistry {
    private sources;
    register(source: SkillSource): void;
    unregister(name: string): boolean;
    getSource(name: string): SkillSource | undefined;
    /** Sources sorted by priority descending (higher priority first). */
    private sortedSources;
    listAllSkills(): Promise<SkillManifest[]>;
    findSkill(id: string): Promise<SkillDefinition | null>;
    getContent(id: string): Promise<string | null>;
}
//# sourceMappingURL=skill-source.d.ts.map