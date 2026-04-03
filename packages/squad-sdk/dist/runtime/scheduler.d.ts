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
export interface ScheduleManifest {
    version: number;
    schedules: ScheduleEntry[];
}
export interface ScheduleEntry {
    id: string;
    name: string;
    enabled: boolean;
    trigger: TriggerConfig;
    task: TaskConfig;
    providers: string[];
    retry?: RetryConfig;
}
export type TriggerConfig = CronTrigger | IntervalTrigger | EventTrigger | StartupTrigger;
export interface CronTrigger {
    type: 'cron';
    cron: string;
}
export interface IntervalTrigger {
    type: 'interval';
    intervalSeconds: number;
}
export interface EventTrigger {
    type: 'event';
    event: string;
}
export interface StartupTrigger {
    type: 'startup';
}
export interface TaskConfig {
    type: 'workflow' | 'script' | 'copilot' | 'webhook';
    ref: string;
    args?: Record<string, string>;
}
export interface RetryConfig {
    maxRetries: number;
    backoffSeconds: number;
}
export interface ScheduleState {
    /** Map of schedule id → last run info */
    runs: Record<string, RunRecord>;
}
export interface RunRecord {
    lastRun: string;
    nextDue?: string;
    status: 'success' | 'failure' | 'running';
    error?: string;
}
export interface TaskResult {
    success: boolean;
    output?: string;
    error?: string;
}
export interface ScheduleProvider {
    readonly name: string;
    execute(entry: ScheduleEntry): Promise<TaskResult>;
    /** Optional: generate platform-native config (e.g. GitHub Actions workflow) */
    generate?(manifest: ScheduleManifest, outDir: string): Promise<string[]>;
}
export declare class ScheduleValidationError extends Error {
    constructor(message: string);
}
/**
 * Validate a raw object against the ScheduleManifest schema.
 * Throws ScheduleValidationError on invalid input.
 */
export declare function validateManifest(data: unknown): ScheduleManifest;
/**
 * Parse and validate a schedule.json file from disk.
 */
export declare function parseSchedule(filePath: string): Promise<ScheduleManifest>;
/**
 * Evaluate which schedules are due now, based on trigger config and state.
 * Returns a list of entries that should be executed.
 */
export declare function evaluateSchedule(manifest: ScheduleManifest, state: ScheduleState, now?: Date): ScheduleEntry[];
/**
 * Minimal cron evaluation for 5-field cron expressions.
 * Supports: minute hour day-of-month month day-of-week
 * Wildcard (*) and specific values only (no ranges/lists for simplicity).
 */
export declare function isCronDue(cron: string, run: RunRecord | undefined, now: Date): boolean;
/**
 * Execute a scheduled task using the specified provider.
 * Includes retry logic if configured.
 */
export declare function executeTask(entry: ScheduleEntry, provider: ScheduleProvider): Promise<TaskResult>;
/**
 * Load schedule state from disk. Returns empty state if file doesn't exist.
 */
export declare function loadState(statePath: string): Promise<ScheduleState>;
/**
 * Save schedule state to disk.
 */
export declare function saveState(statePath: string, state: ScheduleState): Promise<void>;
/**
 * LocalPollingProvider — evaluates schedule in the ralph-watch loop.
 * Executes tasks as local processes or stubs.
 */
export declare class LocalPollingProvider implements ScheduleProvider {
    readonly name = "local-polling";
    execute(entry: ScheduleEntry): Promise<TaskResult>;
}
/**
 * GitHubActionsProvider — generates workflow YAML files from schedule manifest.
 */
export declare class GitHubActionsProvider implements ScheduleProvider {
    readonly name = "github-actions";
    execute(entry: ScheduleEntry): Promise<TaskResult>;
    generate(manifest: ScheduleManifest, outDir: string): Promise<string[]>;
}
/**
 * Default schedule.json template for `squad schedule init`.
 */
export declare function defaultScheduleTemplate(): ScheduleManifest;
//# sourceMappingURL=scheduler.d.ts.map