/**
 * Squad Observer — File watcher for .squad/ directory changes (Issue #268)
 *
 * Monitors the .squad/ directory for file changes and emits OTel spans
 * and EventBus events for real-time observability of squad state changes.
 * Ported from paulyuk/squad#1.
 *
 * @module runtime/squad-observer
 */
import fs from 'node:fs';
import path from 'node:path';
import { SpanStatusCode } from './otel-api.js';
import { getTracer } from './otel.js';
// ============================================================================
// Category classification
// ============================================================================
/**
 * Classify a file path within .squad/ into a category.
 */
export function classifyFile(relativePath) {
    const normalized = relativePath.replace(/\\/g, '/');
    if (normalized.startsWith('agents/'))
        return 'agent';
    if (normalized.startsWith('casting/'))
        return 'casting';
    if (normalized.startsWith('skills/'))
        return 'skill';
    if (normalized.startsWith('decisions/') || normalized === 'decisions.md')
        return 'decision';
    if (normalized === 'config.json' || normalized === 'team.md' || normalized.startsWith('config/'))
        return 'config';
    return 'unknown';
}
// ============================================================================
// Observer implementation
// ============================================================================
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
export class SquadObserver {
    config;
    watcher;
    debounceTimers = new Map();
    running = false;
    constructor(config) {
        this.config = {
            squadDir: config.squadDir,
            eventBus: config.eventBus,
            debounceMs: config.debounceMs ?? 200,
        };
    }
    /**
     * Start watching the .squad/ directory for changes.
     * Emits OTel spans and EventBus events for each detected change.
     */
    start() {
        if (this.running)
            return;
        if (!fs.existsSync(this.config.squadDir)) {
            throw new Error(`Squad directory not found: ${this.config.squadDir}`);
        }
        const tracer = getTracer('squad-observer');
        const span = tracer.startSpan('squad.observer.start', {
            attributes: {
                'squad.dir': this.config.squadDir,
                'debounce_ms': this.config.debounceMs,
            },
        });
        try {
            this.watcher = fs.watch(this.config.squadDir, { recursive: true }, (eventType, filename) => {
                if (!filename)
                    return;
                this.handleChange(eventType, filename);
            });
            this.watcher.on('error', (err) => {
                const errSpan = tracer.startSpan('squad.observer.error', {
                    attributes: { 'error.message': err.message },
                });
                errSpan.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
                errSpan.recordException(err);
                errSpan.end();
            });
            this.running = true;
            span.end();
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
            span.recordException(error);
            span.end();
            throw err;
        }
    }
    /**
     * Stop watching and clean up.
     */
    stop() {
        if (!this.running)
            return;
        const tracer = getTracer('squad-observer');
        const span = tracer.startSpan('squad.observer.stop');
        // Clear all pending debounce timers
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();
        this.watcher?.close();
        this.watcher = undefined;
        this.running = false;
        span.end();
    }
    /** Whether the observer is currently running. */
    get isRunning() {
        return this.running;
    }
    // --------------------------------------------------------------------------
    // Internal
    // --------------------------------------------------------------------------
    handleChange(eventType, filename) {
        // Debounce rapid changes to the same file
        const existing = this.debounceTimers.get(filename);
        if (existing)
            clearTimeout(existing);
        this.debounceTimers.set(filename, setTimeout(() => {
            this.debounceTimers.delete(filename);
            this.processChange(filename);
        }, this.config.debounceMs));
    }
    processChange(filename) {
        const absolutePath = path.join(this.config.squadDir, filename);
        const category = classifyFile(filename);
        const exists = fs.existsSync(absolutePath);
        // Determine change type — basic heuristic since fs.watch doesn't tell us
        const changeType = exists ? 'modified' : 'deleted';
        const change = {
            relativePath: filename,
            absolutePath,
            changeType,
            category,
            timestamp: new Date(),
        };
        // Emit OTel span
        this.emitSpan(change);
        // Emit EventBus event
        if (this.config.eventBus) {
            this.emitEvent(change);
        }
    }
    emitSpan(change) {
        const tracer = getTracer('squad-observer');
        const span = tracer.startSpan('squad.observer.file_change', {
            attributes: {
                'file.path': change.relativePath,
                'file.category': change.category,
                'change.type': change.changeType,
            },
        });
        span.end();
    }
    emitEvent(change) {
        if (!this.config.eventBus)
            return;
        // Map file categories to appropriate event types
        const event = {
            type: 'agent:milestone',
            agentName: change.category === 'agent' ? path.basename(path.dirname(change.relativePath)) : undefined,
            payload: {
                action: 'file_change',
                file: change.relativePath,
                category: change.category,
                changeType: change.changeType,
            },
            timestamp: change.timestamp,
        };
        // Fire and forget — errors handled by EventBus
        void this.config.eventBus.emit(event);
    }
}
//# sourceMappingURL=squad-observer.js.map