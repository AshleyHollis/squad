/**
 * Agent Source Registry
 * Pluggable agent discovery and loading
 */
import * as fs from 'fs/promises';
import * as path from 'path';
/** Directories to scan for agents, in priority order. */
const AGENT_DIRS = ['.squad/agents', '.ai-team/agents'];
/**
 * Parse charter.md content to extract agent metadata.
 */
export function parseCharterMetadata(content) {
    const result = {};
    const identityMatch = content.match(/##\s+Identity\s*\n([\s\S]*?)(?=\n##|\n---|$)/i);
    if (identityMatch) {
        const section = identityMatch[1];
        const nameMatch = section.match(/\*\*Name:\*\*\s*(.+)/i);
        if (nameMatch)
            result.name = nameMatch[1].trim();
        const roleMatch = section.match(/\*\*Role:\*\*\s*(.+)/i);
        if (roleMatch)
            result.role = roleMatch[1].trim();
        const expertiseMatch = section.match(/\*\*Expertise:\*\*\s*(.+)/i);
        if (expertiseMatch) {
            result.skills = expertiseMatch[1].split(',').map(s => s.trim()).filter(Boolean);
        }
    }
    const modelMatch = content.match(/##\s+Model\s*\n([\s\S]*?)(?=\n##|\n---|$)/i);
    if (modelMatch) {
        const preferredMatch = modelMatch[1].match(/\*\*Preferred:\*\*\s*(.+)/i);
        if (preferredMatch)
            result.model = preferredMatch[1].trim();
    }
    const toolsMatch = content.match(/##\s+Tools?\s*\n([\s\S]*?)(?=\n##|\n---|$)/i);
    if (toolsMatch) {
        result.tools = toolsMatch[1]
            .split('\n')
            .map(line => {
            const m = line.match(/^\s*[-*]\s+`?([^`\s]+)`?/);
            return m ? m[1].trim() : null;
        })
            .filter((t) => t !== null);
    }
    return result;
}
export class LocalAgentSource {
    basePath;
    name = 'local';
    type = 'local';
    constructor(basePath) {
        this.basePath = basePath;
    }
    /**
     * Resolve the agents directory, preferring .squad/agents over .ai-team/agents.
     */
    async resolveAgentsDir() {
        for (const dir of AGENT_DIRS) {
            const fullPath = path.join(this.basePath, dir);
            try {
                const stat = await fs.stat(fullPath);
                if (stat.isDirectory())
                    return fullPath;
            }
            catch {
                // directory doesn't exist, try next
            }
        }
        return null;
    }
    async listAgents() {
        const agentsDir = await this.resolveAgentsDir();
        if (!agentsDir)
            return [];
        const manifests = [];
        let entries;
        try {
            entries = await fs.readdir(agentsDir, { withFileTypes: true });
        }
        catch {
            return [];
        }
        for (const entry of entries) {
            if (!entry.isDirectory())
                continue;
            const charterPath = path.join(agentsDir, entry.name, 'charter.md');
            try {
                const content = await fs.readFile(charterPath, 'utf-8');
                const meta = parseCharterMetadata(content);
                manifests.push({
                    name: meta.name || entry.name,
                    role: meta.role || 'agent',
                    source: 'local',
                });
            }
            catch {
                // Skip agents with missing/unreadable charter
            }
        }
        return manifests;
    }
    async getAgent(name) {
        const agentsDir = await this.resolveAgentsDir();
        if (!agentsDir)
            return null;
        const charterPath = path.join(agentsDir, name, 'charter.md');
        let charter;
        try {
            charter = await fs.readFile(charterPath, 'utf-8');
        }
        catch {
            return null;
        }
        const meta = parseCharterMetadata(charter);
        // Optionally read history.md
        let history;
        try {
            history = await fs.readFile(path.join(agentsDir, name, 'history.md'), 'utf-8');
        }
        catch {
            // history is optional
        }
        return {
            name: meta.name || name,
            role: meta.role || 'agent',
            source: 'local',
            charter,
            model: meta.model,
            tools: meta.tools,
            skills: meta.skills,
            history,
        };
    }
    async getCharter(name) {
        const agentsDir = await this.resolveAgentsDir();
        if (!agentsDir)
            return null;
        try {
            return await fs.readFile(path.join(agentsDir, name, 'charter.md'), 'utf-8');
        }
        catch {
            return null;
        }
    }
}
/** Parse "owner/repo" format into components. */
function parseOwnerRepo(repo) {
    const parts = repo.split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        throw new Error(`Invalid repo format "${repo}": expected "owner/repo"`);
    }
    return { owner: parts[0], repo: parts[1] };
}
export class GitHubAgentSource {
    name = 'github';
    type = 'github';
    owner;
    repoName;
    branch;
    pathPrefix;
    fetcher;
    constructor(repo, options) {
        const parsed = parseOwnerRepo(repo);
        this.owner = parsed.owner;
        this.repoName = parsed.repo;
        this.branch = options?.ref;
        this.pathPrefix = options?.pathPrefix ?? '.squad/agents';
        this.fetcher = options?.fetcher ?? createDefaultFetcher();
    }
    async listAgents() {
        const entries = await this.fetcher.listDirectory(this.owner, this.repoName, this.pathPrefix, this.branch);
        const dirs = entries.filter(e => e.type === 'dir');
        const manifests = [];
        for (const dir of dirs) {
            const charterPath = `${this.pathPrefix}/${dir.name}/charter.md`;
            const content = await this.fetcher.getFileContent(this.owner, this.repoName, charterPath, this.branch);
            if (!content)
                continue;
            const meta = parseCharterMetadata(content);
            manifests.push({
                name: meta.name || dir.name,
                role: meta.role || 'agent',
                source: 'github',
            });
        }
        return manifests;
    }
    async getAgent(name) {
        const charterPath = `${this.pathPrefix}/${name}/charter.md`;
        const charter = await this.fetcher.getFileContent(this.owner, this.repoName, charterPath, this.branch);
        if (!charter)
            return null;
        const meta = parseCharterMetadata(charter);
        let history;
        const historyPath = `${this.pathPrefix}/${name}/history.md`;
        const historyContent = await this.fetcher.getFileContent(this.owner, this.repoName, historyPath, this.branch);
        if (historyContent)
            history = historyContent;
        return {
            name: meta.name || name,
            role: meta.role || 'agent',
            source: 'github',
            charter,
            model: meta.model,
            tools: meta.tools,
            skills: meta.skills,
            history,
        };
    }
    async getCharter(name) {
        const charterPath = `${this.pathPrefix}/${name}/charter.md`;
        return this.fetcher.getFileContent(this.owner, this.repoName, charterPath, this.branch);
    }
}
/** Default fetcher that returns empty results when no real fetcher is configured. */
function createDefaultFetcher() {
    return {
        async listDirectory() {
            return [];
        },
        async getFileContent() {
            return null;
        },
    };
}
export class MarketplaceAgentSource {
    apiEndpoint;
    name = 'marketplace';
    type = 'marketplace';
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
    }
    async listAgents() {
        return [];
    }
    async getAgent(name) {
        return null;
    }
    async getCharter(name) {
        return null;
    }
}
export class AgentRegistry {
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
    async listAllAgents() {
        const results = await Promise.all(Array.from(this.sources.values()).map(s => s.listAgents()));
        return results.flat();
    }
    async findAgent(name) {
        for (const source of this.sources.values()) {
            const agent = await source.getAgent(name);
            if (agent)
                return agent;
        }
        return null;
    }
    async getCharter(name) {
        for (const source of this.sources.values()) {
            const charter = await source.getCharter(name);
            if (charter)
                return charter;
        }
        return null;
    }
}
//# sourceMappingURL=agent-source.js.map