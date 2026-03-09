/**
 * Consult mode SDK — setup, extraction, license detection, learning classification.
 *
 * This module provides the complete SDK surface for consult mode:
 *
 * High-level operations (mirror CLI commands):
 * - setupConsultMode(): Initialize consult mode in a project
 * - extractLearnings(): Extract learnings from a consult session
 *
 * Low-level utilities (used by high-level operations):
 * - detectLicense(): Identify project license type (permissive/copyleft/unknown)
 * - logConsultation(): Write/append consultation log entries
 * - mergeToPersonalSquad(): Merge generic learnings to personal squad
 *
 * @module sharing/consult
 */
import type { AgentHistory } from './history-split.js';
export type { AgentHistory, HistoryEntry } from './history-split.js';
/**
 * Thrown when setupConsultMode is called but no personal squad exists.
 * Consumers can catch this specifically to prompt users to run `squad init --global`.
 */
export declare class PersonalSquadNotFoundError extends Error {
    constructor();
}
/**
 * Error thrown when extraction is disabled for a consult session.
 * Consumers can catch this specifically to suggest using --force.
 */
export declare class ExtractionDisabledError extends Error {
    constructor();
}
/**
 * Options for setting up consult mode.
 */
export interface SetupConsultModeOptions {
    /** Project root directory (default: cwd) */
    projectRoot?: string;
    /** Path to personal squad root (auto-resolved if not provided) */
    personalSquadRoot?: string;
    /** If true, don't modify any files — just return what would happen */
    dryRun?: boolean;
    /** Override project name (default: basename of projectRoot). Useful for worktrees. */
    projectName?: string;
    /** If true, disable extraction back to personal squad (read-only consultation) */
    extractionDisabled?: boolean;
}
/**
 * Result of setupConsultMode().
 */
export interface SetupConsultModeResult {
    /** Path to project .squad/ directory */
    squadDir: string;
    /** Path to personal squad root */
    personalSquadRoot: string;
    /** Path to git exclude file */
    gitExclude: string;
    /** Project name (basename of project root) */
    projectName: string;
    /** Whether this was a dry run */
    dryRun: boolean;
    /** Path to created agent file (.github/agents/squad.agent.md) */
    agentFile: string;
    /** List of created file paths (relative to squadDir) */
    createdFiles: string[];
    /** Whether extraction is disabled for this consult session */
    extractionDisabled: boolean;
}
/**
 * Get the personal squad root path.
 * Returns {globalSquadPath}/.squad/
 */
export declare function getPersonalSquadRoot(): string;
/**
 * Resolve the git exclude path using git rev-parse (handles worktrees/submodules).
 *
 * @param cwd - Working directory inside the git repo
 * @throws Error if not a git repository
 */
export declare function resolveGitExcludePath(cwd: string): string;
/**
 * Set up consult mode in a project.
 *
 * Creates .squad/ with consult: true, pointing to your personal squad.
 * Creates .github/agents/squad.agent.md for `gh copilot --agent squad` support.
 * Both are hidden via .git/info/exclude (never committed).
 *
 * @param options - Setup options
 * @returns Setup result with paths and metadata
 * @throws Error if not a git repo, personal squad missing, or already squadified
 */
export declare function setupConsultMode(options?: SetupConsultModeOptions): Promise<SetupConsultModeResult>;
/**
 * Options for extracting learnings from a consult session.
 */
export interface ExtractLearningsOptions {
    /** Project root directory (default: cwd) */
    projectRoot?: string;
    /** Path to personal squad root (auto-resolved if not provided) */
    personalSquadRoot?: string;
    /** If true, don't modify files — just return staged learnings */
    dryRun?: boolean;
    /** If true, delete project .squad/ after extraction */
    clean?: boolean;
    /** If true, allow extraction from copyleft-licensed projects */
    acceptRisks?: boolean;
    /** Optional callback to select which learnings to extract (for interactive mode) */
    selectLearnings?: (learnings: StagedLearning[]) => Promise<StagedLearning[]>;
    /** Override project name (default: basename of projectRoot). Useful for worktrees. */
    projectName?: string;
    /** If true, override extractionDisabled setting in config */
    force?: boolean;
}
/**
 * Full result of extractLearnings().
 */
export interface ExtractLearningsResult extends ExtractionResult {
    /** Whether extraction was blocked by license */
    blocked: boolean;
    /** Number of decisions merged */
    decisionsMerged: number;
    /** Number of skills created (future) */
    skillsCreated: number;
    /** Path to consultation log file */
    consultationLogPath?: string;
    /** Whether project .squad/ was cleaned up */
    cleaned: boolean;
}
/**
 * Load session history from .squad/sessions/ directory.
 *
 * @param squadDir - Path to project .squad/ directory
 * @returns AgentHistory with entries from session files
 */
export declare function loadSessionHistory(squadDir: string): AgentHistory;
/**
 * Extract learnings from a consult mode session.
 *
 * Reads staged learnings from .squad/extract/ (classified by Scribe during session)
 * and optionally merges approved items to your personal squad.
 *
 * @param options - Extraction options
 * @returns Extraction result with learnings, merge stats, and paths
 * @throws Error if not in consult mode or license blocks extraction
 */
export declare function extractLearnings(options?: ExtractLearningsOptions): Promise<ExtractLearningsResult>;
/**
 * License classification result.
 */
export interface LicenseInfo {
    type: 'permissive' | 'copyleft' | 'unknown';
    spdxId?: string;
    name?: string;
    filePath?: string;
}
/**
 * Detect license type from LICENSE file content.
 *
 * @param licenseContent - Raw content of the LICENSE file
 * @returns License classification with type, optional SPDX ID, and name
 */
export declare function detectLicense(licenseContent: string): LicenseInfo;
/**
 * A learning staged by Scribe for extraction to personal squad.
 * Files in .squad/extract/ are markdown files with decision content.
 */
export interface StagedLearning {
    /** Filename (e.g., "use-zod-validation.md") */
    filename: string;
    /** Full path to the file */
    filepath: string;
    /** Content of the file */
    content: string;
}
/**
 * Load staged learnings from .squad/extract/ directory.
 * These are generic learnings that Scribe classified during the session.
 *
 * @param squadDir - Path to project .squad/ directory
 * @returns Array of staged learnings
 */
export declare function loadStagedLearnings(squadDir: string): StagedLearning[];
/**
 * Result of the extraction process.
 */
export interface ExtractionResult {
    /** Learnings extracted to personal squad */
    extracted: StagedLearning[];
    /** Learnings rejected by user */
    skipped: StagedLearning[];
    /** Project license info */
    license: LicenseInfo;
    /** Project name (for consultation log) */
    projectName: string;
    /** Extraction timestamp (ISO 8601) */
    timestamp: string;
    /** Whether --accept-risks was used */
    acceptedRisks: boolean;
    /** Repository URL (GitHub, etc.) */
    repoUrl?: string;
}
/**
 * Write or append a consultation log entry to the personal squad.
 *
 * Creates the consultations directory if it doesn't exist.
 * For new projects, creates a full header; for existing projects, appends session entry.
 *
 * @param personalSquadRoot - Path to personal squad root (e.g. ~/.config/squad/.squad)
 * @param result - Extraction result with learnings and metadata
 * @returns Path to the consultation log file
 */
export declare function logConsultation(personalSquadRoot: string, result: ExtractionResult): Promise<string>;
/**
 * Merge staged learnings into personal squad.
 *
 * Routes skills to ~/.squad/skills/{name}/SKILL.md
 * Routes decisions to ~/.squad/decisions.md (with smart merge)
 *
 * @param learnings - Staged learnings to merge
 * @param personalSquadRoot - Path to personal squad root
 */
export declare function mergeToPersonalSquad(learnings: StagedLearning[], personalSquadRoot: string): Promise<{
    decisions: number;
    skills: number;
}>;
//# sourceMappingURL=consult.d.ts.map