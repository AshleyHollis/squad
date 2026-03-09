/**
 * M4-9: CI/CD pipeline for distribution
 * Generates GitHub Actions workflow YAML for build, test, and release pipelines.
 */
export interface CIPipelineStep {
    name: string;
    command: string;
    condition?: string;
    env?: Record<string, string>;
}
export interface CIPipelineTrigger {
    event: 'push' | 'pull_request' | 'release' | 'workflow_dispatch' | 'schedule';
    branches?: string[];
    tags?: string[];
    cron?: string;
}
export interface CIPipelineArtifact {
    name: string;
    path: string;
    retention?: number;
}
export interface CIPipelineConfig {
    name: string;
    steps: CIPipelineStep[];
    triggers: CIPipelineTrigger[];
    artifacts: CIPipelineArtifact[];
    environment: Record<string, string>;
    nodeVersion?: string;
}
export interface PipelineValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Generate a GitHub Actions CI workflow YAML string.
 */
export declare function generateGitHubActionsWorkflow(config: CIPipelineConfig): string;
/**
 * Generate a release workflow YAML string.
 */
export declare function generateReleaseWorkflow(config: CIPipelineConfig): string;
/**
 * Validate a CI pipeline configuration for completeness and correctness.
 */
export declare function validatePipelineConfig(config: CIPipelineConfig): PipelineValidationResult;
/**
 * Get the default CI pipeline steps.
 */
export declare function getDefaultSteps(): CIPipelineStep[];
//# sourceMappingURL=ci-pipeline.d.ts.map