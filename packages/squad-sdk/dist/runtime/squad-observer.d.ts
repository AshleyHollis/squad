/**
 * Squad Observer — File watcher for .squad/ directory changes (Issue #268)
 *
 * Monitors the .squad/ directory for file changes and emits OTel spans
 * and EventBus events for real-time observability of squad state changes.
 * Ported from paulyuk/squad#1.
 *
 * @module runtime/squad-observer
 */
import { EventBus } from './event-bus.js';
/** Categories of .squad/ file changes. */
export type SquadFileCategory = 'agent' | 'casting' | 'config' | 'decision' | 'skill' | 'unknown';
/** A detected file change in the .squad/ directory. */
export interface SquadFileChange {
    /** Relative path from .squad/ root */
    relativePath: string;
    /** Absolute path on disk */
    absolutePath: string;
    /** Type of change */
    changeType: 'created' | 'modified' | 'deleted';
    /** Category of the changed file */
    category: SquadFileCategory;
    /** Timestamp of detection */
    timestamp: Date;
}
/** Configuration for the observer. */
export interface SquadObserverConfig {
    /** Path to the .squad/ directory to watch */
    squadDir: string;
    /** Optional EventBus to emit events to */
    eventBus?: EventBus;
    /** Debounce interval in ms (default: 200) */
    debounceMs?: number;
}
/**
 * Classify a file path within .squad/ into a category.
 */
export declare function classifyFile(relativePath: string): SquadFileCategory;
/**
 * File watcher that monitors .squad/ directory and emits OTel events.
 *
 * Usage:
 * ```typescript
 * const observer = new SquadObserver({
 *   squadDir: '/path/to/.squad',
 *   eventBus: myEventBus,
 * });
 * observer.start();
 * // ... later
 * observer.stop();
 * ```
 */
export declare class SquadObserver {
    private config;
    private watcher;
    private debounceTimers;
    private running;
    constructor(config: SquadObserverConfig);
    /**
     * Start watching the .squad/ directory for changes.
     * Emits OTel spans and EventBus events for each detected change.
     */
    start(): void;
    /**
     * Stop watching and clean up.
     */
    stop(): void;
    /** Whether the observer is currently running. */
    get isRunning(): boolean;
    private handleChange;
    private processChange;
    private emitSpan;
    private emitEvent;
}
//# sourceMappingURL=squad-observer.d.ts.map