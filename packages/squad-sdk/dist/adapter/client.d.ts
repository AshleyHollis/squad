/**
 * Squad SDK Client Adapter
 *
 * Wraps CopilotClient to provide connection lifecycle management, error recovery,
 * automatic reconnection, and protocol version validation.
 *
 * @module adapter/client
 */
import type { SquadSessionConfig, SquadSession, SquadSessionMetadata, SquadGetAuthStatusResponse, SquadGetStatusResponse, SquadModelInfo, SquadMessageOptions, SquadClientEventType, SquadClientEvent, SquadClientEventHandler } from "./types.js";
/**
 * Connection state for SquadClient.
 */
export type SquadConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting" | "error";
/**
 * Options for creating a SquadClient.
 */
export interface SquadClientOptions {
    /**
     * Path to the Copilot CLI executable.
     * Defaults to bundled CLI from @github/copilot package.
     */
    cliPath?: string;
    /**
     * Additional arguments to pass to the CLI process.
     */
    cliArgs?: string[];
    /**
     * Working directory for the CLI process.
     * @default process.cwd()
     */
    cwd?: string;
    /**
     * Port to bind the CLI server (TCP mode).
     * Set to 0 for random port, or undefined to use stdio mode.
     */
    port?: number;
    /**
     * Use stdio transport instead of TCP.
     * @default true
     */
    useStdio?: boolean;
    /**
     * URL of an external CLI server to connect to.
     * Mutually exclusive with useStdio and cliPath.
     */
    cliUrl?: string;
    /**
     * Log level for the CLI process.
     * @default "debug"
     */
    logLevel?: "error" | "warning" | "info" | "debug" | "all" | "none";
    /**
     * Automatically start the connection when creating a session.
     * @default true
     */
    autoStart?: boolean;
    /**
     * Automatically reconnect on transient failures.
     * @default true
     */
    autoReconnect?: boolean;
    /**
     * Environment variables to pass to the CLI process.
     * @default process.env
     */
    env?: Record<string, string>;
    /**
     * GitHub token for authentication.
     * If not provided, uses logged-in user credentials.
     */
    githubToken?: string;
    /**
     * Use logged-in user credentials for authentication.
     * @default true (false if githubToken is provided)
     */
    useLoggedInUser?: boolean;
    /**
     * Maximum number of reconnection attempts before giving up.
     * @default 3
     */
    maxReconnectAttempts?: number;
    /**
     * Initial delay in milliseconds before first reconnection attempt.
     * Subsequent attempts use exponential backoff.
     * @default 1000
     */
    reconnectDelayMs?: number;
}
/**
 * SquadClient wraps CopilotClient with enhanced lifecycle management.
 *
 * Features:
 * - Connection state tracking
 * - Automatic reconnection with exponential backoff
 * - Protocol version validation
 * - Error recovery
 * - Session lifecycle event handling
 *
 * @example
 * ```typescript
 * const client = new SquadClient();
 * await client.connect();
 *
 * const session = await client.createSession({
 *   model: "claude-sonnet-4.5"
 * });
 *
 * await client.disconnect();
 * ```
 */
export declare class SquadClient {
    private client;
    private state;
    private connectPromise;
    private reconnectAttempts;
    private reconnectTimer;
    private options;
    private manualDisconnect;
    /**
     * Creates a new SquadClient instance.
     *
     * @param options - Configuration options
     * @throws Error if mutually exclusive options are provided
     */
    constructor(options?: SquadClientOptions);
    /**
     * Get the current connection state.
     */
    getState(): SquadConnectionState;
    /**
     * Check if the client is connected.
     */
    isConnected(): boolean;
    /**
     * Establish connection to the Copilot CLI server.
     *
     * This method:
     * 1. Spawns or connects to the CLI server
     * 2. Validates protocol version compatibility
     * 3. Sets up automatic reconnection handlers
     *
     * @returns Promise that resolves when connection is established
     * @throws Error if connection fails or protocol version is incompatible
     */
    connect(): Promise<void>;
    /**
     * Disconnect from the Copilot CLI server.
     *
     * Performs graceful cleanup:
     * 1. Destroys all active sessions
     * 2. Closes the connection
     * 3. Terminates the CLI process (if spawned)
     *
     * @returns Promise that resolves with any errors encountered during cleanup
     */
    disconnect(): Promise<Error[]>;
    /**
     * Force disconnect without graceful cleanup.
     * Use only when disconnect() fails or hangs.
     */
    forceDisconnect(): Promise<void>;
    /**
     * Create a new Squad session.
     *
     * If autoStart is enabled and the client is not connected, this will
     * automatically establish the connection.
     *
     * @param config - Session configuration
     * @returns Promise that resolves with the created session
     */
    createSession(config?: SquadSessionConfig): Promise<SquadSession>;
    /**
     * Resume an existing Squad session by ID.
     *
     * @param sessionId - ID of the session to resume
     * @param config - Optional configuration overrides
     * @returns Promise that resolves with the resumed session
     */
    resumeSession(sessionId: string, config?: SquadSessionConfig): Promise<SquadSession>;
    /**
     * List all available sessions.
     */
    listSessions(): Promise<SquadSessionMetadata[]>;
    /**
     * Delete a session by ID.
     */
    deleteSession(sessionId: string): Promise<void>;
    /**
     * Get the ID of the last updated session.
     */
    getLastSessionId(): Promise<string | undefined>;
    /**
     * Send a ping to verify connectivity.
     */
    ping(message?: string): Promise<{
        message: string;
        timestamp: number;
        protocolVersion?: number;
    }>;
    /**
     * Get CLI status information.
     */
    getStatus(): Promise<SquadGetStatusResponse>;
    /**
     * Get authentication status.
     */
    getAuthStatus(): Promise<SquadGetAuthStatusResponse>;
    /**
     * List available models.
     */
    listModels(): Promise<SquadModelInfo[]>;
    /**
     * Send a message to a session, wrapped with OTel tracing.
     *
     * Creates a `squad.session.message` span for the full call and a
     * child `squad.session.stream` span that tracks streaming duration
     * with `first_token`, `last_token`, and `stream_error` events.
     *
     * @param session - The session to send the message to
     * @param options - Message content and delivery options
     * @returns Promise that resolves when the message is processed
     */
    sendMessage(session: SquadSession, options: SquadMessageOptions): Promise<void>;
    /**
     * Close a session (alias for deleteSession with `squad.session.close` span).
     *
     * @param sessionId - ID of the session to close
     */
    closeSession(sessionId: string): Promise<void>;
    /**
     * Subscribe to client-level session lifecycle events.
     */
    on<K extends SquadClientEventType>(eventType: K, handler: (event: SquadClientEvent & {
        type: K;
    }) => void): () => void;
    on(handler: SquadClientEventHandler): () => void;
    /**
     * Determine if an error is recoverable via reconnection.
     */
    private shouldAttemptReconnect;
    /**
     * Attempt to reconnect with exponential backoff.
     */
    private attemptReconnection;
}
//# sourceMappingURL=client.d.ts.map