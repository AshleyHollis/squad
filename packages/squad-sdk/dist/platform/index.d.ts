/**
 * Platform module — factory + barrel exports.
 *
 * @module platform
 */
export type { PlatformType, WorkItem, PullRequest, PlatformAdapter, WorkItemSource, HybridPlatformConfig, CommunicationChannel, CommunicationReply, CommunicationConfig, CommunicationAdapter } from './types.js';
export type { GitHubRemoteInfo, AzureDevOpsRemoteInfo } from './detect.js';
export { detectPlatform, detectPlatformFromUrl, detectWorkItemSource, parseGitHubRemote, parseAzureDevOpsRemote, getRemoteUrl } from './detect.js';
export { GitHubAdapter } from './github.js';
export { AzureDevOpsAdapter } from './azure-devops.js';
export type { AdoWorkItemConfig } from './azure-devops.js';
export { PlannerAdapter, mapPlannerTaskToWorkItem } from './planner.js';
export { getRalphScanCommands } from './ralph-commands.js';
export type { RalphCommands } from './ralph-commands.js';
export { FileLogCommunicationAdapter } from './comms-file-log.js';
export { GitHubDiscussionsCommunicationAdapter } from './comms-github-discussions.js';
export { ADODiscussionCommunicationAdapter } from './comms-ado-discussions.js';
export { createCommunicationAdapter } from './comms.js';
import type { PlatformAdapter } from './types.js';
/**
 * Create a platform adapter by auto-detecting the platform from the repo's git remote.
 * Throws if required remote info cannot be parsed.
 */
export declare function createPlatformAdapter(repoRoot: string): PlatformAdapter;
//# sourceMappingURL=index.d.ts.map