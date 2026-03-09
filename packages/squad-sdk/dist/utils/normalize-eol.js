/**
 * Normalize line endings to LF.
 * Prevents \r-tainted values when parsing on Windows with core.autocrlf=true.
 */
export function normalizeEol(content) {
    return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}
//# sourceMappingURL=normalize-eol.js.map