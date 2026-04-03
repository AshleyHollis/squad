/**
 * Personal Squad Agent Resolution
 *
 * Discovers and merges personal agents from the user's personal squad directory
 * into project session casts. Personal agents are ambient — they're automatically
 * available in all project contexts with ghost protocol enforced.
 *
 * @module agents/personal
 */
import { AgentManifest } from '../config/agent-source.js';
/** Metadata tag for personal agents in a session cast */
export interface PersonalAgentMeta {
    /** Always 'personal' for personal squad agents */
    origin: 'personal';
    /** Absolute path to the personal agent's directory */
    sourceDir: string;
    /** Whether ghost protocol is enforced (always true in project context) */
    ghostProtocol: boolean;
}
/** A project agent manifest augmented with personal origin info */
export type PersonalAgentManifest = AgentManifest & {
    personal: PersonalAgentMeta;
};
/**
 * Discover personal agents from the user's personal squad directory.
 * Returns empty array if personal squad is disabled or doesn't exist.
 */
export declare function resolvePersonalAgents(): Promise<PersonalAgentManifest[]>;
/**
 * Merge personal agents into a project session cast.
 * Personal agents are tagged with origin: 'personal' and ghost protocol is enforced.
 * Duplicate names: project agents take precedence over personal agents.
 */
export declare function mergeSessionCast(projectAgents: AgentManifest[], personalAgents: PersonalAgentManifest[]): (AgentManifest | PersonalAgentManifest)[];
//# sourceMappingURL=personal.d.ts.map