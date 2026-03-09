/**
 * Caching Strategy for Remote Agents (M5-8, Issue #132)
 */
// --- Constants ---
/** Default TTL: 1 hour for agent definitions. */
export const DEFAULT_AGENT_TTL = 60 * 60 * 1000;
/** Default TTL: 5 minutes for skill content. */
export const DEFAULT_SKILL_TTL = 5 * 60 * 1000;
// --- AgentCache class ---
export class AgentCache {
    cache = new Map();
    stats = { hits: 0, misses: 0, evictions: 0, size: 0 };
    defaultTtl;
    constructor(defaultTtl = DEFAULT_AGENT_TTL) {
        this.defaultTtl = defaultTtl;
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.misses++;
            return null;
        }
        if (this.isExpired(entry)) {
            this.cache.delete(key);
            this.stats.evictions++;
            this.stats.size = this.cache.size;
            this.stats.misses++;
            return null;
        }
        this.stats.hits++;
        return entry.value;
    }
    set(key, value, ttl, source = 'unknown') {
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl: ttl ?? this.defaultTtl,
            source,
        });
        this.stats.size = this.cache.size;
    }
    invalidate(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.stats.evictions++;
            this.stats.size = this.cache.size;
        }
        return deleted;
    }
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.stats.evictions += size;
        this.stats.size = 0;
    }
    has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        if (this.isExpired(entry)) {
            this.cache.delete(key);
            this.stats.evictions++;
            this.stats.size = this.cache.size;
            return false;
        }
        return true;
    }
    getStats() {
        return { ...this.stats };
    }
    /** Return all non-expired entries. */
    entries() {
        const result = [];
        for (const [key, entry] of this.cache) {
            if (!this.isExpired(entry)) {
                result.push([key, entry]);
            }
        }
        return result;
    }
    isExpired(entry) {
        return Date.now() - entry.timestamp > entry.ttl;
    }
}
//# sourceMappingURL=cache.js.map