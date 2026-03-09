/**
 * Azure DevOps Work Item Discussion communication adapter.
 *
 * Posts updates as work item comments and reads replies via `az boards`.
 * Phone-capable via ADO mobile app.
 *
 * @module platform/comms-ado-discussions
 */
import { execFileSync } from 'node:child_process';
const EXEC_OPTS = { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] };
/** Safely parse JSON output */
function parseJson(raw) {
    try {
        return JSON.parse(raw);
    }
    catch (err) {
        throw new Error(`Failed to parse JSON: ${err.message}\nRaw: ${raw}`);
    }
}
export class ADODiscussionCommunicationAdapter {
    org;
    project;
    channel = 'ado-work-items';
    constructor(org, project) {
        this.org = org;
        this.project = project;
    }
    get orgUrl() {
        return `https://dev.azure.com/${this.org}`;
    }
    async postUpdate(options) {
        const prefix = options.author ? `**${options.author}:** ` : '';
        const categoryTag = options.category ? ` [${options.category}]` : '';
        const fullTitle = `[Squad${categoryTag}] ${options.title}`;
        const comment = `${prefix}${options.body}`;
        // Create a work item to serve as the discussion thread
        const output = execFileSync('az', [
            'boards', 'work-item', 'create',
            '--type', 'Task',
            '--title', fullTitle,
            '--fields', `System.Tags=squad; squad:comms`,
            '--discussion', comment,
            '--org', this.orgUrl,
            '--project', this.project,
            '--output', 'json',
        ], EXEC_OPTS);
        const wi = parseJson(output);
        return {
            id: String(wi.id),
            url: wi._links?.html?.href ?? wi.url,
        };
    }
    async pollForReplies(options) {
        // Read work item comments (discussion history)
        const output = execFileSync('az', [
            'boards', 'work-item', 'show',
            '--id', options.threadId,
            '--org', this.orgUrl,
            '--project', this.project,
            '--expand', 'all',
            '--output', 'json',
        ], EXEC_OPTS);
        const wi = parseJson(output);
        // ADO work item show doesn't include comments directly in basic output.
        // The discussion is in the System.History field as HTML.
        // For a production adapter, use the REST API for comments.
        // This is a simplified implementation.
        const history = wi.fields['System.History'];
        if (!history)
            return [];
        return [{
                author: 'ado-user',
                body: history,
                timestamp: new Date(),
                id: `${options.threadId}-history`,
            }];
    }
    getNotificationUrl(threadId) {
        return `${this.orgUrl}/${this.project}/_workitems/edit/${threadId}`;
    }
}
//# sourceMappingURL=comms-ado-discussions.js.map