import { readFileSync } from 'node:fs';
import { join } from 'node:path';
/** Debug logger — writes to stderr only when SQUAD_DEBUG=1. */
function debugLog(...args) {
    if (process.env['SQUAD_DEBUG'] === '1') {
        console.error('[SQUAD_DEBUG]', ...args);
    }
}
/**
 * Check if team.md has actual roster entries in the ## Members section.
 * Returns true if there is at least one table data row.
 */
export function hasRosterEntries(teamContent) {
    const membersMatch = teamContent.match(/## Members\s*\n([\s\S]*?)(?=\n## |\n*$)/);
    if (!membersMatch)
        return false;
    const membersSection = membersMatch[1] ?? '';
    const rows = membersSection.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed.startsWith('|') &&
            !trimmed.match(/^\|\s*Name\s*\|/) &&
            !trimmed.match(/^\|\s*-+\s*\|/);
    });
    return rows.length > 0;
}
/**
 * Build an Init Mode system prompt for team casting.
 * Used when team.md exists but has no roster entries.
 */
export function buildInitModePrompt(config) {
    return `You are the Squad Coordinator in Init Mode.

This project has a Squad scaffold (.squad/ directory) but no team has been cast yet.
The user's message describes what they want to build or work on.

Your job: Propose a team of 4-5 AI agents based on what the user wants to do.

## Rules
1. Analyze the user's message to understand the project (language, stack, scope)
2. Pick a fictional universe for character names (e.g., Alien, The Usual Suspects, Blade Runner, The Matrix, Heat, Star Wars). Pick ONE universe and use it consistently.
3. Propose 4-5 agents with roles that match the project needs
4. Scribe and Ralph are always included automatically — do NOT include them in your proposal

## Response Format — you MUST use this EXACT format:

INIT_TEAM:
- {Name} | {Role} | {scope: 2-4 words describing expertise}
- {Name} | {Role} | {scope}
- {Name} | {Role} | {scope}
- {Name} | {Role} | {scope}
UNIVERSE: {universe name}
PROJECT: {1-sentence project description}

## Example

If user says "Build a React app with a Node backend":

INIT_TEAM:
- Ripley | Lead | Architecture, code review, decisions
- Dallas | Frontend Dev | React, components, styling
- Kane | Backend Dev | Node.js, APIs, database
- Lambert | Tester | Tests, quality, edge cases
UNIVERSE: Alien
PROJECT: A React and Node.js web application

## Important
- Use character names that feel natural, not forced
- Roles should match project needs (don't always use the same 4 roles)
- For CLI projects: maybe skip Frontend, add DevOps or SDK Expert
- For data projects: add Data Engineer, skip Frontend
- Keep scope descriptions short (2-4 words each)
- Respond ONLY with the INIT_TEAM block — no other text
`;
}
/**
 * Build the coordinator system prompt from team.md + routing.md.
 * This prompt tells the LLM how to route user requests to agents.
 */
export function buildCoordinatorPrompt(config) {
    const squadRoot = config.teamRoot;
    // Load team.md for roster
    const teamPath = config.teamPath ?? join(squadRoot, '.squad', 'team.md');
    let teamContent = '';
    try {
        teamContent = readFileSync(teamPath, 'utf-8');
        if (!hasRosterEntries(teamContent)) {
            teamContent = `⚠️ NO TEAM CONFIGURED

This project doesn't have a Squad team yet.

**You MUST NOT do any project work.** Instead, tell the user:
1. "This project doesn't have a Squad team yet."
2. Suggest running \`squad init\` or the \`/init\` command to set one up.
3. Politely refuse any work requests until init is done.

Do not answer coding questions, route to agents, or perform any project tasks.`;
        }
    }
    catch (err) {
        debugLog('buildCoordinatorPrompt: failed to read team.md at', teamPath, err);
        teamContent = `⚠️ NO TEAM CONFIGURED

This project doesn't have a Squad team yet.

**You MUST NOT do any project work.** Instead, tell the user:
1. "This project doesn't have a Squad team yet."
2. Suggest running \`squad init\` or the \`/init\` command to set one up.
3. Politely refuse any work requests until init is done.

Do not answer coding questions, route to agents, or perform any project tasks.`;
    }
    // Load routing.md for routing rules
    const routingPath = config.routingPath ?? join(squadRoot, '.squad', 'routing.md');
    let routingContent = '';
    try {
        routingContent = readFileSync(routingPath, 'utf-8');
    }
    catch (err) {
        debugLog('buildCoordinatorPrompt: failed to read routing.md at', routingPath, err);
        routingContent = '(No routing.md found — run `squad init` to create one)';
    }
    return `You are the Squad Coordinator — you route work to the right agent.

## Team Roster
${teamContent}

## Routing Rules
${routingContent}

## Your Job
1. Read the user's message
2. Decide which agent(s) should handle it based on routing rules
3. If naming a specific agent ("Fenster, fix the bug"), route directly
4. If ambiguous, pick the best match and explain your choice
5. For status/factual questions, answer directly without spawning

## Response Format
When routing to an agent, respond with:
ROUTE: {agent_name}
TASK: {what the agent should do}
CONTEXT: {any relevant context}

When answering directly:
DIRECT: {your answer}

When routing to multiple agents:
MULTI:
- {agent1}: {task1}
- {agent2}: {task2}
`;
}
export function parseCoordinatorResponse(response) {
    const trimmed = response.trim();
    // Direct answer
    if (trimmed.startsWith('DIRECT:')) {
        return {
            type: 'direct',
            directAnswer: trimmed.slice('DIRECT:'.length).trim(),
        };
    }
    // Multi-agent routing
    if (trimmed.startsWith('MULTI:')) {
        const lines = trimmed.split('\n').slice(1);
        const routes = lines
            .filter(l => l.trim().startsWith('-'))
            .map(l => {
            const match = l.match(/^-\s*(\w+):\s*(.+)$/);
            if (match) {
                return { agent: match[1], task: match[2] };
            }
            return null;
        })
            .filter((r) => r !== null);
        return { type: 'multi', routes };
    }
    // Single agent routing
    if (trimmed.startsWith('ROUTE:')) {
        const agentMatch = trimmed.match(/ROUTE:\s*(\w+)/);
        const taskMatch = trimmed.match(/TASK:\s*(.+)/);
        const contextMatch = trimmed.match(/CONTEXT:\s*(.+)/);
        if (agentMatch) {
            return {
                type: 'route',
                routes: [{
                        agent: agentMatch[1],
                        task: taskMatch?.[1] ?? '',
                        context: contextMatch?.[1],
                    }],
            };
        }
    }
    // Fallback — treat as direct answer
    return { type: 'direct', directAnswer: trimmed };
}
/**
 * Format conversation history for the coordinator context window.
 * Keeps recent messages, summarizes older ones.
 */
export function formatConversationContext(messages, maxMessages = 20) {
    const recent = messages.slice(-maxMessages);
    return recent
        .map(m => {
        const prefix = m.agentName ? `[${m.agentName}]` : `[${m.role}]`;
        return `${prefix}: ${m.content}`;
    })
        .join('\n');
}
//# sourceMappingURL=coordinator.js.map