/**
 * Squad Remote Control — RemoteBridge
 *
 * WebSocket server that bridges Squad's EventBus to remote PWA clients.
 * Maintains message history, broadcasts events, handles incoming commands.
 */
import http from 'node:http';
import { type RCMessage, type RCAgent } from './protocol.js';
import type { RemoteBridgeConfig, RemoteConnection, ConnectionState } from './types.js';
export declare class RemoteBridge {
    private config;
    private server;
    private wss;
    private connections;
    private messages;
    private agents;
    private state;
    private messageIdCounter;
    private staticHandler?;
    private acpEventLog;
    private wsRateLimit;
    private ipConnections;
    private httpRateLimits;
    private sessionToken;
    private tickets;
    private readonly SESSION_TTL;
    private readonly sessionCreatedAt;
    private auditLogDir;
    private auditLogPath;
    private auditLog;
    constructor(config: RemoteBridgeConfig);
    /** Set a handler to serve static PWA files */
    setStaticHandler(handler: (req: http.IncomingMessage, res: http.ServerResponse) => void): void;
    /** Get the session token for WebSocket authentication */
    getSessionToken(): string;
    /** Get the audit log file path */
    getAuditLogPath(): string;
    /** Get the session expiry timestamp */
    getSessionExpiry(): number;
    /** Start the HTTP + WebSocket server */
    start(): Promise<number>;
    /** Stop the server and clean up */
    stop(): Promise<void>;
    /** Get the actual port the server is listening on */
    getPort(): number;
    getState(): ConnectionState;
    getConnectionCount(): number;
    getConnections(): RemoteConnection[];
    /** Add a message to history and broadcast to clients */
    addMessage(role: 'user' | 'agent' | 'system', content: string, agentName?: string): RCMessage;
    getMessageHistory(): RCMessage[];
    /** Send a streaming delta to all clients */
    sendDelta(sessionId: string, agentName: string, content: string): void;
    /** Update the agent roster and broadcast */
    updateAgents(agents: RCAgent[]): void;
    /** Update a single agent's status */
    updateAgentStatus(name: string, status: RCAgent['status']): void;
    sendToolCall(agentName: string, tool: string, args: Record<string, unknown>, status: 'running' | 'completed' | 'error'): void;
    sendPermissionRequest(id: string, agentName: string, tool: string, args: Record<string, unknown>, description: string): void;
    sendUsage(model: string, inputTokens: number, outputTokens: number, cost: number): void;
    sendError(message: string, agentName?: string): void;
    private handleSessionsAPI;
    private handleDeleteSession;
    /** Strip ANSI escape codes and Unicode invisible characters */
    private stripInvisible;
    /** Redact secrets from text before replay */
    private redactSecrets;
    private passthroughWrite;
    /** Set a passthrough pipe — raw WebSocket messages go to this writer,
     *  and call passthroughFromAgent() to send agent responses back */
    setPassthrough(writer: (msg: string) => void): void;
    /** Forward a raw message from the agent (copilot stdout) to all clients + record */
    passthroughFromAgent(line: string): void;
    private handleConnection;
    private handleClientCommand;
    private broadcast;
    private send;
}
//# sourceMappingURL=bridge.d.ts.map