/**
 * M5-3: History splitting logic
 * Separates shareable history from private data for safe export.
 */
export interface HistoryEntry {
    id: string;
    timestamp: string;
    type: 'decision' | 'pattern' | 'interaction' | 'error';
    content: string;
    agent?: string;
    metadata?: Record<string, unknown>;
}
export interface AgentHistory {
    entries: HistoryEntry[];
    source?: string;
}
export interface SplitOptions {
    maxAge?: number;
    excludePatterns?: string[];
    anonymize?: boolean;
}
export interface SplitResult {
    exportable: AgentHistory;
    private: AgentHistory;
}
/**
 * Split history into exportable (shareable) and private portions.
 */
export declare function splitHistory(history: AgentHistory, options?: SplitOptions): SplitResult;
/**
 * Merge imported history with existing history, deduplicating by id.
 */
export declare function mergeHistory(existing: AgentHistory, imported: AgentHistory): AgentHistory;
//# sourceMappingURL=history-split.d.ts.map