/**
 * Concrete Migration Definitions
 *
 * Registers real migration functions for known Squad version transitions.
 * Each migration transforms a config object from the old shape to the new.
 *
 * @module config/migrations
 */
import { MigrationRegistry, type Migration } from '../migration.js';
/**
 * Migrate from 0.4.x to 0.5.0.
 *
 * Changes:
 * - Renames `.ai-team/` directory references to `.squad/`
 * - Converts team.md-style flat config to squad.config.ts typed format
 * - Normalises agent names to lowercase with `@` prefix
 */
export declare const migration_0_4_to_0_5: Migration;
/**
 * Migrate from 0.5.0 to 0.6.0.
 *
 * Changes:
 * - Converts simple routing rules to typed RoutingConfig with patterns and tiers
 * - Adds model registry with tier system (premium/standard/fast)
 * - Adds agent source configuration for pluggable discovery
 */
export declare const migration_0_5_to_0_6: Migration;
/**
 * Returns all registered concrete migrations in version order.
 */
export declare function getRegisteredMigrations(): ReadonlyArray<Migration>;
/**
 * Creates a MigrationRegistry pre-loaded with all known migrations.
 */
export declare function createDefaultRegistry(): MigrationRegistry;
//# sourceMappingURL=index.d.ts.map