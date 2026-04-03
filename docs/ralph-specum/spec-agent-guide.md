# Spec Agent Guide

> This is the user guide for the Spec agent added by this fork. It describes how to use it in your own projects — not how to build it. For the implementation details, see [implementation-spec.md](implementation-spec.md).

---

## What the Spec Agent Does

The Spec agent is a Specification Engineer. Before any implementation code is written, it produces structured specification artifacts — a constitution, a PRD, an architecture doc, a feature roadmap, and a per-feature spec — that give the whole team a shared understanding of what to build and why.

It runs in three modes:

| Mode | When | What it produces |
|------|------|-----------------|
| **Project setup** | No constitution or PRD exists yet | Constitution → PRD → Architecture → Roadmap |
| **Codebase indexing** | You ask it to "index the codebase" | Component catalogue, convention extraction |
| **Feature spec** | A PRD exists and you want to spec a feature | goals.md → research.md → requirements.md → design.md → tasks.md |

---

## Getting Started

The Spec agent activates automatically. You don't invoke it by name — the coordinator routes to it based on what exists in your `.squad/project/` directory.

### New project (nothing exists yet)

Just tell the coordinator what you're building:

```
Team, I want to build a recipe sharing app with React and Node.
```

The coordinator sees no `constitution.md`, routes to the Spec agent, and it begins the project setup flow.

### Existing project, adding a feature

If a PRD already exists, describe the feature you want to spec:

```
Team, I want to add user authentication.
```

The coordinator routes to the Spec agent for a feature spec.

### Force a specific flow

You can override routing with explicit phrases:

- `"Start a new PRD"` — forces project-level even if a PRD already exists
- `"Index the codebase"` or `"Index src/api/"` — triggers indexing mode
- `"Quick"` or `"Skip interviews"` — skips all interviews, auto-generates artifacts

---

## Level 1: Constitution Setup

**Triggered when**: `.squad/project/constitution.md` does not exist.

The constitution is the highest-authority document. It defines your MUST / SHOULD / MAY rules — non-negotiable standards, strong recommendations, and optional conventions. All future specs validate against it.

### What the Spec agent does first

Before asking you anything, it reads your codebase:
- `package.json`, `tsconfig.json`, `.eslintrc*`, `.editorconfig`
- `README.md`, `CONTRIBUTING.md`
- Existing file naming, test setup, CI config

It only asks about things it can't discover from code.

### Interview (3-5 questions)

The constitution interview covers:
- Commit conventions (Conventional Commits, ticket-prefixed, free-form)
- Testing philosophy (TDD, test-after, minimal)
- Coding standards (strict types, moderate, relaxed)
- Error handling approach
- Branching strategy
- Security requirements

### Output: `.squad/project/constitution.md`

A living document — versioned with semver. Major bumps for breaking rule changes, minor for new rules, patch for clarifications.

---

## Level 2: Project Setup (PRD + Architecture + Roadmap)

**Triggered when**: Constitution exists but `.squad/project/prd.md` does not.

### Vision Interview (4 rounds, adaptive depth)

The vision interview is a conversation, not a form. The Spec agent asks one question at a time, using tappable choices where answers are common and open text where your specific vision matters.

**Round 1 — The Elevator Pitch** (always asked)
- What is this app?
- Who is it for?
- What ONE thing must it do well?
- Why build it?

**Round 2 — Scope and Shape** (always asked)
- Walk me through the first user session
- What are the 3-5 core features?
- What's explicitly NOT in v1?
- Is there a deadline?

**Round 3 — Technical Foundation** (based on context)
- Tech stack preference
- Where it runs (web, mobile, API, desktop)
- Integrations
- Deployment target
- Team size

**Round 4 — Priorities and Constraints** (if relevant)
- Ship fast vs build right
- Hard constraints (budget, compliance, accessibility)
- Database preference

**Adaptive depth**: Side projects get Rounds 1-2 only. Serious apps get all 4 rounds. If you say "just a simple X" — the agent trusts you and keeps it brief.

### Approval gates

Each major artifact requires your explicit approval before the Spec agent moves on:

1. PRD presented → you confirm → architecture begins
2. Architecture presented → you confirm → roadmap begins
3. Roadmap presented → you confirm → F000 spec auto-generated

### Output

| Artifact | Location | Purpose |
|----------|----------|---------|
| `prd.md` | `.squad/project/prd.md` | Vision, users, core features, NFRs |
| `overview.md` | `.squad/project/architecture/overview.md` | System overview, key decisions, tech stack rationale |
| `data-model.md` | `.squad/project/architecture/data-model.md` | Entity relationships, diagrams |
| `api-design.md` | `.squad/project/architecture/api-design.md` | Endpoints, request/response shapes, error formats |
| `infrastructure.md` | `.squad/project/architecture/infrastructure.md` | Deployment, CI/CD, environment config |
| `roadmap.md` | `.squad/project/roadmap.md` | Ordered feature list + Spec Status table |

### The Roadmap and Spec Status table

The roadmap uses 3-digit feature IDs (`F000`, `F001`, ...) ordered by dependency. F000 is always "Project Foundation".

After generating the roadmap, a **Spec Status table** is appended at the bottom:

```
| Feature | Milestone | Spec Directory | Status | Phase |
|---------|-----------|----------------|--------|-------|
| F000 Project Foundation | M0 | `000-project-foundation/` | N/A | — |
| F001 User Authentication | M1 | `001-user-authentication/` | ⬜ Not started | — |
```

Status values progress: `⬜ Not started` → `📋 Discovery` → `🔬 Research` → `📝 Requirements` → `🏗️ Design` → `✅ Specced` → `🚧 Implementing` → `✅ Complete`

---

## Level 3: Codebase Indexing

**Triggered by**: "Index the codebase" or "Index src/api/" or "Index src/services/"

Useful when taking over an existing codebase or after a sprint of implementation work.

### Pre-scan interview (skip with "quick")

- External documentation URLs to index?
- MCP servers or skills to document?
- Specific directories to focus on?
- Code areas lacking comments needing extra attention?

### What it detects

Controllers, services, models, helpers, migrations — anything matching standard file patterns. For each file: exports, methods, dependencies, a lightweight component spec.

### Incremental re-indexing

The index stores SHA-256 hashes. On subsequent runs, only changed files are re-processed.

**Modifiers you can say in chat:**
- `"index just src/api/"` — limit scan to one directory
- `"quick"` — skip interviews, batch scan only
- `"dry run"` — preview what would be indexed without writing files
- `"force reindex"` — regenerate all, even unchanged files
- `"only changed files"` — only git-changed files since last index

### Output: `.squad/specs/.index/`

- `index.md` — summary dashboard with component counts by category
- `components/` — per-component specs
- `external/` — external resource specs (docs URLs, MCP servers)
- `.index-state.json` — hashes for incremental re-indexing

---

## Level 4: Feature Specification

**Triggered when**: PRD exists and you describe a feature to work on.

The feature spec is the core workflow. It runs through 5 phases, each with its own interview and artifact. You approve each phase before the next begins.

### Intent classification

Before any questions, the Spec agent classifies your request:

| Intent | Triggers | Depth |
|--------|----------|-------|
| `BUG_FIX` | fix, resolve, debug, broken, failing, bug, crash | 5 questions (reproduction-focused) |
| `TRIVIAL` | typo, spelling, small change, minor, rename, quick | 1-2 questions |
| `REFACTOR` | refactor, restructure, clean up, simplify, tech debt | 3-5 questions |
| `GREENFIELD` | new feature, add, build, implement, create, from scratch | 5-10 questions |
| `MID_SIZED` | (default) | 3-7 questions |

Intent also determines the task workflow later: GREENFIELD → POC-first; everything else → TDD.

### Spec directory naming

Each feature gets a directory named with a 3-digit numeric prefix matching its roadmap ID:

```
.squad/specs/
  000-project-foundation/
  001-user-authentication/
  002-password-reset/
```

### Phase 1: Discovery

**Mandatory and interactive. Never skipped (unless quick mode).**

The Spec agent reads `.squad/project/constitution.md`, existing code patterns, and `.squad/specs/{feature}/.progress.md` (created at phase start) before asking a single question.

**Standard interview (3 rounds, adaptive depth):**

*Round 1 — Goals and Context*: What problem does this solve? What does success look like? Hard constraints? Existing code to build on?

*Round 2 — Scope and Priorities*: What's out of scope? Must-have vs nice-to-have? External dependencies? Who are the users?

*Round 3 — Technical Preferences*: Approach preference? Testing expectations? Security/performance/accessibility requirements?

**Bug interview**: When intent is BUG_FIX, the interview focuses on reproduction — exact steps, expected vs actual, when it started, existing failing tests, fastest command to reproduce.

**Output**: `goals.md` — read back to you, confirmed before research begins.

### Phase 2: Research

Investigates in parallel:
- External best practices (web search for docs, known pitfalls)
- Codebase patterns (existing architecture, dependencies, test patterns)
- Quality commands (actual lint/test/build from your project)
- Verification tooling (dev server, health endpoint, browser automation)
- Related specs (overlap or conflicts with existing specs)

**Output**: `research.md`

### Phase 3: Requirements

Produces:
- User stories with testable acceptance criteria (AC-*)
- Functional requirements table (FR-*)
- Non-functional requirements table (NFR-*)
- Glossary, out-of-scope, dependencies, success criteria

Every user story has testable acceptance criteria. No ambiguous language ("fast", "easy", "simple"). Out-of-scope section prevents scope creep.

**Output**: `requirements.md`

### Phase 4: Design

Produces:
- Component diagram (mermaid)
- Data flow (sequence diagram)
- Technical decisions table
- File structure table (what to create or modify)
- TypeScript interfaces
- Error handling table
- Test strategy

**Output**: `design.md`

### Phase 5: Tasks

Breaks the design into an ordered task list in checkbox format, grouped by phase, with task IDs (T01, T02, ...), parallel markers (`[P]`), and quality checkpoints (`[VERIFY]`).

**GREENFIELD workflow** (POC-first):
1. Make It Work (working prototype, skip tests) — 50-60% of tasks
2. Refactoring (clean up, follow patterns) — 15-20%
3. Testing (unit, integration, E2E) — 15-20%
4. Quality Gates (lint, types, CI, PR) — 10-15%
5. PR Lifecycle (CI monitoring, final validation) — 5-10%

**Non-GREENFIELD workflow** (TDD Red-Green-Yellow):
1. Red-Green-Yellow Cycles (test-first triplets) — 60-70%
2. Additional Testing (integration, E2E) — 10-15%
3. Quality Gates — 10-15%
4. PR Lifecycle — 5-10%

Each task specifies which Squad agent handles it, references actual quality commands from `research.md`, and links back to FR-* and AC-* requirements.

**Output**: `tasks.md` + `checklists/requirements.md` + `checklists/acceptance.md`

### Approach proposals

After every phase interview, the Spec agent proposes 2-3 distinct approaches before writing any artifact:

```
Based on our discussion, here are the approaches I see:

(A) [Recommended] {approach}
{Trade-off}

(B) {alternative}
{Trade-off}

Which fits best?
```

You pick. The chosen approach is stored in `.progress.md` and carries forward into the next phase.

### Approval flow

Each phase ends with an approval gate:

- **Approve** — artifact is committed, next phase begins
- **Request Changes** — you describe what to change, Spec agent revises
- **Run Review** — automated spec review, up to 3 revision iterations

In **quick mode**, all gates are auto-approved and phases chain automatically.

---

## Progress Tracking

### Spec Status table

`roadmap.md` contains a Spec Status table (see Level 2 above). The Spec agent updates it after each phase completes. Check it to see where every feature stands.

### state.json

Each spec directory contains a machine-readable `state.json`:

```json
{
  "featureId": "F001",
  "phase": "requirements",
  "intent": "GREENFIELD",
  "workflow": "poc",
  "totalTasks": 0,
  "completedTasks": 0,
  "updatedAt": "2026-04-03T00:00:00Z"
}
```

### .progress.md

Created at the start of Discovery and updated throughout. Stores:
- Intent classification
- Interview responses (never re-asked across phases or sessions)
- Chosen approaches
- Task completion status

### project/status.json

A rollup of all feature states across the project. Updated by the Spec agent (phase transitions) and the coordinator (task completions).

---

## Quick Mode

Useful when you want the Spec agent to run autonomously without interviews:

```
Team, spec the user authentication feature. Quick.
```

or

```
Team, spec authentication. Skip interviews.
```

In quick mode:
- All interviews are skipped
- All artifacts are auto-generated (research → requirements → design → tasks)
- An automated reviewer runs on each artifact (max 3 revision iterations)
- All phases auto-approve and chain immediately
- Execution begins automatically

---

## Interview Tips

### Tappable choices

Most questions come with pre-populated choices — tap or click to answer without typing. Copilot automatically adds a freeform option for custom answers.

### Recommendations

When the Spec agent has a recommendation, it's the first choice and labelled "(Recommended)". Go with it unless you have a specific reason not to.

### Skip questions you've already answered

If your initial request already answered a question, the Spec agent skips it. You can front-load context to shorten the interview:

```
Team, I want to add JWT authentication. No social login in v1, 
tight timeline (2 weeks), must follow our existing Express patterns.
```

The Spec agent reads this and skips the corresponding questions.

### "What did I miss?"

If you write a detailed brief, the Spec agent summarises what it understood and asks "What did I miss?" instead of running a full interview.

---

## Artifact Reference

### Project artifacts (created once)

```
.squad/project/
├── constitution.md          # Project principles — MUST/SHOULD/MAY rules
├── prd.md                   # Product Requirements Document
├── roadmap.md               # Feature list + Spec Status table
├── status.json              # Machine-readable project status rollup
└── architecture/
    ├── overview.md          # System overview, tech stack rationale
    ├── data-model.md        # Entity relationships, diagrams
    ├── api-design.md        # Endpoints, request/response shapes
    └── infrastructure.md    # Deployment, CI/CD, environment config
```

### Feature artifacts (one set per feature)

```
.squad/specs/{NNN}-{feature-slug}/
├── goals.md                 # Discovery: goals, constraints, scope
├── research.md              # Research findings: patterns, constraints, tooling
├── requirements.md          # User stories, FR-*, AC-*, NFR-*
├── design.md                # Technical design: components, data flow, decisions
├── tasks.md                 # Ordered task list with verification checkpoints
├── checklists/
│   ├── requirements.md      # FR-* checklist mapped to tasks
│   └── acceptance.md        # AC-* checklist mapped to tasks
├── state.json               # Machine-readable phase/progress state
└── .progress.md             # Accumulated interview context across phases
```

### Indexing artifacts (created by codebase indexing)

```
.squad/specs/.index/
├── index.md                 # Dashboard: component counts by category
├── components/              # Per-component specs
│   ├── controller-users.md
│   └── service-auth.md
├── external/                # External resource specs (docs URLs, MCP servers)
└── .index-state.json        # Hashes for incremental re-indexing
```

---

## Common Patterns

### Start a greenfield project

```
Team, I want to build a task manager. 
React frontend, Node/Express backend, PostgreSQL database.
```

→ Constitution interview → PRD → Architecture → Roadmap → F000 spec auto-generated

### Add a feature to an existing project

```
Team, I want to add email notifications when a task is assigned.
```

→ Feature spec flow: Discovery → Research → Requirements → Design → Tasks

### Continue a spec after a break

The Spec agent reads `.progress.md` and `state.json` on every invocation — it knows where it left off. Just say:

```
Team, continue the email notifications spec.
```

### Skip to a specific phase

```
Team, skip discovery for the notifications feature — here's what I already know:
[paste your notes]. Start from research.
```

### Re-run a phase

```
Team, redo the requirements for notifications — I want to add offline support.
```

### Full autonomous run

```
Team, spec the email notifications feature end-to-end. Quick.
```

→ All 5 phases, no interviews, auto-approved, tasks ready immediately.
