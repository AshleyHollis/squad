/**
 * Base Roles — Public API
 *
 * Provides role lookup, search, and the `useRole()` builder for
 * referencing built-in roles in squad.config.ts.
 *
 * Attribution: Role content adapted from agency-agents by AgentLand
 * Contributors (MIT License) — https://github.com/msitarzewski/agency-agents
 *
 * @module roles
 */
export type { BaseRole, RoleCategory, UseRoleOptions } from './types.js';
export { BASE_ROLES, ENGINEERING_ROLE_IDS, CATEGORY_ROLE_IDS } from './catalog.js';
import type { BaseRole, RoleCategory, UseRoleOptions } from './types.js';
import type { AgentDefinition } from '../builders/types.js';
/**
 * Get all available base roles, optionally filtered by category.
 */
export declare function listRoles(category?: RoleCategory): readonly BaseRole[];
/**
 * Look up a base role by ID.
 *
 * @param id - Role ID (e.g., 'backend', 'marketing')
 * @returns The role definition, or undefined if not found
 */
export declare function getRoleById(id: string): BaseRole | undefined;
/**
 * Search roles by keyword across title, vibe, expertise, and routing patterns.
 *
 * @param query - Search query (case-insensitive)
 * @returns Matching roles sorted by relevance
 */
export declare function searchRoles(query: string): readonly BaseRole[];
/**
 * Get all unique categories in the catalog.
 */
export declare function getCategories(): readonly RoleCategory[];
/**
 * Create an AgentDefinition from a base role with optional overrides.
 *
 * This is the primary way to use base roles in `squad.config.ts`:
 *
 * ```typescript
 * import { useRole, defineSquad } from '@bradygaster/squad-sdk';
 *
 * export default defineSquad({
 *   agents: [
 *     useRole('lead', { name: 'ripley' }),
 *     useRole('backend', { name: 'kane', expertise: ['Node.js', 'PostgreSQL'] }),
 *   ],
 * });
 * ```
 *
 * @param roleId - Base role ID (e.g., 'backend', 'marketing')
 * @param options - Agent name and optional overrides
 * @returns AgentDefinition ready for defineSquad()
 * @throws Error if roleId is not found in the catalog
 */
export declare function useRole(roleId: string, options: UseRoleOptions): AgentDefinition;
/**
 * Generate a charter markdown string from a base role ID.
 * Used by cast.ts when creating agents during init.
 *
 * @param roleId - Base role ID
 * @param agentName - The cast name for the agent
 * @returns Full charter.md content, or null if role not found
 */
export declare function generateCharterFromRole(roleId: string, agentName: string): string | null;
//# sourceMappingURL=index.d.ts.map