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
/** A rate limit sample from API response headers */
export interface RateSample {
    timestamp: number;
    remaining: number;
    limit: number;
}
/** Traffic light state for rate-aware scheduling */
export type TrafficLight = 'green' | 'amber' | 'red';
/** Agent priority for quota allocation */
export type AgentPriority = 0 | 1 | 2;
/**
 * Determine traffic light from rate limit headers.
 */
export declare function getTrafficLight(remaining: number, limit: number): TrafficLight;
/**
 * Check if an agent should proceed based on traffic light and priority.
 * - GREEN: all agents proceed
 * - AMBER: only P0 agents proceed
 * - RED: no agents proceed
 */
export declare function shouldProceed(light: TrafficLight, priority: AgentPriority): boolean;
/**
 * Get retry delay with priority-based jitter windows.
 * Higher priority agents retry sooner with smaller windows.
 */
export declare function getRetryDelay(priority: AgentPriority, attempt: number): number;
/**
 * Predictive circuit breaker that opens BEFORE rate limit errors.
 *
 * Tracks the last N rate limit samples and uses linear regression
 * to predict when quota will be exhausted. If predicted ETA is
 * below the warning threshold, the circuit opens preemptively.
 */
export declare class PredictiveCircuitBreaker {
    private samples;
    private readonly maxSamples;
    private readonly warningThresholdSeconds;
    constructor(options?: {
        maxSamples?: number;
        warningThresholdSeconds?: number;
    });
    /** Record a rate limit sample from API response headers */
    addSample(remaining: number, limit: number): void;
    /** Get all recorded samples (for testing/debugging) */
    getSamples(): readonly RateSample[];
    /**
     * Predict seconds until quota exhaustion using the observed
     * consumption rate between the first and last recorded samples.
     * Returns null if insufficient data or quota is not being consumed.
     */
    predictExhaustion(): number | null;
    /**
     * Should the circuit open preemptively?
     * Returns true when predicted ETA to exhaustion is below threshold.
     */
    shouldOpen(): boolean;
    /** Reset all samples (e.g., after rate limit window resets) */
    reset(): void;
}
/** Rate pool allocation for cooperative multi-agent quota management */
export interface RatePoolAllocation {
    priority: AgentPriority;
    allocated: number;
    used: number;
    leaseExpiry: string;
}
/** Shared rate pool state */
export interface RatePool {
    totalLimit: number;
    resetAt: string;
    allocations: Record<string, RatePoolAllocation>;
}
/**
 * Check if an agent has remaining quota in the cooperative pool.
 * Pure read — no side effects.
 */
export declare function canUseQuota(pool: RatePool, agentName: string): boolean;
/**
 * Consume one unit of quota for an agent.
 * Also reclaims stale leases from other crashed agents so their
 * unused allocation is freed for the pool.
 * Call this after canUseQuota() confirms there is quota available.
 */
export declare function consumeQuota(pool: RatePool, agentName: string): void;
/**
 * Load rate pool state from the shared file.
 */
export declare function loadRatePool(teamRoot?: string): Promise<RatePool | null>;
//# sourceMappingURL=rate-limiting.d.ts.map