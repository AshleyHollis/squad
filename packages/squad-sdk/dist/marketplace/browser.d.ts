/**
 * Marketplace Browser — CLI interface for browsing the marketplace
 * Issue #136 (M5-11)
 */
import type { MarketplaceEntry, MarketplaceIndex, MarketplaceSearchQuery, MarketplaceSearchResult } from './schema.js';
export interface MarketplaceFetcher {
    fetchIndex(): Promise<MarketplaceIndex>;
    fetchEntry(id: string): Promise<MarketplaceEntry | null>;
    fetchPackage(id: string): Promise<Buffer>;
}
export declare class MarketplaceBrowser {
    private fetcher;
    constructor(fetcher: MarketplaceFetcher);
    /** Browse marketplace with optional search query */
    browse(query?: string): Promise<string>;
    /** Get detailed view of a specific entry */
    getDetails(entryId: string): Promise<string>;
    /** Install an agent/skill from marketplace */
    install(entryId: string, targetDir: string): Promise<InstallResult>;
    /** Search with full query options */
    search(query: MarketplaceSearchQuery): Promise<MarketplaceSearchResult>;
}
export interface InstallResult {
    success: boolean;
    entryId?: string;
    version?: string;
    targetDir?: string;
    size?: number;
    error?: string;
}
export declare function formatEntryList(entries: MarketplaceEntry[]): string;
export declare function formatEntryDetails(entry: MarketplaceEntry): string;
//# sourceMappingURL=browser.d.ts.map