/**
 * Casting Engine v1 (M3-2, Issue #138)
 *
 * Generates themed agent personas from a universe template.
 * Each CastMember maps to an agent role with name, personality, and backstory.
 */
export type AgentRole = 'lead' | 'developer' | 'tester' | 'prompt-engineer' | 'security' | 'devops' | 'designer' | 'scribe' | 'reviewer';
export type UniverseId = 'usual-suspects' | 'oceans-eleven' | 'custom';
export interface CastMember {
    /** Character name from the universe */
    name: string;
    /** Agent role this character fills */
    role: AgentRole;
    /** One-line personality trait */
    personality: string;
    /** Short backstory for system-prompt injection */
    backstory: string;
    /** Display name: "Name — Role" */
    displayName: string;
}
export interface CastingConfig {
    /** Universe theme to draw characters from */
    universe: UniverseId;
    /** Desired team size (clamped to available characters) */
    teamSize?: number;
    /** Roles that must be filled */
    requiredRoles?: AgentRole[];
    /** Custom character names (only for universe = 'custom') */
    customNames?: Record<AgentRole, string>;
}
interface UniverseCharacter {
    name: string;
    personality: string;
    backstory: string;
    preferredRoles: AgentRole[];
}
interface UniverseTemplate {
    id: UniverseId;
    label: string;
    characters: UniverseCharacter[];
}
export declare class CastingEngine {
    /** List available universe IDs. */
    getUniverses(): UniverseId[];
    /** Get a universe template by ID. */
    getUniverse(id: UniverseId): UniverseTemplate | undefined;
    /**
     * Cast a team of agents from a universe.
     *
     * Roles are filled by best-fit characters (preferredRoles match).
     * Required roles are guaranteed to be present.
     * Team size is clamped to available characters.
     */
    castTeam(config: CastingConfig): CastMember[];
    private castCustomTeam;
    private findBestFit;
    private toCastMember;
}
export {};
//# sourceMappingURL=casting-engine.d.ts.map