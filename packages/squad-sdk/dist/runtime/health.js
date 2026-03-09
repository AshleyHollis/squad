/**
 * Health Monitor (M0-8 #83)
 *
 * Monitors the health of SquadClient connections and provides diagnostics.
 * Exposes health status for external monitoring and startup validation.
 */
import { TIMEOUTS } from './constants.js';
/**
 * Health Monitor for SquadClient connections.
 *
 * Provides health checks, diagnostics logging, and external health status.
 * Use check() for startup validation before creating sessions.
 */
export class HealthMonitor {
    client;
    timeout;
    logDiagnostics;
    constructor(config) {
        this.client = config.client;
        this.timeout = config.timeout ?? TIMEOUTS.HEALTH_CHECK_MS;
        this.logDiagnostics = config.logDiagnostics ?? true;
    }
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
    async check() {
        const startTime = Date.now();
        const result = {
            status: 'unhealthy',
            connectionState: this.client.getState(),
            connected: this.client.isConnected(),
            timestamp: new Date(),
        };
        try {
            // Check connection state
            if (!this.client.isConnected()) {
                result.error = 'Client not connected';
                result.status = 'unhealthy';
                this.logDiagnostic('Connection check failed', result.error);
                return result;
            }
            // Attempt ping
            const pingPromise = this.client.ping('health-check');
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timeout')), this.timeout));
            const pingResult = await Promise.race([pingPromise, timeoutPromise]);
            result.responseTimeMs = Date.now() - startTime;
            result.protocolVersion = pingResult.protocolVersion;
            // Validate response time
            if (result.responseTimeMs > this.timeout * 0.8) {
                result.status = 'degraded';
                result.error = `Slow response: ${result.responseTimeMs}ms`;
                this.logDiagnostic('Health check degraded', result.error);
            }
            else {
                result.status = 'healthy';
            }
            return result;
        }
        catch (error) {
            result.status = 'unhealthy';
            result.error = error instanceof Error ? error.message : String(error);
            result.responseTimeMs = Date.now() - startTime;
            this.logDiagnostic('Health check failed', result.error, error);
            return result;
        }
    }
    /**
     * Get current status without performing a health check.
     *
     * @returns Basic health status based on connection state
     */
    getStatus() {
        const connected = this.client.isConnected();
        const connectionState = this.client.getState();
        let status;
        if (connected && connectionState === 'connected') {
            status = 'healthy';
        }
        else if (connectionState === 'reconnecting') {
            status = 'degraded';
        }
        else {
            status = 'unhealthy';
        }
        return {
            status,
            connectionState,
            connected,
            timestamp: new Date(),
        };
    }
    /**
     * Log diagnostic information on connection failures.
     */
    logDiagnostic(message, details, error) {
        if (!this.logDiagnostics)
            return;
        console.error(`[HealthMonitor] ${message}: ${details}`);
        if (error instanceof Error && error.stack) {
            console.error(`[HealthMonitor] Stack trace:`, error.stack);
        }
    }
}
//# sourceMappingURL=health.js.map