import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Box, Text } from 'ink';
import { getRoleEmoji } from '../lifecycle.js';
import { isNoColor, useLayoutTier } from '../terminal.js';
import { Separator } from './Separator.js';
import { useCompletionFlash } from '../useAnimation.js';
import { getStatusTag } from '../agent-status.js';
const PULSE_FRAMES = ['●', '◉', '○', '◉'];
/** Pulsing dot for active agents — draws the eye. Static in NO_COLOR mode. */
const PulsingDot = () => {
    const noColor = isNoColor();
    const [frame, setFrame] = useState(0);
    useEffect(() => {
        if (noColor)
            return;
        // 800ms interval reduces re-renders vs 500ms (fix-cli-scroll-rerender-storm)
        const timer = setInterval(() => {
            setFrame(f => (f + 1) % PULSE_FRAMES.length);
        }, 800);
        return () => clearInterval(timer);
    }, [noColor]);
    if (noColor)
        return _jsx(Text, { children: "\u25CF" });
    return _jsx(Text, { color: "green", children: PULSE_FRAMES[frame] });
};
/** Elapsed seconds since agent started working. */
function agentElapsedSec(agent) {
    const active = agent.status === 'streaming' || agent.status === 'working';
    if (!active)
        return 0;
    return Math.floor((Date.now() - agent.startedAt.getTime()) / 1000);
}
/** Format elapsed time for display. */
function formatElapsed(seconds) {
    if (seconds < 1)
        return '';
    return `${seconds}s`;
}
export const AgentPanel = ({ agents, streamingContent }) => {
    const noColor = isNoColor();
    const tier = useLayoutTier();
    // Re-render gate: store elapsed strings in a ref so the timer only triggers
    // a React re-render (via the tick counter) when a visible value changes.
    const elapsedRef = useRef(new Map());
    const [, setElapsedTick] = useState(0);
    useEffect(() => {
        const hasActive = agents.some(a => a.status === 'working' || a.status === 'streaming');
        if (!hasActive)
            return;
        const timer = setInterval(() => {
            let changed = false;
            for (const a of agents) {
                if (a.status === 'working' || a.status === 'streaming') {
                    const display = formatElapsed(agentElapsedSec(a));
                    if (elapsedRef.current.get(a.name) !== display) {
                        elapsedRef.current.set(a.name, display);
                        changed = true;
                    }
                }
            }
            if (changed)
                setElapsedTick(t => t + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [agents]);
    // Completion flash: brief "✓ Done" when agent finishes work
    const completionFlash = useCompletionFlash(agents);
    if (agents.length === 0) {
        return (_jsxs(Box, { flexDirection: "column", paddingX: 1, marginTop: 1, children: [_jsx(Text, { dimColor: true, children: "No agents active." }), _jsxs(Text, { children: [_jsx(Text, { bold: true, children: "Send a message" }), _jsx(Text, { dimColor: true, children: " to start. " }), _jsx(Text, { bold: true, children: "/help" }), _jsx(Text, { dimColor: true, children: " for commands." })] })] }));
    }
    const activeAgents = agents.filter(a => a.status === 'streaming' || a.status === 'working');
    // Narrow layout: minimal single-line per agent, no hints
    if (tier === 'narrow') {
        return (_jsxs(Box, { flexDirection: "column", paddingX: 1, marginTop: 1, children: [agents.map((agent) => {
                    const active = agent.status === 'streaming' || agent.status === 'working';
                    const errored = agent.status === 'error';
                    const statusLabel = getStatusTag(agent.status);
                    return (_jsxs(Box, { gap: 0, children: [_jsxs(Text, { dimColor: !active && !errored, bold: active, color: noColor ? undefined : active ? 'green' : errored ? 'red' : undefined, children: [getRoleEmoji(agent.role), " ", agent.name] }), active && _jsxs(_Fragment, { children: [_jsx(Text, { children: " " }), _jsx(PulsingDot, {})] }), errored && _jsx(Text, { color: noColor ? undefined : 'red', bold: true, children: " ERR" }), completionFlash.has(agent.name) && (noColor
                                ? _jsx(Text, { bold: true, children: " \u2713 Done" })
                                : _jsx(Text, { color: "green", bold: true, children: " \u2713 Done" })), !active && !errored && !completionFlash.has(agent.name) && _jsxs(Text, { dimColor: true, children: [" ", statusLabel] })] }, agent.name));
                }), _jsx(Separator, { marginTop: 1 })] }));
    }
    // Normal layout: compact, abbreviated hints
    if (tier === 'normal') {
        return (_jsxs(Box, { flexDirection: "column", paddingX: 1, marginTop: 1, children: [agents.map((agent) => {
                    const active = agent.status === 'streaming' || agent.status === 'working';
                    const errored = agent.status === 'error';
                    const statusLabel = getStatusTag(agent.status);
                    return (_jsxs(Box, { gap: 0, children: [_jsxs(Text, { dimColor: !active && !errored, bold: active, color: noColor ? undefined : active ? 'green' : errored ? 'red' : undefined, children: [getRoleEmoji(agent.role), " ", agent.name] }), active && _jsxs(_Fragment, { children: [_jsx(Text, { children: " " }), _jsx(PulsingDot, {}), agent.activityHint && _jsxs(Text, { bold: true, children: [" ", agent.activityHint.slice(0, 30)] })] }), errored && _jsxs(Text, { color: noColor ? undefined : 'red', bold: true, children: [" ", statusLabel] }), completionFlash.has(agent.name) && _jsx(Text, { color: noColor ? undefined : 'green', bold: true, children: " \u2713 Done" }), !active && !errored && !completionFlash.has(agent.name) && _jsxs(Text, { dimColor: true, children: [" ", statusLabel] })] }, agent.name));
                }), activeAgents.length > 0 && (_jsx(Box, { flexDirection: "column", children: activeAgents.map(a => {
                        const sec = agentElapsedSec(a);
                        const elapsed = formatElapsed(sec);
                        const hint = a.activityHint ?? 'working';
                        return (_jsxs(Text, { color: noColor ? undefined : 'yellow', dimColor: true, children: [' ', hint.slice(0, 40), elapsed ? ` (${elapsed})` : ''] }, a.name));
                    }) })), _jsx(Separator, { marginTop: 1 })] }));
    }
    // Wide layout: full detail with models, full hints
    return (_jsxs(Box, { flexDirection: "column", paddingX: 1, marginTop: 1, children: [_jsx(Box, { flexWrap: "wrap", gap: 1, children: agents.map((agent) => {
                    const active = agent.status === 'streaming' || agent.status === 'working';
                    const errored = agent.status === 'error';
                    return (_jsxs(Box, { gap: 0, children: [_jsxs(Text, { dimColor: !active && !errored, bold: active, color: noColor ? undefined : active ? 'green' : errored ? 'red' : undefined, children: [getRoleEmoji(agent.role), " ", agent.name] }), active && (_jsxs(Box, { marginLeft: 0, children: [_jsx(Text, { children: " " }), _jsx(PulsingDot, {}), agent.activityHint && _jsxs(Text, { color: noColor ? undefined : 'green', children: [" ", agent.activityHint] }), agent.model && _jsxs(Text, { dimColor: true, children: [" (", agent.model, ")"] })] })), errored && (_jsx(Text, { color: noColor ? undefined : 'red', bold: true, children: " [ERR]" })), completionFlash.has(agent.name) && (noColor
                                ? _jsx(Text, { bold: true, children: " \u2713 Done" })
                                : _jsx(Text, { color: "green", bold: true, children: " \u2713 Done" }))] }, agent.name));
                }) }), activeAgents.length > 0 ? (_jsxs(Box, { flexDirection: "column", children: [activeAgents.length > 1 && (_jsxs(Text, { dimColor: true, children: [" ", activeAgents.length, " agents working in parallel"] })), activeAgents.map(a => {
                        const sec = agentElapsedSec(a);
                        const elapsed = formatElapsed(sec);
                        const hint = a.activityHint ?? 'working';
                        return (_jsxs(Text, { color: noColor ? undefined : 'yellow', children: [' ', getRoleEmoji(a.role), " ", a.name, " \u2014 ", hint, elapsed ? ` (${elapsed})` : '', a.model ? ` [${a.model}]` : ''] }, a.name));
                    })] })) : (_jsxs(Text, { dimColor: true, children: [' ', agents.length, " agent", agents.length !== 1 ? 's' : '', " ready"] })), _jsx(Separator, { marginTop: 1 })] }));
};
//# sourceMappingURL=AgentPanel.js.map