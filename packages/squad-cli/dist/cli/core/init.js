/**
 * Init command implementation — uses SDK
 * Scaffolds a new Squad project with templates, workflows, and directory structure
 */
import path from 'node:path';
import { detectSquadDir } from './detect-squad-dir.js';
import { success, BOLD, RESET, YELLOW, GREEN, DIM } from './output.js';
import { fatal } from './errors.js';
import { detectProjectType } from './project-type.js';
import { getPackageVersion } from './version.js';
import { initSquad as sdkInitSquad, cleanupOrphanInitPrompt } from '@bradygaster/squad-sdk';
const CYAN = '\x1b[36m';
/** True when animations should be suppressed (NO_COLOR, dumb term, non-TTY). */
export function isInitNoColor() {
    return ((process.env['NO_COLOR'] != null && process.env['NO_COLOR'] !== '') ||
        process.env['TERM'] === 'dumb' ||
        !process.stdout.isTTY);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/** Typewriter effect — falls back to instant print when animations disabled. */
export async function typewrite(text, charMs = 8) {
    if (isInitNoColor()) {
        process.stdout.write(text + '\n');
        return;
    }
    for (const char of text) {
        process.stdout.write(char);
        await sleep(charMs);
    }
    process.stdout.write('\n');
}
/** Staggered list reveal — each line appears with a short delay. */
async function revealLines(lines, delayMs = 30) {
    for (const line of lines) {
        if (!isInitNoColor())
            await sleep(delayMs);
        console.log(line);
    }
}
/** The structures that init creates, for the ceremony summary. */
const INIT_LANDMARKS = [
    { emoji: '📁', label: 'Team workspace' },
    { emoji: '📋', label: 'Skills & ceremonies' },
    { emoji: '🔧', label: 'Workflows & CI' },
    { emoji: '🧠', label: 'Identity & wisdom' },
    { emoji: '🤖', label: 'Copilot agent prompt' },
];
/**
 * Show deprecation warning for .ai-team/ directory
 */
function showDeprecationWarning() {
    console.log();
    console.log(`${YELLOW}⚠️  DEPRECATION: .ai-team/ is deprecated and will be removed in v1.0.0${RESET}`);
    console.log(`${YELLOW}    Run 'npx @bradygaster/squad-cli upgrade --migrate-directory' to migrate to .squad/${RESET}`);
    console.log(`${YELLOW}    Details: https://github.com/bradygaster/squad/issues/101${RESET}`);
    console.log();
}
/**
 * Main init command handler
 */
export async function runInit(dest, options = {}) {
    const version = getPackageVersion();
    console.log();
    await typewrite(`${DIM}Let's build your team.${RESET}`, 8);
    console.log();
    // Detect project type
    const projectType = detectProjectType(dest);
    // Detect squad directory
    const squadInfo = detectSquadDir(dest);
    // Show deprecation warning if using .ai-team/
    if (squadInfo.isLegacy) {
        showDeprecationWarning();
    }
    // Build SDK options
    const initOptions = {
        teamRoot: dest,
        projectName: path.basename(dest) || 'my-project',
        agents: [
            {
                name: 'scribe',
                role: 'scribe',
                displayName: 'Scribe',
            }
        ],
        configFormat: options.sdk ? 'sdk' : 'markdown',
        skipExisting: true,
        includeWorkflows: options.includeWorkflows !== false,
        includeTemplates: true,
        includeMcpConfig: true,
        projectType: projectType,
        version,
        prompt: options.prompt,
        extractionDisabled: options.extractionDisabled,
    };
    // Handle SIGINT to cleanup orphan .init-prompt
    const squadDir = squadInfo.path;
    const sigintHandler = async () => {
        await cleanupOrphanInitPrompt(squadDir);
        process.exit(130);
    };
    process.on('SIGINT', sigintHandler);
    // Run SDK init
    let result;
    try {
        result = await sdkInitSquad(initOptions);
    }
    catch (err) {
        process.off('SIGINT', sigintHandler);
        fatal(`Failed to initialize squad: ${err.message}`);
        return; // Unreachable but makes TS happy
    }
    process.off('SIGINT', sigintHandler);
    // Report .init-prompt storage
    if (options.prompt) {
        success(`.init-prompt stored — team will be cast when you start squad`);
    }
    // Report created files
    for (const file of result.createdFiles) {
        // Files are already relative to teamRoot, just display as-is
        success(file);
    }
    // Report skipped files
    for (const file of result.skippedFiles) {
        // Files are already relative to teamRoot, just display as-is
        console.log(`${DIM}${file} already exists — skipping${RESET}`);
    }
    // ── Celebration ceremony ──────────────────────────────────────────
    console.log();
    await typewrite(`${CYAN}${BOLD}◆ SQUAD${RESET}`, 10);
    if (!isInitNoColor())
        await sleep(50);
    console.log();
    await revealLines(INIT_LANDMARKS.map(l => `  ${l.emoji}  ${l.label}`), 30);
    if (!isInitNoColor())
        await sleep(80);
    console.log();
    console.log(`${GREEN}${BOLD}Your team is ready.${RESET} Run ${CYAN}${BOLD}squad${RESET} to start.`);
    console.log();
    if (squadInfo.isLegacy) {
        showDeprecationWarning();
    }
}
//# sourceMappingURL=init.js.map