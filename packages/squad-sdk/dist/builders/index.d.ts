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
import type { TeamDefinition, AgentDefinition, BudgetDefinition, DefaultsDefinition, RoutingDefinition, CeremonyDefinition, HooksDefinition, CastingDefinition, TelemetryDefinition, SkillDefinition, SquadSDKConfig } from './types.js';
export type { AgentRef, ScheduleExpression, BuilderModelId, BudgetDefinition, ModelPreference, DefaultsDefinition, TeamDefinition, AgentCapability, AgentDefinition, RoutingRule, RoutingDefinition, CeremonyDefinition, HooksDefinition, CastingDefinition, TelemetryDefinition, SkillDefinition, SkillTool, SquadSDKConfig, } from './types.js';
declare class BuilderValidationError extends Error {
    constructor(builder: string, reason: string);
}
export declare function defineBudget(config: BudgetDefinition): BudgetDefinition;
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
export declare function defineTeam(config: TeamDefinition): TeamDefinition;
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
export declare function defineAgent(config: AgentDefinition): AgentDefinition;
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
export declare function defineRouting(config: RoutingDefinition): RoutingDefinition;
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
export declare function defineCeremony(config: CeremonyDefinition): CeremonyDefinition;
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
export declare function defineHooks(config: HooksDefinition): HooksDefinition;
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
export declare function defineCasting(config: CastingDefinition): CastingDefinition;
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
export declare function defineTelemetry(config: TelemetryDefinition): TelemetryDefinition;
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
export declare function defineSkill(config: SkillDefinition): SkillDefinition;
/**
 * Define squad-level defaults applied to all agents unless overridden.
 *
 * ```ts
 * const defaults = defineDefaults({
 *   model: { preferred: 'claude-sonnet-4', rationale: 'Good balance of speed and quality', fallback: 'claude-haiku-4.5' },
 * });
 * ```
 */
export declare function defineDefaults(config: DefaultsDefinition): DefaultsDefinition;
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
export declare function defineSquad(config: SquadSDKConfig): SquadSDKConfig;
/** Exported for testing — not part of the public API contract. */
export { BuilderValidationError };
//# sourceMappingURL=index.d.ts.map