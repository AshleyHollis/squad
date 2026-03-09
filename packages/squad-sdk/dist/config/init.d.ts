/**
 * Squad Initialization Module (M2-6, PRD #98)
 *
 * Creates new Squad projects with typed configuration.
 * Generates squad.config.ts or squad.config.json with agent definitions.
 * Scaffolds directory structure, templates, workflows, and agent files.
 *
 * @module config/init
 */
import type { SubSquadDefinition } from '../streams/types.js';
/**
 * Get the SDK templates directory path.
 */
export declare function getSDKTemplatesDir(): string | null;
/**
 * Agent specification for initialization.
 */
export interface InitAgentSpec {
    /** Agent name (kebab-case) */
    name: string;
    /** Agent role identifier */
    role: string;
    /** Display name (optional, defaults to titlecased name) */
    displayName?: string;
}
/**
 * Initialization options.
 */
export interface InitOptions {
    /** Root directory for Squad team files */
    teamRoot: string;
    /** Project name */
    projectName: string;
    /** Project description (optional) */
    projectDescription?: string;
    /** Agents to create */
    agents: InitAgentSpec[];
    /** Config format (typescript or json for old format, sdk for new builder syntax, markdown for no config file) */
    configFormat?: 'typescript' | 'json' | 'sdk' | 'markdown';
    /** User name for initial history entries */
    userName?: string;
    /** Skip files that already exist (default: true) */
    skipExisting?: boolean;
    /** Include GitHub workflows (default: true) */
    includeWorkflows?: boolean;
    /** Include .squad/templates/ copy (default: true) */
    includeTemplates?: boolean;
    /** Include sample MCP config (default: true) */
    includeMcpConfig?: boolean;
    /** Project type for workflow customization */
    projectType?: 'node' | 'python' | 'go' | 'rust' | 'java' | 'csharp' | 'unknown';
    /** Version to stamp in squad.agent.md */
    version?: string;
    /** Project description prompt — stored for REPL auto-casting. */
    prompt?: string;
    /** If true, disable extraction from consult sessions (read-only consultations) */
    extractionDisabled?: boolean;
    /** Optional SubSquad definitions — generates .squad/workstreams.json when provided */
    streams?: SubSquadDefinition[];
}
/**
 * Initialization result.
 */
export interface InitResult {
    /** List of created file paths (relative to teamRoot) */
    createdFiles: string[];
    /** List of skipped file paths (already existed) */
    skippedFiles: string[];
    /** Configuration file path */
    configPath: string;
    /** Agent directory paths */
    agentDirs: string[];
    /** Path to squad.agent.md */
    agentFile: string;
    /** Path to .squad/ directory */
    squadDir: string;
}
export declare function initSquad(options: InitOptions): Promise<InitResult>;
/**
 * Clean up orphan .init-prompt file.
 * Called by CLI on Ctrl+C abort to remove partial state.
 *
 * @param squadDir - Path to the .squad directory
 */
export declare function cleanupOrphanInitPrompt(squadDir: string): Promise<void>;
//# sourceMappingURL=init.d.ts.map