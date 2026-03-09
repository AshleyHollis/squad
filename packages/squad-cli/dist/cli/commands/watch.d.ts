/**
 * Watch command — Ralph's standalone polling process
 */
export interface BoardState {
    untriaged: number;
    assigned: number;
    drafts: number;
    needsReview: number;
    changesRequested: number;
    ciFailures: number;
    readyToMerge: number;
}
export declare function reportBoard(state: BoardState, round: number): void;
/**
 * Run watch command — Ralph's local polling process
 */
export declare function runWatch(dest: string, intervalMinutes: number): Promise<void>;
//# sourceMappingURL=watch.d.ts.map