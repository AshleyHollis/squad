/**
 * Health Monitor (M0-8 #83)
 *
 * Monitors the health of SquadClient connections and provides diagnostics.
 * Exposes health status for external monitoring and startup validation.
 */
import type { SquadClient } from '../adapter/client.js';
export interface HealthCheckResult {
    /** Overall health status */
    status: 'healthy' | 'degraded' | 'unhealthy';
    /** Connection state */
    connectionState: string;
    /** Whether the client is connected */
    connected: boolean;
    /** Error message if unhealthy */
    error?: string;
    /** Protocol version if available */
    protocolVersion?: number;
    /** Timestamp of the check */
    timestamp: Date;
    /** Response time in milliseconds */
    responseTimeMs?: number;
}
export interface HealthMonitorConfig {
    /** Client to monitor */
    client: SquadClient;
    /** Timeout for health checks in milliseconds (default: 5000) */
    timeout?: number;
    /** Log diagnostic information on failures */
    logDiagnostics?: boolean;
}
/**
 * Health Monitor for SquadClient connections.
 *
 * Provides health checks, diagnostics logging, and external health status.
 * Use check() for startup validation before creating sessions.
 */
export declare class HealthMonitor {
    private client;
    private timeout;
    private logDiagnostics;
    constructor(config: HealthMonitorConfig);
    /**
     * Perform a health check on the client connection.
     *
     * This method:
     * 1. Checks connection state
     * 2. Attempts a ping if connected
     * 3. Validates protocol version
     * 4. Logs diagnostics on failure
     *
     * @returns Health check result with status and diagnostics
     */
    check(): Promise<HealthCheckResult>;
    /**
     * Get current status without performing a health check.
     *
     * @returns Basic health status based on connection state
     */
    getStatus(): Pick<HealthCheckResult, 'status' | 'connectionState' | 'connected' | 'timestamp'>;
    /**
     * Log diagnostic information on connection failures.
     */
    private logDiagnostic;
}
//# sourceMappingURL=health.d.ts.map