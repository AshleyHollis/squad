/**
 * M4-1: Bundle strategy & esbuild configuration
 * Defines bundling strategy for the SDK: ESM output, tree-shakeable
 */
export type BundleFormat = 'esm' | 'cjs';
export interface BundleConfig {
    entryPoints: string[];
    outDir: string;
    format: BundleFormat;
    minify: boolean;
    sourcemap: boolean;
    external: string[];
}
/**
 * Create a full BundleConfig with sensible defaults, optionally overriding fields.
 */
export declare function createBundleConfig(options?: Partial<BundleConfig>): BundleConfig;
/**
 * Returns the list of entry points for the SDK build.
 */
export declare function getBundleTargets(): string[];
export interface BundleValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    files: string[];
}
/**
 * Check that the output directory contains expected build artifacts.
 */
export declare function validateBundleOutput(outDir: string): BundleValidationResult;
//# sourceMappingURL=bundle.d.ts.map