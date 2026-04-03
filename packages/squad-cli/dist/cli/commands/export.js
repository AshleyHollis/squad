/**
 * Export command — port from beta CLI
 * Exports squad to squad-export.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { detectSquadDir } from '../core/detect-squad-dir.js';
import { success, warn } from '../core/output.js';
import { fatal } from '../core/errors.js';
/**
 * Export squad to JSON
 */
export async function runExport(dest, outPath) {
    const squadInfo = detectSquadDir(dest);
    const teamMd = path.join(squadInfo.path, 'team.md');
    if (!fs.existsSync(teamMd)) {
        fatal('No squad found — run init first');
    }
    const manifest = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        squad_version: '0.6.0',
        casting: {},
        agents: {},
        skills: []
    };
    // Read casting state
    const castingDir = path.join(squadInfo.path, 'casting');
    for (const file of ['registry.json', 'policy.json', 'history.json']) {
        const filePath = path.join(castingDir, file);
        try {
            if (fs.existsSync(filePath)) {
                manifest.casting[file.replace('.json', '')] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            }
        }
        catch (err) {
            console.error(`Warning: could not read casting/${file}: ${err.message}`);
        }
    }
    // Read agents
    const agentsDir = path.join(squadInfo.path, 'agents');
    try {
        if (fs.existsSync(agentsDir)) {
            for (const entry of fs.readdirSync(agentsDir)) {
                const agentDir = path.join(agentsDir, entry);
                if (!fs.statSync(agentDir).isDirectory())
                    continue;
                const agent = {};
                const charterPath = path.join(agentDir, 'charter.md');
                const historyPath = path.join(agentDir, 'history.md');
                if (fs.existsSync(charterPath))
                    agent.charter = fs.readFileSync(charterPath, 'utf8');
                if (fs.existsSync(historyPath))
                    agent.history = fs.readFileSync(historyPath, 'utf8');
                manifest.agents[entry] = agent;
            }
        }
    }
    catch (err) {
        console.error(`Warning: could not read agents: ${err.message}`);
    }
    // Read skills
    const skillSources = [
        { dir: path.join(dest, '.copilot', 'skills'), layout: 'nested' },
        { dir: path.join(squadInfo.path, 'skills'), layout: 'nested' },
        { dir: path.join(dest, '.ai-team', 'skills'), layout: 'flat' },
    ];
    const skillsSource = skillSources.find(({ dir }) => fs.existsSync(dir));
    try {
        if (skillsSource) {
            for (const entry of fs.readdirSync(skillsSource.dir)) {
                const skillFile = skillsSource.layout === 'nested'
                    ? path.join(skillsSource.dir, entry, 'SKILL.md')
                    : path.join(skillsSource.dir, entry);
                if (fs.existsSync(skillFile)) {
                    manifest.skills.push(fs.readFileSync(skillFile, 'utf8'));
                }
            }
        }
    }
    catch (err) {
        console.error(`Warning: could not read skills: ${err.message}`);
    }
    // Determine output path
    const finalOutPath = outPath || path.join(dest, 'squad-export.json');
    try {
        fs.writeFileSync(finalOutPath, JSON.stringify(manifest, null, 2) + '\n');
    }
    catch (err) {
        fatal(`Failed to write export file: ${err.message}`);
    }
    const displayPath = path.relative(dest, finalOutPath) || path.basename(finalOutPath);
    success(`Exported squad to ${displayPath}`);
    warn('Review agent histories before sharing — they may contain project-specific information');
}
//# sourceMappingURL=export.js.map