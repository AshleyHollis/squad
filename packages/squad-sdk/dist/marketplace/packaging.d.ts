/**
 * Packaging utilities — prepare Squad projects for marketplace distribution
 * Issue #108 (M4-8)
 */
import type { MarketplaceManifest } from './index.js';
export interface PackageResult {
    outputPath: string;
    size: number;
    files: string[];
    warnings: string[];
}
export interface MarketplacePackageValidationResult {
    valid: boolean;
    errors: string[];
    missingFiles: string[];
}
/**
 * Package a project directory for marketplace distribution.
 */
export declare function packageForMarketplace(projectDir: string, manifest: MarketplaceManifest): PackageResult;
/**
 * Validate that a package directory contains all required files.
 */
export declare function validatePackageContents(packagePath: string): MarketplacePackageValidationResult;
//# sourceMappingURL=packaging.d.ts.map