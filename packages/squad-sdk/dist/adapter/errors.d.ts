/**
 * SDK Error Hierarchy and Telemetry (M0-6, Issue #78)
 *
 * Wraps Copilot SDK errors with Squad-specific context and diagnostic information.
 * Provides a comprehensive error hierarchy for SDK-specific exceptions.
 * Includes basic telemetry hooks for latency tracking and error rate monitoring.
 *
 * @module adapter/errors
 */
/**
 * Error severity levels for classification and routing.
 */
export declare enum ErrorSeverity {
    /** Informational — no action needed, logged for awareness */
    INFO = "info",
    /** Warning — degraded functionality but operation can continue */
    WARNING = "warning",
    /** Error — operation failed but system remains stable */
    ERROR = "error",
    /** Critical — system stability at risk, requires immediate attention */
    CRITICAL = "critical"
}
/**
 * Error categories for diagnostic routing.
 */
export declare enum ErrorCategory {
    /** SDK connection or communication errors */
    SDK_CONNECTION = "sdk_connection",
    /** Session lifecycle errors (create, resume, close) */
    SESSION_LIFECYCLE = "session_lifecycle",
    /** Tool execution failures */
    TOOL_EXECUTION = "tool_execution",
    /** Model API call failures */
    MODEL_API = "model_api",
    /** Configuration errors */
    CONFIGURATION = "configuration",
    /** Authentication and authorization failures */
    AUTH = "auth",
    /** Rate limiting and quota errors */
    RATE_LIMIT = "rate_limit",
    /** Internal Squad runtime errors */
    RUNTIME = "runtime",
    /** Validation errors (invalid input) */
    VALIDATION = "validation",
    /** Unknown or uncategorized errors */
    UNKNOWN = "unknown"
}
/**
 * Diagnostic context for error reporting.
 * Includes metadata to help identify and resolve issues.
 */
export interface ErrorContext {
    /** Session ID where error occurred (if applicable) */
    sessionId?: string;
    /** Agent name (if applicable) */
    agentName?: string;
    /** Tool name (if tool execution error) */
    toolName?: string;
    /** Model being used (if model API error) */
    model?: string;
    /** Operation being performed when error occurred */
    operation?: string;
    /** Additional diagnostic data */
    metadata?: Record<string, unknown>;
    /** Stack trace from original error */
    originalStack?: string;
    /** Timestamp when error occurred */
    timestamp: Date;
}
/**
 * Base error class for all Squad SDK errors.
 * Wraps SDK exceptions with Squad context and diagnostic information.
 */
export declare class SquadError extends Error {
    readonly severity: ErrorSeverity;
    readonly category: ErrorCategory;
    readonly context: ErrorContext;
    readonly recoverable: boolean;
    readonly originalError?: Error;
    /**
     * Create a new Squad error.
     *
     * @param message - User-friendly error message
     * @param severity - Error severity level
     * @param category - Error category for routing
     * @param context - Diagnostic context
     * @param recoverable - Whether the operation can be retried
     * @param originalError - Original SDK error (if wrapping)
     */
    constructor(message: string, severity: ErrorSeverity, category: ErrorCategory, context: ErrorContext, recoverable?: boolean, originalError?: Error);
    /**
     * Convert error to JSON for logging/telemetry.
     */
    toJSON(): Record<string, unknown>;
    /**
     * Get user-friendly error message with context.
     */
    getUserMessage(): string;
}
/**
 * SDK connection error — failed to connect to Copilot SDK.
 */
export declare class SDKConnectionError extends SquadError {
    constructor(message: string, context: ErrorContext, originalError?: Error);
}
/**
 * Session lifecycle error — failed to create, resume, or close a session.
 */
export declare class SessionLifecycleError extends SquadError {
    constructor(message: string, context: ErrorContext, recoverable?: boolean, originalError?: Error);
}
/**
 * Tool execution error — custom tool failed during execution.
 */
export declare class ToolExecutionError extends SquadError {
    constructor(message: string, context: ErrorContext, originalError?: Error);
}
/**
 * Model API error — LLM API call failed.
 */
export declare class ModelAPIError extends SquadError {
    constructor(message: string, context: ErrorContext, recoverable?: boolean, originalError?: Error);
}
/**
 * Configuration error — invalid or missing configuration.
 */
export declare class ConfigurationError extends SquadError {
    constructor(message: string, context: ErrorContext, originalError?: Error);
}
/**
 * Authentication error — auth failure (token, permissions).
 */
export declare class AuthenticationError extends SquadError {
    constructor(message: string, context: ErrorContext, originalError?: Error);
}
/**
 * Rate limit error — API rate limit exceeded.
 */
export declare class RateLimitError extends SquadError {
    readonly retryAfter?: number;
    constructor(message: string, context: ErrorContext, retryAfter?: number, originalError?: Error);
    getUserMessage(): string;
}
/**
 * Runtime error — internal Squad runtime failure.
 */
export declare class RuntimeError extends SquadError {
    constructor(message: string, context: ErrorContext, originalError?: Error);
}
/**
 * Validation error — invalid input or parameters.
 */
export declare class ValidationError extends SquadError {
    constructor(message: string, context: ErrorContext, originalError?: Error);
}
/**
 * Factory for creating Squad errors from SDK errors.
 * Maps SDK error patterns to appropriate Squad error types.
 */
export declare class ErrorFactory {
    /**
     * Wrap an SDK error with Squad context.
     * Automatically detects error type and maps to appropriate Squad error class.
     *
     * @param error - Original SDK error
     * @param context - Squad diagnostic context
     * @returns Squad error with full context
     *
     * @example
     * ```typescript
     * try {
     *   await session.sendMessage({ prompt: 'Hello' });
     * } catch (err) {
     *   throw ErrorFactory.wrap(err, {
     *     sessionId: 'abc-123',
     *     operation: 'sendMessage',
     *     timestamp: new Date()
     *   });
     * }
     * ```
     */
    static wrap(error: unknown, context: Partial<ErrorContext>): SquadError;
}
/**
 * Telemetry data point for tracking operations.
 */
export interface TelemetryPoint {
    /** Operation name */
    operation: string;
    /** Duration in milliseconds */
    duration: number;
    /** Success or failure */
    success: boolean;
    /** Error category (if failed) */
    errorCategory?: ErrorCategory;
    /** Session ID */
    sessionId?: string;
    /** Agent name */
    agentName?: string;
    /** Additional metadata */
    metadata?: Record<string, unknown>;
    /** Timestamp */
    timestamp: Date;
}
/**
 * Telemetry handler function.
 */
export type TelemetryHandler = (point: TelemetryPoint) => void | Promise<void>;
/**
 * Telemetry collector for tracking latency and error rates.
 *
 * Usage:
 * ```typescript
 * const telemetry = new TelemetryCollector();
 *
 * // Register handler
 * telemetry.onData((point) => {
 *   console.log(`${point.operation}: ${point.duration}ms`);
 * });
 *
 * // Track operation
 * const stopwatch = telemetry.start('session.create', { sessionId: 'abc-123' });
 * try {
 *   await createSession();
 *   stopwatch.success();
 * } catch (err) {
 *   stopwatch.failure(err);
 * }
 * ```
 */
export declare class TelemetryCollector {
    private handlers;
    /**
     * Register a telemetry data handler.
     *
     * @param handler - Handler function to receive telemetry points
     * @returns Unsubscribe function
     */
    onData(handler: TelemetryHandler): () => void;
    /**
     * Start tracking an operation.
     *
     * @param operation - Operation name
     * @param context - Additional context
     * @returns Stopwatch object with success/failure methods
     */
    start(operation: string, context?: {
        sessionId?: string;
        agentName?: string;
        metadata?: Record<string, unknown>;
    }): {
        success: () => void;
        failure: (error: unknown) => void;
    };
    /**
     * Clear all handlers.
     */
    clear(): void;
}
//# sourceMappingURL=errors.d.ts.map