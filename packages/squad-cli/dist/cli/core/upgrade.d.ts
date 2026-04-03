/**
 * Squad upgrade command — overwrites squad-owned files, runs migrations
 * Zero-dep implementation using Node.js stdlib only
 * @module cli/core/upgrade
 */
export interface UpgradeOptions {
    migrateDirectory?: boolean;
    self?: boolean;
    force?: boolean;
}
export interface UpdateInfo {
    fromVersion: string;
    toVersion: string;
    filesUpdated: string[];
    migrationsRun: string[];
}
/**
 * Ensure .gitattributes has required merge=union rules (idempotent)
 */
export declare function ensureGitattributes(dest: string): string[];
/**
 * Ensure .gitignore has required entries (idempotent).
 * Skips entries already covered by a parent path (e.g. `.squad/` covers `.squad/log/`).
 */
export declare function ensureGitignore(dest: string): string[];
/**
 * Create missing infrastructure directories
 */
export declare function ensureDirectories(dest: string): string[];
/**
 * Run the upgrade command
 */
export declare function runUpgrade(dest: string, options?: UpgradeOptions): Promise<UpdateInfo>;
//# sourceMappingURL=upgrade.d.ts.map