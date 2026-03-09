/**
 * M4-10: Version stamping & CHANGELOG generation
 * Conventional commits parsing, version bumping, and changelog output.
 */
export interface CommitInfo {
    sha: string;
    message: string;
    author: string;
    date: string;
    type: string;
}
export interface ConventionalCommit {
    type: string;
    scope: string | null;
    description: string;
    breaking: boolean;
}
/**
 * Parse a conventional commit message into structured parts.
 */
export declare function parseConventionalCommit(message: string): ConventionalCommit;
/**
 * Bump a semver version string by the given increment type.
 */
export declare function bumpVersion(current: string, type: 'major' | 'minor' | 'patch' | 'prerelease'): string;
/**
 * Stamp a version string into the specified file contents.
 * Returns an array of { file, content } with the version replaced.
 */
export declare function stampVersion(version: string, files: string[]): {
    file: string;
    content: string;
}[];
/**
 * Generate a CHANGELOG entry from a list of conventional commits.
 */
export declare function generateChangelog(commits: CommitInfo[], currentVersion: string): string;
//# sourceMappingURL=versioning.d.ts.map