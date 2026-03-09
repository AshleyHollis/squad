/**
 * File-based communication adapter — zero-config fallback.
 *
 * Writes updates to `.squad/comms/` as markdown files.
 * Always available, no external dependencies. Works on every platform.
 * Replies are read from the same directory (humans edit files manually or via git).
 *
 * @module platform/comms-file-log
 */
import type { CommunicationAdapter, CommunicationChannel, CommunicationReply } from './types.js';
export declare class FileLogCommunicationAdapter implements CommunicationAdapter {
    private readonly squadRoot;
    readonly channel: CommunicationChannel;
    private readonly commsDir;
    constructor(squadRoot: string);
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
    getNotificationUrl(_threadId: string): string | undefined;
}
//# sourceMappingURL=comms-file-log.d.ts.map