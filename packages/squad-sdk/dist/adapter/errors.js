/**
 * SDK Error Hierarchy and Telemetry (M0-6, Issue #78)
 *
 * Wraps Copilot SDK errors with Squad-specific context and diagnostic information.
 * Provides a comprehensive error hierarchy for SDK-specific exceptions.
 * Includes basic telemetry hooks for latency tracking and error rate monitoring.
 *
 * @module adapter/errors
 */
// ============================================================================
// Base Error Types
// ============================================================================
/**
 * Error severity levels for classification and routing.
 */
export var ErrorSeverity;
(function (ErrorSeverity) {
    /** Informational — no action needed, logged for awareness */
    ErrorSeverity["INFO"] = "info";
    /** Warning — degraded functionality but operation can continue */
    ErrorSeverity["WARNING"] = "warning";
    /** Error — operation failed but system remains stable */
    ErrorSeverity["ERROR"] = "error";
    /** Critical — system stability at risk, requires immediate attention */
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (ErrorSeverity = {}));
/**
 * Error categories for diagnostic routing.
 */
export var ErrorCategory;
(function (ErrorCategory) {
    /** SDK connection or communication errors */
    ErrorCategory["SDK_CONNECTION"] = "sdk_connection";
    /** Session lifecycle errors (create, resume, close) */
    ErrorCategory["SESSION_LIFECYCLE"] = "session_lifecycle";
    /** Tool execution failures */
    ErrorCategory["TOOL_EXECUTION"] = "tool_execution";
    /** Model API call failures */
    ErrorCategory["MODEL_API"] = "model_api";
    /** Configuration errors */
    ErrorCategory["CONFIGURATION"] = "configuration";
    /** Authentication and authorization failures */
    ErrorCategory["AUTH"] = "auth";
    /** Rate limiting and quota errors */
    ErrorCategory["RATE_LIMIT"] = "rate_limit";
    /** Internal Squad runtime errors */
    ErrorCategory["RUNTIME"] = "runtime";
    /** Validation errors (invalid input) */
    ErrorCategory["VALIDATION"] = "validation";
    /** Unknown or uncategorized errors */
    ErrorCategory["UNKNOWN"] = "unknown";
})(ErrorCategory || (ErrorCategory = {}));
/**
 * Base error class for all Squad SDK errors.
 * Wraps SDK exceptions with Squad context and diagnostic information.
 */
export class SquadError extends Error {
    severity;
    category;
    context;
    recoverable;
    originalError;
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
    constructor(message, severity, category, context, recoverable = false, originalError) {
        super(message);
        this.name = 'SquadError';
        this.severity = severity;
        this.category = category;
        this.context = context;
        this.recoverable = recoverable;
        this.originalError = originalError;
        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        // Preserve original stack if available
        if (originalError?.stack) {
            this.context.originalStack = originalError.stack;
        }
    }
    /**
     * Convert error to JSON for logging/telemetry.
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            severity: this.severity,
            category: this.category,
            recoverable: this.recoverable,
            context: this.context,
            stack: this.stack,
            originalError: this.originalError?.message
        };
    }
    /**
     * Get user-friendly error message with context.
     */
    getUserMessage() {
        const parts = [this.message];
        if (this.context.sessionId) {
            parts.push(`(Session: ${this.context.sessionId})`);
        }
        if (this.context.agentName) {
            parts.push(`(Agent: ${this.context.agentName})`);
        }
        if (this.recoverable) {
            parts.push('— This error is recoverable. You may retry the operation.');
        }
        return parts.join(' ');
    }
}
// ============================================================================
// Specific Error Types
// ============================================================================
/**
 * SDK connection error — failed to connect to Copilot SDK.
 */
export class SDKConnectionError extends SquadError {
    constructor(message, context, originalError) {
        super(message, ErrorSeverity.ERROR, ErrorCategory.SDK_CONNECTION, context, true, originalError);
        this.name = 'SDKConnectionError';
    }
}
/**
 * Session lifecycle error — failed to create, resume, or close a session.
 */
export class SessionLifecycleError extends SquadError {
    constructor(message, context, recoverable = false, originalError) {
        super(message, ErrorSeverity.ERROR, ErrorCategory.SESSION_LIFECYCLE, context, recoverable, originalError);
        this.name = 'SessionLifecycleError';
    }
}
/**
 * Tool execution error — custom tool failed during execution.
 */
export class ToolExecutionError extends SquadError {
    constructor(message, context, originalError) {
        super(message, ErrorSeverity.ERROR, ErrorCategory.TOOL_EXECUTION, context, false, originalError);
        this.name = 'ToolExecutionError';
    }
}
/**
 * Model API error — LLM API call failed.
 */
export class ModelAPIError extends SquadError {
    constructor(message, context, recoverable = true, originalError) {
        super(message, ErrorSeverity.ERROR, ErrorCategory.MODEL_API, context, recoverable, originalError);
        this.name = 'ModelAPIError';
    }
}
/**
 * Configuration error — invalid or missing configuration.
 */
export class ConfigurationError extends SquadError {
    constructor(message, context, originalError) {
        super(message, ErrorSeverity.ERROR, ErrorCategory.CONFIGURATION, context, false, originalError);
        this.name = 'ConfigurationError';
    }
}
/**
 * Authentication error — auth failure (token, permissions).
 */
export class AuthenticationError extends SquadError {
    constructor(message, context, originalError) {
        super(message, ErrorSeverity.CRITICAL, ErrorCategory.AUTH, context, false, originalError);
        this.name = 'AuthenticationError';
    }
}
/**
 * Rate limit error — API rate limit exceeded.
 */
export class RateLimitError extends SquadError {
    retryAfter;
    constructor(message, context, retryAfter, originalError) {
        super(message, ErrorSeverity.WARNING, ErrorCategory.RATE_LIMIT, context, true, originalError);
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
    getUserMessage() {
        const baseMessage = super.getUserMessage();
        if (this.retryAfter) {
            return `${baseMessage} Retry after ${this.retryAfter} seconds.`;
        }
        return baseMessage;
    }
}
/**
 * Runtime error — internal Squad runtime failure.
 */
export class RuntimeError extends SquadError {
    constructor(message, context, originalError) {
        super(message, ErrorSeverity.CRITICAL, ErrorCategory.RUNTIME, context, false, originalError);
        this.name = 'RuntimeError';
    }
}
/**
 * Validation error — invalid input or parameters.
 */
export class ValidationError extends SquadError {
    constructor(message, context, originalError) {
        super(message, ErrorSeverity.ERROR, ErrorCategory.VALIDATION, context, false, originalError);
        this.name = 'ValidationError';
    }
}
// ============================================================================
// Error Factory
// ============================================================================
/**
 * Factory for creating Squad errors from SDK errors.
 * Maps SDK error patterns to appropriate Squad error types.
 */
export class ErrorFactory {
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
    static wrap(error, context) {
        const fullContext = {
            timestamp: new Date(),
            ...context
        };
        const originalError = error instanceof Error ? error : undefined;
        const message = originalError?.message ?? String(error);
        // Pattern matching on error message to categorize
        if (message.includes('connection') || message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT')) {
            return new SDKConnectionError(`Failed to connect to Copilot SDK: ${message}`, fullContext, originalError);
        }
        if (message.includes('session') && (message.includes('create') || message.includes('resume'))) {
            return new SessionLifecycleError(`Session lifecycle error: ${message}`, fullContext, true, originalError);
        }
        if (message.includes('auth') || message.includes('token') || message.includes('unauthorized')) {
            return new AuthenticationError(`Authentication failed: ${message}`, fullContext, originalError);
        }
        if (message.includes('rate limit') || message.includes('429') || message.includes('quota')) {
            const retryMatch = message.match(/retry after (\d+)/i);
            const retryAfter = retryMatch ? parseInt(retryMatch[1], 10) : undefined;
            return new RateLimitError(`Rate limit exceeded: ${message}`, fullContext, retryAfter, originalError);
        }
        if (message.includes('model') || message.includes('API') || message.includes('provider')) {
            return new ModelAPIError(`Model API error: ${message}`, fullContext, true, originalError);
        }
        if (message.includes('config') || message.includes('invalid') || message.includes('missing')) {
            return new ConfigurationError(`Configuration error: ${message}`, fullContext, originalError);
        }
        if (context.toolName) {
            return new ToolExecutionError(`Tool execution failed: ${message}`, fullContext, originalError);
        }
        // Default to generic Squad error
        return new SquadError(message, ErrorSeverity.ERROR, ErrorCategory.UNKNOWN, fullContext, false, originalError);
    }
}
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
export class TelemetryCollector {
    handlers = new Set();
    /**
     * Register a telemetry data handler.
     *
     * @param handler - Handler function to receive telemetry points
     * @returns Unsubscribe function
     */
    onData(handler) {
        this.handlers.add(handler);
        return () => this.handlers.delete(handler);
    }
    /**
     * Start tracking an operation.
     *
     * @param operation - Operation name
     * @param context - Additional context
     * @returns Stopwatch object with success/failure methods
     */
    start(operation, context) {
        const startTime = Date.now();
        const timestamp = new Date();
        const record = (success, errorCategory) => {
            const duration = Date.now() - startTime;
            const point = {
                operation,
                duration,
                success,
                errorCategory,
                sessionId: context?.sessionId,
                agentName: context?.agentName,
                metadata: context?.metadata,
                timestamp
            };
            for (const handler of this.handlers) {
                try {
                    const result = handler(point);
                    if (result instanceof Promise) {
                        result.catch((err) => console.error('Telemetry handler error:', err));
                    }
                }
                catch (err) {
                    console.error('Telemetry handler error:', err);
                }
            }
        };
        return {
            success: () => record(true),
            failure: (error) => {
                const category = error instanceof SquadError ? error.category : ErrorCategory.UNKNOWN;
                record(false, category);
            }
        };
    }
    /**
     * Clear all handlers.
     */
    clear() {
        this.handlers.clear();
    }
}
//# sourceMappingURL=errors.js.map