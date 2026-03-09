/**
 * Offline Mode — graceful degradation when connectivity is unavailable
 * Issue #142 (M5-14)
 */
export type ConnectivityStatus = 'online' | 'offline' | 'degraded';
export interface PendingOperation {
    id: string;
    type: string;
    payload: Record<string, unknown>;
    timestamp: string;
    retries: number;
}
export interface OfflineCapabilities {
    localAgents: boolean;
    cachedSkills: boolean;
    configEditing: boolean;
    marketplaceBrowse: boolean;
    publishing: boolean;
    remoteAgents: boolean;
}
export interface OfflineStatus {
    connectivity: ConnectivityStatus;
    pendingOps: number;
    lastSync: string | null;
    cachedAgents: string[];
}
export declare function detectConnectivity(checker?: () => Promise<boolean>): Promise<ConnectivityStatus>;
export declare class OfflineManager {
    private connectivity;
    private pendingQueue;
    private lastSyncTime;
    private cachedAgentNames;
    private connectivityChecker?;
    private syncHandler?;
    constructor(options?: {
        connectivityChecker?: () => Promise<boolean>;
        syncHandler?: (op: PendingOperation) => Promise<boolean>;
        cachedAgents?: string[];
    });
    /** Get what works offline */
    getOfflineCapabilities(): OfflineCapabilities;
    /** Queue an operation for later sync */
    queueForSync(operation: PendingOperation): void;
    /** Replay queued operations */
    syncPending(): Promise<SyncResult>;
    /** Get current offline status */
    getOfflineStatus(): OfflineStatus;
    /** Update connectivity status */
    refreshConnectivity(): Promise<ConnectivityStatus>;
    /** Set connectivity directly (useful for testing) */
    setConnectivity(status: ConnectivityStatus): void;
    /** Add a cached agent name */
    addCachedAgent(name: string): void;
    /** Get pending operations */
    getPendingOperations(): PendingOperation[];
    /** Clear all pending operations */
    clearPending(): void;
}
export interface SyncResult {
    synced: number;
    failed: number;
    remaining: number;
}
//# sourceMappingURL=offline.d.ts.map