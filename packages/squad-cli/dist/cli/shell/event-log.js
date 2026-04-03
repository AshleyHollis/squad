/**
 * Persistent event log — appends structured events to `.squad/log/squad-events.jsonl`.
 *
 * Survives session restarts. Used by `/logs` to show what happened in prior sessions.
 * All writes are non-fatal — logging must never crash the main flow.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
/** Append a single event to `.squad/log/squad-events.jsonl`. */
export function writeEventLog(teamRoot, event) {
    try {
        const logDir = join(teamRoot, '.squad', 'log');
        mkdirSync(logDir, { recursive: true });
        appendFileSync(join(logDir, 'squad-events.jsonl'), JSON.stringify(event) + '\n', 'utf-8');
    }
    catch {
        // Non-fatal — logging must never break the main flow
    }
}
/** Read the last `limit` events from `.squad/log/squad-events.jsonl`. */
export function readRecentEvents(teamRoot, limit = 20) {
    try {
        const logPath = join(teamRoot, '.squad', 'log', 'squad-events.jsonl');
        if (!existsSync(logPath))
            return [];
        const lines = readFileSync(logPath, 'utf-8').trim().split('\n').filter(Boolean);
        return lines
            .slice(-limit)
            .map(l => { try {
            return JSON.parse(l);
        }
        catch {
            return null;
        } })
            .filter((e) => e !== null);
    }
    catch {
        return [];
    }
}
//# sourceMappingURL=event-log.js.map