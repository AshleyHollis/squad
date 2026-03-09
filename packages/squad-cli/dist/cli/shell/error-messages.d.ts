/**
 * User-friendly error message templates with recovery guidance.
 * All messages are conversational and action-oriented.
 *
 * @module cli/shell/error-messages
 */
export interface ErrorGuidance {
    message: string;
    recovery: string[];
}
/** SDK disconnect / connection errors */
export declare function sdkDisconnectGuidance(detail?: string): ErrorGuidance;
/** team.md missing or invalid */
export declare function teamConfigGuidance(issue: string): ErrorGuidance;
/** Agent session failure */
export declare function agentSessionGuidance(agentName: string, detail?: string): ErrorGuidance;
/** Generic error with context */
export declare function genericGuidance(detail: string): ErrorGuidance;
/** Format an ErrorGuidance into a user-facing string */
export declare function formatGuidance(g: ErrorGuidance): string;
//# sourceMappingURL=error-messages.d.ts.map