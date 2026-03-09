/**
 * Markdown-to-Config Migration
 *
 * Converts legacy .ai-team/ markdown files (team.md, routing.md, decisions.md)
 * into a typed SquadConfig object, enabling migration from the markdown-driven
 * workflow to the typed squad.config.ts format.
 *
 * @module config/markdown-migration
 */
import type { SquadConfig } from '../runtime/config.js';
/**
 * Agent info extracted from team.md.
 */
export interface ParsedAgent {
    /** Agent name (kebab-case) */
    name: string;
    /** Agent role */
    role: string;
    /** Skills / capabilities */
    skills: string[];
    /** Preferred model (if specified) */
    model?: string;
    /** Status */
    status?: string;
    /** Alternative names / aliases */
    aliases?: string[];
    /** Whether this agent is auto-assigned to matching work */
    autoAssign?: boolean;
}
/**
 * Routing rule extracted from routing.md.
 */
export interface ParsedRoutingRule {
    /** Work type or pattern */
    workType: string;
    /** Target agents */
    agents: string[];
    /** Example descriptions */
    examples?: string[];
}
/**
 * Decision extracted from decisions.md.
 */
export interface ParsedDecision {
    /** Decision title */
    title: string;
    /** Decision body / description */
    body: string;
    /** Whether this decision affects configuration */
    configRelevant: boolean;
    /** ISO 8601 date extracted from heading (e.g. "2026-02-21") */
    date?: string;
    /** Author extracted from **By:** lines */
    author?: string;
    /** Heading depth (2 for ##, 3 for ###) */
    headingLevel?: number;
}
/**
 * Complete result of parsing all markdown files.
 */
export interface MarkdownParseResult {
    /** Agents parsed from team.md */
    agents: ParsedAgent[];
    /** Routing rules parsed from routing.md */
    routingRules: ParsedRoutingRule[];
    /** Decisions parsed from decisions.md */
    decisions: ParsedDecision[];
    /** Warnings about unparseable sections */
    warnings: string[];
}
/**
 * Options for markdown migration.
 */
export interface MarkdownMigrationOptions {
    /** Content of team.md (may be undefined if file missing) */
    teamMd?: string;
    /** Content of routing.md (may be undefined if file missing) */
    routingMd?: string;
    /** Content of decisions.md (may be undefined if file missing) */
    decisionsMd?: string;
    /** Base config to merge into (defaults to DEFAULT_CONFIG) */
    baseConfig?: Partial<SquadConfig>;
}
/**
 * Result of a markdown migration.
 */
export interface MarkdownMigrationResult {
    /** Generated SquadConfig */
    config: SquadConfig;
    /** Parse result with all extracted data */
    parsed: MarkdownParseResult;
    /** Sections that were successfully migrated */
    migratedSections: string[];
    /** Sections that were skipped or missing */
    skippedSections: string[];
}
/**
 * Parses team.md content into agent configurations.
 *
 * Supports two formats:
 * 1. Table format: | Name | Role | Skills | Model |
 * 2. Section format: ## Agent Name \n Role: ... \n Skills: ...
 *
 * @param content - Raw team.md content
 * @returns Array of parsed agents and any warnings
 */
export declare function parseTeamMarkdown(content: string): {
    agents: ParsedAgent[];
    warnings: string[];
};
/**
 * Parses routing.md content into routing rules.
 *
 * Expected table format:
 * | Work Type | Route To | Examples |
 * |-----------|----------|----------|
 * | feature-dev | Lead | New features |
 *
 * @param content - Raw routing.md content
 * @returns Parsed routing rules and warnings
 */
export declare function parseRoutingRulesMarkdown(content: string): {
    rules: ParsedRoutingRule[];
    warnings: string[];
};
/**
 * Parses decisions.md content to extract config-relevant decisions.
 *
 * Looks for headings that denote individual decisions and checks body text
 * for config-relevant keywords (model, routing, governance, tier, agent).
 *
 * @param content - Raw decisions.md content
 * @returns Parsed decisions and warnings
 */
export declare function parseDecisionsMarkdown(content: string): {
    decisions: ParsedDecision[];
    warnings: string[];
};
/**
 * Converts parsed markdown data into a typed SquadConfig.
 *
 * @param parsed - Result from parsing all markdown files
 * @param base - Optional base config to merge with
 * @returns Generated SquadConfig
 */
export declare function generateConfigFromParsed(parsed: MarkdownParseResult, base?: Partial<SquadConfig>): SquadConfig;
/**
 * Migrates legacy markdown configuration files to a typed SquadConfig.
 *
 * Handles partial migrations gracefully — any combination of files can be
 * missing and the result will still be a valid SquadConfig.
 *
 * @param options - Markdown file contents and options
 * @returns Migration result with generated config and diagnostics
 */
export declare function migrateMarkdownToConfig(options: MarkdownMigrationOptions): MarkdownMigrationResult;
//# sourceMappingURL=markdown-migration.d.ts.map