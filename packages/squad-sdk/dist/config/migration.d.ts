/**
 * Migration Registry
 *
 * Provides versioned configuration upgrades with forward and rollback support.
 * Versions follow semver-like major.minor.patch ordering.
 *
 * @module config/migration
 */
/**
 * Parsed semver version.
 */
export interface SemVer {
    major: number;
    minor: number;
    patch: number;
    raw: string;
}
/**
 * A single migration step between two versions.
 */
export interface Migration {
    /** Version to migrate from */
    fromVersion: string;
    /** Version to migrate to */
    toVersion: string;
    /** Forward migration function */
    migrate(config: Record<string, unknown>): Record<string, unknown>;
    /** Optional reverse migration function */
    rollback?(config: Record<string, unknown>): Record<string, unknown>;
    /** Human-readable description */
    description?: string;
}
/**
 * Result of running a migration chain.
 */
export interface MigrationResult {
    /** Final config after migrations */
    config: Record<string, unknown>;
    /** Starting version */
    fromVersion: string;
    /** Ending version */
    toVersion: string;
    /** Migrations that were applied (in order) */
    applied: Migration[];
    /** Whether rollback was used (reverse direction) */
    rolledBack: boolean;
}
/**
 * Parses a semver string into its components.
 *
 * @param version - Version string (e.g. "1.2.3")
 * @returns Parsed SemVer object
 * @throws If the version string is invalid
 */
export declare function parseSemVer(version: string): SemVer;
/**
 * Compares two semver versions.
 *
 * @returns negative if a < b, 0 if equal, positive if a > b
 */
export declare function compareSemVer(a: string, b: string): number;
/**
 * Registry for versioned configuration migrations.
 *
 * Migrations are stored as directed edges in a version graph.
 * `runMigrations` finds a path from source to target version
 * and chains the transforms in order.
 */
export declare class MigrationRegistry {
    private migrations;
    /**
     * Registers a migration.
     *
     * @param migration - Migration to register
     * @throws If a migration with the same from/to already exists
     */
    register(migration: Migration): void;
    /**
     * Unregisters a migration.
     *
     * @returns true if a migration was removed
     */
    unregister(fromVersion: string, toVersion: string): boolean;
    /**
     * Returns all registered migrations sorted by fromVersion.
     */
    list(): ReadonlyArray<Migration>;
    /**
     * Checks whether a complete migration path exists between two versions.
     */
    hasPath(fromVersion: string, toVersion: string): boolean;
    /**
     * Detects gaps in the migration chain between two versions.
     *
     * @returns Array of missing migration edges (fromVersion → toVersion pairs)
     */
    detectGaps(fromVersion: string, toVersion: string): Array<{
        from: string;
        to: string;
    }>;
    /**
     * Runs migrations to transform config from one version to another.
     *
     * For forward migrations (from < to), chains migrate() calls.
     * For rollback (from > to), chains rollback() calls in reverse order.
     *
     * @param config - Current configuration object
     * @param fromVersion - Current version
     * @param toVersion - Target version
     * @returns Migration result with transformed config
     * @throws If no migration path exists or rollback is not supported
     */
    runMigrations(config: Record<string, unknown>, fromVersion: string, toVersion: string): MigrationResult;
    /**
     * Finds an ordered migration path between two versions.
     * @internal
     */
    private findPath;
    private findForwardPath;
    private findRollbackPath;
    private getSortedMigrations;
}
//# sourceMappingURL=migration.d.ts.map