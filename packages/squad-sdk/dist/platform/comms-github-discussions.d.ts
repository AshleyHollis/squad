/**
 * GitHub Discussions communication adapter.
 *
 * Posts updates and reads replies via GitHub Discussions using `gh api`.
 * Phone-capable (browser-based), not corp-only.
 *
 * @module platform/comms-github-discussions
 */
import type { CommunicationAdapter, CommunicationChannel, CommunicationReply } from './types.js';
export declare class GitHubDiscussionsCommunicationAdapter implements CommunicationAdapter {
    private readonly owner;
    private readonly repo;
    readonly channel: CommunicationChannel;
    constructor(owner: string, repo: string);
    postUpdate(options: {
        title: string;
        body: string;
        category?: string;
        author?: string;
    }): Promise<{
        id: string;
        url?: string;
    }>;
    pollForReplies(options: {
        threadId: string;
        since: Date;
    }): Promise<CommunicationReply[]>;
    getNotificationUrl(threadId: string): string | undefined;
}
//# sourceMappingURL=comms-github-discussions.d.ts.map