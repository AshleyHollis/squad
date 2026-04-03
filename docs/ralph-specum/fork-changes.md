# Fork Changes: ralph-specum

This document describes everything this fork adds or changes relative to upstream [bradygaster/squad](https://github.com/bradygaster/squad). It is the authoritative reference for understanding what's custom in this fork and what to watch for during upstream merges.

---

## Summary

This fork adds a **Spec-driven development workflow** built on the ralph-specum methodology. Before Squad fans out implementation work, a dedicated Spec agent runs structured specification phases — constitution, PRD, architecture, roadmap, and per-feature specs. Only after specs are approved does implementation begin.

---

## New Files (no upstream equivalent)

These files are entirely new. Upstream merges will never conflict with them.

### Spec Agent

| File | Purpose |
|------|---------|
| `.squad/agents/spec/charter.md` | Live Spec agent charter for this repo's own squad |
| `templates/agents/spec/charter.md` | Template scaffolded into user projects via `squad init` / `squad upgrade` |

### Project Templates

| File | Purpose |
|------|---------|
| `templates/project/constitution.md` | Project constitution template |
| `templates/project/prd.md` | Product Requirements Document template |
| `templates/project/architecture.md` | Architecture document template |

### Feature Spec Templates

| File | Purpose |
|------|---------|
| `templates/spec/goals.md` | Discovery phase template |
| `templates/spec/research.md` | Research phase template |
| `templates/spec/requirements.md` | Requirements phase template |
| `templates/spec/design.md` | Design phase template |
| `templates/spec/tasks.md` | Task breakdown template |

### Documentation

| File | Purpose |
|------|---------|
| `docs/ralph-specum/spec-agent-guide.md` | User guide for the Spec agent (this fork) |
| `docs/ralph-specum/fork-changes.md` | This file — what's different from upstream |
| `docs/ralph-specum/squad-spec-guide.md` | Implementation guide — how the spec workflow was built |
| `docs/ralph-specum/implementation-spec.md` | Technical build spec for the integration |
| `docs/ralph-specum/copilot-cli-instructions.md` | How to implement with Copilot CLI |
| `docs/ralph-specum/upstream-sync-guide.md` | How to sync this fork with upstream |

### Scripts

| File | Purpose |
|------|---------|
| `scripts/sync-upstream.ps1` | PowerShell script to fetch upstream, merge, rebase, and push |

---

## Modified Files (from upstream)

These files exist in upstream Squad and have been changed in this fork. These are the files to watch carefully during upstream syncs.

### `index.cjs`

**Change**: 16 lines added that scaffold the Spec agent during `squad init` and `squad upgrade`.

**Location**: Lines 1784–1798 (approximately — upstream changes will shift line numbers).

**What it does**: When `squad init` or `squad upgrade` runs in a user's project, it copies:
- `templates/agents/spec/charter.md` → `.squad/agents/spec/charter.md`

This means every project initialised or upgraded from this fork automatically gets the Spec agent.

**Merge risk**: Low. The addition is isolated within the init/upgrade scaffolding block. Look for the section that scaffolds other agents and confirm our spec block is still adjacent to it.

### `templates/squad.agent.md`

**Change**: Multiple sections appended to the coordinator's instruction file.

**What was added**:

1. **Spec-first workflow** — The coordinator now checks for the existence of `constitution.md` and `prd.md` before routing to any implementation agent. If they don't exist, it routes to the Spec agent first.

2. **Constitution validation** — Before accepting any spec or implementation PR, the coordinator validates it against the `MUST` rules in `constitution.md`.

3. **Auto-merge** — PRs that pass all quality gates (V4/V5/V6 checkpoints in `tasks.md`) are automatically merged without waiting for manual review.

4. **Continuous mode** — After a feature completes: extract learnings, re-index the codebase, update the roadmap status, and start the next feature spec automatically.

5. **Task dispatch** — The coordinator reads `tasks.md` and dispatches tasks to agents in order, respecting `[P]` parallel markers and dependency ordering.

**Merge risk**: Medium. If upstream changes `squad.agent.md` significantly, the appended sections may need to be re-applied. Keep a copy of our additions in this document for reference.

**Our additions block** (re-apply if lost after an upstream merge):

```markdown
## Spec-First Workflow

Before routing any work to implementation agents, check:

1. Does `.squad/project/constitution.md` exist?
   - No → Route to Spec agent: "No constitution found. Starting project setup."
   
2. Does `.squad/project/prd.md` exist?
   - No → Route to Spec agent: "No PRD found. Starting project-level spec."

3. Does `.squad/specs/{feature}/tasks.md` exist for the requested feature?
   - No → Route to Spec agent: "No spec found for {feature}. Starting feature spec."

Only when all three exist should implementation begin.

## Constitution Validation

Before accepting any spec artifact or implementation PR, validate it against
the MUST rules in `.squad/project/constitution.md`. Flag any violation as a
blocking issue — do not auto-approve specs or PRs that violate MUST rules.

## Auto-Merge

When a feature's tasks.md shows all V4, V5, and V6 checkpoints passing:
- Confirm CI is green
- Merge the PR automatically
- Announce: "Feature {name} complete. Moving to next feature."

## Continuous Mode

After a feature completes (all tasks done, PR merged):
1. Ask Spec agent to extract learnings into `.squad/specs/{feature}/learnings.md`
2. Trigger a codebase re-index: "Index changed files since last index"
3. Update roadmap.md Spec Status table
4. Route to Spec agent for the next [MVP] feature on the roadmap

## Task Dispatch

When a feature spec is approved and `tasks.md` exists:
1. Read `tasks.md` from `.squad/specs/{feature}/`
2. Dispatch tasks in order: T01, T02, T03...
3. Tasks marked `[P]` can be dispatched in parallel
4. Wait for `[VERIFY]` checkpoints to pass before continuing
5. Update `state.json` and `.progress.md` as each task completes
```

### `README.md`

**Change**: Fork-specific content added at the top of the file, before the original upstream README.

**What was added**:
- "What This Fork Adds" section describing the Spec agent and coordinator enhancements
- Install instructions (global npm install from this fork)
- Upgrade instructions
- Links to fork documentation

**Merge risk**: High. Upstream will update `README.md` regularly. Our content is at the top, upstream content starts after a `---` separator. During merges, preserve the top block and take all upstream changes to the lower section.

---

## Behavioral Changes

### `squad init` and `squad upgrade`

Both commands now scaffold a Spec agent into the user's project:

- **Before** (upstream): Only core agents (lead, frontend, backend, tester, scribe) are scaffolded
- **After** (this fork): Spec agent charter is also scaffolded to `.squad/agents/spec/charter.md`
- **Templates scaffolded**: `.squad/templates/project/` and `.squad/templates/spec/` directories are populated

### Coordinator routing

- **Before** (upstream): Coordinator routes directly to implementation agents based on the task
- **After** (this fork): Coordinator checks for constitution → PRD → feature spec before any implementation routing. Missing specs trigger the Spec agent.

### PR merge behavior

- **Before** (upstream): PRs require manual merge
- **After** (this fork): PRs auto-merge when all quality gates (V4/V5/V6) pass and CI is green

---

## Template Structure (new)

This fork adds two template directories:

### `templates/project/` — project-level templates

Scaffolded once per project into `.squad/templates/project/`:

| Template | Used for |
|----------|---------|
| `constitution.md` | Project principles — MUST/SHOULD/MAY rules |
| `prd.md` | Product Requirements Document |
| `architecture.md` | Architecture overview |

### `templates/spec/` — per-feature spec templates

Scaffolded once per project into `.squad/templates/spec/`:

| Template | Spec phase |
|----------|-----------|
| `goals.md` | Discovery |
| `research.md` | Research |
| `requirements.md` | Requirements |
| `design.md` | Design |
| `tasks.md` | Task breakdown |

---

## Upstream Merge Checklist

When pulling upstream changes into this fork, verify:

- [ ] `index.cjs` — confirm spec scaffolding block (lines ~1784-1798) still exists and is correct
- [ ] `templates/squad.agent.md` — confirm our 5 appended sections are still present
- [ ] `README.md` — confirm the fork intro block at the top is intact
- [ ] `templates/agents/spec/charter.md` — upstream doesn't have this, but verify it wasn't accidentally deleted
- [ ] Run `squad init` in a test project and verify `.squad/agents/spec/charter.md` is scaffolded

For the full sync process, see [upstream-sync-guide.md](upstream-sync-guide.md).

---

## Version History

| Date | Change | Commit |
|------|--------|--------|
| 2026-04-03 | Initial documentation of fork changes | *(this commit)* |
| 2026-04-03 | Spec agent charter updated for Copilot CLI compatibility | `054326a7` |
| 2026-04-03 | Scribe: merge 3 inbox decisions | `033e0b25` |
| 2026-03-xx | Initial spec agent + coordinator enhancements | *(earlier commits)* |
