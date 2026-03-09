/**
 * File-based communication adapter — zero-config fallback.
 *
 * Writes updates to `.squad/comms/` as markdown files.
 * Always available, no external dependencies. Works on every platform.
 * Replies are read from the same directory (humans edit files manually or via git).
 *
 * @module platform/comms-file-log
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
export class FileLogCommunicationAdapter {
    squadRoot;
    channel = 'file-log';
    commsDir;
    constructor(squadRoot) {
        this.squadRoot = squadRoot;
        this.commsDir = join(squadRoot, '.squad', 'comms');
        if (!existsSync(this.commsDir)) {
            mkdirSync(this.commsDir, { recursive: true });
        }
    }
    async postUpdate(options) {
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\.\d+Z$/, 'Z');
        const slug = options.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
        const filename = `${timestamp}-${slug}.md`;
        const filepath = join(this.commsDir, filename);
        const content = [
            `# ${options.title}`,
            '',
            `**Posted by:** ${options.author ?? 'Squad'}`,
            `**Category:** ${options.category ?? 'update'}`,
            `**Timestamp:** ${new Date().toISOString()}`,
            '',
            '---',
            '',
            options.body,
            '',
            '---',
            '',
            '<!-- Replies: add your response below this line -->',
            '',
        ].join('\n');
        writeFileSync(filepath, content, 'utf-8');
        return { id: filename.replace(/\.md$/, ''), url: undefined };
    }
    async pollForReplies(options) {
        const filepath = join(this.commsDir, `${options.threadId}.md`);
        if (!existsSync(filepath))
            return [];
        const content = readFileSync(filepath, 'utf-8');
        const replyMarker = '<!-- Replies: add your response below this line -->';
        const markerIdx = content.indexOf(replyMarker);
        if (markerIdx === -1)
            return [];
        const repliesSection = content.slice(markerIdx + replyMarker.length).trim();
        if (!repliesSection)
            return [];
        // Parse simple reply format: lines after the marker are replies
        return [{
                author: 'human',
                body: repliesSection,
                timestamp: new Date(),
                id: `${options.threadId}-reply`,
            }];
    }
    getNotificationUrl(_threadId) {
        return undefined; // File-based has no web UI
    }
}
//# sourceMappingURL=comms-file-log.js.map