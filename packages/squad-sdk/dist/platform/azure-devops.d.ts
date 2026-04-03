/**
 * Azure DevOps platform adapter — wraps az CLI for work item/PR/branch operations.
 *
 * @module platform/azure-devops
 */
import type { PlatformAdapter, PlatformType, WorkItem, PullRequest } from './types.js';
/** Descriptor for a work item type returned by process template introspection. */
export interface WorkItemTypeInfo {
    /** Display name — e.g. "User Story", "Bug", "Task", "Scenario" */
    name: string;
    /** Description of the work item type (may be empty) */
    description: string;
    /** Whether this type is disabled in the current process */
    disabled: boolean;
}
/**
 * Query the ADO process template for available work item types.
 *
 * Uses `az boards work-item type list` which returns the types configured
 * for the project's process template (Agile, Scrum, CMMI, custom, etc.).
 *
 * Falls back to a minimal default list when the az CLI call fails
 * (e.g. no auth, no devops extension, offline).
 */
export declare function getAvailableWorkItemTypes(org: string, project: string): WorkItemTypeInfo[];
/**
 * Validate that a work item type name exists in the project's process template.
 *
 * Returns `true` when the type is valid and not disabled, or when the type list
 * cannot be retrieved (fail-open so offline/CI scenarios aren't blocked).
 */
export declare function validateWorkItemType(org: string, project: string, typeName: string): {
    valid: boolean;
    available: string[];
};
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
    /**
     * Query the available work item types for this adapter's work item project.
     * Delegates to the module-level `getAvailableWorkItemTypes`.
     */
    getAvailableWorkItemTypes(): WorkItemTypeInfo[];
    /**
     * Validate a work item type against the project's process template.
     */
    validateWorkItemType(typeName: string): {
        valid: boolean;
        available: string[];
    };
    createWorkItem(options: {
        title: string;
        description?: string;
        tags?: string[];
        assignedTo?: string;
        type?: string;
        areaPath?: string;
        iterationPath?: string;
        validateType?: boolean;
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