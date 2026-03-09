/**
 * ThinkingIndicator — clean feedback during agent operations.
 *
 * Shows spinner + activity context + elapsed time.
 * Default label: "Routing to agent..." (covers SDK connection, initial routing).
 * Activity hints from SDK events or @Agent mentions override the default.
 *
 * Owned by Cheritto (TUI Engineer). Design approved by Marquez.
 */
import React from 'react';
export type ThinkingPhase = 'connecting' | 'routing' | 'thinking';
export interface ThinkingIndicatorProps {
    isThinking: boolean;
    elapsedMs: number;
    activityHint?: string;
    phase?: ThinkingPhase;
}
/** Rotating thinking phrases — cycled every few seconds to keep the UI alive. */
export declare const THINKING_PHRASES: string[];
export declare const ThinkingIndicator: React.FC<ThinkingIndicatorProps>;
//# sourceMappingURL=ThinkingIndicator.d.ts.map