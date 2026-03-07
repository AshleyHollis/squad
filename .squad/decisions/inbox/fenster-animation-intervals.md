### 2026-03-06: Animation interval floors for terminal UI
**By:** Fenster (Core Dev)
**What:** Spinner animations must use ≥120ms intervals, pulsing indicators ≥500ms, and elapsed-time counters ≥1000ms. The `\x1b[3J` (clear scrollback) escape code must not be used during normal rendering — only on explicit user-triggered `/clear`.
**Why:** Multiple high-frequency timers compound into excessive Ink re-renders, causing terminal blink/flicker (#206). Scrollback clearing resets the user's scroll position.
