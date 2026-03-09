/**
 * Marketplace Schema — types and utilities for marketplace entries
 * Issue #134 (M5-10)
 */
import type { SquadConfig } from '../config/schema.js';
import type { MarketplaceManifest } from './index.js';
export interface MarketplaceEntryStats {
    downloads: number;
    rating: number;
    reviews: number;
}
export interface MarketplaceEntry {
    id: string;
    manifest: MarketplaceManifest;
    stats: MarketplaceEntryStats;
    verified: boolean;
    featured: boolean;
    publishedAt: string;
    updatedAt: string;
}
export interface MarketplaceIndex {
    entries: MarketplaceEntry[];
    categories: string[];
    tags: string[];
    lastUpdated: string;
}
export type MarketplaceSortField = 'downloads' | 'rating' | 'name' | 'recent';
export interface MarketplaceSearchQuery {
    query?: string;
    category?: string;
    tags?: string[];
    sort?: MarketplaceSortField;
    page?: number;
    perPage?: number;
}
export interface MarketplaceSearchResult {
    entries: MarketplaceEntry[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}
export declare function searchMarketplace(index: MarketplaceIndex, query: MarketplaceSearchQuery): MarketplaceSearchResult;
export interface EntryValidationResult {
    valid: boolean;
    errors: string[];
}
export declare function validateEntry(entry: MarketplaceEntry): EntryValidationResult;
export declare function generateEntryFromConfig(config: SquadConfig): MarketplaceEntry;
//# sourceMappingURL=schema.d.ts.map