/**
 * Casting System (PRD 11 + M3-2)
 *
 * Runtime casting engine that generates agent personas from universe themes.
 * Typed config replaces static markdown definitions.
 *
 * v1 API (M3-2):  CastingEngine.castTeam(config) → CastMember[]
 * Legacy API:     CastingRegistry (filesystem-backed, stub)
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
export { CastingEngine, } from './casting-engine.js';
// Re-export casting history (M3-10)
export { CastingHistory, } from './casting-history.js';
// --- Legacy Casting Registry ---
export class CastingRegistry {
    entries = new Map();
    config;
    constructor(config) {
        this.config = config;
    }
    async load() {
        const registryPath = path.join(this.config.castingDir, 'registry.json');
        if (!fs.existsSync(registryPath))
            return;
        const raw = fs.readFileSync(registryPath, 'utf-8');
        const entries = JSON.parse(raw);
        for (const entry of entries) {
            this.entries.set(entry.role, entry);
        }
    }
    getByRole(role) {
        return this.entries.get(role);
    }
    getAllEntries() {
        return Array.from(this.entries.values());
    }
    async cast(role, _universe) {
        throw new Error('Not implemented');
    }
    async recast(_universe) {
        throw new Error('Not implemented');
    }
}
//# sourceMappingURL=index.js.map