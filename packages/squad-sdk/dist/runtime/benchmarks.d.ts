/**
 * M6-11: Performance profiling & benchmarks
 * Provides benchmark utilities to measure Squad operation timings.
 *
 * @module runtime/benchmarks
 */
/**
 * Result of a single benchmark run.
 */
export interface BenchmarkResult {
    /** Benchmark name */
    name: string;
    /** Number of iterations run */
    iterations: number;
    /** Average time in ms */
    avg: number;
    /** Minimum time in ms */
    min: number;
    /** Maximum time in ms */
    max: number;
    /** 95th percentile time in ms */
    p95: number;
    /** 99th percentile time in ms */
    p99: number;
}
/**
 * Timing summary returned by individual benchmark functions.
 */
export interface TimingResult {
    avg: number;
    min: number;
    max: number;
    p95: number;
}
/**
 * Full benchmark report returned by `runAll`.
 */
export interface BenchmarkReport {
    results: BenchmarkResult[];
    totalTime: number;
    timestamp: string;
}
/**
 * An async operation that can be benchmarked.
 */
export type BenchmarkFn = () => Promise<void> | void;
/**
 * Calculate percentile from a sorted array of numbers.
 */
export declare function percentile(sorted: number[], p: number): number;
/**
 * Measure the execution time of a function over N iterations and return stats.
 */
export declare function measureIterations(fn: BenchmarkFn, iterations: number): Promise<{
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
    timings: number[];
}>;
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
export declare class BenchmarkSuite {
    private benchmarks;
    constructor();
    /**
     * Register a custom benchmark.
     */
    register(name: string, fn: BenchmarkFn): void;
    /**
     * Unregister a benchmark by name.
     */
    unregister(name: string): boolean;
    /**
     * List all registered benchmark names.
     */
    list(): string[];
    /**
     * Benchmark config loading.
     */
    benchmarkConfigLoad(iterations: number): Promise<TimingResult>;
    /**
     * Benchmark charter compilation.
     */
    benchmarkCharterCompile(iterations: number): Promise<TimingResult>;
    /**
     * Benchmark routing operations.
     */
    benchmarkRouting(iterations: number): Promise<TimingResult>;
    /**
     * Benchmark model selection.
     */
    benchmarkModelSelection(iterations: number): Promise<TimingResult>;
    /**
     * Benchmark export/import round-trip.
     */
    benchmarkExportImport(iterations: number): Promise<TimingResult>;
    /**
     * Run all registered benchmarks and produce a full report.
     */
    runAll(iterations?: number): Promise<BenchmarkReport>;
    private configLoadOp;
    private charterCompileOp;
    private routingOp;
    private modelSelectionOp;
    private exportImportOp;
}
/**
 * Format benchmark results as a terminal-formatted table.
 */
export declare function formatBenchmarkReport(results: BenchmarkResult[]): string;
//# sourceMappingURL=benchmarks.d.ts.map