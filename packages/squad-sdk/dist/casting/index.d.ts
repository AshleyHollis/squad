/**
 * Casting System (PRD 11 + M3-2)
 *
 * Runtime casting engine that generates agent personas from universe themes.
 * Typed config replaces static markdown definitions.
 *
 * v1 API (M3-2):  CastingEngine.castTeam(config) → CastMember[]
 * Legacy API:     CastingRegistry (filesystem-backed, stub)
 */
export { CastingEngine, type CastMember, type CastingConfig, type AgentRole, type UniverseId, } from './casting-engine.js';
export { CastingHistory, type CastingRecord, type CastingRecordMember, type SerializedCastingHistory, } from './casting-history.js';
export interface CastingUniverse {
    /** Universe name (e.g., 'The Wire', 'Seinfeld') */
    name: string;
    /** Available character names */
    characters: string[];
    /** Universe-specific constraints */
    constraints?: string[];
}
export interface CastingEntry {
    /** Agent role name (e.g., 'core-dev', 'lead') */
    role: string;
    /** Cast character name */
    characterName: string;
    /** Universe the character is from */
    universe: string;
    /** Display name (e.g., 'Fenster — Core Dev') */
    displayName: string;
}
export interface CastingRegistryConfig {
    /** Path to .squad/casting/ directory */
    castingDir: string;
    /** Active universe name */
    activeUniverse?: string;
}
export declare class CastingRegistry {
    private entries;
    private config;
    constructor(config: CastingRegistryConfig);
    load(): Promise<void>;
    getByRole(role: string): CastingEntry | undefined;
    getAllEntries(): CastingEntry[];
    cast(role: string, _universe?: string): Promise<CastingEntry>;
    recast(_universe: string): Promise<CastingEntry[]>;
}
//# sourceMappingURL=index.d.ts.map