/**
 * Base Role Catalog — combines engineering and category roles
 *
 * This is the main catalog entry point that merges all base role sets.
 *
 * Attribution: Role content adapted from agency-agents by AgentLand
 * Contributors (MIT License) — https://github.com/msitarzewski/agency-agents
 *
 * @module roles/catalog
 */
import type { BaseRole } from './types.js';
/**
 * The complete base role catalog — all 20 built-in roles.
 */
export declare const BASE_ROLES: readonly BaseRole[];
/**
 * Role IDs for the software development core roles.
 */
export declare const ENGINEERING_ROLE_IDS: ("lead" | "tester" | "designer" | "frontend" | "backend" | "fullstack" | "reviewer" | "devops" | "security" | "data" | "docs" | "ai")[];
/**
 * Role IDs for the category generalist roles.
 */
export declare const CATEGORY_ROLE_IDS: ("marketing-strategist" | "sales-strategist" | "product-manager" | "project-manager" | "support-specialist" | "game-developer" | "media-buyer" | "compliance-legal")[];
//# sourceMappingURL=catalog.d.ts.map