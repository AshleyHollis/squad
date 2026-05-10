# Fork Changes: ralph-specum

This document describes everything this fork adds or changes relative to upstream [bradygaster/squad](https://github.com/bradygaster/squad). It is the authoritative reference for understanding what's custom in this fork and what to watch for during upstream merges.

---

## Summary

This fork **aligns Squad's coordinator and Spec workflow with [Microsoft's DevSquad](https://microsoft.github.io/devsquad-copilot/) framework** while preserving all Squad-only execution features (casting, personal squad, drop-box pattern, worktrees, eager parallel fan-out, per-agent model selection).

**The strategic shift (commit `9df87b17`, 2026-05-09):** Squad's original monolithic Spec agent has been split into four narrowly-scoped sub-agents driven by a phase-progression model. The coordinator's "Spec-First Workflow" gate has been replaced with state-detection routing across explicit named phases (envision → constitution → prd → architecture → roadmap → spec.feature → design → tasks → implement → review). DevSquad's vocabulary (Conductor, Delivery Agents, Support Agents, Impact Classification, Comprehension Checkpoints, Spec Amendment, ADRs) has been adopted at the concept layer; Squad's distinctive execution patterns are preserved underneath.

The full Rosetta Stone — concept-by-concept mapping, the four locked design decisions, Squad-only features that were preserved — is at [`devsquad-mapping.md`](devsquad-mapping.md).

---

## New files (no upstream equivalent)

These files are entirely new. Upstream merges will never conflict with them.

### Documentation

| File | Purpose |
|------|---------|
| `docs/ralph-specum/devsquad-mapping.md` | **Rosetta Stone** — concept mapping Squad ↔ DevSquad, four locked design decisions, Squad-only feature inventory, list of DevSquad concepts deliberately not adopted |
| `docs/ralph-specum/fork-changes.md` | This file |
| `docs/ralph-specum/spec-agent-guide.md` | Superseded notice — points readers at the four sub-agent charters + Rosetta Stone |
| `docs/ralph-specum/squad-spec-guide.md` | Earlier implementation guide (predates DevSquad alignment) |
| `docs/ralph-specum/implementation-spec.md` | Earlier technical build spec (predates DevSquad alignment) |
| `docs/ralph-specum/copilot-cli-instructions.md` | Copilot CLI implementation notes |
| `docs/ralph-specum/upstream-sync-guide.md` | How to sync this fork with upstream |

### Spec sub-agent charters

Each sub-agent owns exactly one phase from the new Phase Routing model.

| File | Phase owned | Output |
|------|-------------|--------|
| `.squad/agents/spec-constitution/charter.md` (live) | `constitution` | `.squad/project/constitution.md` |
| `.squad/agents/spec-prd/charter.md` (live) | `prd` | `.squad/project/prd.md` |
| `.squad/agents/spec-feature/charter.md` (live) | `spec.feature` + `tasks` | `.squad/specs/{NNN}-{slug}/{goals,research,requirements,tasks}.md` |
| `.squad/agents/spec-index/charter.md` (live) | `index` | `.squad/specs/.index/` |

The same four charters are mirrored in the install templates at `packages/squad-{cli,sdk}/templates/agents/spec-{name}/charter.md`. They ship to new squads via:
- `squad upgrade` — via 5 new `TEMPLATE_MANIFEST` entries in `packages/squad-cli/src/cli/core/templates.ts` with destinations at live agent locations (`agents/{name}/charter.md`) and `overwriteOnUpgrade: true`
- `squad init` — via a system-agent materialization loop in `packages/squad-sdk/src/config/init.ts` that scans `templates/agents/*/charter.md` and writes to `.squad/agents/{name}/charter.md` with `writeIfNotExists` semantics

### Skills (8 new)

| Skill | Used by | Purpose |
|-------|---------|---------|
| `plain-language-interview` | All spec sub-agents | "Option N means…" interview UX pattern |
| `architecture-design` | Lead | Project-level architecture by concern (data, API, infra) — fan-out template |
| `roadmap-planning` | Lead | Feature decomposition + Spec Status Dashboard + project status.json |
| `feature-design` | Domain specialists | Per-feature design fan-out across concerns (Backend, Frontend, Tester) |
| `task-workflow-selection` | spec-feature | POC-first / TDD / Bug-TDD selection by intent |
| `task-decomposition-format` | spec-feature | Checkbox format, sub-fields, `[VERIFY]` checkpoints, sibling `checklists/` |
| `feature-state-tracking` | Multi-agent (spec-feature, coordinator, Lead) | `state.json` + `.progress.md` write triggers |
| `worktree-lifecycle` | Coordinator | Issue-based git worktree management (when worktree mode is enabled) |

Live at `.squad/skills/{name}/SKILL.md`; mirrored to install templates at `packages/squad-{cli,sdk}/templates/skills/{name}/SKILL.md`. Ship via `syncAllSkills` (upgrade) and the SDK init template copy.

### Skill index

| File | Purpose |
|------|---------|
| `.squad/skills/README.md` | Categorized skill index — DevSquad's 5 categories (Plan & Architecture, Work Items & Estimation, Quality & Security, Development, Project Setup) plus a Squad Operations category for capabilities DevSquad doesn't have |

### ADR template

| File | Purpose |
|------|---------|
| `.squad/templates/architecture/decisions/adr-template.md` | DevSquad-style ADR with ranked priorities, options scoring, review checkpoints. Used for High-impact architectural decisions; routine team agreements continue to use the lightweight `decisions.md` / inbox path |

Mirrored to `packages/squad-{cli,sdk}/templates/architecture/decisions/adr-template.md`.

### Earlier (pre-DevSquad-alignment) additions still present

Project templates (`templates/project/{constitution,prd,architecture}.md`) and per-feature spec templates (`templates/spec/{goals,research,requirements,design,tasks}.md`) — added in earlier ralph-specum work, still in use by the new sub-agents.

PowerShell sync helper: `scripts/sync-upstream.ps1`.

---

## Modified files (from upstream)

These files exist in upstream Squad and have been changed in this fork. Watch carefully during upstream syncs.

### `packages/squad-cli/templates/squad.agent.md.template` (coordinator)

The main coordinator prompt. Substantially rewritten by the DevSquad alignment refactor.

**New / replaced sections:**
- `Agent Taxonomy` — Conductor / Delivery / Support / Advisory tiers
- `Phase Routing` — replaces the old "Spec-First Workflow" gate; phase progression table + state-detection routing table
- `Routing` intent table — explicit lanes for bug fixes, refactors, framework changes (bypass spec phases), Spec Amendment, Comprehension Checkpoint follow-ups
- `Action Protocol (Selective)` — `[ASK]` and `[CHECKPOINT]` fenced-block syntax; explicit non-adoption of `[CREATE]/[EDIT]/[BOARD]`
- `Comprehension Checkpoint` — post-implementation gate
- `Spec Amendment` — Impact-tiered mid-flight spec revision flow with audit trail
- `Impact Classification` — Low/Medium/High risk axis (orthogonal to Response Mode)
- `Reasoning & Handoff` — names the existing spawn prompt fields and disk-state handoff
- `Context Management` — names the layered context model (Coordinator session / Project state / Agent memory / Phase state)

**Slimmed sections (delinked to existing skills):**
- `Per-Agent Model Selection` (was 93 lines) — now references `.copilot/skills/model-selection/SKILL.md`
- `Client Compatibility` (was 44 lines) — now references `.copilot/skills/client-compatibility/SKILL.md`
- `Worktree Awareness` — slimmed inline; lifecycle moved to `.copilot/skills/worktree-lifecycle/SKILL.md`
- `Reviewer Rejection Protocol` + `Reviewer Rejection Lockout Semantics` — collapsed to one block referencing `.copilot/skills/reviewer-protocol/SKILL.md`

**Net size:** 1146 lines (upstream baseline pre-fork) → 1414 lines (peak) → **1263 lines** (post bloat-reduction). Still ~117 lines larger than upstream.

**Merge risk: HIGH.** Upstream will continue to evolve this file. Our additions are scattered — Agent Taxonomy near the top, Phase Routing in the middle, Action Protocol/Checkpoint/Amendment as a cluster, Reasoning & Handoff near the end. During merges, preserve every section listed above.

This file exists in **5 copies** across the repo (see [Multiple template copies](#multiple-template-copies) below).

### `packages/squad-sdk/templates/squad.agent.md.template`

Mirrored from the CLI version. Same risk profile.

### `templates/squad.agent.md.template` (root)

Mirrored from the CLI version. Read by SDK init in dev mode (per `getSDKTemplatesDir()` line 40 fallback).

### `.squad/agents/spec/charter.md`

Was 746 lines — the original monolithic Spec agent charter (constitution + project-level + indexing + feature-level all in one file). Now **65 lines** — a family-index router pointing at the four sub-agents and listing which responsibilities migrated to Lead via skills.

The same conversion applies to `packages/squad-{cli,sdk}/templates/agents/spec/charter.md`.

### `.squad/team.md` and `.squad/templates/roster.md`

Added `Tier` column (Conductor / Delivery / Support / Advisory) per [Agent Taxonomy](../../packages/squad-cli/templates/squad.agent.md.template#agent-taxonomy). The four spec sub-agents added to the live roster (squad-on-squad).

Mirrored to `packages/squad-{cli,sdk}/templates/roster.md`.

### `.squad/templates/spawn-template.md` + package mirrors

Restructured into clear field tiers: always-present, phase-routed (when applicable), contextual. Adds `PHASE`, `IMPACT`, `CEREMONY`, `OUTPUT`, `RELEVANT SKILLS` as conditional fields. Adds an Action Protocol reminder block at the bottom.

### `packages/squad-cli/src/cli/core/templates.ts`

Added 5 new `TEMPLATE_MANIFEST` entries:
- 4 sub-agent charters (live destinations: `agents/spec-{name}/charter.md`)
- 1 spec family-index router (live destination: `agents/spec/charter.md`)

All `overwriteOnUpgrade: true` — system agents get refreshed on every upgrade.

### `packages/squad-sdk/src/config/init.ts`

Added a system-agent materialization loop after the regular agent creation loop (around line 845). For each `templates/agents/*/charter.md` shipped in the SDK templates, copies to `.squad/agents/{name}/charter.md` with `writeIfNotExists` semantics. This is how fresh `squad init` runs get the rich sub-agent charters rather than the generic 25-line `generateCharter()` output.

### `index.cjs` (earlier change, still present)

16-line block scaffolding the original Spec agent. Now superseded by the system-agent materialization loop above, but still in place. **Merge risk:** Low to Medium — this file is bundled, look for the spec-scaffolding block during upstream sync.

### `README.md` (earlier change, still present)

Fork-specific content at the top of the file. **Merge risk:** High — preserve the top block and take all upstream changes below the `---` separator.

---

## Behavioral changes

### Spec agent dispatch

**Before this fork's DevSquad alignment** (initial ralph-specum integration): A single Spec agent at `.squad/agents/spec/` running 4 operating levels (constitution / project-level / indexing / feature-level) sequentially based on file presence. Every Spec invocation risked absorbing all four levels.

**After (current state):** The coordinator detects state and routes to one of four narrowly-scoped sub-agents (`spec-constitution`, `spec-prd`, `spec-feature`, `spec-index`). Architecture and roadmap responsibilities migrated to Lead, who reads the relevant skills (`architecture-design`, `roadmap-planning`).

### Coordinator routing

**Before (upstream):** Coordinator routes directly to implementation agents based on the task.

**After:** Coordinator runs phase detection (state-driven *suggestion*, never a forced gate). Bug fixes, refactors, and framework changes bypass spec phases entirely. Ambiguous prompts route to `envision` (Lead-led scoping) instead of defaulting to spec.

### Approval gates

**Before:** Implicit approval points buried in agent charters.

**After:** Explicit `[CHECKPOINT]` fenced blocks at every phase boundary, mediated by the coordinator. Comprehension Checkpoint after implementation. Spec Amendment flow for mid-flight revisions.

### Decision records

**Before:** All decisions logged to `.squad/decisions.md` via the inbox drop-box pattern.

**After:** Two-tier model. ADRs (`.squad/architecture/decisions/{NNN}-{slug}.md`) for architectural / load-bearing decisions that would survive a rewrite. Decisions inbox for routine team agreements (drop-box pattern preserved).

---

## Multiple template copies

The repo currently has **5 copies** of `squad.agent.md.template`:

| Path | Status | Read by |
|------|--------|---------|
| `packages/squad-cli/templates/squad.agent.md.template` | Current (1263 lines) | `squad upgrade` |
| `packages/squad-sdk/templates/squad.agent.md.template` | Current (mirrored from CLI) | `squad init` (production) |
| `templates/squad.agent.md.template` (root) | Current (mirrored) | `squad init` (dev mode fallback) |
| `.squad-templates/squad.agent.md` | **Stale, 1327 lines, unclear purpose** | Not read by install code |
| `.github/agents/squad.agent.md` | Live coordinator for this repo | This repo's squad-on-squad team |

**Merge guidance:**
- Three of these (`packages/squad-cli/templates/`, `packages/squad-sdk/templates/`, `templates/`) are kept in sync with each other manually. After any upstream merge that touches one, mirror the result to the other two.
- `.squad-templates/squad.agent.md` is a snapshot whose role isn't clear — leave alone unless you have a reason to touch it.
- `.github/agents/squad.agent.md` is regenerated by `squad upgrade` from the CLI template.

---

## Upstream merge checklist

When pulling upstream changes into this fork, verify:

- [ ] **Coordinator template** — confirm Phase Routing, Action Protocol, Comprehension Checkpoint, Spec Amendment, Reasoning & Handoff, Context Management, Impact Classification, Agent Taxonomy sections all preserved across the 3 mirrored locations
- [ ] **Spec family** — `agents/spec/charter.md` is the family-index router, NOT the old monolithic charter
- [ ] **Spec sub-agents** — `agents/spec-{constitution,prd,feature,index}/charter.md` exist in templates and live
- [ ] **TEMPLATE_MANIFEST** — 5 entries for spec sub-agent + router charters present in `packages/squad-cli/src/cli/core/templates.ts`
- [ ] **SDK init system-agent loop** — present in `packages/squad-sdk/src/config/init.ts` after the regular agent creation loop
- [ ] **Skills** — 8 new skills present in templates and live; skill README index up to date
- [ ] **ADR template** — present in `.squad/templates/architecture/decisions/adr-template.md` and mirrors
- [ ] **Spawn template** — has structured Reasoning & Handoff fields and Action Protocol reminder
- [ ] **Roster / team.md** — Tier column intact
- [ ] **`index.cjs`** — spec-scaffolding block still adjacent to other agent scaffolds
- [ ] **`README.md`** — fork intro block at the top intact
- [ ] Run `squad init` in a test project and verify the four spec sub-agent charters scaffold correctly
- [ ] Run `squad upgrade` in a test project and verify the live charters refresh

For the full sync process, see [upstream-sync-guide.md](upstream-sync-guide.md).

---

## Version history

| Date | Change | Commit |
|------|--------|--------|
| 2026-05-09 | **DevSquad alignment refactor** — phase routing, Spec sub-agent split, action protocol, skill extractions, install/upgrade parity | `9df87b17` |
| 2026-04-03 | Initial documentation of fork changes | *(earlier)* |
| 2026-04-03 | Spec agent charter updated for Copilot CLI compatibility | `054326a7` |
| 2026-04-03 | Scribe: merge 3 inbox decisions | `033e0b25` |
| 2026-03-xx | Initial spec agent + coordinator enhancements | *(earlier commits)* |
