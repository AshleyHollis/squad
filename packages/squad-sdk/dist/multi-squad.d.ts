/**
 * Multi-squad resolution, configuration, and migration.
 *
 * Supports multiple personal squads via a global config directory:
 *   - Windows: %APPDATA%/squad/
 *   - macOS:   ~/Library/Application Support/squad/
 *   - Linux:   $XDG_CONFIG_HOME/squad/ (default ~/.config/squad/)
 *
 * Each squad is registered in squads.json and has its own directory
 * under squads/{name}/ in the global config root.
 *
 * Resolution chain for resolveSquadPath():
 *   explicit name → SQUAD_NAME env var → active in squads.json → "default" → legacy fallback
 *
 * @module multi-squad
 */
/** A single squad entry in squads.json. */
export interface SquadEntry {
    /** Human-readable squad name (kebab-case recommended). */
    name: string;
    /** Absolute path to the squad's .squad/ state directory. */
    path: string;
    /** ISO-8601 timestamp when this squad was created. */
    created_at: string;
}
/** Schema for the global squads.json config file. */
export interface MultiSquadConfig {
    /** All registered squads. */
    squads: SquadEntry[];
    /** Name of the currently active squad. */
    active: string;
}
/** Information returned by listSquads(). */
export interface SquadInfo {
    name: string;
    path: string;
    active: boolean;
}
/**
 * Returns the platform-appropriate global config directory for squads.
 * Delegates to resolveGlobalSquadPath() which handles Windows/macOS/Linux.
 */
export declare function getSquadRoot(): string;
/**
 * Resolve the filesystem path for a named squad's state directory.
 *
 * Resolution chain:
 *  1. Explicit `name` parameter
 *  2. SQUAD_NAME environment variable
 *  3. `active` field in squads.json
 *  4. "default"
 *  5. Legacy ~/.squad fallback (if no squads.json exists)
 *
 * Triggers auto-migration on first call if a legacy layout is detected.
 */
export declare function resolveSquadPath(name?: string): string;
/**
 * List all registered squads with their active status.
 */
export declare function listSquads(): SquadInfo[];
/**
 * Create a new squad directory and register it in squads.json.
 * Returns the absolute path to the new squad's state directory.
 *
 * @throws If a squad with the given name already exists.
 */
export declare function createSquad(name: string): string;
/**
 * Delete a squad by name. Removes its directory and unregisters it.
 *
 * @throws If the squad is the currently active one, or if it doesn't exist.
 */
export declare function deleteSquad(name: string): void;
/**
 * Set the active squad in squads.json.
 *
 * @throws If the named squad is not registered.
 */
export declare function switchSquad(name: string): void;
/**
 * Detect legacy ~/.squad layout and register it as "default" in squads.json.
 *
 * Migration is **non-destructive**: files are NOT moved. The existing path
 * is simply registered in squads.json so the new resolution chain finds it.
 *
 * @returns `true` if migration was performed, `false` if not needed.
 */
export declare function migrateIfNeeded(): boolean;
//# sourceMappingURL=multi-squad.d.ts.map