/**
 * Conflict Resolution on Import (M5-9, Issue #133)
 */
// --- Detection ---
/** Flatten an object into dotted key paths. */
function flattenObject(obj, prefix = '') {
    const result = new Map();
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            for (const [k, v] of flattenObject(value, fullKey)) {
                result.set(k, v);
            }
        }
        else {
            result.set(fullKey, value);
        }
    }
    return result;
}
function valuesEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
/** Detect conflicts between an existing config and an incoming bundle. */
export function detectConflicts(existing, incoming) {
    const conflicts = [];
    const existingFlat = flattenObject(existing);
    const incomingFlat = flattenObject(incoming.config);
    // Check incoming keys against existing
    for (const [path, incomingValue] of incomingFlat) {
        const existingValue = existingFlat.get(path);
        if (existingValue === undefined) {
            conflicts.push({ path, existingValue: undefined, incomingValue, type: 'added' });
        }
        else if (!valuesEqual(existingValue, incomingValue)) {
            conflicts.push({ path, existingValue, incomingValue, type: 'modified' });
        }
    }
    // Check for keys in existing that are missing from incoming (removed)
    for (const [path, existingValue] of existingFlat) {
        if (!incomingFlat.has(path)) {
            conflicts.push({ path, existingValue, incomingValue: undefined, type: 'removed' });
        }
    }
    return conflicts;
}
// --- Resolution ---
/** Resolve conflicts using the given strategy. Returns a merged SquadConfig. */
export function resolveConflicts(existing, conflicts, strategy) {
    if (strategy === 'keep-existing') {
        return { ...existing };
    }
    if (strategy === 'manual') {
        return { ...existing };
    }
    // Clone via JSON round-trip
    const result = JSON.parse(JSON.stringify(existing));
    for (const conflict of conflicts) {
        if (strategy === 'use-incoming') {
            if (conflict.type === 'removed') {
                deletePath(result, conflict.path);
            }
            else {
                setPath(result, conflict.path, conflict.incomingValue);
            }
        }
        else if (strategy === 'merge') {
            if (conflict.type === 'added') {
                setPath(result, conflict.path, conflict.incomingValue);
            }
            // 'modified' keeps existing, 'removed' keeps existing
        }
    }
    return result;
}
// --- Report ---
/** Generate a human-readable markdown conflict report. */
export function generateConflictReport(conflicts) {
    if (conflicts.length === 0)
        return '# Conflict Report\n\nNo conflicts detected.\n';
    const lines = [
        '# Conflict Report',
        '',
        `**${conflicts.length}** conflict(s) detected.`,
        '',
        '| # | Path | Type | Existing | Incoming |',
        '|---|------|------|----------|----------|',
    ];
    let i = 1;
    for (const c of conflicts) {
        const existing = c.existingValue === undefined ? '_(none)_' : `\`${JSON.stringify(c.existingValue)}\``;
        const incoming = c.incomingValue === undefined ? '_(none)_' : `\`${JSON.stringify(c.incomingValue)}\``;
        lines.push(`| ${i++} | \`${c.path}\` | ${c.type} | ${existing} | ${incoming} |`);
    }
    lines.push('');
    return lines.join('\n');
}
// --- Helpers ---
function setPath(obj, dotPath, value) {
    const parts = dotPath.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current) || typeof current[part] !== 'object') {
            current[part] = {};
        }
        current = current[part];
    }
    current[parts[parts.length - 1]] = value;
}
function deletePath(obj, dotPath) {
    const parts = dotPath.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current) || typeof current[part] !== 'object') {
            return;
        }
        current = current[part];
    }
    delete current[parts[parts.length - 1]];
}
//# sourceMappingURL=conflicts.js.map