/**
 * Squad directory resolution — walk-up and global path algorithms.
 *
 * resolveSquad()            — find .squad/ by walking up from startDir to .git boundary
 * resolveSquadPaths()       — dual-root resolution (projectDir / teamDir) for remote squad mode
 * resolveGlobalSquadPath()  — platform-specific global config directory
 *
 * Dual-root resolution and remote mode design ported from @spboyer (Shayne Boyer)'s
 * PR bradygaster/squad#131. Original concept: resolveSquadPaths() with config.json
 * pointer for team identity separation.
 *
 * @module resolution
 */
/**
 * Schema for `.squad/config.json` — controls remote squad mode.
 * Named SquadDirConfig to avoid collision with the runtime SquadConfig.
 */
export interface SquadDirConfig {
    version: number;
    teamRoot: string;
    projectKey: string | null;
    /** True when in consult mode (personal squad consulting on external project) */
    consult?: boolean;
    /** True when extraction is disabled for consult sessions (read-only consultation) */
    extractionDisabled?: boolean;
}
/**
 * Resolved paths for dual-root squad mode.
 *
 * In **local** mode, projectDir and teamDir point to the same `.squad/` directory.
 * In **remote** mode, config.json specifies a `teamRoot` that resolves to a
 * separate directory for team identity (agents, casting, skills).
 */
export interface ResolvedSquadPaths {
    mode: 'local' | 'remote';
    /** Project-local .squad/ (decisions, logs) */
    projectDir: string;
    /** Team identity root (agents, casting, skills) */
    teamDir: string;
    /** User's personal squad dir, null if not found or disabled */
    personalDir: string | null;
    config: SquadDirConfig | null;
    name: '.squad' | '.ai-team';
    isLegacy: boolean;
}
/**
 * Walk up the directory tree from `startDir` looking for a `.squad/` directory.
 *
 * Stops at the repository root (the directory containing `.git` as a directory).
 * When `.git` is a **file** (git worktree), falls back to the main checkout strategy:
 * reads the `gitdir:` pointer, resolves the main checkout path, and checks there.
 * Returns the **absolute path** to the `.squad/` directory, or `null` if none is found.
 *
 * Resolution order (worktree-local strategy first, main-checkout strategy second):
 * 1. Walk up from `startDir` checking for `.squad/` — stops at `.git` directory boundary
 * 2. If `.git` is a file (worktree), check the main checkout for `.squad/`
 *
 * @param startDir - Directory to start searching from. Defaults to `process.cwd()`.
 * @returns Absolute path to `.squad/` or `null`.
 */
export declare function resolveSquad(startDir?: string): string | null;
/**
 * Try to read and parse `.squad/config.json` (or `.ai-team/config.json`).
 * Returns null for missing file, unreadable file, or malformed JSON.
 */
export declare function loadDirConfig(squadDir: string): SquadDirConfig | null;
/**
 * Check if a config represents consult mode (personal squad consulting on external project).
 */
export declare function isConsultMode(config: SquadDirConfig | null): boolean;
/**
 * Resolve dual-root squad paths (projectDir / teamDir).
 *
 * - Walks up from `startDir` looking for `.squad/` (or `.ai-team/` for legacy repos).
 * - If `.squad/config.json` exists with a valid `teamRoot` → **remote** mode:
 *   teamDir is resolved relative to the **project root** (parent of .squad/).
 * - Otherwise → **local** mode: projectDir === teamDir.
 *
 * @param startDir - Directory to start searching from. Defaults to `process.cwd()`.
 * @returns Resolved paths, or `null` if no squad directory is found.
 */
export declare function resolveSquadPaths(startDir?: string): ResolvedSquadPaths | null;
/**
 * Return the platform-specific global Squad configuration directory.
 *
 * | Platform | Path                                       |
 * |----------|--------------------------------------------|
 * | Windows  | `%APPDATA%/squad/`                         |
 * | macOS    | `~/Library/Application Support/squad/`      |
 * | Linux    | `$XDG_CONFIG_HOME/squad/` (default `~/.config/squad/`) |
 *
 * The directory is created (recursively) if it does not already exist.
 *
 * @returns Absolute path to the global squad config directory.
 */
export declare function resolveGlobalSquadPath(): string;
/**
 * Resolves the user's personal squad directory.
 * Returns null if SQUAD_NO_PERSONAL is set or directory doesn't exist.
 *
 * Platform paths:
 * - Windows: %APPDATA%/squad/personal-squad
 * - macOS: ~/Library/Application Support/squad/personal-squad
 * - Linux: $XDG_CONFIG_HOME/squad/personal-squad or ~/.config/squad/personal-squad
 */
export declare function resolvePersonalSquadDir(): string | null;
/**
 * Ensure the user's personal squad directory exists with the expected structure.
 * Creates `personal-squad/agents/` and `personal-squad/config.json` if missing.
 *
 * Idempotent — safe to call multiple times.
 *
 * @returns Absolute path to the personal squad directory.
 */
export declare function ensurePersonalSquadDir(): string;
/**
 * Validate that a file path is within `.squad/` or the system temp directory.
 *
 * Use this guard before writing any scratch/temp/state files to ensure Squad
 * never clutters the repo root or arbitrary filesystem locations.
 *
 * @param filePath  - Absolute path to validate.
 * @param squadRoot - Absolute path to the `.squad/` directory (e.g. from `resolveSquad()`).
 * @returns The resolved absolute `filePath` if it is safe.
 * @throws If `filePath` is outside `.squad/` and not in the system temp directory.
 */
export declare function ensureSquadPath(filePath: string, squadRoot: string): string;
/**
 * Validate that a file path is within either the projectDir or teamDir
 * (or the system temp directory). For use in dual-root / remote mode.
 *
 * @param filePath - Absolute path to validate.
 * @param projectDir - Absolute path to the project-local .squad/ directory.
 * @param teamDir - Absolute path to the team identity directory.
 * @returns The resolved absolute filePath if it is safe.
 * @throws If filePath is outside both roots and not in the system temp directory.
 */
export declare function ensureSquadPathDual(filePath: string, projectDir: string, teamDir: string): string;
/**
 * Validates a file path is inside one of three allowed directories:
 * projectDir, teamDir, personalDir, or system temp.
 * Extends ensureSquadPathDual() for triple-root (project + team + personal).
 */
export declare function ensureSquadPathTriple(filePath: string, projectDir: string, teamDir: string, personalDir: string | null): string;
/**
 * ensureSquadPath that works with resolved dual-root paths.
 * Convenience wrapper around ensureSquadPathDual.
 */
export declare function ensureSquadPathResolved(filePath: string, paths: ResolvedSquadPaths): string;
//# sourceMappingURL=resolution.d.ts.map