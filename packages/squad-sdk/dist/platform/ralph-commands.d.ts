/**
 * Platform-specific Ralph commands for triage and work management.
 *
 * @module platform/ralph-commands
 */
import type { PlatformType } from './types.js';
export interface RalphCommands {
    listUntriaged: string;
    listAssigned: string;
    listOpenPRs: string;
    listDraftPRs: string;
    createBranch: string;
    createPR: string;
    mergePR: string;
    createWorkItem: string;
}
/**
 * Get Ralph scan/triage commands for a given platform.
 * GitHub → gh CLI commands
 * Azure DevOps → az CLI commands
 */
export declare function getRalphScanCommands(platform: PlatformType): RalphCommands;
/** Ralph commands for Planner via Graph API (az CLI token) */
export declare function getPlannerRalphCommands(): RalphCommands;
//# sourceMappingURL=ralph-commands.d.ts.map