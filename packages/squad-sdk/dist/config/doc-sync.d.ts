/**
 * Doc ↔ Config Synchronisation (M2-12)
 *
 * Keeps agent documentation (.agent.md) in sync with typed SquadConfig.
 * The .agent.md file is the *reference* document; SquadConfig is the
 * *runtime* source of truth.  This module bridges the two.
 *
 * @module config/doc-sync
 */
import type { AgentDocMetadata } from './agent-doc.js';
import type { SquadConfig } from './schema.js';
/**
 * A single mismatch between the agent doc and the typed config.
 */
export interface DriftEntry {
    /** Which field differs */
    field: string;
    /** Value found in the agent doc */
    docValue: unknown;
    /** Value found in the typed config */
    configValue: unknown;
    /** Human-readable summary */
    message: string;
}
/**
 * Result of a drift-detection run.
 */
export interface DriftReport {
    /** True when doc and config are perfectly aligned */
    inSync: boolean;
    /** Individual mismatches */
    entries: DriftEntry[];
}
/**
 * Merge metadata extracted from an agent doc into an existing SquadConfig.
 *
 * Only fields present in the doc metadata will overwrite config values;
 * everything else is left untouched.
 *
 * @param doc    - Metadata parsed from the .agent.md file
 * @param config - Current typed configuration (mutated in-place *and* returned)
 * @returns The updated config
 */
export declare function syncDocToConfig(doc: AgentDocMetadata, config: SquadConfig): SquadConfig;
/**
 * Generate (or update) an agent doc from a typed SquadConfig.
 *
 * If a `template` is provided the function replaces recognised section
 * placeholders (`{{IDENTITY}}`, `{{CAPABILITIES}}`, etc.) with values
 * from the config.  If no template is given a minimal markdown document
 * is produced from scratch.
 *
 * @param config   - The typed configuration
 * @param template - Optional markdown template with `{{SECTION}}` placeholders
 * @returns Generated markdown string
 */
export declare function syncConfigToDoc(config: SquadConfig, template?: string): string;
/**
 * Detect mismatches between an agent doc and a typed config.
 *
 * @param doc    - Metadata parsed from the .agent.md file
 * @param config - Current typed configuration
 * @returns A drift report listing every mismatch found
 */
export declare function detectDrift(doc: AgentDocMetadata, config: SquadConfig): DriftReport;
//# sourceMappingURL=doc-sync.d.ts.map