/**
 * M4-3: Distribution configuration
 * Supports npm distribution (npm install -g @bradygaster/squad-cli).
 */
export interface GitHubDistConfig {
    owner: string;
    repo: string;
    binaryName: string;
    installCommandTemplate: string;
}
/**
 * Generate a shell script that downloads and installs from GitHub releases.
 */
export declare function generateInstallScript(config?: Partial<GitHubDistConfig>): string;
export interface ReleaseValidationResult {
    valid: boolean;
    errors: string[];
    version: string;
    expectedAssets: string[];
}
/**
 * Validate that a GitHub release has the expected assets.
 */
export declare function validateGitHubRelease(config: GitHubDistConfig, version: string): ReleaseValidationResult;
/**
 * Get the npx install command string.
 */
export declare function getInstallCommand(config?: Partial<GitHubDistConfig>): string;
/**
 * Generate the bin script that runs when npx invokes the package.
 */
export declare function generateNpxEntryPoint(): string;
/**
 * Get the default GitHub distribution config.
 */
export declare function getDefaultDistConfig(): GitHubDistConfig;
//# sourceMappingURL=github-dist.d.ts.map