/**
 * GitHub platform adapter — wraps gh CLI for issue/PR/branch operations.
 *
 * @module platform/github
 */
import type { PlatformAdapter, PlatformType, WorkItem, PullRequest } from './types.js';
export declare class GitHubAdapter implements PlatformAdapter {
    private readonly owner;
    private readonly repo;
    readonly type: PlatformType;
    constructor(owner: string, repo: string);
    private get repoFlag();
    private gh;
    listWorkItems(options: {
        tags?: string[];
        state?: string;
        limit?: number;
    }): Promise<WorkItem[]>;
    getWorkItem(id: number): Promise<WorkItem>;
    createWorkItem(options: {
        title: string;
        description?: string;
        tags?: string[];
        assignedTo?: string;
        type?: string;
    }): Promise<WorkItem>;
    addTag(workItemId: number, tag: string): Promise<void>;
    removeTag(workItemId: number, tag: string): Promise<void>;
    addComment(workItemId: number, comment: string): Promise<void>;
    listPullRequests(options: {
        status?: string;
        limit?: number;
    }): Promise<PullRequest[]>;
    createPullRequest(options: {
        title: string;
        sourceBranch: string;
        targetBranch: string;
        description?: string;
    }): Promise<PullRequest>;
    mergePullRequest(id: number): Promise<void>;
    createBranch(name: string, fromBranch?: string): Promise<void>;
}
//# sourceMappingURL=github.d.ts.map