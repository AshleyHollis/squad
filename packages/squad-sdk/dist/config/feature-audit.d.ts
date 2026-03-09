/**
 * Feature Audit — Risk Punch List (M3-13, Issue #154)
 *
 * Internal development tool that audits all v1 modules for completeness
 * and produces a risk assessment before GA.
 */
import type { SquadConfig } from './schema.js';
export type FeatureCompleteness = 'complete' | 'partial' | 'stub' | 'missing';
export type RiskLevel = 'low' | 'medium' | 'high';
export interface FeatureStatus {
    /** Module / feature name */
    name: string;
    /** Current completeness level */
    status: FeatureCompleteness;
    /** Free-form notes on what's done or missing */
    notes: string;
    /** Overall risk for GA */
    riskLevel: RiskLevel;
}
export interface FeatureAuditReport {
    /** When the audit was generated */
    timestamp: string;
    /** Squad config version audited against */
    configVersion: string;
    /** Per-module results */
    features: FeatureStatus[];
    /** Rollup counts */
    summary: {
        total: number;
        complete: number;
        partial: number;
        stub: number;
        missing: number;
        highRisk: number;
    };
}
/**
 * Audit all v1 modules against the provided config and return a report.
 */
export declare function auditFeatures(config: SquadConfig): FeatureAuditReport;
/**
 * Filter the report to only high-risk features that need attention before GA.
 */
export declare function getHighRiskFeatures(report: FeatureAuditReport): FeatureStatus[];
/**
 * Generate a markdown summary of the audit report.
 */
export declare function generateAuditMarkdown(report: FeatureAuditReport): string;
//# sourceMappingURL=feature-audit.d.ts.map