/**
 * Scheduler — Generic, provider-agnostic scheduler for Squad (#296)
 *
 * Unified schedule manifest + provider adapters that replace scattered
 * cron jobs, polling scripts, and manual triggers with a single
 * `.squad/schedule.json` configuration file.
 *
 * Provider model:
 *   - LocalPollingProvider  — evaluates schedule in ralph-watch loop
 *   - GitHubActionsProvider — generates/updates workflow files from schedule
 *   - Custom providers via ScheduleProvider interface
 */
import { readFile, writeFile } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
// ============================================================================
// Validation
// ============================================================================
export class ScheduleValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ScheduleValidationError';
    }
}
const VALID_TRIGGER_TYPES = ['cron', 'interval', 'event', 'startup'];
const VALID_TASK_TYPES = ['workflow', 'script', 'copilot', 'webhook'];
/**
 * Validate a raw object against the ScheduleManifest schema.
 * Throws ScheduleValidationError on invalid input.
 */
export function validateManifest(data) {
    if (data === null || typeof data !== 'object') {
        throw new ScheduleValidationError('Schedule manifest must be a JSON object');
    }
    const obj = data;
    if (typeof obj.version !== 'number' || obj.version < 1) {
        throw new ScheduleValidationError('Schedule manifest requires a positive integer "version" field');
    }
    if (!Array.isArray(obj.schedules)) {
        throw new ScheduleValidationError('Schedule manifest requires a "schedules" array');
    }
    const seenIds = new Set();
    for (let i = 0; i < obj.schedules.length; i++) {
        const entry = obj.schedules[i];
        validateEntry(entry, i, seenIds);
    }
    return data;
}
function validateEntry(entry, index, seenIds) {
    if (entry === null || typeof entry !== 'object') {
        throw new ScheduleValidationError(`schedules[${index}] must be an object`);
    }
    const e = entry;
    const prefix = `schedules[${index}]`;
    if (typeof e.id !== 'string' || e.id.length === 0) {
        throw new ScheduleValidationError(`${prefix}.id must be a non-empty string`);
    }
    if (seenIds.has(e.id)) {
        throw new ScheduleValidationError(`Duplicate schedule id: "${e.id}"`);
    }
    seenIds.add(e.id);
    if (typeof e.name !== 'string' || e.name.length === 0) {
        throw new ScheduleValidationError(`${prefix}.name must be a non-empty string`);
    }
    if (typeof e.enabled !== 'boolean') {
        throw new ScheduleValidationError(`${prefix}.enabled must be a boolean`);
    }
    // Trigger validation
    if (e.trigger === null || typeof e.trigger !== 'object') {
        throw new ScheduleValidationError(`${prefix}.trigger must be an object`);
    }
    const trigger = e.trigger;
    if (!VALID_TRIGGER_TYPES.includes(trigger.type)) {
        throw new ScheduleValidationError(`${prefix}.trigger.type must be one of: ${VALID_TRIGGER_TYPES.join(', ')}`);
    }
    if (trigger.type === 'cron' && (typeof trigger.cron !== 'string' || trigger.cron.length === 0)) {
        throw new ScheduleValidationError(`${prefix}.trigger.cron must be a non-empty string`);
    }
    if (trigger.type === 'interval') {
        if (typeof trigger.intervalSeconds !== 'number' || trigger.intervalSeconds <= 0) {
            throw new ScheduleValidationError(`${prefix}.trigger.intervalSeconds must be a positive number`);
        }
    }
    if (trigger.type === 'event' && (typeof trigger.event !== 'string' || trigger.event.length === 0)) {
        throw new ScheduleValidationError(`${prefix}.trigger.event must be a non-empty string`);
    }
    // Task validation
    if (e.task === null || typeof e.task !== 'object') {
        throw new ScheduleValidationError(`${prefix}.task must be an object`);
    }
    const task = e.task;
    if (!VALID_TASK_TYPES.includes(task.type)) {
        throw new ScheduleValidationError(`${prefix}.task.type must be one of: ${VALID_TASK_TYPES.join(', ')}`);
    }
    if (typeof task.ref !== 'string' || task.ref.length === 0) {
        throw new ScheduleValidationError(`${prefix}.task.ref must be a non-empty string`);
    }
    // Providers validation
    if (!Array.isArray(e.providers) || e.providers.length === 0) {
        throw new ScheduleValidationError(`${prefix}.providers must be a non-empty array of strings`);
    }
    for (const p of e.providers) {
        if (typeof p !== 'string' || p.length === 0) {
            throw new ScheduleValidationError(`${prefix}.providers must contain only non-empty strings`);
        }
    }
    // Optional retry validation
    if (e.retry !== undefined) {
        if (e.retry === null || typeof e.retry !== 'object') {
            throw new ScheduleValidationError(`${prefix}.retry must be an object`);
        }
        const retry = e.retry;
        if (typeof retry.maxRetries !== 'number' || retry.maxRetries < 0) {
            throw new ScheduleValidationError(`${prefix}.retry.maxRetries must be a non-negative number`);
        }
        if (typeof retry.backoffSeconds !== 'number' || retry.backoffSeconds <= 0) {
            throw new ScheduleValidationError(`${prefix}.retry.backoffSeconds must be a positive number`);
        }
    }
}
// ============================================================================
// Schedule Operations
// ============================================================================
/**
 * Parse and validate a schedule.json file from disk.
 */
export async function parseSchedule(filePath) {
    let raw;
    try {
        raw = await readFile(filePath, 'utf8');
    }
    catch (err) {
        throw new ScheduleValidationError(`Cannot read schedule file: ${filePath} — ${err.message}`);
    }
    let data;
    try {
        data = JSON.parse(raw);
    }
    catch {
        throw new ScheduleValidationError(`Invalid JSON in schedule file: ${filePath}`);
    }
    return validateManifest(data);
}
/**
 * Evaluate which schedules are due now, based on trigger config and state.
 * Returns a list of entries that should be executed.
 */
export function evaluateSchedule(manifest, state, now = new Date()) {
    const due = [];
    for (const entry of manifest.schedules) {
        if (!entry.enabled)
            continue;
        const run = state.runs[entry.id];
        if (run?.status === 'running')
            continue;
        if (isDue(entry.trigger, run, now)) {
            due.push(entry);
        }
    }
    return due;
}
function isDue(trigger, run, now) {
    switch (trigger.type) {
        case 'startup':
            // Due if never run
            return run === undefined;
        case 'interval': {
            if (!run)
                return true;
            const lastRun = new Date(run.lastRun);
            const elapsed = (now.getTime() - lastRun.getTime()) / 1000;
            return elapsed >= trigger.intervalSeconds;
        }
        case 'cron':
            return isCronDue(trigger.cron, run, now);
        case 'event':
            // Event triggers are fired externally, not by polling
            return false;
        default:
            return false;
    }
}
/**
 * Minimal cron evaluation for 5-field cron expressions.
 * Supports: minute hour day-of-month month day-of-week
 * Wildcard (*) and specific values only (no ranges/lists for simplicity).
 */
export function isCronDue(cron, run, now) {
    const parts = cron.trim().split(/\s+/);
    if (parts.length !== 5)
        return false;
    const [minField, hourField, domField, monthField, dowField] = parts;
    const minute = now.getMinutes();
    const hour = now.getHours();
    const dom = now.getDate();
    const month = now.getMonth() + 1; // 1-12
    const dow = now.getDay(); // 0-6 (Sun-Sat)
    if (!cronFieldMatches(minField, minute))
        return false;
    if (!cronFieldMatches(hourField, hour))
        return false;
    if (!cronFieldMatches(domField, dom))
        return false;
    if (!cronFieldMatches(monthField, month))
        return false;
    if (!cronFieldMatches(dowField, dow))
        return false;
    // Don't run again within the same minute
    if (run) {
        const lastRun = new Date(run.lastRun);
        if (lastRun.getFullYear() === now.getFullYear() &&
            lastRun.getMonth() === now.getMonth() &&
            lastRun.getDate() === now.getDate() &&
            lastRun.getHours() === now.getHours() &&
            lastRun.getMinutes() === now.getMinutes()) {
            return false;
        }
    }
    return true;
}
function cronFieldMatches(field, value) {
    if (field === '*')
        return true;
    // Support */N step syntax
    if (field.startsWith('*/')) {
        const step = parseInt(field.slice(2), 10);
        if (isNaN(step) || step <= 0)
            return false;
        return value % step === 0;
    }
    // Support comma-separated values
    const values = field.split(',').map(v => parseInt(v, 10));
    return values.includes(value);
}
// ============================================================================
// Task Execution
// ============================================================================
/**
 * Execute a scheduled task using the specified provider.
 * Includes retry logic if configured.
 */
export async function executeTask(entry, provider) {
    const maxRetries = entry.retry?.maxRetries ?? 0;
    const backoffSeconds = entry.retry?.backoffSeconds ?? 1;
    let lastResult = { success: false, error: 'No attempt made' };
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
            const delay = backoffSeconds * Math.pow(2, attempt - 1) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        try {
            lastResult = await provider.execute(entry);
            if (lastResult.success)
                return lastResult;
        }
        catch (err) {
            lastResult = { success: false, error: err.message };
        }
    }
    return lastResult;
}
// ============================================================================
// State Persistence
// ============================================================================
/**
 * Load schedule state from disk. Returns empty state if file doesn't exist.
 */
export async function loadState(statePath) {
    try {
        const raw = await readFile(statePath, 'utf8');
        return JSON.parse(raw);
    }
    catch {
        return { runs: {} };
    }
}
/**
 * Save schedule state to disk.
 */
export async function saveState(statePath, state) {
    await writeFile(statePath, JSON.stringify(state, null, 2) + '\n', 'utf8');
}
// ============================================================================
// Built-in Providers
// ============================================================================
/**
 * LocalPollingProvider — evaluates schedule in the ralph-watch loop.
 * Executes tasks as local processes or stubs.
 */
export class LocalPollingProvider {
    name = 'local-polling';
    async execute(entry) {
        switch (entry.task.type) {
            case 'script': {
                try {
                    const { execSync } = await import('node:child_process');
                    const output = execSync(entry.task.ref, {
                        encoding: 'utf8',
                        timeout: 60_000,
                    });
                    return { success: true, output: output.trim() };
                }
                catch (err) {
                    return { success: false, error: err.message };
                }
            }
            case 'workflow':
                return {
                    success: true,
                    output: `Workflow ${entry.task.ref} triggered (local stub — use github-actions provider for real dispatch)`,
                };
            case 'copilot':
                return {
                    success: true,
                    output: `Copilot task ${entry.task.ref} dispatched (stub)`,
                };
            case 'webhook': {
                try {
                    const resp = await fetch(entry.task.ref, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ scheduleId: entry.id, timestamp: new Date().toISOString() }),
                    });
                    return {
                        success: resp.ok,
                        output: `HTTP ${resp.status} ${resp.statusText}`,
                        error: resp.ok ? undefined : `HTTP ${resp.status}`,
                    };
                }
                catch (err) {
                    return { success: false, error: err.message };
                }
            }
            default:
                return { success: false, error: `Unknown task type: ${entry.task.type}` };
        }
    }
}
/**
 * GitHubActionsProvider — generates workflow YAML files from schedule manifest.
 */
export class GitHubActionsProvider {
    name = 'github-actions';
    async execute(entry) {
        // GitHub Actions execution is handled by the platform itself.
        // This provider's main value is generate(), not execute().
        return {
            success: true,
            output: `GitHub Actions handles execution of ${entry.task.ref} natively`,
        };
    }
    async generate(manifest, outDir) {
        const generated = [];
        for (const entry of manifest.schedules) {
            if (!entry.enabled)
                continue;
            if (!entry.providers.includes('github-actions'))
                continue;
            if (entry.trigger.type !== 'cron' && entry.trigger.type !== 'interval')
                continue;
            const cronExpr = entry.trigger.type === 'cron'
                ? entry.trigger.cron
                : intervalToCron(entry.trigger.intervalSeconds);
            const workflowName = `squad-schedule-${entry.id}.yml`;
            const workflowPath = path.join(outDir, workflowName);
            const yaml = [
                `# Auto-generated by Squad Scheduler from schedule.json`,
                `# Schedule: ${entry.name} (${entry.id})`,
                `name: "Squad: ${entry.name}"`,
                ``,
                `on:`,
                `  schedule:`,
                `    - cron: '${cronExpr}'`,
                `  workflow_dispatch: {}`,
                ``,
                `jobs:`,
                `  run:`,
                `    runs-on: ubuntu-latest`,
                `    steps:`,
                `      - uses: actions/checkout@v4`,
                `      - name: Run scheduled task`,
                `        run: echo "Executing ${entry.id} — ${entry.task.type}:${entry.task.ref}"`,
            ].join('\n') + '\n';
            const dir = path.dirname(workflowPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(workflowPath, yaml, 'utf8');
            generated.push(workflowPath);
        }
        return generated;
    }
}
/**
 * Convert an interval in seconds to the nearest cron expression.
 */
function intervalToCron(seconds) {
    const minutes = Math.max(1, Math.round(seconds / 60));
    if (minutes < 60)
        return `*/${minutes} * * * *`;
    const hours = Math.round(minutes / 60);
    if (hours < 24)
        return `0 */${hours} * * *`;
    return '0 0 * * *'; // daily fallback
}
// ============================================================================
// Default Template
// ============================================================================
/**
 * Default schedule.json template for `squad schedule init`.
 */
export function defaultScheduleTemplate() {
    return {
        version: 1,
        schedules: [
            {
                id: 'ralph-heartbeat',
                name: 'Ralph Heartbeat',
                enabled: true,
                trigger: { type: 'interval', intervalSeconds: 300 },
                task: { type: 'workflow', ref: '.github/workflows/squad-heartbeat.yml' },
                providers: ['local-polling', 'github-actions'],
            },
        ],
    };
}
//# sourceMappingURL=scheduler.js.map