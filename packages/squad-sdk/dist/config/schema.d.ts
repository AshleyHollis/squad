/**
 * Squad Configuration Schema
 * Typed configuration interface for Squad teams
 */
export interface SquadConfig {
    version: string;
    team: TeamConfig;
    routing: RoutingConfig;
    models: ModelConfig;
    agents: AgentConfig[];
    hooks?: HooksConfig;
    ceremonies?: CeremonyConfig[];
    plugins?: PluginConfig;
}
export interface TeamConfig {
    name: string;
    description?: string;
    projectContext?: string;
    issueSource?: {
        repo: string;
        filters?: string[];
    };
}
export interface AgentConfig {
    name: string;
    role: string;
    displayName?: string;
    charter?: string;
    model?: string;
    tools?: string[];
    status?: 'active' | 'inactive' | 'retired';
}
export interface RoutingConfig {
    rules: RoutingRule[];
    defaultAgent?: string;
    fallbackBehavior?: 'ask' | 'default-agent' | 'coordinator';
}
export interface RoutingRule {
    pattern: string;
    agents: string[];
    tier?: 'direct' | 'lightweight' | 'standard' | 'full';
    priority?: number;
}
export interface ModelConfig {
    default: string;
    defaultTier: 'premium' | 'standard' | 'fast';
    tiers: Record<string, string[]>;
    agentOverrides?: Record<string, string>;
    taskTypeMapping?: Record<string, string>;
}
export interface HooksConfig {
    allowedWritePaths?: string[];
    blockedCommands?: string[];
    maxAskUserPerSession?: number;
    scrubPii?: boolean;
    reviewerLockout?: boolean;
}
export interface CeremonyConfig {
    name: string;
    schedule?: string;
    participants?: string[];
    agenda?: string;
    enabled?: boolean;
}
export interface PluginConfig {
    enabled: string[];
    config?: Record<string, unknown>;
}
export declare const DEFAULT_CONFIG: SquadConfig;
export declare function defineConfig(config: Partial<SquadConfig>): SquadConfig;
export declare function validateConfig(config: unknown): config is SquadConfig;
//# sourceMappingURL=schema.d.ts.map