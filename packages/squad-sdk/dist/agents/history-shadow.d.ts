/**
 * Session History Shadows (M1-11)
 *
 * When importing/spawning remote agents, creates local history shadows that
 * capture project-specific learnings separate from the portable agent definition.
 *
 * Shadows live at: .squad/agents/{name}/history.md
 */
/**
 * Standard history sections that agents maintain.
 */
export type HistorySection = 'Context' | 'Learnings' | 'Decisions' | 'Patterns' | 'Issues' | 'References';
/**
 * Parsed history content by section.
 */
export interface ParsedHistory {
    /** Context section: project-specific background */
    context?: string;
    /** Learnings section: what the agent has learned */
    learnings?: string;
    /** Decisions section: key decisions made */
    decisions?: string;
    /** Patterns section: recurring patterns observed */
    patterns?: string;
    /** Issues section: problems encountered */
    issues?: string;
    /** References section: important files/links */
    references?: string;
    /** Full raw content */
    fullContent: string;
}
/**
 * Create a history shadow for an agent.
 *
 * Initializes the shadow file at `.squad/agents/{name}/history.md` with
 * project-specific context. This is separate from the agent's portable
 * charter and captures session-specific learnings.
 *
 * @param teamRoot - Path to team root directory
 * @param agentName - Name of the agent
 * @param initialContext - Initial context to seed the history
 * @returns Path to created history shadow
 */
export declare function createHistoryShadow(teamRoot: string, agentName: string, initialContext?: string): Promise<string>;
/**
 * Append content to a specific section of an agent's history shadow.
 *
 * If the section doesn't exist, it will be created.
 * Content is appended with a timestamp.
 *
 * @param teamRoot - Path to team root directory
 * @param agentName - Name of the agent
 * @param section - Section to append to
 * @param content - Content to append
 */
export declare function appendToHistory(teamRoot: string, agentName: string, section: HistorySection, content: string): Promise<void>;
/**
 * Read and parse an agent's history shadow.
 *
 * @param teamRoot - Path to team root directory
 * @param agentName - Name of the agent
 * @returns Parsed history with sections
 */
export declare function readHistory(teamRoot: string, agentName: string): Promise<ParsedHistory>;
/**
 * Check if a history shadow exists for an agent.
 *
 * @param teamRoot - Path to team root directory
 * @param agentName - Name of the agent
 * @returns True if shadow exists
 */
export declare function shadowExists(teamRoot: string, agentName: string): Promise<boolean>;
/**
 * Delete a history shadow for an agent.
 *
 * @param teamRoot - Path to team root directory
 * @param agentName - Name of the agent
 */
export declare function deleteHistoryShadow(teamRoot: string, agentName: string): Promise<void>;
//# sourceMappingURL=history-shadow.d.ts.map