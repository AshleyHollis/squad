/**
 * GitHub platform adapter — wraps gh CLI for issue/PR/branch operations.
 *
 * @module platform/github
 */
import { execFileSync } from 'node:child_process';
const EXEC_OPTS = { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] };
/** Safely parse JSON output, including raw text in error messages */
function parseJson(raw) {
    try {
        return JSON.parse(raw);
    }
    catch (err) {
        throw new Error(`Failed to parse JSON from CLI output: ${err.message}\nRaw output: ${raw}`);
    }
}
export class GitHubAdapter {
    owner;
    repo;
    type = 'github';
    constructor(owner, repo) {
        this.owner = owner;
        this.repo = repo;
    }
    get repoFlag() {
        return `${this.owner}/${this.repo}`;
    }
    gh(args) {
        return execFileSync('gh', args, EXEC_OPTS).trim();
    }
    async listWorkItems(options) {
        const args = ['issue', 'list', '--repo', this.repoFlag, '--json', 'number,title,state,labels,assignees,url'];
        if (options.state)
            args.push('--state', options.state);
        if (options.limit)
            args.push('--limit', String(options.limit));
        if (options.tags?.length) {
            for (const tag of options.tags) {
                args.push('--label', tag);
            }
        }
        const output = this.gh(args);
        const issues = parseJson(output);
        return issues.map((issue) => ({
            id: issue.number,
            title: issue.title,
            state: issue.state.toLowerCase(),
            tags: issue.labels.map((l) => l.name),
            assignedTo: issue.assignees[0]?.login,
            url: issue.url,
        }));
    }
    async getWorkItem(id) {
        const output = this.gh([
            'issue', 'view', String(id), '--repo', this.repoFlag,
            '--json', 'number,title,state,labels,assignees,url',
        ]);
        const issue = parseJson(output);
        return {
            id: issue.number,
            title: issue.title,
            state: issue.state.toLowerCase(),
            tags: issue.labels.map((l) => l.name),
            assignedTo: issue.assignees[0]?.login,
            url: issue.url,
        };
    }
    async createWorkItem(options) {
        const args = [
            'issue', 'create',
            '--repo', this.repoFlag,
            '--title', options.title,
        ];
        if (options.description) {
            args.push('--body', options.description);
        }
        if (options.tags?.length) {
            for (const tag of options.tags) {
                args.push('--label', tag);
            }
        }
        if (options.assignedTo) {
            args.push('--assignee', options.assignedTo);
        }
        // gh issue create doesn't support --json; it prints the issue URL to stdout
        const url = this.gh(args);
        const match = url.match(/\/issues\/(\d+)\s*$/);
        if (!match) {
            throw new Error(`Could not parse issue number from gh output: ${url}`);
        }
        const issueNumber = parseInt(match[1], 10);
        return {
            id: issueNumber,
            title: options.title,
            state: 'open',
            tags: options.tags ?? [],
            assignedTo: options.assignedTo,
            url: url.trim(),
        };
    }
    async addTag(workItemId, tag) {
        this.gh(['issue', 'edit', String(workItemId), '--repo', this.repoFlag, '--add-label', tag]);
    }
    async removeTag(workItemId, tag) {
        this.gh(['issue', 'edit', String(workItemId), '--repo', this.repoFlag, '--remove-label', tag]);
    }
    async addComment(workItemId, comment) {
        this.gh(['issue', 'comment', String(workItemId), '--repo', this.repoFlag, '--body', comment]);
    }
    async listPullRequests(options) {
        const args = ['pr', 'list', '--repo', this.repoFlag, '--json', 'number,title,headRefName,baseRefName,state,isDraft,reviewDecision,author,url'];
        if (options.status)
            args.push('--state', mapStatusToGhState(options.status));
        if (options.limit)
            args.push('--limit', String(options.limit));
        const output = this.gh(args);
        const prs = parseJson(output);
        return prs.map((pr) => ({
            id: pr.number,
            title: pr.title,
            sourceBranch: pr.headRefName,
            targetBranch: pr.baseRefName,
            status: mapGitHubPrStatus(pr.state, pr.isDraft),
            reviewStatus: mapGitHubReviewStatus(pr.reviewDecision),
            author: pr.author.login,
            url: pr.url,
        }));
    }
    async createPullRequest(options) {
        const args = [
            'pr', 'create',
            '--repo', this.repoFlag,
            '--head', options.sourceBranch,
            '--base', options.targetBranch,
            '--title', options.title,
            '--json', 'number,title,headRefName,baseRefName,state,isDraft,reviewDecision,author,url',
        ];
        if (options.description) {
            args.push('--body', options.description);
        }
        const output = this.gh(args);
        const pr = parseJson(output);
        return {
            id: pr.number,
            title: pr.title,
            sourceBranch: pr.headRefName,
            targetBranch: pr.baseRefName,
            status: mapGitHubPrStatus(pr.state, pr.isDraft),
            reviewStatus: mapGitHubReviewStatus(pr.reviewDecision),
            author: pr.author.login,
            url: pr.url,
        };
    }
    async mergePullRequest(id) {
        this.gh(['pr', 'merge', String(id), '--repo', this.repoFlag, '--merge']);
    }
    async createBranch(name, fromBranch) {
        const base = fromBranch ?? 'main';
        execFileSync('git', ['checkout', base], EXEC_OPTS);
        execFileSync('git', ['pull'], EXEC_OPTS);
        execFileSync('git', ['checkout', '-b', name], EXEC_OPTS);
    }
}
/** Map normalized status (active/completed/abandoned/draft) to gh CLI --state values */
function mapStatusToGhState(status) {
    switch (status.toLowerCase()) {
        case 'active': return 'open';
        case 'completed': return 'merged';
        case 'abandoned': return 'closed';
        case 'draft': return 'open';
        default: return status;
    }
}
function mapGitHubPrStatus(state, isDraft) {
    if (isDraft)
        return 'draft';
    switch (state.toUpperCase()) {
        case 'OPEN': return 'active';
        case 'CLOSED': return 'abandoned';
        case 'MERGED': return 'completed';
        default: return 'active';
    }
}
function mapGitHubReviewStatus(decision) {
    switch (decision?.toUpperCase()) {
        case 'APPROVED': return 'approved';
        case 'CHANGES_REQUESTED': return 'changes-requested';
        case 'REVIEW_REQUIRED': return 'pending';
        default: return undefined;
    }
}
//# sourceMappingURL=github.js.map