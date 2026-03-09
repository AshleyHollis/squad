/**
 * Azure DevOps platform adapter — wraps az CLI for work item/PR/branch operations.
 *
 * @module platform/azure-devops
 */
import { execFileSync, execSync } from 'node:child_process';
const EXEC_OPTS = { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] };
/** Check whether the az CLI with devops extension is available */
function assertAzCliAvailable() {
    try {
        execSync('az devops -h', EXEC_OPTS);
    }
    catch {
        throw new Error('Azure DevOps CLI not found. Install it with:\n' +
            '  1. Install Azure CLI: https://aka.ms/install-az-cli\n' +
            '  2. Add DevOps extension: az extension add --name azure-devops\n' +
            '  3. Login: az login\n' +
            '  4. Set defaults: az devops configure --defaults organization=https://dev.azure.com/YOUR_ORG project=YOUR_PROJECT');
    }
}
/** Escape a value for safe interpolation into a WIQL string (double single-quotes). */
function escapeWiql(value) {
    return value.replace(/'/g, "''");
}
/** Safely parse JSON output, including raw text in error messages */
function parseJson(raw) {
    try {
        return JSON.parse(raw);
    }
    catch (err) {
        throw new Error(`Failed to parse JSON from CLI output: ${err.message}\nRaw output: ${raw}`);
    }
}
export class AzureDevOpsAdapter {
    org;
    project;
    repo;
    workItemConfig;
    type = 'azure-devops';
    constructor(org, project, repo, workItemConfig) {
        this.org = org;
        this.project = project;
        this.repo = repo;
        this.workItemConfig = workItemConfig;
        assertAzCliAvailable();
    }
    get orgUrl() {
        return `https://dev.azure.com/${this.org}`;
    }
    /** Org URL for work item operations (may differ from repo org). */
    get wiOrgUrl() {
        const wiOrg = this.workItemConfig?.org ?? this.org;
        return `https://dev.azure.com/${wiOrg}`;
    }
    /** Project for work item operations (may differ from repo project). */
    get wiProject() {
        return this.workItemConfig?.project ?? this.project;
    }
    /** Common az CLI default args for repo operations */
    get defaultArgs() {
        return ['--org', this.orgUrl, '--project', this.project];
    }
    /** Common az CLI default args for work item operations */
    get workItemArgs() {
        return ['--org', this.wiOrgUrl, '--project', this.wiProject];
    }
    az(args) {
        return execFileSync('az', args, EXEC_OPTS).trim();
    }
    async listWorkItems(options) {
        const conditions = [];
        if (options.state) {
            conditions.push(`[System.State] = '${escapeWiql(options.state)}'`);
        }
        if (options.tags?.length) {
            for (const tag of options.tags) {
                conditions.push(`[System.Tags] Contains '${escapeWiql(tag)}'`);
            }
        }
        conditions.push(`[System.TeamProject] = '${escapeWiql(this.wiProject)}'`);
        const where = conditions.join(' AND ');
        const top = options.limit ?? 50;
        const wiql = `SELECT [System.Id] FROM WorkItems WHERE ${where} ORDER BY [System.CreatedDate] DESC`;
        const output = this.az([
            'boards', 'query', '--wiql', wiql, ...this.workItemArgs, '--output', 'json',
        ]);
        const items = parseJson(output);
        // Fetch full details for each work item (limited by top)
        const results = [];
        for (const item of items.slice(0, top)) {
            const wi = await this.getWorkItem(item.id);
            results.push(wi);
        }
        return results;
    }
    async getWorkItem(id) {
        const output = this.az([
            'boards', 'work-item', 'show', '--id', String(id), ...this.workItemArgs, '--output', 'json',
        ]);
        const wi = parseJson(output);
        const fields = wi.fields;
        const tags = typeof fields['System.Tags'] === 'string'
            ? fields['System.Tags'].split(';').map((t) => t.trim()).filter(Boolean)
            : [];
        const assignedTo = fields['System.AssignedTo'];
        return {
            id: wi.id,
            title: fields['System.Title'] ?? '',
            state: fields['System.State'] ?? '',
            tags,
            assignedTo: assignedTo?.displayName ?? assignedTo?.uniqueName,
            url: wi._links?.html?.href ?? wi.url,
        };
    }
    async createWorkItem(options) {
        const wiType = options.type ?? this.workItemConfig?.defaultWorkItemType ?? 'User Story';
        const fields = [
            `System.Title=${options.title}`,
        ];
        if (options.description) {
            fields.push(`System.Description=${options.description}`);
        }
        if (options.tags?.length) {
            fields.push(`System.Tags=${options.tags.join('; ')}`);
        }
        if (options.assignedTo) {
            fields.push(`System.AssignedTo=${options.assignedTo}`);
        }
        // Area path: explicit > config > omit (uses project default)
        const areaPath = options.areaPath ?? this.workItemConfig?.areaPath;
        if (areaPath) {
            fields.push(`System.AreaPath=${areaPath}`);
        }
        // Iteration path: explicit > config > omit (uses project default)
        const iterationPath = options.iterationPath ?? this.workItemConfig?.iterationPath;
        if (iterationPath) {
            fields.push(`System.IterationPath=${iterationPath}`);
        }
        const output = this.az([
            'boards', 'work-item', 'create', '--type', wiType, '--fields', ...fields, ...this.workItemArgs, '--output', 'json',
        ]);
        const created = parseJson(output);
        const createdFields = created.fields;
        const tags = typeof createdFields['System.Tags'] === 'string'
            ? createdFields['System.Tags'].split(';').map((t) => t.trim()).filter(Boolean)
            : [];
        return {
            id: created.id,
            title: createdFields['System.Title'] ?? '',
            state: createdFields['System.State'] ?? '',
            tags,
            url: created._links?.html?.href ?? created.url,
        };
    }
    async addTag(workItemId, tag) {
        // Get current tags, append the new one
        const wi = await this.getWorkItem(workItemId);
        const currentTags = wi.tags.filter((t) => t !== tag);
        currentTags.push(tag);
        const tagsStr = currentTags.join('; ');
        this.az([
            'boards', 'work-item', 'update', '--id', String(workItemId),
            '--fields', `System.Tags=${tagsStr}`, ...this.workItemArgs, '--output', 'json',
        ]);
    }
    async removeTag(workItemId, tag) {
        const wi = await this.getWorkItem(workItemId);
        const updatedTags = wi.tags.filter((t) => t !== tag);
        const tagsStr = updatedTags.join('; ');
        this.az([
            'boards', 'work-item', 'update', '--id', String(workItemId),
            '--fields', `System.Tags=${tagsStr}`, ...this.workItemArgs, '--output', 'json',
        ]);
    }
    async addComment(workItemId, comment) {
        this.az([
            'boards', 'work-item', 'update', '--id', String(workItemId),
            '--discussion', comment, ...this.workItemArgs, '--output', 'json',
        ]);
    }
    async listPullRequests(options) {
        const args = [
            'repos', 'pr', 'list',
            '--repository', this.repo,
            ...this.defaultArgs,
            '--output', 'json',
        ];
        if (options.status)
            args.push('--status', options.status);
        if (options.limit)
            args.push('--top', String(options.limit));
        const output = this.az(args);
        const prs = parseJson(output);
        return prs.map((pr) => ({
            id: pr.pullRequestId,
            title: pr.title,
            sourceBranch: stripRefsHeads(pr.sourceRefName),
            targetBranch: stripRefsHeads(pr.targetRefName),
            status: mapAdoPrStatus(pr.status, pr.isDraft),
            reviewStatus: mapAdoReviewStatus(pr.reviewers),
            author: pr.createdBy.displayName ?? pr.createdBy.uniqueName,
            url: pr.repository?.webUrl
                ? `${pr.repository.webUrl}/pullrequest/${pr.pullRequestId}`
                : pr.url,
        }));
    }
    async createPullRequest(options) {
        const args = [
            'repos', 'pr', 'create',
            '--repository', this.repo,
            '--source-branch', options.sourceBranch,
            '--target-branch', options.targetBranch,
            '--title', options.title,
            ...this.defaultArgs,
            '--output', 'json',
        ];
        if (options.description) {
            args.push('--description', options.description);
        }
        const output = this.az(args);
        const pr = parseJson(output);
        return {
            id: pr.pullRequestId,
            title: pr.title,
            sourceBranch: stripRefsHeads(pr.sourceRefName),
            targetBranch: stripRefsHeads(pr.targetRefName),
            status: mapAdoPrStatus(pr.status, pr.isDraft),
            reviewStatus: mapAdoReviewStatus(pr.reviewers),
            author: pr.createdBy.displayName ?? pr.createdBy.uniqueName,
            url: pr.url,
        };
    }
    async mergePullRequest(id) {
        this.az([
            'repos', 'pr', 'update', '--id', String(id),
            '--status', 'completed', ...this.defaultArgs, '--output', 'json',
        ]);
    }
    async createBranch(name, fromBranch) {
        const base = fromBranch ?? 'main';
        execFileSync('git', ['checkout', base], EXEC_OPTS);
        execFileSync('git', ['pull'], EXEC_OPTS);
        execFileSync('git', ['checkout', '-b', name], EXEC_OPTS);
    }
}
function stripRefsHeads(ref) {
    return ref.replace(/^refs\/heads\//, '');
}
function mapAdoPrStatus(status, isDraft) {
    if (isDraft)
        return 'draft';
    switch (status.toLowerCase()) {
        case 'active': return 'active';
        case 'completed': return 'completed';
        case 'abandoned': return 'abandoned';
        default: return 'active';
    }
}
function mapAdoReviewStatus(reviewers) {
    if (!reviewers?.length)
        return 'pending';
    // ADO vote: 10 = approved, -10 = rejected, 5 = approved with suggestions, -5 = waiting, 0 = no vote
    const hasReject = reviewers.some((r) => r.vote <= -5);
    if (hasReject)
        return 'changes-requested';
    const hasApproval = reviewers.some((r) => r.vote >= 5);
    if (hasApproval)
        return 'approved';
    return 'pending';
}
//# sourceMappingURL=azure-devops.js.map