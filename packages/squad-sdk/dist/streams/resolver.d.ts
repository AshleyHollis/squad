/**
 * SubSquad Resolver — Resolves which SubSquad is active.
 *
 * Resolution order:
 *   1. SQUAD_TEAM env var → look up in SubSquads config
 *   2. .squad-workstream file (gitignored) → contains SubSquad name
 *   3. If exactly one SubSquad is defined in the config, auto-select that SubSquad
 *   4. null (no active SubSquad — single-squad mode / no SubSquads)
 *
 * @module streams/resolver
 */
import type { SubSquadConfig, ResolvedSubSquad } from './types.js';
/**
 * Load SubSquads configuration from .squad/workstreams.json.
 *
 * @param squadRoot - Root directory of the project (where .squad/ lives)
 * @returns Parsed SubSquadConfig or null if not found / invalid
 */
export declare function loadSubSquadsConfig(squadRoot: string): SubSquadConfig | null;
/** @deprecated Use loadSubSquadsConfig instead */
export declare const loadWorkstreamsConfig: typeof loadSubSquadsConfig;
/** @deprecated Use loadSubSquadsConfig instead */
export declare const loadStreamsConfig: typeof loadSubSquadsConfig;
/**
 * Resolve which SubSquad is active for the current environment.
 *
 * @param squadRoot - Root directory of the project
 * @returns ResolvedSubSquad or null if no SubSquad is active
 */
export declare function resolveSubSquad(squadRoot: string): ResolvedSubSquad | null;
/** @deprecated Use resolveSubSquad instead */
export declare const resolveWorkstream: typeof resolveSubSquad;
/** @deprecated Use resolveSubSquad instead */
export declare const resolveStream: typeof resolveSubSquad;
/**
 * Get the GitHub label filter string for a resolved SubSquad.
 *
 * @param subsquad - The resolved SubSquad
 * @returns Label filter string (e.g., "team:ui")
 */
export declare function getSubSquadLabelFilter(subsquad: ResolvedSubSquad): string;
/** @deprecated Use getSubSquadLabelFilter instead */
export declare const getWorkstreamLabelFilter: typeof getSubSquadLabelFilter;
/** @deprecated Use getSubSquadLabelFilter instead */
export declare const getStreamLabelFilter: typeof getSubSquadLabelFilter;
//# sourceMappingURL=resolver.d.ts.map