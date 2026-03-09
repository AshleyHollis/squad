/**
 * M5-1: Export command (squad export)
 * Exports Squad configuration as a portable bundle.
 */
export interface ExportOptions {
    includeHistory?: boolean;
    includeSkills?: boolean;
    format?: 'json' | 'yaml';
    anonymize?: boolean;
}
export interface AgentCharter {
    name: string;
    role: string;
    content: string;
}
export interface ExportRoutingRule {
    pattern: string;
    agent: string;
    priority?: number;
}
export interface ExportMetadata {
    version: string;
    timestamp: string;
    source: string;
}
export interface ExportBundle {
    config: Record<string, unknown>;
    agents: AgentCharter[];
    skills: string[];
    routingRules: ExportRoutingRule[];
    metadata: ExportMetadata;
    history?: Record<string, unknown>[];
}
/**
 * Strip secrets and sensitive patterns from text content.
 */
export declare function sanitizeContent(content: string): string;
/**
 * Anonymize PII and local paths from content.
 */
export declare function anonymizeContent(content: string): string;
/**
 * Export a Squad project configuration as a bundle.
 */
export declare function exportSquadConfig(projectDir: string, options?: ExportOptions): ExportBundle;
/**
 * Serialize an export bundle to a string.
 */
export declare function serializeBundle(bundle: ExportBundle, format?: 'json' | 'yaml'): string;
//# sourceMappingURL=export.d.ts.map