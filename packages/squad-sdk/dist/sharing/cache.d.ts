/**
 * Caching Strategy for Remote Agents (M5-8, Issue #132)
 */
import type { AgentDefinition } from '../config/agent-source.js';
export interface CacheEntry<T = AgentDefinition> {
    value: T;
    timestamp: number;
    ttl: number;
    source: string;
}
export interface CacheStats {
    hits: number;
    misses: number;
    evictions: number;
    size: number;
}
/** Default TTL: 1 hour for agent definitions. */
export declare const DEFAULT_AGENT_TTL: number;
/** Default TTL: 5 minutes for skill content. */
export declare const DEFAULT_SKILL_TTL: number;
export declare class AgentCache<T = AgentDefinition> {
    private cache;
    private stats;
    private defaultTtl;
    constructor(defaultTtl?: number);
    get(key: string): T | null;
    set(key: string, value: T, ttl?: number, source?: string): void;
    invalidate(key: string): boolean;
    clear(): void;
    has(key: string): boolean;
    getStats(): CacheStats;
    /** Return all non-expired entries. */
    entries(): Array<[string, CacheEntry<T>]>;
    private isExpired;
}
//# sourceMappingURL=cache.d.ts.map