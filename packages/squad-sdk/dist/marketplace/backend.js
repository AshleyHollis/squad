/**
 * Marketplace Backend — reference/mock implementation of marketplace API
 * Issue #139 (M5-12)
 */
import { searchMarketplace, validateEntry } from './schema.js';
// --- MarketplaceBackend (reference/mock) ---
export class MarketplaceBackend {
    entries = new Map();
    packages = new Map();
    /** List entries with search/pagination */
    listEntries(query) {
        const index = this.buildIndex();
        return searchMarketplace(index, query);
    }
    /** Get a single entry by ID */
    getEntry(id) {
        return this.entries.get(id) ?? null;
    }
    /** Publish a new entry */
    publishEntry(manifest, pkg) {
        const warnings = [];
        const id = manifest.name;
        if (this.entries.has(id)) {
            return { success: false, warnings: [], error: `Entry already exists: ${id}` };
        }
        if (!manifest.name || !manifest.version) {
            return { success: false, warnings: [], error: 'name and version are required' };
        }
        if (pkg.length === 0) {
            warnings.push('Package is empty — this may indicate a build issue');
        }
        const now = new Date().toISOString();
        const entry = {
            id,
            manifest,
            stats: { downloads: 0, rating: 0, reviews: 0 },
            verified: false,
            featured: false,
            publishedAt: now,
            updatedAt: now,
        };
        const validation = validateEntry(entry);
        if (!validation.valid) {
            return { success: false, warnings: [], error: validation.errors.join('; ') };
        }
        this.entries.set(id, entry);
        this.packages.set(id, pkg);
        return {
            success: true,
            url: `https://marketplace.squad.dev/extensions/${id}`,
            warnings,
        };
    }
    /** Unpublish an entry */
    unpublishEntry(id) {
        if (!this.entries.has(id)) {
            return { success: false, error: `Entry not found: ${id}` };
        }
        this.entries.delete(id);
        this.packages.delete(id);
        return { success: true };
    }
    /** Update an existing entry's manifest */
    updateEntry(id, manifest) {
        const existing = this.entries.get(id);
        if (!existing) {
            return { success: false, error: `Entry not found: ${id}` };
        }
        this.entries.set(id, {
            ...existing,
            manifest,
            updatedAt: new Date().toISOString(),
        });
        return { success: true };
    }
    /** Get package buffer */
    getPackage(id) {
        return this.packages.get(id) ?? null;
    }
    /** Build a MarketplaceIndex from current entries */
    buildIndex() {
        const allEntries = Array.from(this.entries.values());
        const categories = new Set();
        const tags = new Set();
        for (const entry of allEntries) {
            for (const cat of entry.manifest.categories)
                categories.add(cat);
            for (const tag of entry.manifest.tags)
                tags.add(tag);
        }
        return {
            entries: allEntries,
            categories: [...categories],
            tags: [...tags],
            lastUpdated: new Date().toISOString(),
        };
    }
}
//# sourceMappingURL=backend.js.map