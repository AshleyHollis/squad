/**
 * Communication adapter factory — creates the right adapter based on config.
 *
 * Reads `.squad/config.json` for the `communications` section.
 * Falls back to FileLog (always available) if nothing is configured.
 *
 * @module platform/comms
 */
import type { CommunicationAdapter } from './types.js';
/**
 * Create a communication adapter based on config or auto-detection.
 *
 * Priority:
 * 1. Explicit config in `.squad/config.json` → `communications.channel`
 * 2. Auto-detect from platform: GitHub → GitHubDiscussions, ADO → ADOWorkItemDiscussions
 * 3. Fallback: FileLog (always works)
 */
export declare function createCommunicationAdapter(repoRoot: string): CommunicationAdapter;
//# sourceMappingURL=comms.d.ts.map