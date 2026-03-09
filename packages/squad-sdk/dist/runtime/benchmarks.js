/**
 * M6-11: Performance profiling & benchmarks
 * Provides benchmark utilities to measure Squad operation timings.
 *
 * @module runtime/benchmarks
 */
// ============================================================================
// Helpers
// ============================================================================
/**
 * Calculate percentile from a sorted array of numbers.
 */
export function percentile(sorted, p) {
    if (sorted.length === 0)
        return 0;
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
}
/**
 * Measure the execution time of a function over N iterations and return stats.
 */
export async function measureIterations(fn, iterations) {
    if (iterations < 1) {
        throw new Error('Iterations must be at least 1');
    }
    const timings = [];
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await fn();
        const end = performance.now();
        timings.push(end - start);
    }
    timings.sort((a, b) => a - b);
    const sum = timings.reduce((a, b) => a + b, 0);
    return {
        avg: sum / timings.length,
        min: timings[0],
        max: timings[timings.length - 1],
        p95: percentile(timings, 95),
        p99: percentile(timings, 99),
        timings,
    };
}
// ============================================================================
// BenchmarkSuite
// ============================================================================
/**
 * Runs performance benchmarks on Squad operations.
 *
 * Usage:
 * ```ts
 * const suite = new BenchmarkSuite();
 * const report = await suite.runAll(100);
 * console.log(formatBenchmarkReport(report.results));
 * ```
 */
export class BenchmarkSuite {
    benchmarks = new Map();
    constructor() {
        // Register built-in benchmarks
        this.benchmarks.set('configLoad', () => this.configLoadOp());
        this.benchmarks.set('charterCompile', () => this.charterCompileOp());
        this.benchmarks.set('routing', () => this.routingOp());
        this.benchmarks.set('modelSelection', () => this.modelSelectionOp());
        this.benchmarks.set('exportImport', () => this.exportImportOp());
    }
    /**
     * Register a custom benchmark.
     */
    register(name, fn) {
        this.benchmarks.set(name, fn);
    }
    /**
     * Unregister a benchmark by name.
     */
    unregister(name) {
        return this.benchmarks.delete(name);
    }
    /**
     * List all registered benchmark names.
     */
    list() {
        return [...this.benchmarks.keys()];
    }
    /**
     * Benchmark config loading.
     */
    async benchmarkConfigLoad(iterations) {
        const stats = await measureIterations(() => this.configLoadOp(), iterations);
        return { avg: stats.avg, min: stats.min, max: stats.max, p95: stats.p95 };
    }
    /**
     * Benchmark charter compilation.
     */
    async benchmarkCharterCompile(iterations) {
        const stats = await measureIterations(() => this.charterCompileOp(), iterations);
        return { avg: stats.avg, min: stats.min, max: stats.max, p95: stats.p95 };
    }
    /**
     * Benchmark routing operations.
     */
    async benchmarkRouting(iterations) {
        const stats = await measureIterations(() => this.routingOp(), iterations);
        return { avg: stats.avg, min: stats.min, max: stats.max, p95: stats.p95 };
    }
    /**
     * Benchmark model selection.
     */
    async benchmarkModelSelection(iterations) {
        const stats = await measureIterations(() => this.modelSelectionOp(), iterations);
        return { avg: stats.avg, min: stats.min, max: stats.max, p95: stats.p95 };
    }
    /**
     * Benchmark export/import round-trip.
     */
    async benchmarkExportImport(iterations) {
        const stats = await measureIterations(() => this.exportImportOp(), iterations);
        return { avg: stats.avg, min: stats.min, max: stats.max, p95: stats.p95 };
    }
    /**
     * Run all registered benchmarks and produce a full report.
     */
    async runAll(iterations = 100) {
        const totalStart = performance.now();
        const results = [];
        for (const [name, fn] of this.benchmarks) {
            const stats = await measureIterations(fn, iterations);
            results.push({
                name,
                iterations,
                avg: stats.avg,
                min: stats.min,
                max: stats.max,
                p95: stats.p95,
                p99: stats.p99,
            });
        }
        const totalTime = performance.now() - totalStart;
        return {
            results,
            totalTime,
            timestamp: new Date().toISOString(),
        };
    }
    // -- Internal operations simulating real Squad work --
    configLoadOp() {
        // Simulate config parsing: build and validate a config-like object
        const config = {
            version: '1.0.0',
            models: { defaultModel: 'claude-sonnet-4.5', defaultTier: 'standard', fallbackChains: { premium: [], standard: [], fast: [] } },
            routing: { rules: [{ workType: 'feature-dev', agents: ['@coordinator'] }] },
        };
        JSON.parse(JSON.stringify(config));
    }
    charterCompileOp() {
        // Simulate agent charter compilation from markdown
        const charter = `# Agent Charter\n\n## Role\nCore developer\n\n## Skills\n- TypeScript\n- Testing\n\n## Rules\n1. Follow conventions\n2. Write tests`;
        const lines = charter.split('\n');
        const sections = {};
        let current = '';
        for (const line of lines) {
            if (line.startsWith('## ')) {
                current = line.slice(3).trim().toLowerCase();
                sections[current] = [];
            }
            else if (current) {
                sections[current].push(line);
            }
        }
        JSON.stringify(sections);
    }
    routingOp() {
        // Simulate routing rule evaluation
        const rules = [
            { workType: 'feature-dev', agents: ['fenster'], patterns: [/feature/i, /feat/i] },
            { workType: 'bug-fix', agents: ['kujan'], patterns: [/bug/i, /fix/i] },
            { workType: 'testing', agents: ['verbal'], patterns: [/test/i, /spec/i] },
            { workType: 'documentation', agents: ['mcmanus'], patterns: [/doc/i, /readme/i] },
        ];
        const input = 'Implement a new feature for the routing module';
        for (const rule of rules) {
            for (const pattern of rule.patterns) {
                if (pattern.test(input))
                    break;
            }
        }
    }
    modelSelectionOp() {
        // Simulate model selection logic
        const tiers = {
            premium: ['claude-opus-4.6', 'gpt-5.2'],
            standard: ['claude-sonnet-4.5', 'gpt-5.1-codex'],
            fast: ['claude-haiku-4.5', 'gpt-5-mini'],
        };
        const role = 'developer';
        const complexity = 7;
        const tier = complexity > 8 ? 'premium' : complexity > 4 ? 'standard' : 'fast';
        const models = tiers[tier];
        const _selected = models[0];
        void _selected;
        void role;
    }
    exportImportOp() {
        // Simulate export → serialize → deserialize → import round-trip
        const bundle = {
            config: { version: '1.0.0', models: {}, routing: { rules: [] } },
            agents: [{ name: 'fenster', role: 'developer', content: '# Fenster' }],
            skills: ['typescript', 'testing'],
            routingRules: [{ pattern: 'feature/*', agent: 'fenster' }],
            metadata: { version: '1.0.0', timestamp: new Date().toISOString(), source: 'test' },
        };
        const serialized = JSON.stringify(bundle);
        JSON.parse(serialized);
    }
}
// ============================================================================
// Report Formatting
// ============================================================================
/**
 * Format benchmark results as a terminal-formatted table.
 */
export function formatBenchmarkReport(results) {
    if (results.length === 0) {
        return 'No benchmark results to display.';
    }
    const COL_NAME = 24;
    const COL_NUM = 12;
    const header = [
        'Name'.padEnd(COL_NAME),
        'Iter'.padStart(COL_NUM),
        'Avg (ms)'.padStart(COL_NUM),
        'Min (ms)'.padStart(COL_NUM),
        'Max (ms)'.padStart(COL_NUM),
        'P95 (ms)'.padStart(COL_NUM),
        'P99 (ms)'.padStart(COL_NUM),
    ].join('  ');
    const separator = '─'.repeat(header.length);
    const rows = results.map((r) => {
        return [
            r.name.padEnd(COL_NAME),
            String(r.iterations).padStart(COL_NUM),
            r.avg.toFixed(3).padStart(COL_NUM),
            r.min.toFixed(3).padStart(COL_NUM),
            r.max.toFixed(3).padStart(COL_NUM),
            r.p95.toFixed(3).padStart(COL_NUM),
            r.p99.toFixed(3).padStart(COL_NUM),
        ].join('  ');
    });
    return [separator, header, separator, ...rows, separator].join('\n');
}
//# sourceMappingURL=benchmarks.js.map