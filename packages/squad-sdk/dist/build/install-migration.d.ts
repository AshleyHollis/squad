/**
 * M4-11: Migration for install path changes
 * Detects current install method and generates migration instructions.
 */
export type InstallMethod = 'npx-github' | 'npm-global' | 'npm-local' | 'unknown';
export interface MigrationStep {
    description: string;
    command?: string;
    manual?: boolean;
}
export interface MigrationPlan {
    from: InstallMethod;
    to: InstallMethod;
    steps: MigrationStep[];
}
/**
 * Detect the current install method based on environment heuristics.
 */
export declare function detectInstallMethod(): InstallMethod;
/**
 * Generate a migration plan between install methods.
 */
export declare function migrateInstallPath(from: InstallMethod, to: InstallMethod): MigrationPlan;
/**
 * Generate user-facing markdown migration instructions.
 */
export declare function generateMigrationInstructions(from: InstallMethod, to: InstallMethod): string;
//# sourceMappingURL=install-migration.d.ts.map