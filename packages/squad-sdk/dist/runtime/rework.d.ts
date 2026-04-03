/**
 * Rework Rate — Pure calculation helpers.
 *
 * Computes PR rework metrics from review and commit data.
 * No I/O, no side effects — safe to import in tests.
 *
 * @module runtime/rework
 */
/** Minimal PR shape from `gh pr list --json ...` */
export interface PrInfo {
    number: number;
    title: string;
    author?: {
        login: string;
    };
    mergedAt?: string;
    additions?: number;
    deletions?: number;
    changedFiles?: number;
}
/** Review data from `gh pr view --json reviews` */
export interface PrReview {
    submittedAt?: string;
    state?: string;
}
/** Commit data from `gh pr view --json commits` */
export interface PrCommit {
    committedDate?: string;
    commit?: {
        committedDate?: string;
    };
    oid?: string;
}
/** Per-PR rework analysis result */
export interface PrReworkResult {
    number: number;
    title: string;
    author: string;
    mergedAt: string | undefined;
    totalCommits: number;
    reworkCommits: number;
    reworkRate: number;
    reviewCycles: number;
    hadChangesRequested: boolean;
    reworkTimeMs: number | null;
    totalReviews: number;
    additions: number;
    deletions: number;
}
/** Aggregate summary across analyzed PRs */
export interface ReworkSummary {
    totalPrs: number;
    avgReworkRate?: number;
    prsWithRework?: number;
    prsWithChangesRequested?: number;
    avgReviewCycles?: number;
    totalReworkCommits?: number;
    totalCommits?: number;
    avgReworkTimeHours?: number | null;
    rejectionRate?: number;
}
/**
 * Calculate rework metrics for a single PR.
 * Rework = commits pushed after the first review.
 */
export declare function calculatePrRework(pr: PrInfo, reviews: PrReview[], commits: PrCommit[]): PrReworkResult;
/**
 * Calculate aggregate rework summary across all analyzed PRs.
 */
export declare function calculateReworkSummary(results: PrReworkResult[]): ReworkSummary;
//# sourceMappingURL=rework.d.ts.map