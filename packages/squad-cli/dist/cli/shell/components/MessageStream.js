import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from 'react';
import { Box, Text } from 'ink';
import { getRoleEmoji } from '../lifecycle.js';
import { isNoColor, useTerminalWidth, useLayoutTier } from '../terminal.js';
import { Separator } from './Separator.js';
import { useMessageFade } from '../useAnimation.js';
import { ThinkingIndicator } from './ThinkingIndicator.js';
/** Convert basic inline markdown to Ink <Text> elements. */
export function renderMarkdownInline(text) {
    // Split on bold (**text**), italic (*text*), and code (`text`) patterns
    const parts = [];
    // Regex: bold first (greedy **), then code (`), then italic (single *)
    const re = /(\*\*(.+?)\*\*)|(`([^`]+?)`)|(\*(.+?)\*)/g;
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = re.exec(text)) !== null) {
        // Add plain text before this match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        if (match[1]) {
            // Bold: **text**
            parts.push(_jsx(Text, { bold: true, children: match[2] }, key++));
        }
        else if (match[3]) {
            // Code: `text`
            parts.push(_jsx(Text, { color: "yellow", children: match[4] }, key++));
        }
        else if (match[5]) {
            // Italic: *text*
            parts.push(_jsx(Text, { color: "gray", children: match[6] }, key++));
        }
        lastIndex = match.index + match[0].length;
    }
    // Remaining plain text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }
    return parts.length === 0 ? text : parts;
}
/** Format elapsed seconds for response timestamps. */
export function formatDuration(start, end) {
    const ms = end.getTime() - start.getTime();
    if (ms < 1000)
        return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}
/** Convert table to card layout for narrow terminals. */
function tableToCardLayout(tableLines) {
    const parsed = tableLines.map(line => {
        const trimmed = line.trim();
        const inner = trimmed.slice(1, -1);
        return inner.split('|').map(c => c.trim());
    });
    // Find separator row to split header from data rows
    const sepIndex = parsed.findIndex(row => row.length > 0 && row.every(cell => /^[-:]+$/.test(cell)));
    if (sepIndex <= 0 || sepIndex >= parsed.length - 1) {
        // No valid separator or no data rows — return as-is
        return tableLines.join('\n');
    }
    const headers = parsed[sepIndex - 1];
    const dataRows = parsed.slice(sepIndex + 1);
    if (!headers || headers.length === 0)
        return tableLines.join('\n');
    // Render each row as a card with "Header: value" pairs
    const cards = dataRows.map(row => {
        const pairs = headers.map((h, i) => {
            const val = row[i] ?? '';
            return `**${h}:** ${val}`;
        });
        return pairs.join('\n');
    });
    return cards.join('\n---\n');
}
/** Truncate table columns to fit within maxWidth. */
function truncateTableColumns(tableLines, maxWidth) {
    const parsed = tableLines.map(line => {
        const trimmed = line.trim();
        const inner = trimmed.slice(1, -1);
        return inner.split('|').map(c => c.trim());
    });
    const numCols = Math.max(...parsed.map(r => r.length));
    if (numCols === 0)
        return tableLines;
    const overhead = numCols + 1 + numCols * 2;
    const available = Math.max(maxWidth - overhead, numCols * 3);
    const colWidth = Math.max(3, Math.floor(available / numCols));
    return parsed.map(cells => {
        const truncated = cells.map(cell => {
            if (/^[-:]+$/.test(cell))
                return '-'.repeat(colWidth);
            if (cell.length <= colWidth)
                return cell.padEnd(colWidth);
            return cell.slice(0, colWidth - 1) + '\u2026';
        });
        while (truncated.length < numCols)
            truncated.push(' '.repeat(colWidth));
        return '| ' + truncated.join(' | ') + ' |';
    });
}
/** Bold the header row of a markdown table (the row above the separator). */
function boldTableHeader(tableLines) {
    const sepIndex = tableLines.findIndex(line => {
        const trimmed = line.trim();
        if (!trimmed.startsWith('|') || !trimmed.endsWith('|'))
            return false;
        const inner = trimmed.slice(1, -1);
        const cells = inner.split('|').map(c => c.trim());
        return cells.length > 0 && cells.every(cell => /^[-:]+$/.test(cell));
    });
    if (sepIndex <= 0)
        return tableLines;
    const headerIndex = sepIndex - 1;
    const headerLine = tableLines[headerIndex];
    const leadingWS = headerLine.match(/^(\s*)/)?.[1] ?? '';
    const trimmed = headerLine.trim();
    const inner = trimmed.slice(1, -1);
    const cells = inner.split('|');
    const boldCells = cells.map(cell => {
        const content = cell.trim();
        if (content.length === 0)
            return cell;
        return cell.replace(content, `**${content}**`);
    });
    const result = [...tableLines];
    result[headerIndex] = leadingWS + '|' + boldCells.join('|') + '|';
    return result;
}
/**
 * Reformat markdown tables based on layout tier.
 * - **narrow**: Card layout (key-value pairs)
 * - **normal**: Truncate columns to fit maxWidth
 * - **wide**: Preserve full table
 */
export function wrapTableContent(content, maxWidth, tier) {
    const lines = content.split('\n');
    const result = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (line.trimStart().startsWith('|') && line.trimEnd().endsWith('|')) {
            const tableLines = [];
            while (i < lines.length && lines[i].trimStart().startsWith('|') && lines[i].trimEnd().endsWith('|')) {
                tableLines.push(lines[i]);
                i++;
            }
            if (tier === 'narrow') {
                // Card layout for narrow terminals
                result.push(tableToCardLayout(tableLines));
            }
            else {
                const maxLineLen = Math.max(...tableLines.map(l => l.length));
                if (maxLineLen <= maxWidth) {
                    result.push(...boldTableHeader(tableLines));
                }
                else {
                    result.push(...boldTableHeader(truncateTableColumns(tableLines, maxWidth)));
                }
            }
        }
        else {
            result.push(line);
            i++;
        }
    }
    return result.join('\n');
}
export const MessageStream = ({ messages, agents, streamingContent, processing = false, activityHint, agentActivities, thinkingPhase, maxVisible = 50, }) => {
    const visible = messages.slice(-maxVisible);
    const roleMap = new Map((agents ?? []).map(a => [a.name, a.role]));
    // Message fade-in: new messages start dim for 200ms
    const fadingCount = useMessageFade(messages.length);
    // Elapsed time tracking for the ThinkingIndicator
    const [elapsedMs, setElapsedMs] = useState(0);
    const processingStartRef = useRef(Date.now());
    useEffect(() => {
        if (processing) {
            processingStartRef.current = Date.now();
            setElapsedMs(0);
            // Update once per second — reduces re-renders that cause flicker (#206)
            const timer = setInterval(() => {
                setElapsedMs(Date.now() - processingStartRef.current);
            }, 1000);
            return () => clearInterval(timer);
        }
        else {
            setElapsedMs(0);
        }
    }, [processing]);
    // Build activity hint: prefer explicit hint, then infer from agent @mention
    const resolvedHint = (() => {
        if (activityHint)
            return activityHint;
        const lastUser = [...messages].reverse().find(m => m.role === 'user');
        if (lastUser) {
            const atMatch = lastUser.content.match(/^@(\w+)/);
            if (atMatch?.[1])
                return `${atMatch[1]} is thinking...`;
        }
        return undefined;
    })();
    // Compute response duration: time from previous user message to this agent message
    const getResponseDuration = (index) => {
        const msg = visible[index];
        if (!msg || msg.role !== 'agent')
            return null;
        // Walk backward to find the preceding user message
        for (let j = index - 1; j >= 0; j--) {
            if (visible[j]?.role === 'user') {
                return formatDuration(visible[j].timestamp, msg.timestamp);
            }
        }
        return null;
    };
    const noColor = isNoColor();
    const width = useTerminalWidth();
    const tier = useLayoutTier();
    const contentWidth = tier === 'wide' ? Math.min(width, 120) : tier === 'normal' ? Math.min(width, 80) : width;
    return (_jsxs(Box, { flexDirection: "column", marginTop: 1, width: contentWidth, children: [visible.map((msg, i) => {
                const isNewTurn = msg.role === 'user' && i > 0;
                const agentRole = msg.agentName ? roleMap.get(msg.agentName) : undefined;
                const emoji = agentRole ? getRoleEmoji(agentRole) : '';
                const duration = getResponseDuration(i);
                const isFading = fadingCount > 0 && i >= visible.length - fadingCount;
                return (_jsxs(React.Fragment, { children: [isNewTurn && _jsx(Separator, { marginTop: 1 }), _jsx(Box, { gap: 1, children: msg.role === 'user' ? (_jsxs(_Fragment, { children: [_jsx(Text, { color: noColor ? undefined : 'cyan', bold: true, dimColor: isFading, children: "\u276F" }), _jsx(Text, { color: noColor ? undefined : 'cyan', wrap: "wrap", dimColor: isFading, children: msg.content })] })) : msg.role === 'system' ? (_jsx(_Fragment, { children: _jsx(Text, { color: "gray", wrap: "wrap", children: msg.content }) })) : (_jsxs(_Fragment, { children: [_jsxs(Text, { color: noColor ? undefined : 'green', bold: true, dimColor: isFading, children: [emoji ? `${emoji} ` : '', (msg.agentName === 'coordinator' ? 'Squad' : msg.agentName) ?? 'agent', ":"] }), _jsx(Text, { wrap: "wrap", dimColor: isFading, children: renderMarkdownInline(wrapTableContent(msg.content, contentWidth, tier)) }), duration && _jsxs(Text, { color: "gray", children: ["(", duration, ")"] })] })) })] }, i));
            }), streamingContent && streamingContent.size > 0 && (_jsx(_Fragment, { children: Array.from(streamingContent.entries()).map(([agentName, content]) => (content ? (_jsxs(Box, { gap: 1, children: [_jsxs(Text, { color: noColor ? undefined : 'green', bold: true, children: [roleMap.has(agentName)
                                    ? `${getRoleEmoji(roleMap.get(agentName))} `
                                    : '', agentName === 'coordinator' ? 'Squad' : agentName, ":"] }), _jsx(Text, { wrap: "wrap", children: renderMarkdownInline(wrapTableContent(content, contentWidth, tier)) }), _jsx(Text, { color: noColor ? undefined : 'cyan', children: "\u258C" })] }, agentName)) : null)) })), agentActivities && agentActivities.size > 0 && (_jsx(Box, { flexDirection: "column", children: Array.from(agentActivities.entries()).map(([name, activity]) => (_jsxs(Text, { color: "gray", children: ["\u25B8 ", name, " is ", activity] }, name))) })), processing && (!streamingContent || streamingContent.size === 0) && (_jsx(ThinkingIndicator, { isThinking: true, elapsedMs: elapsedMs, activityHint: resolvedHint, phase: thinkingPhase })), processing && streamingContent && streamingContent.size > 0 && (_jsx(ThinkingIndicator, { isThinking: true, elapsedMs: elapsedMs, activityHint: `${Array.from(streamingContent.keys()).join(', ')} streaming` }))] }));
};
//# sourceMappingURL=MessageStream.js.map