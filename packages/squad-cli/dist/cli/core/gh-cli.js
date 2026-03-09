/**
 * GitHub CLI wrapper utilities — zero dependencies
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
/**
 * Check if gh CLI is available
 */
export async function ghAvailable() {
    try {
        await execFileAsync('gh', ['--version']);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Check if gh CLI is authenticated
 */
export async function ghAuthenticated() {
    try {
        await execFileAsync('gh', ['auth', 'status']);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * List issues with optional filters
 */
export async function ghIssueList(options = {}) {
    const args = ['issue', 'list', '--json', 'number,title,body,labels,assignees'];
    if (options.label) {
        args.push('--label', options.label);
    }
    if (options.state) {
        args.push('--state', options.state);
    }
    if (options.limit) {
        args.push('--limit', String(options.limit));
    }
    const { stdout } = await execFileAsync('gh', args);
    return JSON.parse(stdout || '[]');
}
export async function ghPrList(options = {}) {
    const args = ['pr', 'list', '--json', 'number,title,author,labels,isDraft,reviewDecision,state,headRefName,statusCheckRollup'];
    if (options.state) {
        args.push('--state', options.state);
    }
    if (options.limit) {
        args.push('--limit', String(options.limit));
    }
    if (options.label) {
        args.push('--label', options.label);
    }
    const { stdout } = await execFileAsync('gh', args);
    return JSON.parse(stdout || '[]');
}
/**
 * Edit an issue (add/remove labels or assignees)
 */
export async function ghIssueEdit(issueNumber, options) {
    const args = ['issue', 'edit', String(issueNumber)];
    if (options.addLabel) {
        args.push('--add-label', options.addLabel);
    }
    if (options.removeLabel) {
        args.push('--remove-label', options.removeLabel);
    }
    if (options.addAssignee) {
        args.push('--add-assignee', options.addAssignee);
    }
    if (options.removeAssignee) {
        args.push('--remove-assignee', options.removeAssignee);
    }
    await execFileAsync('gh', args);
}
//# sourceMappingURL=gh-cli.js.map