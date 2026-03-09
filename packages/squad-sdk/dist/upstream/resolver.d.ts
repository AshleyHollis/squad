/**
 * Upstream resolver — reads upstream.json and resolves all upstream Squad sources.
 *
 * Implements the resolution logic the coordinator follows at session start:
 * 1. Read upstream.json
 * 2. For each source, resolve its .squad/ directory
 * 3. Read skills, decisions, wisdom, casting policy, routing
 *
 * @module upstream/resolver
 */
import type { UpstreamConfig, UpstreamResolution } from './types.js';
/**
 * Read and parse upstream.json from a squad directory.
 * Returns null if the file doesn't exist or is invalid.
 */
export declare function readUpstreamConfig(squadDir: string): UpstreamConfig | null;
/**
 * Resolve all upstream sources for a squad directory.
 *
 * For each upstream in upstream.json:
 * - Local paths: read directly from the source's .squad/
 * - Git URLs: read from .squad/_upstream_repos/{name}/ (must be cloned first)
 * - Export files: read from the JSON file
 *
 * @param squadDir - The .squad/ directory of the current repo
 * @returns Resolved upstream content, or null if no upstream.json exists
 */
export declare function resolveUpstreams(squadDir: string): UpstreamResolution | null;
/**
 * Build the INHERITED CONTEXT block for agent spawn prompts.
 */
export declare function buildInheritedContextBlock(resolution: UpstreamResolution | null): string;
/**
 * Build user-facing display for session start greeting.
 */
export declare function buildSessionDisplay(resolution: UpstreamResolution | null): string;
//# sourceMappingURL=resolver.d.ts.map