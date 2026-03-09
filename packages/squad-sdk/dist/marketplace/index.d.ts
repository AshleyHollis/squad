/**
 * Marketplace module — Copilot Extensions marketplace readiness
 * Issue #108 (M4-8)
 */
import type { SquadConfig } from '../config/schema.js';
export declare enum ManifestCategory {
    Productivity = "productivity",
    Development = "development",
    Testing = "testing",
    DevOps = "devops",
    Documentation = "documentation",
    Security = "security",
    Other = "other"
}
export interface MarketplaceManifest {
    name: string;
    version: string;
    description: string;
    author: string;
    repository: string;
    categories: ManifestCategory[];
    tags: string[];
    icon: string;
    screenshots: string[];
    pricing: ManifestPricing;
}
export interface ManifestPricing {
    model: 'free' | 'paid' | 'freemium';
    trial?: boolean;
    url?: string;
}
export interface ManifestValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export declare function validateManifest(manifest: MarketplaceManifest): ManifestValidationResult;
export declare function generateManifest(config: SquadConfig): MarketplaceManifest;
export { ExtensionAdapter, toExtensionConfig, fromExtensionEvent, registerExtension } from './extension-adapter.js';
export type { ExtensionEvent, ExtensionConfig, RegistrationResult } from './extension-adapter.js';
export { packageForMarketplace, validatePackageContents } from './packaging.js';
export type { PackageResult, MarketplacePackageValidationResult } from './packaging.js';
export { searchMarketplace, validateEntry, generateEntryFromConfig } from './schema.js';
export type { MarketplaceEntry, MarketplaceEntryStats, MarketplaceIndex, MarketplaceSearchQuery, MarketplaceSearchResult, MarketplaceSortField, EntryValidationResult, } from './schema.js';
export { MarketplaceBrowser, formatEntryList, formatEntryDetails } from './browser.js';
export type { MarketplaceFetcher, InstallResult } from './browser.js';
export { MarketplaceBackend } from './backend.js';
export type { PublishResult, OperationResult } from './backend.js';
export { validateRemoteAgent, quarantineAgent, generateSecurityReport, SECURITY_RULES } from './security.js';
export type { RemoteAgentDefinition, SecurityReport, SecurityRule, SecuritySeverity } from './security.js';
//# sourceMappingURL=index.d.ts.map