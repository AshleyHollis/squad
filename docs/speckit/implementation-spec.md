# Squad SpecKit Integration — Implementation Spec

> This spec defines modifications to a forked Squad repo to add spec-driven
> development with constitution, codebase indexing, and continuous autonomous
> feature building. Copilot CLI: follow this spec to implement the changes.

## Context

- This is a fork of bradygaster/squad
- All modifications go on branch `speckit-integration`
- Minimise changes to existing Squad files — prefer adding new files
- Only one existing file should be edited: the Lead agent's charter

## Reference Document

The full design rationale, user flows, and examples are in:
`docs/speckit/squad-speckit-guide.md`

Read it before starting implementation, but follow THIS spec for what to build.

---

## File Manifest

### New Files to Create

```
.squad/
├── agents/
│   └── spec/
│       └── charter.md                    ← Spec agent definition
├── templates/
│   ├── project/
│   │   ├── constitution.md               ← Constitution template
│   │   ├── prd.md                        ← PRD template
│   │   └── architecture.md              ← Architecture template
│   └── spec/
│       ├── goals.md                      ← Feature goals template
│       ├── research.md                   ← Research output template
│       ├── requirements.md               ← Requirements output template
│       ├── design.md                     ← Design output template
│       └── tasks.md                      ← Task list template
docs/speckit/
└── squad-speckit-guide.md                ← Full guide (reference only)
```

### Existing Files to Modify

```
.squad/agents/lead/charter.md             ← Add spec-first workflow section
```

---

## 1. Spec Agent Charter

**File**: `.squad/agents/spec/charter.md`

This is the largest new file. The Spec agent must handle three levels of operation.

### 1.1 Identity

```markdown
# Spec Agent Charter

## Identity
- **Role**: Specification Engineer
- **Icon**: 📋

## Overview
The Spec agent creates structured specifications before any implementation work
begins. It operates at three levels: project setup (constitution + PRD), codebase
indexing, and feature specification.
```

### 1.2 Operating Levels

The charter must define how the agent decides which level to operate at:

```
if .squad/constitution.md does NOT exist → constitution setup
else if .squad/prd.md does NOT exist → project-level (PRD + architecture + roadmap)
else if user requests "index" → indexing mode
else → feature-level specification
```

### 1.3 Constitution Section

Include in the charter:

- Interview questions for establishing project principles (3-5 for solo dev)
- Discovery process: read package.json, tsconfig, eslintrc, editorconfig,
  README, CONTRIBUTING before asking the user anything
- Output format: MUST/SHOULD/MAY rules, tech stack, architecture patterns,
  quality standards, development workflow
- Constitution is versioned (semver) with a changelog
- All subsequent spec phases read and validate against the constitution

### 1.4 Project-Level Section (PRD + Architecture + Roadmap)

Include in the charter:

**Vision Interview** (4 rounds, adaptive depth):
- Round 1: Elevator pitch, target users, core value prop, motivation
- Round 2: First user session walkthrough, 3-5 core features, explicit v1 exclusions
- Round 3: Tech stack preferences, platform, integrations, deployment
- Round 4: Priorities, hard constraints, data approach

**Architecture** — proposed after PRD, includes:
- Directory structure, tech stack with rationale, high-level data model,
  API design approach, infrastructure, key decisions table, dev setup

**Roadmap** — decomposition rules:
- F000 is ALWAYS "Project Foundation" (scaffolding, CI, dev tooling)
- Order by dependency: features others depend on come first
- Each feature completable in a single Squad session
- Tags: [MVP], [NEXT], [LATER]
- After roadmap confirmed, auto-generate F000 spec and begin continuous mode

### 1.5 Codebase Indexing Section

Include in the charter:

- Detection patterns for controllers, services, models, helpers, migrations
- Pre-scan interview (external URLs, focus areas, sparse areas)
- Incremental re-indexing via SHA-256 hashes in .index-state.json
- Options: --path, --quick, --dry-run, --force, --changed
- Output to .squad/specs/.index/ (index.md, components/, external/)
- Post-scan review

### 1.6 Feature-Level Section

This is the core spec workflow. Include ALL of the following in the charter:

**Intent Classification** — classify every goal before interviewing:

| Intent | Keywords | Questions |
|--------|----------|-----------|
| BUG_FIX | fix, debug, broken, error, crash | 5 (reproduction-focused) |
| TRIVIAL | typo, minor, rename, quick | 1-2 |
| REFACTOR | refactor, clean up, simplify, tech debt | 3-5 |
| GREENFIELD | new, add, build, implement, create | 5-10 |
| MID_SIZED | (default) | 3-7 |

**Codebase-First Principle**:
- Codebase facts → auto-discover (read files, grep, package.json)
- User decisions → ask via interview
- NEVER ask the user about things discoverable from code

**Per-Phase Interviews** — each phase has its own exploration territory:

Research exploration:
- Technical approach preference, known constraints, integration surface,
  prior knowledge, technologies to evaluate/avoid

Requirements exploration:
- Primary users, priority tradeoffs, success criteria, scope boundaries,
  compliance needs

Design exploration:
- Architecture style, component boundaries, data modelling, API design,
  error handling, performance approach

**Approach Proposals** — after EVERY interview:
- Present 2-3 distinct approaches with honest trade-offs
- Lead with recommendation
- Store chosen approach in .progress.md

**Phase Flow** (each phase follows this pattern):
1. Read context: constitution, learnings, index, prior phase artifacts
2. Interview (skip if --quick; skip if BUG_FIX for non-discovery phases)
3. Propose approaches, user picks
4. Generate artifact (delegate to appropriate research/analysis)
5. Present walkthrough summary
6. Approval gate: Approve / Run Review / Request Changes
7. On approve: update state, commit artifact, STOP (wait for next phase)
8. In --quick mode: auto-approve, continue to next phase

**Research Phase** must discover:
- External best practices (web search)
- Codebase patterns (existing architecture, dependencies)
- Quality commands (actual lint/test/build from package.json, Makefile, CI)
- Verification tooling (dev server, port, health endpoint, browser automation)
- Related specs (scan existing specs for overlap)

**Requirements Phase** output must include:
- User stories with testable acceptance criteria (AC-*)
- Functional requirements table (FR-*)
- Non-functional requirements table (NFR-*)
- Glossary, out-of-scope, dependencies, success criteria

**Design Phase** output must include:
- Component diagram (mermaid), data flow (sequence diagram)
- Technical decisions table (Decision | Options | Choice | Rationale)
- File structure table (File | Create/Modify | Purpose)
- Interfaces (TypeScript types)
- Error handling, edge cases, dependencies, security, performance
- Test strategy (unit, integration, E2E)

**Tasks Phase** — workflow selection based on intent:

GREENFIELD → POC-first (5 phases):
1. Make It Work (POC) — 50-60% of tasks
2. Refactoring — 15-20%
3. Testing — 15-20%
4. Quality Gates — 10-15%
5. PR Lifecycle — 5-10%

Non-GREENFIELD → TDD Red-Green-Yellow (4 phases):
1. Red-Green-Yellow Cycles — 60-70%
2. Additional Testing — 10-15%
3. Quality Gates — 10-15%
4. PR Lifecycle — 5-10%

BUG_FIX → Phase 0 (Reproduce) + TDD phases

Task format rules:
- Max 4 Do steps, max 3 files per task
- [P] for parallel-eligible, [VERIFY] for quality checks
- ALL Verify fields must be automated commands (no manual checks)
- Quality checkpoints every 2-3 tasks
- Final sequence: V4 (local CI) → V5 (CI pipeline) → V6 (AC checklist)
- Fine: 40-60+ tasks (POC) / 30-50+ (TDD)
- Coarse: 10-20 (POC) / 8-15 (TDD)
- Each task specifies which Squad agent handles it

### 1.7 State Tracking

Define in the charter that each feature maintains:

**.ralph-state.json**: phase, intent, workflow, taskIndex, totalTasks,
taskIteration, maxTaskIterations, awaitingApproval, relatedSpecs

**.progress.md**: intent classification, interview responses per phase,
learnings, task completion status, errors

### 1.8 Quick Mode

When --quick flag or user absent (no response within 30 seconds):
- Skip all interviews
- Auto-generate all artifacts
- Run automated spec-reviewer after each (max 3 revision iterations)
- Auto-approve all phases
- Proceed straight to implementation

---

## 2. Lead Agent Charter Modifications

**File**: `.squad/agents/lead/charter.md` (existing file — ADD these sections)

### 2.1 Spec-First Workflow

Add this section to the Lead's charter. The Lead must:

1. Check for constitution → if missing, route to Spec agent
2. Check for PRD → if missing, route to Spec agent (project level)
3. For any feature request, check for spec → if missing, route to Spec agent
4. Skip spec only if user says "skip spec" or task is trivially small

### 2.2 Auto-Merge

Add to the Lead's charter:

```markdown
## Auto-Merge

When a feature PR passes ALL quality gates (V4, V5, V6), auto-merge:

  gh pr merge --squash --auto --delete-branch

Default: auto-merge ON.
Override: user says "don't auto-merge" → stop, wait for manual merge.
Skip auto-merge if: CI fails, or constitution MUST rule was flagged.
```

### 2.3 Continuous Mode

Add to the Lead's charter:

```markdown
## Continuous Mode (Default)

After a feature completes (build done, PR merged), automatically:

1. Extract learnings from .progress.md → append to .squad/learnings.md
2. Quick re-index (--quick --changed)
3. Update roadmap — mark completed feature [DONE]
4. Find next [MVP] feature with all dependencies met
5. Auto-start Spec agent for next feature

DO NOT stop and ask "Ready for next feature?" — just start it.

If user is present (interactive session): normal mode with interviews.
If user is absent (no response within 30s): --quick mode.
User can interrupt any time to steer.

Stop when:
- All [MVP] features are [DONE]
- A feature fails after max retries (mark [BLOCKED], continue to next)
- User interrupts (Ctrl+C or message)
- Context window exhausted (suggest new session)
```

### 2.4 Constitution Validation

Add to the Lead's charter:

```markdown
## Constitution Validation

Every feature spec must be consistent with .squad/constitution.md.
If a feature design violates a MUST rule, flag it during spec review.
Research/requirements/design/tasks phases all read the constitution.
```

### 2.5 Task Dispatch

Add to the Lead's charter:

```markdown
## Task Dispatch from Spec

When reading tasks.md:
- Tasks marked [P] with no unmet dependencies → launch in parallel
- Tasks with dependencies → hold until dependencies complete
- [VERIFY] tasks route to Tester agent
- Route other tasks to agent specified in task's Agent column
- Track completion in .squad/specs/{feature}/progress.md

Verification layers before advancing each task:
1. Contradiction detection — reject if "requires manual" + "complete"
2. Completion signal — agent must explicitly signal done
3. Artifact review — every 5th task, phase boundaries, final task
```

---

## 3. Templates

Create these template files. Each is a markdown skeleton with placeholder
variables that the Spec agent fills in during spec generation.

### 3.1 Constitution Template

**File**: `.squad/templates/project/constitution.md`

Sections: Project Identity (name, purpose, domain), Principles (MUST/SHOULD/MAY
rules), Technology Stack (languages, frameworks, tools, infrastructure),
Architecture Patterns (code organisation, naming, error handling, API shape),
Quality Standards (testing, performance, security), Development Workflow
(branching, commits, review, CI/CD), Changelog.

### 3.2 PRD Template

**File**: `.squad/templates/project/prd.md`

Sections: Vision, Target Users, Core Problem, Core Features (MVP),
User Journey, Out of Scope (v1), Non-Functional Requirements,
Success Metrics, Constraints.

### 3.3 Architecture Template

**File**: `.squad/templates/project/architecture.md`

Sections: Tech Stack (with rationale), Project Structure, Data Model
(high-level), API Design, Infrastructure, Key Decisions table,
Development Setup, Dependencies.

### 3.4 Feature Templates

**Files** in `.squad/templates/spec/`:

**goals.md**: Problem Statement, Success Criteria, In Scope, Out of Scope,
Constraints, Users, Testing Expectations.

**research.md**: Executive Summary, External Research (best practices, prior art,
pitfalls), Codebase Analysis (patterns, dependencies, constraints), Quality
Commands table, Verification Tooling table, Related Specs table, Feasibility
Assessment table, Recommendations, Open Questions, Sources.

**requirements.md**: Goal, User Stories (As a/I want/So that + Acceptance
Criteria), Functional Requirements table (ID, requirement, priority, verify),
Non-Functional Requirements table (ID, requirement, metric, target), Glossary,
Out of Scope, Dependencies, Success Criteria.

**design.md**: Overview, Architecture (mermaid component diagram, component
responsibilities), Data Flow (mermaid sequence diagram), Technical Decisions
table, File Structure table, Interfaces (TypeScript), Error Handling table,
Edge Cases, Dependencies table, Security, Performance, Test Strategy, Existing
Patterns to Follow.

**tasks.md**: Overview (total tasks, workflow type, phase distribution),
Completion Criteria, Task Writing Guide (sizing rules, parallel markers,
principles), Phase structure for POC-first and TDD workflows, Quality
Checkpoint format, Final verification sequence (V4-V6).

---

## 4. Implementation Order

Build in this order (each step should compile/work before moving to next):

1. Create `.squad/templates/` directory with all template files
2. Create `.squad/agents/spec/charter.md` with full charter content
3. Modify `.squad/agents/lead/charter.md` — add spec-first workflow,
   auto-merge, continuous mode, constitution validation, task dispatch sections
4. Create `docs/speckit/squad-speckit-guide.md` — copy the full reference guide
5. Update `.squad/` README or team.md to document the Spec agent role
6. Test: initialise Squad in a test project, verify Spec agent is discoverable,
   verify Lead routes to Spec when no constitution exists

---

## 5. Charter Content Sources

The full content for the Spec agent charter and Lead modifications is detailed
in `docs/speckit/squad-speckit-guide.md`. Key sections to extract from:

| Charter Section | Guide Reference |
|----------------|-----------------|
| Constitution | Part 2.1 (charter), Part 5.0a |
| Project-level (PRD) | Part 2.1 (project-level vision interview), Flow A |
| Codebase Indexing | Part 5.0b |
| Intent Classification | Part 2.1 (intent classification) |
| Discovery Interview | Part 2.1 (discovery interview protocol) |
| Per-Phase Interviews | Part 5.1-5.4 |
| Task Format | Part 2.1 (task format) |
| Phase Rules | Part 5.4 (workflow selection, phase distribution) |
| State Tracking | Part 5.6 |
| Quick Mode | Part 5.7 |
| Auto-Merge | Part 2.2 (Lead charter) |
| Continuous Mode | Part 2.2 (Lead charter) |
| Cross-Feature Learnings | Part 5.9 |

When writing the charter, extract the RULES and FORMATS from these sections.
Do not include user flow examples or explanatory prose — the charter should
be instructions the agent follows, not a tutorial.
