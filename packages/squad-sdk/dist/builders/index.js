/**
 * Builder Functions — SDK-First Squad Mode
 *
 * Each builder accepts a strongly-typed config object, validates it at
 * runtime (manual type-guards — no zod dependency), and returns the
 * validated value with the same type. The pattern mirrors `defineConfig()`
 * in config/schema.ts: identity-passthrough with runtime safety.
 *
 * @module builders
 */
// ---------------------------------------------------------------------------
// Validation helpers (private)
// ---------------------------------------------------------------------------
class BuilderValidationError extends Error {
    constructor(builder, reason) {
        super(`[${builder}] ${reason}`);
        this.name = 'BuilderValidationError';
    }
}
function assertNonEmptyString(value, field, builder) {
    if (typeof value !== 'string' || value.length === 0) {
        throw new BuilderValidationError(builder, `"${field}" must be a non-empty string`);
    }
}
function assertArray(value, field, builder) {
    if (!Array.isArray(value)) {
        throw new BuilderValidationError(builder, `"${field}" must be an array`);
    }
}
function assertObject(value, builder) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new BuilderValidationError(builder, 'config must be a plain object');
    }
}
function assertOptionalString(value, field, builder) {
    if (value !== undefined && typeof value !== 'string') {
        throw new BuilderValidationError(builder, `"${field}" must be a string when provided`);
    }
}
function assertOptionalBoolean(value, field, builder) {
    if (value !== undefined && typeof value !== 'boolean') {
        throw new BuilderValidationError(builder, `"${field}" must be a boolean when provided`);
    }
}
function assertOptionalNumber(value, field, builder) {
    if (value !== undefined && typeof value !== 'number') {
        throw new BuilderValidationError(builder, `"${field}" must be a number when provided`);
    }
}
function assertOptionalArray(value, field, builder) {
    if (value !== undefined && !Array.isArray(value)) {
        throw new BuilderValidationError(builder, `"${field}" must be an array when provided`);
    }
}
function assertStringUnion(value, allowed, field, builder) {
    if (!allowed.includes(value)) {
        throw new BuilderValidationError(builder, `"${field}" must be one of: ${allowed.join(', ')}`);
    }
}
/** Validates a model field that accepts string or ModelPreference object. */
function assertModelPreference(value, field, builder) {
    if (value === undefined)
        return;
    if (typeof value === 'string')
        return;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const obj = value;
        assertNonEmptyString(obj.preferred, `${field}.preferred`, builder);
        assertOptionalString(obj.rationale, `${field}.rationale`, builder);
        assertOptionalString(obj.fallback, `${field}.fallback`, builder);
        return;
    }
    throw new BuilderValidationError(builder, `"${field}" must be a model string or { preferred, rationale?, fallback? }`);
}
// ---------------------------------------------------------------------------
// defineBudget
// ---------------------------------------------------------------------------
export function defineBudget(config) {
    assertObject(config, 'defineBudget');
    if (config.perAgentSpawn !== undefined) {
        if (typeof config.perAgentSpawn !== 'number' || !Number.isFinite(config.perAgentSpawn) || config.perAgentSpawn <= 0) {
            throw new BuilderValidationError('defineBudget', '"perAgentSpawn" must be a finite positive number');
        }
    }
    if (config.perSession !== undefined) {
        if (typeof config.perSession !== 'number' || !Number.isFinite(config.perSession) || config.perSession <= 0) {
            throw new BuilderValidationError('defineBudget', '"perSession" must be a finite positive number');
        }
    }
    if (config.warnAt !== undefined) {
        if (typeof config.warnAt !== 'number' || !Number.isFinite(config.warnAt) || config.warnAt < 0 || config.warnAt > 1) {
            throw new BuilderValidationError('defineBudget', '"warnAt" must be a finite number between 0 and 1');
        }
    }
    return config;
}
// ---------------------------------------------------------------------------
// defineTeam
// ---------------------------------------------------------------------------
/**
 * Define team metadata, project context, and member roster.
 *
 * ```ts
 * const team = defineTeam({
 *   name: 'Core Squad',
 *   description: 'The main engineering team',
 *   members: ['@edie', '@fenster', '@hockney'],
 * });
 * ```
 */
export function defineTeam(config) {
    assertObject(config, 'defineTeam');
    assertNonEmptyString(config.name, 'name', 'defineTeam');
    assertOptionalString(config.description, 'description', 'defineTeam');
    assertOptionalString(config.projectContext, 'projectContext', 'defineTeam');
    assertArray(config.members, 'members', 'defineTeam');
    for (const member of config.members) {
        assertNonEmptyString(member, 'members[]', 'defineTeam');
    }
    return config;
}
// ---------------------------------------------------------------------------
// defineAgent
// ---------------------------------------------------------------------------
const AGENT_STATUSES = ['active', 'inactive', 'retired'];
const CAPABILITY_LEVELS = ['expert', 'proficient', 'basic'];
/**
 * Define a single agent with its role, charter, model preference,
 * tools, and capability profile.
 *
 * ```ts
 * const edie = defineAgent({
 *   name: 'edie',
 *   role: 'TypeScript Engineer',
 *   charter: '.squad/agents/edie/charter.md',
 *   model: 'claude-sonnet-4',
 *   tools: ['grep', 'edit', 'powershell'],
 *   capabilities: [{ name: 'type-system', level: 'expert' }],
 *   status: 'active',
 * });
 * ```
 */
export function defineAgent(config) {
    assertObject(config, 'defineAgent');
    assertNonEmptyString(config.name, 'name', 'defineAgent');
    assertNonEmptyString(config.role, 'role', 'defineAgent');
    assertOptionalString(config.description, 'description', 'defineAgent');
    assertOptionalString(config.charter, 'charter', 'defineAgent');
    assertModelPreference(config.model, 'model', 'defineAgent');
    if (config.budget !== undefined) {
        defineBudget(config.budget);
    }
    assertOptionalArray(config.tools, 'tools', 'defineAgent');
    assertOptionalArray(config.capabilities, 'capabilities', 'defineAgent');
    if (config.status !== undefined) {
        assertStringUnion(config.status, AGENT_STATUSES, 'status', 'defineAgent');
    }
    if (config.capabilities) {
        for (const cap of config.capabilities) {
            assertObject(cap, 'defineAgent');
            assertNonEmptyString(cap.name, 'capabilities[].name', 'defineAgent');
            assertStringUnion(cap.level, CAPABILITY_LEVELS, 'capabilities[].level', 'defineAgent');
        }
    }
    return config;
}
// ---------------------------------------------------------------------------
// defineRouting
// ---------------------------------------------------------------------------
const ROUTING_TIERS = ['direct', 'lightweight', 'standard', 'full'];
const FALLBACK_BEHAVIORS = ['ask', 'default-agent', 'coordinator'];
/**
 * Define typed routing rules with pattern matching, priority, and tier.
 *
 * ```ts
 * const routing = defineRouting({
 *   rules: [
 *     { pattern: 'feature-*', agents: ['@edie'], tier: 'standard', priority: 1 },
 *     { pattern: 'docs-*', agents: ['@mcmanus'], tier: 'lightweight' },
 *   ],
 *   defaultAgent: '@coordinator',
 *   fallback: 'coordinator',
 * });
 * ```
 */
export function defineRouting(config) {
    assertObject(config, 'defineRouting');
    assertArray(config.rules, 'rules', 'defineRouting');
    assertOptionalString(config.defaultAgent, 'defaultAgent', 'defineRouting');
    if (config.fallback !== undefined) {
        assertStringUnion(config.fallback, FALLBACK_BEHAVIORS, 'fallback', 'defineRouting');
    }
    for (const rule of config.rules) {
        assertObject(rule, 'defineRouting');
        assertNonEmptyString(rule.pattern, 'rules[].pattern', 'defineRouting');
        assertArray(rule.agents, 'rules[].agents', 'defineRouting');
        for (const agent of rule.agents) {
            assertNonEmptyString(agent, 'rules[].agents[]', 'defineRouting');
        }
        if (rule.tier !== undefined) {
            assertStringUnion(rule.tier, ROUTING_TIERS, 'rules[].tier', 'defineRouting');
        }
        assertOptionalNumber(rule.priority, 'rules[].priority', 'defineRouting');
        assertOptionalString(rule.description, 'rules[].description', 'defineRouting');
    }
    return config;
}
// ---------------------------------------------------------------------------
// defineCeremony
// ---------------------------------------------------------------------------
/**
 * Define a ceremony with schedule, participants, and agenda.
 *
 * ```ts
 * const standup = defineCeremony({
 *   name: 'standup',
 *   trigger: 'schedule',
 *   schedule: '0 9 * * 1-5',
 *   participants: ['@edie', '@fenster', '@hockney'],
 *   agenda: 'Yesterday / Today / Blockers',
 * });
 * ```
 */
export function defineCeremony(config) {
    assertObject(config, 'defineCeremony');
    assertNonEmptyString(config.name, 'name', 'defineCeremony');
    assertOptionalString(config.trigger, 'trigger', 'defineCeremony');
    assertOptionalString(config.schedule, 'schedule', 'defineCeremony');
    assertOptionalArray(config.participants, 'participants', 'defineCeremony');
    assertOptionalString(config.agenda, 'agenda', 'defineCeremony');
    assertOptionalArray(config.hooks, 'hooks', 'defineCeremony');
    return config;
}
// ---------------------------------------------------------------------------
// defineHooks
// ---------------------------------------------------------------------------
/**
 * Define the governance hook pipeline.
 *
 * ```ts
 * const hooks = defineHooks({
 *   allowedWritePaths: ['src/**', 'test/**', '.squad/**'],
 *   blockedCommands: ['rm -rf /', 'DROP TABLE'],
 *   maxAskUser: 3,
 *   scrubPii: true,
 *   reviewerLockout: true,
 * });
 * ```
 */
export function defineHooks(config) {
    assertObject(config, 'defineHooks');
    assertOptionalArray(config.allowedWritePaths, 'allowedWritePaths', 'defineHooks');
    assertOptionalArray(config.blockedCommands, 'blockedCommands', 'defineHooks');
    assertOptionalNumber(config.maxAskUser, 'maxAskUser', 'defineHooks');
    assertOptionalBoolean(config.scrubPii, 'scrubPii', 'defineHooks');
    assertOptionalBoolean(config.reviewerLockout, 'reviewerLockout', 'defineHooks');
    return config;
}
// ---------------------------------------------------------------------------
// defineCasting
// ---------------------------------------------------------------------------
const OVERFLOW_STRATEGIES = ['reject', 'generic', 'rotate'];
/**
 * Define casting configuration — universe allowlists and overflow.
 *
 * ```ts
 * const casting = defineCasting({
 *   allowlistUniverses: ['The Usual Suspects', 'Breaking Bad'],
 *   overflowStrategy: 'generic',
 *   capacity: { 'The Usual Suspects': 8 },
 * });
 * ```
 */
export function defineCasting(config) {
    assertObject(config, 'defineCasting');
    assertOptionalArray(config.allowlistUniverses, 'allowlistUniverses', 'defineCasting');
    if (config.overflowStrategy !== undefined) {
        assertStringUnion(config.overflowStrategy, OVERFLOW_STRATEGIES, 'overflowStrategy', 'defineCasting');
    }
    if (config.capacity !== undefined) {
        assertObject(config.capacity, 'defineCasting');
        for (const [universe, count] of Object.entries(config.capacity)) {
            if (typeof count !== 'number' || count < 0) {
                throw new BuilderValidationError('defineCasting', `capacity["${universe}"] must be a non-negative number`);
            }
        }
    }
    return config;
}
// ---------------------------------------------------------------------------
// defineTelemetry
// ---------------------------------------------------------------------------
/**
 * Define OpenTelemetry configuration.
 *
 * ```ts
 * const telemetry = defineTelemetry({
 *   enabled: true,
 *   endpoint: 'http://localhost:4317',
 *   serviceName: 'squad',
 *   sampleRate: 1.0,
 *   aspireDefaults: true,
 * });
 * ```
 */
export function defineTelemetry(config) {
    assertObject(config, 'defineTelemetry');
    assertOptionalBoolean(config.enabled, 'enabled', 'defineTelemetry');
    assertOptionalString(config.endpoint, 'endpoint', 'defineTelemetry');
    assertOptionalString(config.serviceName, 'serviceName', 'defineTelemetry');
    assertOptionalNumber(config.sampleRate, 'sampleRate', 'defineTelemetry');
    assertOptionalBoolean(config.aspireDefaults, 'aspireDefaults', 'defineTelemetry');
    if (config.sampleRate !== undefined && (config.sampleRate < 0 || config.sampleRate > 1)) {
        throw new BuilderValidationError('defineTelemetry', '"sampleRate" must be between 0.0 and 1.0');
    }
    return config;
}
// ---------------------------------------------------------------------------
// defineSkill
// ---------------------------------------------------------------------------
const CONFIDENCE_LEVELS = ['low', 'medium', 'high'];
const SKILL_SOURCES = ['manual', 'observed', 'earned', 'extracted'];
/**
 * Define a reusable skill with patterns, context, and examples.
 *
 * ```ts
 * const skill = defineSkill({
 *   name: 'init-mode',
 *   description: 'Team initialization flow (Phase 1 + Phase 2)',
 *   domain: 'orchestration',
 *   confidence: 'high',
 *   source: 'extracted',
 *   content: '## Context\n...\n## Patterns\n...',
 *   tools: [{ name: 'ask_user', description: 'Confirm team roster', when: 'Phase 1 proposal' }],
 * });
 * ```
 */
export function defineSkill(config) {
    assertObject(config, 'defineSkill');
    assertNonEmptyString(config.name, 'name', 'defineSkill');
    assertNonEmptyString(config.description, 'description', 'defineSkill');
    assertNonEmptyString(config.domain, 'domain', 'defineSkill');
    assertNonEmptyString(config.content, 'content', 'defineSkill');
    if (config.confidence !== undefined) {
        assertStringUnion(config.confidence, CONFIDENCE_LEVELS, 'confidence', 'defineSkill');
    }
    if (config.source !== undefined) {
        assertStringUnion(config.source, SKILL_SOURCES, 'source', 'defineSkill');
    }
    assertOptionalArray(config.tools, 'tools', 'defineSkill');
    if (config.tools) {
        for (const tool of config.tools) {
            assertObject(tool, 'defineSkill');
            assertNonEmptyString(tool.name, 'tools[].name', 'defineSkill');
            assertNonEmptyString(tool.description, 'tools[].description', 'defineSkill');
            assertNonEmptyString(tool.when, 'tools[].when', 'defineSkill');
        }
    }
    return config;
}
// ---------------------------------------------------------------------------
// defineDefaults
// ---------------------------------------------------------------------------
/**
 * Define squad-level defaults applied to all agents unless overridden.
 *
 * ```ts
 * const defaults = defineDefaults({
 *   model: { preferred: 'claude-sonnet-4', rationale: 'Good balance of speed and quality', fallback: 'claude-haiku-4.5' },
 * });
 * ```
 */
export function defineDefaults(config) {
    assertObject(config, 'defineDefaults');
    assertModelPreference(config.model, 'model', 'defineDefaults');
    if (config.budget !== undefined) {
        defineBudget(config.budget);
    }
    return config;
}
// ---------------------------------------------------------------------------
// defineSquad — top-level composition
// ---------------------------------------------------------------------------
/**
 * Compose all builder outputs into a single SDK config.
 *
 * ```ts
 * export default defineSquad({
 *   version: '1.0.0',
 *   team: defineTeam({ name: 'Core', members: ['@edie'] }),
 *   agents: [defineAgent({ name: 'edie', role: 'TypeScript Engineer' })],
 *   routing: defineRouting({ rules: [...] }),
 *   defaults: defineDefaults({ model: 'claude-sonnet-4' }),
 * });
 * ```
 */
export function defineSquad(config) {
    assertObject(config, 'defineSquad');
    assertOptionalString(config.version, 'version', 'defineSquad');
    // Validate nested sections via their respective builders
    defineTeam(config.team);
    assertArray(config.agents, 'agents', 'defineSquad');
    for (const agent of config.agents) {
        defineAgent(agent);
    }
    if (config.defaults !== undefined)
        defineDefaults(config.defaults);
    if (config.routing !== undefined)
        defineRouting(config.routing);
    if (config.ceremonies !== undefined) {
        assertArray(config.ceremonies, 'ceremonies', 'defineSquad');
        for (const ceremony of config.ceremonies) {
            defineCeremony(ceremony);
        }
    }
    if (config.hooks !== undefined)
        defineHooks(config.hooks);
    if (config.casting !== undefined)
        defineCasting(config.casting);
    if (config.telemetry !== undefined)
        defineTelemetry(config.telemetry);
    if (config.skills !== undefined) {
        assertArray(config.skills, 'skills', 'defineSquad');
        for (const skill of config.skills) {
            defineSkill(skill);
        }
    }
    return config;
}
/** Exported for testing — not part of the public API contract. */
export { BuilderValidationError };
//# sourceMappingURL=index.js.map