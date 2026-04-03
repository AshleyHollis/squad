/**
 * Predictive Circuit Breaker — Rate Limit Protection
 *
 * Opens the circuit BEFORE getting a 429 by predicting when
 * API quota will be exhausted. Prediction uses the observed
 * consumption rate between the oldest and newest samples
 * (first-to-last delta), not a full least-squares regression.
 *
 * @see https://github.com/bradygaster/squad/issues/515
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
/** Priority-based retry windows (ms) */
const RETRY_WINDOWS = {
    0: [500, 5_000], // P0 (Lead): 500ms–5s
    1: [2_000, 30_000], // P1 (Specialists): 2s–30s
    2: [5_000, 60_000], // P2 (Ralph/Scribe): 5s–60s
};
/**
 * Determine traffic light from rate limit headers.
 */
export function getTrafficLight(remaining, limit) {
    if (limit === 0)
        return 'red';
    const pct = remaining / limit;
    if (pct > 0.20)
        return 'green';
    if (pct > 0.05)
        return 'amber';
    return 'red';
}
/**
 * Check if an agent should proceed based on traffic light and priority.
 * - GREEN: all agents proceed
 * - AMBER: only P0 agents proceed
 * - RED: no agents proceed
 */
export function shouldProceed(light, priority) {
    if (light === 'green')
        return true;
    if (light === 'amber')
        return priority === 0;
    return false;
}
/**
 * Get retry delay with priority-based jitter windows.
 * Higher priority agents retry sooner with smaller windows.
 */
export function getRetryDelay(priority, attempt) {
    const [min, max] = RETRY_WINDOWS[priority] ?? RETRY_WINDOWS[2];
    const base = Math.min(min * Math.pow(2, attempt), max);
    const jitter = Math.random() * base * 0.5;
    return Math.round(base + jitter);
}
/**
 * Predictive circuit breaker that opens BEFORE rate limit errors.
 *
 * Tracks the last N rate limit samples and uses linear regression
 * to predict when quota will be exhausted. If predicted ETA is
 * below the warning threshold, the circuit opens preemptively.
 */
export class PredictiveCircuitBreaker {
    samples = [];
    maxSamples;
    warningThresholdSeconds;
    constructor(options) {
        this.maxSamples = options?.maxSamples ?? 10;
        this.warningThresholdSeconds = options?.warningThresholdSeconds ?? 120;
    }
    /** Record a rate limit sample from API response headers */
    addSample(remaining, limit) {
        this.samples.push({ timestamp: Date.now(), remaining, limit });
        if (this.samples.length > this.maxSamples) {
            this.samples.shift();
        }
    }
    /** Get all recorded samples (for testing/debugging) */
    getSamples() {
        return this.samples;
    }
    /**
     * Predict seconds until quota exhaustion using the observed
     * consumption rate between the first and last recorded samples.
     * Returns null if insufficient data or quota is not being consumed.
     */
    predictExhaustion() {
        if (this.samples.length < 3)
            return null;
        const n = this.samples.length;
        const first = this.samples[0];
        const last = this.samples[n - 1];
        const elapsedMs = last.timestamp - first.timestamp;
        if (elapsedMs === 0)
            return null;
        const consumed = first.remaining - last.remaining;
        if (consumed <= 0)
            return null; // Not consuming or recovering
        const consumedPerMs = consumed / elapsedMs;
        const msUntilExhausted = last.remaining / consumedPerMs;
        return msUntilExhausted / 1000;
    }
    /**
     * Should the circuit open preemptively?
     * Returns true when predicted ETA to exhaustion is below threshold.
     */
    shouldOpen() {
        const eta = this.predictExhaustion();
        if (eta === null)
            return false;
        return eta < this.warningThresholdSeconds;
    }
    /** Reset all samples (e.g., after rate limit window resets) */
    reset() {
        this.samples = [];
    }
}
/**
 * Check if an agent has remaining quota in the cooperative pool.
 * Pure read — no side effects.
 */
export function canUseQuota(pool, agentName) {
    const alloc = pool.allocations[agentName];
    if (!alloc)
        return true; // Unknown agent — allow gracefully
    return alloc.used < alloc.allocated;
}
/**
 * Consume one unit of quota for an agent.
 * Also reclaims stale leases from other crashed agents so their
 * unused allocation is freed for the pool.
 * Call this after canUseQuota() confirms there is quota available.
 */
export function consumeQuota(pool, agentName) {
    const alloc = pool.allocations[agentName];
    if (!alloc)
        return; // Unknown agent — nothing to consume
    // Reclaim stale leases from other agents
    const now = new Date();
    for (const [name, a] of Object.entries(pool.allocations)) {
        if (new Date(a.leaseExpiry) < now && name !== agentName) {
            a.allocated = 0;
        }
    }
    alloc.used++;
}
/**
 * Load rate pool state from the shared file.
 */
export async function loadRatePool(teamRoot) {
    const candidates = [];
    if (teamRoot) {
        candidates.push(path.join(teamRoot, '.squad', 'rate-pool.json'));
    }
    candidates.push(path.join(os.homedir(), '.squad', 'rate-pool.json'));
    for (const candidate of candidates) {
        if (existsSync(candidate)) {
            try {
                const raw = await readFile(candidate, 'utf8');
                return JSON.parse(raw);
            }
            catch {
                // Malformed — skip
            }
        }
    }
    return null;
}
//# sourceMappingURL=rate-limiting.js.map