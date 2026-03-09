/** Parsed routing rule from routing.md */
export interface RoutingRule {
    workType: string;
    agentName: string;
    keywords: string[];
}
/** Parsed module ownership rule from routing.md */
export interface ModuleOwnership {
    modulePath: string;
    primary: string;
    secondary: string | null;
}
/** Team member from team.md roster */
export interface TeamMember {
    name: string;
    role: string;
    label: string;
}
/** Triage decision result */
export interface TriageDecision {
    agent: TeamMember;
    reason: string;
    source: 'module-ownership' | 'routing-rule' | 'role-keyword' | 'lead-fallback';
    confidence: 'high' | 'medium' | 'low';
}
/** Issue data for triage */
export interface TriageIssue {
    number: number;
    title: string;
    body?: string;
    labels: string[];
}
/** Parse routing rules from routing.md content */
export declare function parseRoutingRules(routingMd: string): RoutingRule[];
/** Parse module ownership from routing.md content */
export declare function parseModuleOwnership(routingMd: string): ModuleOwnership[];
/** Parse team roster from team.md content */
export declare function parseRoster(teamMd: string): TeamMember[];
/**
 * Triage an issue using routing rules, module ownership, and roster.
 * Priority order:
 * 1. Module path match — issue mentions a file path matching module ownership
 * 2. Work type keyword — issue content matches routing rule keywords
 * 3. Role keyword — fallback to generic role-based matching (frontend/backend/test)
 * 4. Lead fallback — assign to Lead/Architect if no match
 */
export declare function triageIssue(issue: TriageIssue, rules: RoutingRule[], modules: ModuleOwnership[], roster: TeamMember[]): TriageDecision | null;
//# sourceMappingURL=triage.d.ts.map