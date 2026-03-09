/**
 * Squad Configuration Loader
 *
 * Loads and validates squad.config.ts or squad.config.json configuration files.
 * Implements the config schema design from spike #72.
 *
 * @module runtime/config
 */
import type { AgentRole } from './constants.js';
/**
 * Model tier classification.
 */
export type ModelTier = 'premium' | 'standard' | 'fast';
/**
 * Model identifier from Copilot CLI.
 */
export type ModelId = string;
/**
 * Work type categories for routing.
 */
export type WorkType = 'feature-dev' | 'bug-fix' | 'testing' | 'documentation' | 'refactoring' | 'architecture' | 'research' | 'triage' | 'meta' | string;
/**
 * Agent role for model selection (re-exported from constants).
 */
export type { AgentRole } from './constants.js';
/**
 * Task output type for model selection.
 */
export type TaskOutputType = 'code' | 'text' | 'analysis' | 'decision';
/**
 * Model selection configuration (Layer 3 + Layer 4).
 */
export interface ModelSelectionConfig {
    /** Default model for new agents (Layer 4) */
    defaultModel: ModelId;
    /** Default tier when no specific model is chosen */
    defaultTier: ModelTier;
    /** Task output type → model mapping */
    taskRules?: TaskToModelRule[];
    /** Role → model mapping with conditions */
    roleMapping?: RoleToModelMapping[];
    /** Complexity-based adjustments */
    complexityAdjustments?: ComplexityAdjustment[];
    /** Fallback chains per tier */
    fallbackChains: {
        premium: ModelId[];
        standard: ModelId[];
        fast: ModelId[];
    };
    /** Prefer same provider when falling back */
    preferSameProvider?: boolean;
    /** Respect tier ceiling during fallback (don't upgrade to premium on standard failure) */
    respectTierCeiling?: boolean;
    /** Nuclear fallback configuration */
    nuclearFallback?: {
        enabled: boolean;
        model: ModelId;
        maxRetriesBeforeNuclear: number;
    };
}
/**
 * Task-to-model selection rule.
 */
export interface TaskToModelRule {
    /** Task output type */
    outputType: TaskOutputType;
    /** Model to use for this output type */
    model: ModelId;
    /** Optional conditions */
    conditions?: {
        minComplexity?: number;
        workType?: WorkType[];
    };
}
/**
 * Role-to-model mapping with override conditions.
 */
export interface RoleToModelMapping {
    /** Agent role */
    role: AgentRole;
    /** Default model for this role */
    model: ModelId;
    /** Override conditions */
    overrides?: {
        workType?: WorkType;
        model: ModelId;
    }[];
}
/**
 * Complexity-based model adjustment.
 */
export interface ComplexityAdjustment {
    /** Complexity threshold (0-10 scale) */
    threshold: number;
    /** Adjustment action */
    action: 'bump-tier' | 'downgrade-tier' | 'switch-to-specialist';
    /** Target model if action is 'switch-to-specialist' */
    targetModel?: ModelId;
}
/**
 * Routing rule: work type → agent mapping.
 */
export interface RoutingRule {
    /** Work type identifier */
    workType: WorkType;
    /** Agent(s) to route this work to */
    agents: string[];
    /** Examples to help LLM understand this work type */
    examples?: string[];
    /** Confidence level for LLM self-assessment */
    confidence?: 'high' | 'medium' | 'low';
}
/**
 * Issue label-based routing rule.
 */
export interface IssueRoutingRule {
    /** Label to match */
    label: string;
    /** Action to take when label is present */
    action: 'assign' | 'route' | 'evaluate';
    /** Target agent or evaluation criteria */
    target?: string;
    /** Required labels (all must be present) */
    requiredLabels?: string[];
    /** Excluded labels (none can be present) */
    excludedLabels?: string[];
    /** Issue state filter */
    state?: 'open' | 'closed' | 'all';
}
/**
 * @copilot capability evaluation criteria.
 */
export interface CopilotCapabilityEvaluation {
    /** Capabilities to check */
    requiredCapabilities: string[];
    /** Fallback agent if @copilot cannot handle */
    fallbackAgent: string;
    /** Auto-route without asking if confidence is high */
    autoRouteOnHighConfidence?: boolean;
}
/**
 * Routing configuration.
 */
export interface RoutingConfig {
    /** Work type → agent routing rules */
    rules: RoutingRule[];
    /** Issue label → routing rules */
    issueRouting?: IssueRoutingRule[];
    /** @copilot capability evaluation */
    copilotEvaluation?: CopilotCapabilityEvaluation;
    /** Routing governance rules */
    governance?: {
        eagerByDefault?: boolean;
        scribeAutoRuns?: boolean;
        allowRecursiveSpawn?: boolean;
        [key: string]: unknown;
    };
}
/**
 * Casting policy configuration.
 */
export interface CastingPolicy {
    /** Allowlist of fictional universes */
    allowlistUniverses?: string[];
    /** Capacity limits per universe */
    universeCapacity?: Record<string, number>;
    /** Overflow strategy when capacity is reached */
    overflowStrategy?: 'reject' | 'generic' | 'rotate';
    /** Universe-specific constraints */
    universeConstraints?: Record<string, {
        avoid?: string[];
        combine?: string[];
        maxPerRole?: number;
    }>;
}
/**
 * Agent source configuration (foundation for PRD 15).
 */
export interface AgentSourceConfig {
    /** Source type */
    type: 'local' | 'git' | 'npm' | 'url';
    /** Source location */
    location: string;
    /** Optional version/ref for git/npm sources */
    version?: string;
    /** Cache strategy */
    cache?: 'always' | 'never' | 'auto';
}
/**
 * Platform-specific overrides.
 */
export interface PlatformOverrides {
    /** VS Code-specific overrides */
    vscode?: {
        /** Disable model selection (Phase 1) */
        disableModelSelection?: boolean;
        /** Scribe mode (sync on VS Code, background on CLI) */
        scribeMode?: 'sync' | 'background';
        /** Other VS Code-specific settings */
        [key: string]: unknown;
    };
    /** CLI-specific overrides */
    cli?: {
        [key: string]: unknown;
    };
}
/**
 * Root Squad configuration object.
 */
export interface SquadConfig {
    /** Config schema version */
    version: string;
    /** Model selection configuration */
    models: ModelSelectionConfig;
    /** Routing configuration */
    routing: RoutingConfig;
    /** Casting policy configuration */
    casting?: CastingPolicy;
    /** Agent source configurations */
    agentSources?: AgentSourceConfig[];
    /** MCP integration configuration (pass-through to SDK) */
    mcp?: {
        servers?: Record<string, unknown>;
        [key: string]: unknown;
    };
    /** Platform-specific overrides */
    platforms?: PlatformOverrides;
    /** Custom extensions */
    [key: string]: unknown;
}
/**
 * Default Squad configuration with typed defaults.
 */
export declare const DEFAULT_CONFIG: SquadConfig;
/**
 * Configuration load result.
 */
export interface ConfigLoadResult {
    /** Loaded configuration */
    config: SquadConfig;
    /** Configuration file path that was loaded (if any) */
    source?: string;
    /** Whether default config was used */
    isDefault: boolean;
}
/**
 * Configuration validation result.
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings?: string[];
}
/**
 * Configuration validation error.
 */
export declare class ConfigValidationError extends Error {
    readonly errors: string[];
    constructor(message: string, errors: string[]);
}
/**
 * Discovers Squad configuration file by walking up directory tree.
 *
 * Search order per directory:
 * 1. squad.config.ts
 * 2. squad.config.js
 * 3. squad.config.json
 * 4. .squad/config.json
 *
 * @param cwd - Starting directory for upward search
 * @returns Path to config file if found, undefined otherwise
 */
export declare function discoverConfigFile(cwd?: string): string | undefined;
/**
 * Loads Squad configuration from squad.config.ts, squad.config.js, squad.config.json, or .squad/config.json.
 *
 * Search order:
 * 1. squad.config.ts (ESM import)
 * 2. squad.config.js (ESM import)
 * 3. squad.config.json (JSON parse)
 * 4. .squad/config.json (JSON parse)
 * 5. Walk up directory tree to find config file
 * 6. DEFAULT_CONFIG (fallback)
 *
 * @param cwd - Working directory to search for config files
 * @returns Configuration load result with validation
 * @throws {ConfigValidationError} If config validation fails
 */
export declare function loadConfig(cwd?: string): Promise<ConfigLoadResult>;
/**
 * Validates Squad configuration schema and returns detailed result.
 *
 * @param config - Configuration object to validate
 * @returns Validation result with errors and warnings
 */
export declare function validateConfigDetailed(config: unknown): ValidationResult;
/**
 * Validates Squad configuration schema.
 *
 * @param config - Configuration object to validate
 * @returns Validated configuration with defaults merged
 * @throws {ConfigValidationError} If validation fails
 */
export declare function validateConfig(config: unknown): SquadConfig;
/**
 * Synchronously loads Squad configuration.
 * Only supports squad.config.json (TypeScript config requires async import).
 *
 * @param cwd - Working directory to search for config files
 * @returns Configuration load result with validation
 * @throws {ConfigValidationError} If config validation fails
 */
export declare function loadConfigSync(cwd?: string): ConfigLoadResult;
//# sourceMappingURL=config.d.ts.map