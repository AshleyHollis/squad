/**
 * Squad upgrade command — overwrites squad-owned files, runs migrations
 * Zero-dep implementation using Node.js stdlib only
 * @module cli/core/upgrade
 */
export interface UpgradeOptions {
    migrateDirectory?: boolean;
    self?: boolean;
}
export interface UpdateInfo {
    fromVersion: string;
    toVersion: string;
    filesUpdated: string[];
    migrationsRun: string[];
}
/**
 * Run the upgrade command
 */
export declare function runUpgrade(dest: string, options?: UpgradeOptions): Promise<UpdateInfo>;
//# sourceMappingURL=upgrade.d.ts.map