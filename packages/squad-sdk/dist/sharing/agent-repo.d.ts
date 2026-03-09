/**
 * Agent Repository Configuration (M5-7, Issue #131)
 */
import type { AgentDefinition, AgentManifest, GitHubFetcher } from '../config/agent-source.js';
export interface AgentRepoConfig {
    owner: string;
    repo: string;
    branch?: string;
    path?: string;
    authentication?: {
        type: 'token' | 'app';
        token?: string;
    };
}
export interface PushResult {
    success: boolean;
    sha?: string;
    errors: string[];
}
/**
 * Abstracted GitHub operations for agent repo management.
 */
export interface AgentRepoOperations extends GitHubFetcher {
    /** Push a file to a repo (create or update). */
    pushFile(owner: string, repo: string, path: string, content: string, message: string, branch?: string): Promise<{
        sha: string;
    }>;
}
export declare function configureAgentRepo(config: AgentRepoConfig): AgentRepoConfig;
export declare function listRepoAgents(config: AgentRepoConfig, ops: AgentRepoOperations): Promise<AgentManifest[]>;
export declare function pullAgent(config: AgentRepoConfig, agentId: string, ops: AgentRepoOperations): Promise<AgentDefinition | null>;
export declare function pushAgent(config: AgentRepoConfig, agent: AgentDefinition, ops: AgentRepoOperations): Promise<PushResult>;
//# sourceMappingURL=agent-repo.d.ts.map