/**
 * Squad Configuration Loader
 *
 * Loads and validates squad.config.ts or squad.config.json configuration files.
 * Implements the config schema design from spike #72.
 *
 * @module runtime/config
 */
import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { pathToFileURL } from 'url';
import { MODELS } from './constants.js';
// ============================================================================
// Default Configuration
// ============================================================================
/**
 * Default Squad configuration with typed defaults.
 */
export const DEFAULT_CONFIG = {
    version: '1.0.0',
    models: {
        defaultModel: MODELS.DEFAULT,
        defaultTier: 'standard',
        fallbackChains: {
            premium: [...MODELS.FALLBACK_CHAINS.premium],
            standard: [...MODELS.FALLBACK_CHAINS.standard],
            fast: [...MODELS.FALLBACK_CHAINS.fast]
        },
        preferSameProvider: true,
        respectTierCeiling: true,
        nuclearFallback: {
            enabled: false,
            model: MODELS.NUCLEAR_FALLBACK,
            maxRetriesBeforeNuclear: MODELS.NUCLEAR_MAX_RETRIES
        }
    },
    routing: {
        rules: [
            {
                workType: 'feature-dev',
                agents: ['@coordinator'],
                confidence: 'high'
            }
        ],
        governance: {
            eagerByDefault: true,
            scribeAutoRuns: false,
            allowRecursiveSpawn: false
        }
    },
    casting: {
        allowlistUniverses: [
            'The Usual Suspects',
            'Breaking Bad',
            'The Wire',
            'Firefly',
            'Star Trek',
            'Lord of the Rings',
            'The Godfather',
            'Inception',
            'The Matrix',
            'Blade Runner',
            'Harry Potter',
            'Game of Thrones',
            'The Expanse',
            'Westworld',
            'Sherlock Holmes'
        ],
        overflowStrategy: 'generic',
        universeCapacity: {}
    },
    platforms: {
        vscode: {
            disableModelSelection: false,
            scribeMode: 'sync'
        }
    }
};
/**
 * Configuration validation error.
 */
export class ConfigValidationError extends Error {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
        this.name = 'ConfigValidationError';
    }
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
export function discoverConfigFile(cwd = process.cwd()) {
    let currentDir = resolve(cwd);
    const root = resolve(dirname(currentDir), '..');
    const configFiles = [
        'squad.config.ts',
        'squad.config.js',
        'squad.config.json',
        join('.squad', 'config.json')
    ];
    while (true) {
        for (const configFile of configFiles) {
            const configPath = join(currentDir, configFile);
            if (existsSync(configPath)) {
                return configPath;
            }
        }
        // Check if we've reached the root
        const parentDir = dirname(currentDir);
        if (parentDir === currentDir || currentDir === root) {
            break;
        }
        currentDir = parentDir;
    }
    return undefined;
}
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
export async function loadConfig(cwd = process.cwd()) {
    const resolvedCwd = resolve(cwd);
    // Try local configs first
    const localConfigs = [
        { path: join(resolvedCwd, 'squad.config.ts'), type: 'ts' },
        { path: join(resolvedCwd, 'squad.config.js'), type: 'js' },
        { path: join(resolvedCwd, 'squad.config.json'), type: 'json' },
        { path: join(resolvedCwd, '.squad', 'config.json'), type: 'json' }
    ];
    for (const { path: configPath, type } of localConfigs) {
        if (existsSync(configPath)) {
            try {
                if (type === 'ts' || type === 'js') {
                    const configUrl = pathToFileURL(configPath).href;
                    const module = await import(configUrl);
                    const config = module.default || module.squadConfig;
                    if (!config) {
                        throw new Error(`${configPath} must export default or named export "squadConfig"`);
                    }
                    const validated = validateConfig(config);
                    return {
                        config: validated,
                        source: configPath,
                        isDefault: false
                    };
                }
                else {
                    const content = readFileSync(configPath, 'utf-8');
                    const config = JSON.parse(content);
                    const validated = validateConfig(config);
                    return {
                        config: validated,
                        source: configPath,
                        isDefault: false
                    };
                }
            }
            catch (error) {
                if (error instanceof ConfigValidationError) {
                    throw error;
                }
                throw new Error(`Failed to load ${configPath}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }
    // Walk up directory tree
    const discoveredPath = discoverConfigFile(dirname(resolvedCwd));
    if (discoveredPath) {
        try {
            if (discoveredPath.endsWith('.ts') || discoveredPath.endsWith('.js')) {
                const configUrl = pathToFileURL(discoveredPath).href;
                const module = await import(configUrl);
                const config = module.default || module.squadConfig;
                if (!config) {
                    throw new Error(`${discoveredPath} must export default or named export "squadConfig"`);
                }
                const validated = validateConfig(config);
                return {
                    config: validated,
                    source: discoveredPath,
                    isDefault: false
                };
            }
            else {
                const content = readFileSync(discoveredPath, 'utf-8');
                const config = JSON.parse(content);
                const validated = validateConfig(config);
                return {
                    config: validated,
                    source: discoveredPath,
                    isDefault: false
                };
            }
        }
        catch (error) {
            if (error instanceof ConfigValidationError) {
                throw error;
            }
            throw new Error(`Failed to load ${discoveredPath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Fall back to default config
    return {
        config: DEFAULT_CONFIG,
        source: undefined,
        isDefault: true
    };
}
/**
 * Validates Squad configuration schema and returns detailed result.
 *
 * @param config - Configuration object to validate
 * @returns Validation result with errors and warnings
 */
export function validateConfigDetailed(config) {
    const errors = [];
    const warnings = [];
    if (!config || typeof config !== 'object') {
        return {
            valid: false,
            errors: ['Config must be an object'],
            warnings
        };
    }
    const cfg = config;
    // Validate version
    if (!cfg.version || typeof cfg.version !== 'string') {
        errors.push('config.version is required and must be a string');
    }
    // Validate models section
    if (!cfg.models) {
        errors.push('config.models is required');
    }
    else {
        const models = cfg.models;
        if (!models.defaultModel || typeof models.defaultModel !== 'string') {
            errors.push('config.models.defaultModel is required and must be a string');
        }
        if (!models.defaultTier || !['premium', 'standard', 'fast'].includes(models.defaultTier)) {
            errors.push('config.models.defaultTier must be "premium", "standard", or "fast"');
        }
        if (!models.fallbackChains) {
            errors.push('config.models.fallbackChains is required');
        }
        else {
            if (!Array.isArray(models.fallbackChains.premium)) {
                errors.push('config.models.fallbackChains.premium must be an array');
            }
            if (!Array.isArray(models.fallbackChains.standard)) {
                errors.push('config.models.fallbackChains.standard must be an array');
            }
            if (!Array.isArray(models.fallbackChains.fast)) {
                errors.push('config.models.fallbackChains.fast must be an array');
            }
        }
        // Validate task rules if present
        if (models.taskRules) {
            if (!Array.isArray(models.taskRules)) {
                errors.push('config.models.taskRules must be an array');
            }
            else {
                models.taskRules.forEach((rule, idx) => {
                    if (!rule.outputType || typeof rule.outputType !== 'string') {
                        errors.push(`config.models.taskRules[${idx}].outputType is required`);
                    }
                    if (!rule.model || typeof rule.model !== 'string') {
                        errors.push(`config.models.taskRules[${idx}].model is required`);
                    }
                });
            }
        }
        // Validate role mapping if present
        if (models.roleMapping) {
            if (!Array.isArray(models.roleMapping)) {
                errors.push('config.models.roleMapping must be an array');
            }
            else {
                models.roleMapping.forEach((mapping, idx) => {
                    if (!mapping.role || typeof mapping.role !== 'string') {
                        errors.push(`config.models.roleMapping[${idx}].role is required`);
                    }
                    if (!mapping.model || typeof mapping.model !== 'string') {
                        errors.push(`config.models.roleMapping[${idx}].model is required`);
                    }
                });
            }
        }
    }
    // Validate routing section
    if (!cfg.routing) {
        errors.push('config.routing is required');
    }
    else {
        if (!Array.isArray(cfg.routing.rules)) {
            errors.push('config.routing.rules must be an array');
        }
        else {
            const agentNames = new Set();
            cfg.routing.rules.forEach((rule, idx) => {
                if (!rule.workType || typeof rule.workType !== 'string') {
                    errors.push(`config.routing.rules[${idx}].workType is required`);
                }
                if (!Array.isArray(rule.agents) || rule.agents.length === 0) {
                    errors.push(`config.routing.rules[${idx}].agents must be a non-empty array`);
                }
                else {
                    rule.agents.forEach(agent => agentNames.add(agent));
                }
            });
            // Check for duplicate work types
            const workTypes = new Set();
            cfg.routing.rules.forEach(rule => {
                if (rule.workType) {
                    if (workTypes.has(rule.workType)) {
                        warnings.push(`Duplicate work type in routing rules: ${rule.workType}`);
                    }
                    workTypes.add(rule.workType);
                }
            });
        }
        // Validate issue routing if present
        if (cfg.routing.issueRouting) {
            if (!Array.isArray(cfg.routing.issueRouting)) {
                errors.push('config.routing.issueRouting must be an array');
            }
            else {
                cfg.routing.issueRouting.forEach((rule, idx) => {
                    if (!rule.label || typeof rule.label !== 'string') {
                        errors.push(`config.routing.issueRouting[${idx}].label is required`);
                    }
                    if (!rule.action || !['assign', 'route', 'evaluate'].includes(rule.action)) {
                        errors.push(`config.routing.issueRouting[${idx}].action must be "assign", "route", or "evaluate"`);
                    }
                });
            }
        }
    }
    // Validate agent sources if present
    if (cfg.agentSources) {
        if (!Array.isArray(cfg.agentSources)) {
            errors.push('config.agentSources must be an array');
        }
        else {
            cfg.agentSources.forEach((source, idx) => {
                if (!source.type || !['local', 'git', 'npm', 'url'].includes(source.type)) {
                    errors.push(`config.agentSources[${idx}].type must be "local", "git", "npm", or "url"`);
                }
                if (!source.location || typeof source.location !== 'string') {
                    errors.push(`config.agentSources[${idx}].location is required`);
                }
            });
        }
    }
    // Validate casting policy if present
    if (cfg.casting) {
        if (cfg.casting.allowlistUniverses && !Array.isArray(cfg.casting.allowlistUniverses)) {
            errors.push('config.casting.allowlistUniverses must be an array');
        }
        if (cfg.casting.overflowStrategy && !['reject', 'generic', 'rotate'].includes(cfg.casting.overflowStrategy)) {
            errors.push('config.casting.overflowStrategy must be "reject", "generic", or "rotate"');
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}
/**
 * Validates Squad configuration schema.
 *
 * @param config - Configuration object to validate
 * @returns Validated configuration with defaults merged
 * @throws {ConfigValidationError} If validation fails
 */
export function validateConfig(config) {
    const result = validateConfigDetailed(config);
    if (!result.valid) {
        throw new ConfigValidationError(`Configuration validation failed:\n${result.errors.map(e => `  - ${e}`).join('\n')}`, result.errors);
    }
    const cfg = config;
    // Merge with defaults for optional fields
    const validated = {
        ...DEFAULT_CONFIG,
        ...cfg,
        models: {
            ...DEFAULT_CONFIG.models,
            ...cfg.models
        },
        routing: {
            ...DEFAULT_CONFIG.routing,
            ...cfg.routing,
            governance: {
                ...DEFAULT_CONFIG.routing.governance,
                ...cfg.routing?.governance
            }
        },
        casting: {
            ...DEFAULT_CONFIG.casting,
            ...cfg.casting
        },
        platforms: {
            ...DEFAULT_CONFIG.platforms,
            ...cfg.platforms
        }
    };
    return validated;
}
/**
 * Synchronously loads Squad configuration.
 * Only supports squad.config.json (TypeScript config requires async import).
 *
 * @param cwd - Working directory to search for config files
 * @returns Configuration load result with validation
 * @throws {ConfigValidationError} If config validation fails
 */
export function loadConfigSync(cwd = process.cwd()) {
    const resolvedCwd = resolve(cwd);
    // Only check squad.config.json (sync loading of .ts not supported)
    const jsonConfigPath = join(resolvedCwd, 'squad.config.json');
    if (existsSync(jsonConfigPath)) {
        try {
            const content = readFileSync(jsonConfigPath, 'utf-8');
            const config = JSON.parse(content);
            const validated = validateConfig(config);
            return {
                config: validated,
                source: jsonConfigPath,
                isDefault: false
            };
        }
        catch (error) {
            if (error instanceof ConfigValidationError) {
                throw error;
            }
            throw new Error(`Failed to load squad.config.json: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Fall back to default config
    return {
        config: DEFAULT_CONFIG,
        source: undefined,
        isDefault: true
    };
}
//# sourceMappingURL=config.js.map