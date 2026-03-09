/**
 * SubSquad-Aware Issue Filtering
 *
 * Filters GitHub issues to only those matching a SubSquad's labelFilter.
 * Intended to scope work to the active SubSquad during triage.
 *
 * @module streams/filter
 */
/**
 * Filter issues to only those matching the SubSquad's label filter.
 *
 * Matching is case-insensitive. If the SubSquad has no labelFilter,
 * all issues are returned (passthrough).
 *
 * @param issues - Array of issues to filter
 * @param subsquad - The resolved SubSquad to filter by
 * @returns Filtered array of issues matching the SubSquad's label
 */
export function filterIssuesBySubSquad(issues, subsquad) {
    const filter = subsquad.definition.labelFilter;
    if (!filter) {
        return issues;
    }
    const normalizedFilter = filter.toLowerCase();
    return issues.filter(issue => issue.labels.some(label => label.name.toLowerCase() === normalizedFilter));
}
/** @deprecated Use filterIssuesBySubSquad instead */
export const filterIssuesByWorkstream = filterIssuesBySubSquad;
/** @deprecated Use filterIssuesBySubSquad instead */
export const filterIssuesByStream = filterIssuesBySubSquad;
//# sourceMappingURL=filter.js.map