/**
 * Marketplace Backend — reference/mock implementation of marketplace API
 * Issue #139 (M5-12)
 */
import type { MarketplaceManifest } from './index.js';
import type { MarketplaceEntry, MarketplaceSearchQuery, MarketplaceSearchResult } from './schema.js';
export interface PublishResult {
    success: boolean;
    url?: string;
    warnings: string[];
    error?: string;
}
export interface OperationResult {
    success: boolean;
    error?: string;
}
export declare class MarketplaceBackend {
    private entries;
    private packages;
    /** List entries with search/pagination */
    listEntries(query: MarketplaceSearchQuery): MarketplaceSearchResult;
    /** Get a single entry by ID */
    getEntry(id: string): MarketplaceEntry | null;
    /** Publish a new entry */
    publishEntry(manifest: MarketplaceManifest, pkg: Buffer): PublishResult;
    /** Unpublish an entry */
    unpublishEntry(id: string): OperationResult;
    /** Update an existing entry's manifest */
    updateEntry(id: string, manifest: MarketplaceManifest): OperationResult;
    /** Get package buffer */
    getPackage(id: string): Buffer | null;
    /** Build a MarketplaceIndex from current entries */
    private buildIndex;
}
//# sourceMappingURL=backend.d.ts.map