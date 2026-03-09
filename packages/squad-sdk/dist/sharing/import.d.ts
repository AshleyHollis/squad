/**
 * M5-2: Import command (squad import)
 * Imports a Squad configuration bundle into a target project.
 */
import type { ExportBundle } from './export.js';
export interface ImportOptions {
    merge?: boolean;
    dryRun?: boolean;
    skipValidation?: boolean;
}
export interface ImportChange {
    type: 'added' | 'modified' | 'skipped';
    path: string;
    reason?: string;
}
export interface ImportResult {
    success: boolean;
    changes: ImportChange[];
    warnings: string[];
}
export interface BundleValidationError {
    field: string;
    message: string;
}
/**
 * Deserialize a bundle string (JSON or YAML-like) into an ExportBundle.
 */
export declare function deserializeBundle(content: string): ExportBundle;
/**
 * Validate an ExportBundle for structural correctness.
 */
export declare function validateBundle(bundle: ExportBundle): BundleValidationError[];
/**
 * Import a Squad configuration bundle into a target directory.
 */
export declare function importSquadConfig(bundlePath: string, targetDir: string, options?: ImportOptions): ImportResult;
//# sourceMappingURL=import.d.ts.map