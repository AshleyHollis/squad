/**
 * Azure DevOps Work Item Discussion communication adapter.
 *
 * Posts updates as work item comments and reads replies via `az boards`.
 * Phone-capable via ADO mobile app.
 *
 * @module platform/comms-ado-discussions
 */
import type { CommunicationAdapter, CommunicationChannel, CommunicationReply } from './types.js';
export declare class ADODiscussionCommunicationAdapter implements CommunicationAdapter {
    private readonly org;
    private readonly project;
    readonly channel: CommunicationChannel;
    constructor(org: string, project: string);
    private get orgUrl();
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
//# sourceMappingURL=comms-ado-discussions.d.ts.map