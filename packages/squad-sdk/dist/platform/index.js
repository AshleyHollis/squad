/**
 * Platform module — factory + barrel exports.
 *
 * @module platform
 */
export { detectPlatform, detectPlatformFromUrl, detectWorkItemSource, parseGitHubRemote, parseAzureDevOpsRemote, getRemoteUrl } from './detect.js';
export { GitHubAdapter } from './github.js';
export { AzureDevOpsAdapter } from './azure-devops.js';
export { getAvailableWorkItemTypes, validateWorkItemType } from './azure-devops.js';
export { PlannerAdapter, mapPlannerTaskToWorkItem } from './planner.js';
export { getRalphScanCommands } from './ralph-commands.js';
export { FileLogCommunicationAdapter } from './comms-file-log.js';
export { GitHubDiscussionsCommunicationAdapter } from './comms-github-discussions.js';
export { ADODiscussionCommunicationAdapter } from './comms-ado-discussions.js';
export { createCommunicationAdapter } from './comms.js';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { detectPlatform, getRemoteUrl, parseGitHubRemote, parseAzureDevOpsRemote } from './detect.js';
import { GitHubAdapter } from './github.js';
import { AzureDevOpsAdapter } from './azure-devops.js';
/**
 * Read ADO work item config from .squad/config.json if present.
 */
function readAdoConfig(repoRoot) {
    const configPath = join(repoRoot, '.squad', 'config.json');
    if (!existsSync(configPath))
        return undefined;
    try {
        const raw = readFileSync(configPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.ado && typeof parsed.ado === 'object') {
            return parsed.ado;
        }
    }
    catch { /* ignore parse errors */ }
    return undefined;
}
/**
 * Create a platform adapter by auto-detecting the platform from the repo's git remote.
 * Throws if required remote info cannot be parsed.
 */
export function createPlatformAdapter(repoRoot) {
    const platform = detectPlatform(repoRoot);
    const remoteUrl = getRemoteUrl(repoRoot);
    if (!remoteUrl) {
        throw new Error('No git remote "origin" found. Cannot create platform adapter.');
    }
    if (platform === 'azure-devops') {
        const info = parseAzureDevOpsRemote(remoteUrl);
        if (!info) {
            throw new Error(`Could not parse Azure DevOps remote URL: ${remoteUrl}`);
        }
        const adoConfig = readAdoConfig(repoRoot);
        return new AzureDevOpsAdapter(info.org, info.project, info.repo, adoConfig);
    }
    const info = parseGitHubRemote(remoteUrl);
    if (!info) {
        throw new Error(`Could not parse GitHub remote URL: ${remoteUrl}`);
    }
    return new GitHubAdapter(info.owner, info.repo);
}
//# sourceMappingURL=index.js.map