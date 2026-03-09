/**
 * Azure DevOps platform adapter — wraps az CLI for work item/PR/branch operations.
 *
 * @module platform/azure-devops
 */
import type { PlatformAdapter, PlatformType, WorkItem, PullRequest } from './types.js';
/** ADO-specific configuration for work items that may live in a different org/project than the repo. */
export interface AdoWorkItemConfig {
    /** Azure DevOps org for work items (if different from repo org) */
    org?: string;
    /** Azure DevOps project for work items (if different from repo project) */
    project?: string;
    /** Default work item type — e.g. "User Story", "Scenario", "Bug" (default: "User Story") */
    defaultWorkItemType?: string;
    /** Default area path for new work items — e.g. "MyProject\\Team A" */
    areaPath?: string;
    /** Default iteration path for new work items — e.g. "MyProject\\Sprint 1" */
    iterationPath?: string;
}
export declare class AzureDevOpsAdapter implements PlatformAdapter {
    private readonly org;
    private readonly project;
    private readonly repo;
    private readonly workItemConfig?;
    readonly type: PlatformType;
    constructor(org: string, project: string, repo: string, workItemConfig?: AdoWorkItemConfig | undefined);
    private get orgUrl();
    /** Org URL for work item operations (may differ from repo org). */
    private get wiOrgUrl();
    /** Project for work item operations (may differ from repo project). */
    private get wiProject();
    /** Common az CLI default args for repo operations */
    private get defaultArgs();
    /** Common az CLI default args for work item operations */
    private get workItemArgs();
    private az;
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
        areaPath?: string;
        iterationPath?: string;
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
//# sourceMappingURL=azure-devops.d.ts.map