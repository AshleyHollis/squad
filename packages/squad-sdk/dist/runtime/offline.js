/**
 * Offline Mode — graceful degradation when connectivity is unavailable
 * Issue #142 (M5-14)
 */
// --- Detect connectivity ---
export function detectConnectivity(checker) {
    if (!checker) {
        return Promise.resolve('online');
    }
    return checker()
        .then((ok) => (ok ? 'online' : 'offline'))
        .catch(() => 'offline');
}
// --- OfflineManager ---
export class OfflineManager {
    connectivity = 'online';
    pendingQueue = [];
    lastSyncTime = null;
    cachedAgentNames = [];
    connectivityChecker;
    syncHandler;
    constructor(options) {
        this.connectivityChecker = options?.connectivityChecker;
        this.syncHandler = options?.syncHandler;
        this.cachedAgentNames = options?.cachedAgents ?? [];
    }
    /** Get what works offline */
    getOfflineCapabilities() {
        const isOnline = this.connectivity === 'online';
        return {
            localAgents: true,
            cachedSkills: true,
            configEditing: true,
            marketplaceBrowse: isOnline || this.connectivity === 'degraded',
            publishing: isOnline,
            remoteAgents: isOnline,
        };
    }
    /** Queue an operation for later sync */
    queueForSync(operation) {
        this.pendingQueue.push({ ...operation });
    }
    /** Replay queued operations */
    async syncPending() {
        if (this.connectivity === 'offline') {
            return { synced: 0, failed: 0, remaining: this.pendingQueue.length };
        }
        let synced = 0;
        let failed = 0;
        const remaining = [];
        for (const op of this.pendingQueue) {
            try {
                const success = this.syncHandler
                    ? await this.syncHandler(op)
                    : true;
                if (success) {
                    synced++;
                }
                else {
                    op.retries++;
                    remaining.push(op);
                    failed++;
                }
            }
            catch {
                op.retries++;
                remaining.push(op);
                failed++;
            }
        }
        this.pendingQueue = remaining;
        this.lastSyncTime = new Date().toISOString();
        return { synced, failed, remaining: remaining.length };
    }
    /** Get current offline status */
    getOfflineStatus() {
        return {
            connectivity: this.connectivity,
            pendingOps: this.pendingQueue.length,
            lastSync: this.lastSyncTime,
            cachedAgents: [...this.cachedAgentNames],
        };
    }
    /** Update connectivity status */
    async refreshConnectivity() {
        this.connectivity = await detectConnectivity(this.connectivityChecker);
        return this.connectivity;
    }
    /** Set connectivity directly (useful for testing) */
    setConnectivity(status) {
        this.connectivity = status;
    }
    /** Add a cached agent name */
    addCachedAgent(name) {
        if (!this.cachedAgentNames.includes(name)) {
            this.cachedAgentNames.push(name);
        }
    }
    /** Get pending operations */
    getPendingOperations() {
        return [...this.pendingQueue];
    }
    /** Clear all pending operations */
    clearPending() {
        this.pendingQueue = [];
    }
}
//# sourceMappingURL=offline.js.map