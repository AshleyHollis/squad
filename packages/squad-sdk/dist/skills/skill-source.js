/**
 * Skill Source Interface & Implementations (M5-5, Issue #128)
 *
 * Pluggable skill discovery from local filesystem or GitHub repos.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseFrontmatter } from './skill-loader.js';
// --- Local implementation ---
export class LocalSkillSource {
    basePath;
    name = 'local';
    type = 'local';
    priority;
    constructor(basePath, priority = 0) {
        this.basePath = basePath;
        this.priority = priority;
    }
    get skillsDir() {
        return path.join(this.basePath, '.squad', 'skills');
    }
    async listSkills() {
        if (!fs.existsSync(this.skillsDir))
            return [];
        let entries;
        try {
            entries = fs.readdirSync(this.skillsDir, { withFileTypes: true });
        }
        catch {
            return [];
        }
        const manifests = [];
        for (const entry of entries) {
            if (!entry.isDirectory())
                continue;
            const skillFile = path.join(this.skillsDir, entry.name, 'SKILL.md');
            if (!fs.existsSync(skillFile))
                continue;
            try {
                const raw = fs.readFileSync(skillFile, 'utf-8');
                const { meta } = parseFrontmatter(raw);
                manifests.push({
                    id: entry.name,
                    name: typeof meta.name === 'string' ? meta.name : entry.name,
                    domain: typeof meta.domain === 'string' ? meta.domain : 'general',
                    source: 'local',
                });
            }
            catch {
                // skip malformed
            }
        }
        return manifests;
    }
    async getSkill(id) {
        const skillFile = path.join(this.skillsDir, id, 'SKILL.md');
        if (!fs.existsSync(skillFile))
            return null;
        try {
            const raw = fs.readFileSync(skillFile, 'utf-8');
            const { meta, body } = parseFrontmatter(raw);
            if (!body)
                return null;
            return {
                id,
                name: typeof meta.name === 'string' ? meta.name : id,
                domain: typeof meta.domain === 'string' ? meta.domain : 'general',
                content: body,
                triggers: Array.isArray(meta.triggers) ? meta.triggers : [],
                agentRoles: Array.isArray(meta.roles) ? meta.roles : [],
            };
        }
        catch {
            return null;
        }
    }
    async getContent(id) {
        const skillFile = path.join(this.skillsDir, id, 'SKILL.md');
        if (!fs.existsSync(skillFile))
            return null;
        try {
            const raw = fs.readFileSync(skillFile, 'utf-8');
            const { body } = parseFrontmatter(raw);
            return body || null;
        }
        catch {
            return null;
        }
    }
}
// --- GitHub implementation ---
export class GitHubSkillSource {
    name = 'github';
    type = 'github';
    priority;
    owner;
    repoName;
    branch;
    pathPrefix;
    fetcher;
    constructor(repo, options) {
        const parts = repo.split('/');
        if (parts.length !== 2 || !parts[0] || !parts[1]) {
            throw new Error(`Invalid repo format "${repo}": expected "owner/repo"`);
        }
        this.owner = parts[0];
        this.repoName = parts[1];
        this.branch = options?.ref;
        this.pathPrefix = options?.pathPrefix ?? '.squad/skills';
        this.fetcher = options?.fetcher ?? {
            async listDirectory() { throw new Error('No GitHubFetcher configured'); },
            async getFileContent() { throw new Error('No GitHubFetcher configured'); },
        };
        this.priority = options?.priority ?? 0;
    }
    async listSkills() {
        const entries = await this.fetcher.listDirectory(this.owner, this.repoName, this.pathPrefix, this.branch);
        const dirs = entries.filter(e => e.type === 'dir');
        const manifests = [];
        for (const dir of dirs) {
            const skillPath = `${this.pathPrefix}/${dir.name}/SKILL.md`;
            const content = await this.fetcher.getFileContent(this.owner, this.repoName, skillPath, this.branch);
            if (!content)
                continue;
            const { meta } = parseFrontmatter(content);
            manifests.push({
                id: dir.name,
                name: typeof meta.name === 'string' ? meta.name : dir.name,
                domain: typeof meta.domain === 'string' ? meta.domain : 'general',
                source: 'github',
            });
        }
        return manifests;
    }
    async getSkill(id) {
        const skillPath = `${this.pathPrefix}/${id}/SKILL.md`;
        const content = await this.fetcher.getFileContent(this.owner, this.repoName, skillPath, this.branch);
        if (!content)
            return null;
        const { meta, body } = parseFrontmatter(content);
        if (!body)
            return null;
        return {
            id,
            name: typeof meta.name === 'string' ? meta.name : id,
            domain: typeof meta.domain === 'string' ? meta.domain : 'general',
            content: body,
            triggers: Array.isArray(meta.triggers) ? meta.triggers : [],
            agentRoles: Array.isArray(meta.roles) ? meta.roles : [],
        };
    }
    async getContent(id) {
        const skillPath = `${this.pathPrefix}/${id}/SKILL.md`;
        const content = await this.fetcher.getFileContent(this.owner, this.repoName, skillPath, this.branch);
        if (!content)
            return null;
        const { body } = parseFrontmatter(content);
        return body || null;
    }
}
// --- Registry ---
export class SkillSourceRegistry {
    sources = new Map();
    register(source) {
        this.sources.set(source.name, source);
    }
    unregister(name) {
        return this.sources.delete(name);
    }
    getSource(name) {
        return this.sources.get(name);
    }
    /** Sources sorted by priority descending (higher priority first). */
    sortedSources() {
        return Array.from(this.sources.values()).sort((a, b) => b.priority - a.priority);
    }
    async listAllSkills() {
        const sorted = this.sortedSources();
        const results = await Promise.all(sorted.map(s => s.listSkills()));
        return results.flat();
    }
    async findSkill(id) {
        for (const source of this.sortedSources()) {
            const skill = await source.getSkill(id);
            if (skill)
                return skill;
        }
        return null;
    }
    async getContent(id) {
        for (const source of this.sortedSources()) {
            const content = await source.getContent(id);
            if (content)
                return content;
        }
        return null;
    }
}
//# sourceMappingURL=skill-source.js.map