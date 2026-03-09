/**
 * User-friendly error message templates with recovery guidance.
 * All messages are conversational and action-oriented.
 *
 * @module cli/shell/error-messages
 */
/** SDK disconnect / connection errors */
export function sdkDisconnectGuidance(detail) {
    return {
        message: detail ? `SDK disconnected: ${detail}` : 'SDK disconnected.',
        recovery: [
            "Run 'squad doctor' to check your setup",
            'Check your internet connection',
            'Restart the shell to reconnect',
        ],
    };
}
/** team.md missing or invalid */
export function teamConfigGuidance(issue) {
    return {
        message: `Team configuration issue: ${issue}`,
        recovery: [
            "Run 'squad doctor' to diagnose",
            "Run 'squad init' to regenerate team.md",
            'Check .squad/team.md exists and has valid YAML',
        ],
    };
}
/** Agent session failure */
export function agentSessionGuidance(agentName, detail) {
    return {
        message: `${agentName} session failed${detail ? `: ${detail}` : ''}.`,
        recovery: [
            'Try your message again (session will auto-reconnect)',
            "Run 'squad doctor' to check setup",
            `Use @${agentName} to retry directly`,
        ],
    };
}
/** Generic error with context */
export function genericGuidance(detail) {
    return {
        message: detail,
        recovery: [
            'Try again',
            "Run 'squad doctor' for diagnostics",
        ],
    };
}
/** Format an ErrorGuidance into a user-facing string */
export function formatGuidance(g) {
    const lines = [`❌ ${g.message}`];
    if (g.recovery.length > 0) {
        lines.push('   Try:');
        for (const r of g.recovery) {
            lines.push(`   • ${r}`);
        }
    }
    return lines.join('\n');
}
//# sourceMappingURL=error-messages.js.map