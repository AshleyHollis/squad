/**
 * Security model — remote agent validation for marketplace entries
 * Issue #140 (M5-13)
 */
import type { AgentConfig } from '../config/schema.js';
export interface RemoteAgentDefinition extends AgentConfig {
    charter?: string;
    tools?: string[];
}
export interface SecurityReport {
    passed: boolean;
    warnings: string[];
    blocked: string[];
    riskScore: number;
}
export type SecuritySeverity = 'warning' | 'critical';
export interface SecurityRule {
    name: string;
    severity: SecuritySeverity;
    check: (agent: RemoteAgentDefinition, source: string) => string | null;
}
export declare const SECURITY_RULES: SecurityRule[];
export declare function validateRemoteAgent(agent: RemoteAgentDefinition, source: string): SecurityReport;
export declare function quarantineAgent(agent: RemoteAgentDefinition): RemoteAgentDefinition;
export declare function generateSecurityReport(report: SecurityReport): string;
//# sourceMappingURL=security.d.ts.map