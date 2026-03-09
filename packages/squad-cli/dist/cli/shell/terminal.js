import { platform } from 'node:os';
import { useState, useEffect } from 'react';
/** Current terminal width, clamped to a minimum of 40. */
export function getTerminalWidth() {
    return Math.max(process.stdout.columns || 80, 40);
}
/** React hook — returns live terminal width, updates on resize. */
export function useTerminalWidth() {
    const [width, setWidth] = useState(getTerminalWidth());
    useEffect(() => {
        const onResize = () => setWidth(getTerminalWidth());
        // Avoid MaxListenersExceededWarning in test environments with many renders
        const prev = process.stdout.getMaxListeners?.() ?? 10;
        if (prev <= 20)
            process.stdout.setMaxListeners?.(prev + 10);
        process.stdout.on('resize', onResize);
        return () => {
            process.stdout.off('resize', onResize);
        };
    }, []);
    return width;
}
/** Current terminal height, clamped to a minimum of 10. */
export function getTerminalHeight() {
    return Math.max(process.stdout.rows || 24, 10);
}
/** React hook — returns live terminal height, updates on resize. */
export function useTerminalHeight() {
    const [height, setHeight] = useState(getTerminalHeight());
    useEffect(() => {
        const onResize = () => setHeight(getTerminalHeight());
        const prev = process.stdout.getMaxListeners?.() ?? 10;
        if (prev <= 20)
            process.stdout.setMaxListeners?.(prev + 10);
        process.stdout.on('resize', onResize);
        return () => {
            process.stdout.off('resize', onResize);
        };
    }, []);
    return height;
}
/**
 * Detect terminal capabilities for cross-platform compatibility.
 */
/**
 * Returns true when the environment requests no color output.
 * Respects the NO_COLOR standard (https://no-color.org/) and TERM=dumb.
 */
export function isNoColor() {
    return (process.env['NO_COLOR'] != null && process.env['NO_COLOR'] !== '' ||
        process.env['TERM'] === 'dumb');
}
export function detectTerminal() {
    const plat = platform();
    const isTTY = Boolean(process.stdout.isTTY);
    const noColor = isNoColor();
    return {
        supportsColor: !noColor && isTTY && (process.env['FORCE_COLOR'] !== '0'),
        supportsUnicode: plat !== 'win32' || Boolean(process.env['WT_SESSION']),
        columns: process.stdout.columns || 80,
        rows: process.stdout.rows || 24,
        platform: plat,
        isWindows: plat === 'win32',
        isTTY,
        noColor,
    };
}
/**
 * Get a safe character for the platform.
 * Falls back to ASCII on terminals that don't support unicode.
 */
export function safeChar(unicode, ascii, caps) {
    return caps.supportsUnicode ? unicode : ascii;
}
/**
 * Box-drawing characters that degrade gracefully.
 */
export function boxChars(caps) {
    if (caps.supportsUnicode) {
        return { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' };
    }
    return { tl: '+', tr: '+', bl: '+', br: '+', h: '-', v: '|' };
}
/** Determine layout tier from terminal width. */
export function getLayoutTier(width) {
    if (width >= 120)
        return 'wide';
    if (width >= 80)
        return 'normal';
    return 'narrow';
}
/** React hook — returns current layout tier, updates on resize. */
export function useLayoutTier() {
    const width = useTerminalWidth();
    return getLayoutTier(width);
}
//# sourceMappingURL=terminal.js.map