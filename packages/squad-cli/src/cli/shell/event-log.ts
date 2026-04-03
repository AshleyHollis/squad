/**
 * Persistent event log — appends structured events to `.squad/log/squad-events.jsonl`.
 *
 * Survives session restarts. Used by `/logs` to show what happened in prior sessions.
 * All writes are non-fatal — logging must never crash the main flow.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type SquadEventType =
  | 'coordinator_routed'    // coordinator decided ROUTE: or MULTI: → agent dispatched
  | 'coordinator_direct'    // coordinator responded DIRECT: (intentional, no routing needed)
  | 'coordinator_fallback'  // coordinator response didn't match expected format — no agent spawned
  | 'agent_spawn_start'     // agent spawn beginning
  | 'agent_spawn_complete'  // agent spawn succeeded
  | 'agent_spawn_error'     // agent spawn failed
  | 'agent_spawn_stub';     // spawnAgent called without a client — returned stub immediately

export interface SquadEvent {
  ts: string;
  type: SquadEventType;
  /** Agent name (lowercase) */
  agent?: string;
  /** First 200 chars of the task */
  task?: string;
  /** Duration in ms (spawn complete/error only) */
  durationMs?: number;
  /** Error message (spawn error only) */
  error?: string;
  /**
   * First 500 chars of the raw coordinator response.
   * Only present on coordinator_fallback so you can see what the LLM said vs. what was expected.
   */
  raw?: string;
}

/** Append a single event to `.squad/log/squad-events.jsonl`. */
export function writeEventLog(teamRoot: string, event: SquadEvent): void {
  try {
    const logDir = join(teamRoot, '.squad', 'log');
    mkdirSync(logDir, { recursive: true });
    appendFileSync(join(logDir, 'squad-events.jsonl'), JSON.stringify(event) + '\n', 'utf-8');
  } catch {
    // Non-fatal — logging must never break the main flow
  }
}

/** Read the last `limit` events from `.squad/log/squad-events.jsonl`. */
export function readRecentEvents(teamRoot: string, limit = 20): SquadEvent[] {
  try {
    const logPath = join(teamRoot, '.squad', 'log', 'squad-events.jsonl');
    if (!existsSync(logPath)) return [];
    const lines = readFileSync(logPath, 'utf-8').trim().split('\n').filter(Boolean);
    return lines
      .slice(-limit)
      .map(l => { try { return JSON.parse(l) as SquadEvent; } catch { return null; } })
      .filter((e): e is SquadEvent => e !== null);
  } catch {
    return [];
  }
}
