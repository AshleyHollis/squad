/**
 * Agent Onboarding Module (M2-10, PRD #111)
 *
 * Handles runtime agent onboarding with context-aware charter generation.
 * Creates agent directory, charter, and history with project context.
 *
 * @module agents/onboarding
 */
/**
 * Agent onboarding options.
 */
export interface OnboardOptions {
    /** Root directory for Squad team files */
    teamRoot: string;
    /** Agent name (kebab-case) */
    agentName: string;
    /** Agent role identifier */
    role: string;
    /** Display name (optional, defaults to titlecased name) */
    displayName?: string;
    /** Project context for charter generation */
    projectContext?: string;
    /** User name for initial history entry */
    userName?: string;
    /** Custom charter template override */
    charterTemplate?: string;
}
/**
 * Agent onboarding result.
 */
export interface OnboardResult {
    /** Created file paths */
    createdFiles: string[];
    /** Agent directory path */
    agentDir: string;
    /** Charter file path */
    charterPath: string;
    /** History file path */
    historyPath: string;
}
/**
 * Onboard a new agent to the Squad.
 *
 * Creates:
 * - Agent directory at .squad/agents/{name}/
 * - charter.md from role template + project context
 * - history.md with project description and tech stack
 *
 * @param options - Onboarding options
 * @returns Result with created file paths
 */
export declare function onboardAgent(options: OnboardOptions): Promise<OnboardResult>;
/**
 * Update an agent's configuration to squad.config.ts (if it exists).
 *
 * This is a helper function to add agent routing after onboarding.
 * Only works with TypeScript configs (JSON requires manual edit).
 *
 * @param teamRoot - Team root directory
 * @param agentName - Agent name to add
 * @param role - Agent role
 * @returns True if config was updated, false if not found or JSON format
 */
export declare function addAgentToConfig(teamRoot: string, agentName: string, role: string): Promise<boolean>;
//# sourceMappingURL=onboarding.d.ts.map