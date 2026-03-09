/**
 * Init command implementation — uses SDK
 * Scaffolds a new Squad project with templates, workflows, and directory structure
 */
/** True when animations should be suppressed (NO_COLOR, dumb term, non-TTY). */
export declare function isInitNoColor(): boolean;
/** Typewriter effect — falls back to instant print when animations disabled. */
export declare function typewrite(text: string, charMs?: number): Promise<void>;
/**
 * Options for the init command.
 */
export interface RunInitOptions {
    /** Project description prompt — stored for REPL auto-casting. */
    prompt?: string;
    /** If true, disable extraction from consult sessions (read-only consultations) */
    extractionDisabled?: boolean;
    /** If false, skip GitHub workflow installation (default: true) */
    includeWorkflows?: boolean;
    /** If true, generate squad.config.ts with SDK builder syntax (default: false) */
    sdk?: boolean;
}
/**
 * Main init command handler
 */
export declare function runInit(dest: string, options?: RunInitOptions): Promise<void>;
//# sourceMappingURL=init.d.ts.map