/**
 * Autocomplete for the Squad interactive shell.
 * Provides @agent name completion and /slash command completion.
 */
export type CompleterResult = [string[], string];
export type CompleterFunction = (line: string) => CompleterResult;
/**
 * Create a readline-compatible completer function.
 * Completes @AgentName and /command prefixes.
 */
export declare function createCompleter(agentNames: string[]): CompleterFunction;
//# sourceMappingURL=autocomplete.d.ts.map