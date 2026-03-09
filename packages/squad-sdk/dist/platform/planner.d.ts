/**
 * Microsoft Planner adapter — uses Graph API via az CLI token for task management.
 * Planner buckets map to squad assignments (squad:untriaged, squad:riker, etc.)
 *
 * @module platform/planner
 */
import type { PlatformType, WorkItem } from './types.js';
/** Planner task shape from Graph API */
interface PlannerTask {
    id: string;
    title: string;
    percentComplete: number;
    bucketId: string;
    assignments: Record<string, unknown>;
}
/** Planner bucket shape from Graph API */
interface PlannerBucket {
    id: string;
    name: string;
}
/**
 * Map a Planner task + bucket name to a normalized WorkItem.
 * The original Planner task ID is stored in the url field so it can be recovered.
 */
export declare function mapPlannerTaskToWorkItem(task: PlannerTask, bucketName: string): WorkItem;
/**
 * Planner adapter — partial PlatformAdapter for work-item operations only.
 * Planner has no concept of PRs or branches, so those methods are not implemented.
 * Use alongside a repo adapter (GitHub/ADO) in a hybrid config.
 */
export declare class PlannerAdapter {
    private readonly planId;
    readonly type: PlatformType;
    private bucketCache;
    constructor(planId: string);
    private graphFetch;
    /** Fetch and cache buckets for this plan */
    getBuckets(): Promise<PlannerBucket[]>;
    /** Resolve a bucket name to its ID */
    getBucketId(bucketName: string): Promise<string | undefined>;
    /** Resolve a bucket ID to its name */
    getBucketName(bucketId: string): Promise<string>;
    listWorkItems(options: {
        tags?: string[];
        state?: string;
        limit?: number;
    }): Promise<WorkItem[]>;
    createWorkItem(options: {
        title: string;
        description?: string;
        tags?: string[];
    }): Promise<WorkItem>;
    addTag(taskId: string, bucketName: string): Promise<void>;
    addComment(taskId: string, comment: string): Promise<void>;
}
export {};
//# sourceMappingURL=planner.d.ts.map