/**
 * M4-2: npm bundling & registry publication
 * Generates package.json content and validates npm publication readiness.
 */
export interface NpmPackageConfig {
    name: string;
    version: string;
    description: string;
    exports: Record<string, string | Record<string, string>>;
    bin?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    engines?: Record<string, string>;
}
export interface PackageJsonOutput {
    name: string;
    version: string;
    description: string;
    type: string;
    main: string;
    types: string;
    exports: Record<string, unknown>;
    bin?: Record<string, string>;
    files: string[];
    peerDependencies?: Record<string, string>;
    engines: Record<string, string>;
    license: string;
    repository: {
        type: string;
        url: string;
    };
    keywords: string[];
}
export interface PackageValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Generate package.json content suitable for npm publication.
 */
export declare function generatePackageJson(config: NpmPackageConfig): PackageJsonOutput;
/**
 * Validate a package.json object for npm publication readiness.
 */
export declare function validatePackageJson(pkg: Record<string, unknown>): PackageValidationResult;
/**
 * Return the files array for package.json publication.
 */
export declare function getPublishFiles(): string[];
/**
 * Return the default ESM exports map for the SDK.
 */
export declare function getDefaultExports(): Record<string, Record<string, string>>;
//# sourceMappingURL=npm-package.d.ts.map