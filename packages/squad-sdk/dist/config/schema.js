/**
 * Squad Configuration Schema
 * Typed configuration interface for Squad teams
 */
export const DEFAULT_CONFIG = {
    version: '0.6.0',
    team: {
        name: 'Default Squad',
        description: 'A Squad team',
    },
    routing: {
        rules: [],
        fallbackBehavior: 'coordinator',
    },
    models: {
        default: 'claude-sonnet-4',
        defaultTier: 'standard',
        tiers: {
            premium: ['claude-opus-4', 'claude-opus-4.5'],
            standard: ['claude-sonnet-4', 'claude-sonnet-4.5', 'gpt-5.1-codex'],
            fast: ['claude-haiku-4.5', 'gpt-5.1-codex-mini'],
        },
    },
    agents: [],
};
export function defineConfig(config) {
    return {
        ...DEFAULT_CONFIG,
        ...config,
        team: {
            ...DEFAULT_CONFIG.team,
            ...config.team,
        },
        routing: {
            ...DEFAULT_CONFIG.routing,
            ...config.routing,
            rules: config.routing?.rules ?? DEFAULT_CONFIG.routing.rules,
        },
        models: {
            ...DEFAULT_CONFIG.models,
            ...config.models,
            tiers: config.models?.tiers ?? DEFAULT_CONFIG.models.tiers,
        },
        agents: config.agents ?? DEFAULT_CONFIG.agents,
    };
}
export function validateConfig(config) {
    if (typeof config !== 'object' || config === null)
        return false;
    const c = config;
    if (typeof c.version !== 'string')
        return false;
    if (!c.team || typeof c.team.name !== 'string')
        return false;
    if (!c.routing || !Array.isArray(c.routing.rules))
        return false;
    if (!c.models || typeof c.models.default !== 'string')
        return false;
    if (!Array.isArray(c.agents))
        return false;
    return true;
}
//# sourceMappingURL=schema.js.map