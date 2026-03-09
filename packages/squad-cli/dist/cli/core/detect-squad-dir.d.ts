/**
 * Squad directory detection — zero dependencies
 */
export interface SquadDirInfo {
    path: string;
    name: '.squad' | '.ai-team';
    isLegacy: boolean;
}
/**
 * Detect squad directory — .squad/ first, fall back to .ai-team/
 */
export declare function detectSquadDir(dest: string): SquadDirInfo;
//# sourceMappingURL=detect-squad-dir.d.ts.map