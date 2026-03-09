/**
 * M6-13: Release candidate build & validation
 * Handles release manifest creation, validation, and release notes generation.
 *
 * @module build/release
 */
import type { CommitInfo } from './versioning.js';
/** Release channel. */
export type ReleaseChannel = 'stable' | 'rc' | 'beta' | 'alpha';
/**
 * Configuration for creating a release.
 */
export interface ReleaseConfig {
    /** Semver version string (e.g. "1.0.0", "1.0.0-rc.1") */
    version: string;
    /** Release channel */
    channel: ReleaseChannel;
    /** Whether this is a prerelease */
    prerelease: boolean;
    /** Git tag name (e.g. "v1.0.0-rc.1") */
    tag: string;
}
/**
 * An artifact included in a release.
 */
export interface ReleaseArtifact {
    /** Display name */
    name: string;
    /** File path */
    path: string;
    /** File size in bytes */
    size: number;
    /** SHA-256 hash */
    sha256: string;
}
/**
 * Release manifest describing a complete release.
 */
export interface ReleaseManifest {
    /** Semver version */
    version: string;
    /** Release channel */
    channel: ReleaseChannel;
    /** Build artifacts */
    artifacts: ReleaseArtifact[];
    /** ISO timestamp of the release */
    timestamp: string;
    /** Changelog markdown for this release */
    changelog: string;
}
/**
 * A validation error found in a release manifest.
 */
export interface ReleaseValidationError {
    /** Field that failed validation */
    field: string;
    /** Error message */
    message: string;
    /** Severity */
    severity: 'error' | 'warning';
}
/**
 * A checklist item for the release process.
 */
export interface ReleaseChecklistItem {
    /** Human-readable name */
    name: string;
    /** Function that checks this item (returns true if passing) */
    check: () => boolean;
    /** Whether this item is required for release */
    required: boolean;
    /** Current status */
    status: 'pass' | 'fail' | 'skip';
}
/**
 * Compute the SHA-256 hash of a buffer or string.
 */
export declare function computeSha256(data: Buffer | string): string;
/**
 * Build a ReleaseArtifact from a file path.
 * Returns null if the file does not exist.
 */
export declare function buildArtifact(name: string, filePath: string): ReleaseArtifact | null;
/**
 * Create a release manifest from a ReleaseConfig.
 *
 * @param config - Release configuration
 * @param artifactPaths - Optional map of artifact name → file path
 * @returns Release manifest
 */
export declare function createRelease(config: ReleaseConfig, artifactPaths?: Record<string, string>): ReleaseManifest;
/**
 * Validate a release manifest for correctness.
 *
 * @param manifest - Release manifest to validate
 * @returns Array of validation errors (empty if valid)
 */
export declare function validateRelease(manifest: ReleaseManifest): ReleaseValidationError[];
/**
 * Generate release notes markdown from a manifest and commit list.
 */
export declare function generateReleaseNotes(manifest: ReleaseManifest, commits: CommitInfo[]): string;
/**
 * Get the release checklist with default items.
 * Each item's check function can be evaluated to determine pass/fail.
 */
export declare function getReleaseChecklist(manifest?: ReleaseManifest): ReleaseChecklistItem[];
//# sourceMappingURL=release.d.ts.map