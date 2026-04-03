/**
 * Type system for the skill-script model.
 *
 * This module defines the complete type contract for backend skills in `.copilot/skills/`.
 * Skills contain `scripts/` directories with executable JS handlers that replace built-in
 * tool handlers in ToolRegistry.
 *
 * The skill-script model enables stateful, framework-aware backends for tasks, decisions,
 * memories, and logging concerns. Handlers are ordinary async functions that return
 * SquadToolResult values.
 */
// Compile fails if any pair shares a tool name:
const _disjointProof = [true, true, true, true, true, true];
// ─── defineHandler Helper ────────────────────────────────────────────────────
/**
 * Identity function for type inference in handler scripts.
 *
 * Provides compile-time safety when authoring TypeScript handlers.
 * The compiled .js output is a plain function — no runtime dependency on this.
 *
 * @example
 * ```typescript
 * export default defineHandler<CreateIssueArgs>(async (args, config) => {
 *   return { type: "success", text: `Issue created: ${args.title}` };
 * });
 * ```
 */
export function defineHandler(handler) {
    return handler;
}
//# sourceMappingURL=handler-types.js.map