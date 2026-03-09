/**
 * Agent Source Registry
 * Pluggable agent discovery and loading
 */
export interface AgentSource {
    readonly name: string;
    readonly type: 'local' | 'github' | 'marketplace';
    listAgents(): Promise<AgentManifest[]>;
    getAgent(name: string): Promise<AgentDefinition | null>;
    getCharter(name: string): Promise<string | null>;
}
export interface AgentManifest {
    name: string;
    role: string;
    version?: string;
    source: string;
}
export interface AgentDefinition extends AgentManifest {
    charter: string;
    model?: string;
    tools?: string[];
    skills?: string[];
    history?: string;
}
/**
 * Parse charter.md content to extract agent metadata.
 */
export declare function parseCharterMetadata(content: string): {
    name?: string;
    role?: string;
    model?: string;
    skills?: string[];
    tools?: string[];
};
export declare class LocalAgentSource implements AgentSource {
    private basePath;
    readonly name = "local";
    readonly type: "local";
    constructor(basePath: string);
    /**
     * Resolve the agents directory, preferring .squad/agents over .ai-team/agents.
     */
    private resolveAgentsDir;
    listAgents(): Promise<AgentManifest[]>;
    getAgent(name: string): Promise<AgentDefinition | null>;
    getCharter(name: string): Promise<string | null>;
}
/**
 * Pluggable fetcher interface for GitHub API calls (enables testing).
 */
export interface GitHubFetcher {
    /** List directory entries at a path in a repo. */
    listDirectory(owner: string, repo: string, path: string, ref?: string): Promise<Array<{
        name: string;
        type: 'file' | 'dir';
    }>>;
    /** Fetch file content (UTF-8 string) at a path in a repo. */
    getFileContent(owner: string, repo: string, path: string, ref?: string): Promise<string | null>;
}
export declare class GitHubAgentSource implements AgentSource {
    readonly name = "github";
    readonly type: "github";
    private owner;
    private repoName;
    private branch?;
    private pathPrefix;
    private fetcher;
    constructor(repo: string, options?: {
        ref?: string;
        pathPrefix?: string;
        fetcher?: GitHubFetcher;
    });
    listAgents(): Promise<AgentManifest[]>;
    getAgent(name: string): Promise<AgentDefinition | null>;
    getCharter(name: string): Promise<string | null>;
}
export declare class MarketplaceAgentSource implements AgentSource {
    private apiEndpoint;
    readonly name = "marketplace";
    readonly type: "marketplace";
    constructor(apiEndpoint: string);
    listAgents(): Promise<AgentManifest[]>;
    getAgent(name: string): Promise<AgentDefinition | null>;
    getCharter(name: string): Promise<string | null>;
}
export declare class AgentRegistry {
    private sources;
    register(source: AgentSource): void;
    unregister(name: string): boolean;
    getSource(name: string): AgentSource | undefined;
    listAllAgents(): Promise<AgentManifest[]>;
    findAgent(name: string): Promise<AgentDefinition | null>;
    getCharter(name: string): Promise<string | null>;
}
//# sourceMappingURL=agent-source.d.ts.map