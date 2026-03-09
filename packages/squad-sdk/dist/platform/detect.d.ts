/**
 * Auto-detect platform from git remote URL.
 *
 * @module platform/detect
 */
import type { PlatformType, WorkItemSource } from './types.js';
/** Parsed GitHub remote info */
export interface GitHubRemoteInfo {
    owner: string;
    repo: string;
}
/** Parsed Azure DevOps remote info */
export interface AzureDevOpsRemoteInfo {
    org: string;
    project: string;
    repo: string;
}
/**
 * Parse a GitHub remote URL into owner/repo.
 * Supports HTTPS and SSH formats:
 *   https://github.com/owner/repo.git
 *   git@github.com:owner/repo.git
 */
export declare function parseGitHubRemote(url: string): GitHubRemoteInfo | null;
/**
 * Parse an Azure DevOps remote URL into org/project/repo.
 * Supports multiple formats:
 *   https://dev.azure.com/org/project/_git/repo
 *   https://org@dev.azure.com/org/project/_git/repo
 *   git@ssh.dev.azure.com:v3/org/project/repo
 *   https://org.visualstudio.com/project/_git/repo
 */
export declare function parseAzureDevOpsRemote(url: string): AzureDevOpsRemoteInfo | null;
/**
 * Detect platform type from git remote URL string.
 * Returns 'github' for github.com remotes, 'azure-devops' for ADO remotes.
 * Defaults to 'github' if unrecognized.
 */
export declare function detectPlatformFromUrl(url: string): PlatformType;
/**
 * Detect platform from a repository root by reading the git remote.
 * Reads 'origin' remote URL and determines whether it's GitHub or Azure DevOps.
 * Defaults to 'github' if detection fails.
 */
export declare function detectPlatform(repoRoot: string): PlatformType;
/**
 * Detect work-item source for hybrid setups.
 * When a squad config specifies `workItems: 'planner'`, work items come from
 * Planner even though the repo is on GitHub or Azure DevOps.
 */
export declare function detectWorkItemSource(repoRoot: string, configWorkItems?: string): WorkItemSource;
/**
 * Get the origin remote URL for a repo, or null if unavailable.
 */
export declare function getRemoteUrl(repoRoot: string): string | null;
//# sourceMappingURL=detect.d.ts.map