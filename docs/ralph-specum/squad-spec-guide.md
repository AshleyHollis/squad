# Squad + Ralph-Specum: Adding Spec-Driven Development to Squad

## Part 1: Forking and Maintaining Your Squad Fork

### Initial Setup

Fork the repo on GitHub (github.com/bradygaster/squad → "Fork" button). Then clone your fork locally and set up the upstream remote so you can pull in Brady's updates:

```bash
git clone git@github.com:YOUR_USERNAME/squad.git
cd squad
git remote add upstream https://github.com/bradygaster/squad.git
git remote -v
# origin    git@github.com:YOUR_USERNAME/squad.git (fetch/push)
# upstream  https://github.com/bradygaster/squad.git (fetch/push)
```

### Keeping Your Fork Updated

When Brady pushes updates to the original Squad repo, you pull them into your fork like this:

```bash
# Fetch upstream changes
git fetch upstream

# Make sure you're on main
git checkout main

# Merge upstream into your main
git merge upstream/main

# Push updated main to your fork
git push origin main
```

If you've made changes to files that Brady also changes, you'll get merge conflicts. To minimise this, keep your modifications isolated — don't edit Squad's core files if you can avoid it. Instead, **add new files** (your Spec agent, modified templates) and only make surgical edits to existing Squad files where absolutely necessary.

### Branch Strategy

Keep your customisations on a dedicated branch so main stays clean for upstream syncs:

```bash
# Create your customisation branch from main
git checkout -b ralph-specum

# Do all your work here...
# When upstream updates come in:
git checkout main
git merge upstream/main
git push origin main

# Then rebase your customisation branch onto the updated main
git checkout ralph-specum
git rebase main
# Resolve any conflicts, then:
git push origin ralph-specum --force-with-lease
```

### Installing Your Fork Instead of Upstream Squad

When initialising Squad in a project, point to your fork instead of the original:

```bash
npx @YOUR_USERNAME/squad-cli
```

Alternatively, if you haven't published to npm, you can clone your fork locally and symlink it, or use the local install approach described in Squad's docs. The simplest approach during development is to clone your fork next to your project and symlink the `.squad/` and `.github/agents/squad.agent.md` files in (the same pattern described in Tamir Dresher's blog post about using Squad without touching your repo).

---

## Part 2: What to Modify in Squad

The goal is to add a **Spec phase** that runs before Squad fans out implementation work. This means adding a new agent, modifying the Lead's behaviour, and adding spec templates.

### 2.1 Add a Spec Agent

Create a new agent definition file. In Squad, each agent is defined in the `.squad/` directory with a charter file.

**File: `.squad/agents/spec/charter.md`**

```markdown
# Spec Agent Charter

## Identity
- **Name**: Spec (or use Squad's casting system to get a themed name)
- **Role**: Specification Engineer
- **Icon**: 📋

## Responsibilities
The Spec agent operates at THREE levels:

**Project level** (new app / greenfield):
- Constitution: Establish project-wide principles, standards, and conventions
- Vision Interview: Interview the user to understand the app's purpose, users, and scope
- PRD: Produce a Product Requirements Document defining the whole application
- Architecture: Define tech stack, project structure, and foundational decisions
- Feature Map: Decompose the PRD into an ordered list of features (the roadmap)
- Foundation Spec: Generate the first feature spec for project scaffolding

**Indexing level** (existing codebase / brownfield):
- Codebase Scan: Discover and catalogue existing components, patterns, and conventions
- Component Specs: Generate lightweight specs for existing code modules
- Convention Extraction: Identify de facto standards from the code
- Constitution Generation: Derive a constitution from discovered patterns

**Feature level** (adding a feature to an existing app):
- Discovery: Interview the user to understand goals, constraints, and priorities
- Research: Investigate the codebase, existing patterns, and external requirements
- Requirements: Define user stories, acceptance criteria, and constraints
- Design: Produce technical design decisions, API contracts, data models
- Task Breakdown: Generate an ordered, actionable task list for the team

**How the Spec agent decides which level to operate at**:
- If `.squad/constitution.md` does NOT exist → constitution first (always)
- If `.squad/prd.md` does NOT exist → project level (new app kickoff)
- If `.squad/prd.md` exists → feature level (normal feature spec flow)
- User can trigger indexing any time: "Index the codebase" or "Index src/api/"
- User can override: "Start a new PRD" forces project level even if one exists

## Project-Level Artifacts
Created once, at project kickoff, stored in `.squad/`:
- `constitution.md` — project principles, coding standards, conventions, patterns
- `prd.md` — Product Requirements Document: vision, users, core features, NFRs
- `architecture.md` — tech stack, project structure, deployment, key decisions
- `roadmap.md` — ordered feature list derived from the PRD, with priorities

## Feature-Level Artifacts
Created per feature in `.squad/specs/{feature-name}/`:
- `goals.md` — discovery interview summary: goals, constraints, priorities, scope
- `research.md` — codebase analysis, prior art, constraints discovered
- `requirements.md` — user stories, acceptance criteria, non-functional requirements
- `design.md` — technical approach, API contracts, data models, architecture decisions
- `tasks.md` — ordered implementation tasks, each with clear done criteria

## Indexing Artifacts
Created by codebase indexing, stored in `.squad/specs/.index/`:
- `index.md` — summary dashboard: component counts by category, external resources
- `components/` — per-component specs (e.g., `controller-users.md`, `service-auth.md`)
- `external/` — external resource specs (URLs, MCP servers, skills)
- `.index-state.json` — hashes for incremental re-indexing

## Project-Level Vision Interview

Run this when no prd.md exists (new app). This is a CONVERSATION, not a form.

**Round 1 — The Elevator Pitch** (always ask):
1. What is this app? Describe it like you're telling a friend.
2. Who is it for? (Be specific — not "everyone")
3. What's the ONE thing it must do well to be useful?
4. Why build it? (Scratching your own itch? Business idea? Learning project?)

**Round 2 — Scope and Shape** (always ask):
5. What does a user's first session look like? Walk me through it.
6. What are the 3-5 core features? (Not a wish list — the minimum viable set)
7. What's explicitly NOT in v1? (Helps prevent scope creep later)
8. Is there a deadline or milestone driving this?

**Round 3 — Technical Foundation** (ask based on context):
9. Do you have a tech stack in mind, or do you want recommendations?
10. Where will this run? (Web, mobile, desktop, API-only, all of the above)
11. Any integrations? (Third-party APIs, auth providers, payment, etc.)
12. Deployment target? (Cloud provider, self-hosted, serverless, etc.)
13. Solo dev or team? (Affects how we structure the repo and CI)

**Round 4 — Priorities and Constraints** (ask if relevant):
14. What's more important: shipping fast or building it "right"?
15. Any hard constraints? (Budget, specific services, compliance, accessibility)
16. How do you want to handle data? (Database preference, data model complexity)

**Interview Rules** (same principles as feature-level):
- Ask ONE round at a time. Wait for answers.
- Skip questions already answered.
- If the user provides a detailed brief, summarise and ask "What did I miss?"
- After the interview, produce `prd.md` and read it back for confirmation.
- Only proceed to Architecture after the user confirms the PRD.

**Adaptive Depth**:
- Side project / learning: Rounds 1-2, keep it light
- Serious app / startup: All 4 rounds
- If the user says "just a simple X" — trust them, keep it brief

## Feature Decomposition (roadmap.md)

After the PRD and architecture are confirmed, decompose the app into features.
Each feature becomes an entry in roadmap.md and will later get its own spec cycle.

**Decomposition rules**:
- Feature F000 is ALWAYS "Project Foundation" — repo setup, scaffolding, CI, 
  base configuration, dev tooling. This gets built first.
- Order features by dependency: features that others depend on come first.
- Group features into phases/milestones if the user mentioned them.
- Each feature should be completable in a single Squad session (hours, not days).
  If a feature feels too big, split it.
- Mark features as: [MVP] must-have for v1, [NEXT] planned for after MVP, 
  [LATER] nice-to-have / Phase 2+

**roadmap.md format**:
```
# Roadmap: {app-name}

## Phase 1 — Foundation
- F000 | Project Foundation | Repo, scaffolding, CI, base config | [MVP]

## Phase 2 — Core
- F001 | {feature} | {one-line description} | [MVP]
- F002 | {feature} | {one-line description} | [MVP]
- F003 | {feature} | {one-line description} | [MVP]

## Phase 3 — Polish
- F004 | {feature} | {one-line description} | [NEXT]
- F005 | {feature} | {one-line description} | [LATER]
```

**User checkpoint**: Present the roadmap and ask:
"Here's how I'd break this down. Does the ordering make sense? 
Anything missing or in the wrong phase?"

After confirmation, the Spec agent automatically generates the feature spec
for F000 (Project Foundation) so the team can start building immediately.

## Intent Classification (Feature Level)

Before asking any interview questions, classify the user's goal to calibrate depth.
Analyse the goal text for keywords:

| Intent | Keywords | Interview Depth |
|--------|----------|-----------------|
| BUG_FIX | fix, resolve, debug, broken, failing, error, bug, crash | 5 questions (reproduction-focused) |
| TRIVIAL | typo, spelling, small change, minor, rename, quick | 1-2 questions |
| REFACTOR | refactor, restructure, clean up, simplify, tech debt | 3-5 questions |
| GREENFIELD | new feature, add, build, implement, create, from scratch | 5-10 questions |
| MID_SIZED | (default if no clear match) | 3-7 questions |

Store intent in `.squad/specs/{feature}/.progress.md`. Intent also determines the
execution workflow later (POC-first for GREENFIELD, TDD for everything else).

## Codebase-First Principle

<mandatory>
Before asking ANY question, check: is this a codebase fact or a user decision?
- Codebase fact → auto-discover it (read files, grep patterns, check package.json)
- User decision → ask via the interview

Never ask the user about things you can discover from the code.
</mandatory>

Examples:
- "What test framework do you use?" → READ package.json, don't ask
- "What's more important, shipping fast or building it right?" → ASK the user
- "What database are you using?" → READ existing code, don't ask
- "Should we support social login in v1?" → ASK the user

## Per-Phase Interviews

Ralph-specum runs a SEPARATE brainstorming interview for EACH phase, not just one
interview at the start. Each phase has its own "exploration territory" — the topics
to probe. Questions adapt to prior answers stored in .progress.md so nothing is
asked twice.

After each interview, propose 2-3 distinct approaches and let the user pick.
See Part 5 for the exploration territories for each phase.

## Discovery Interview Protocol (Feature Level)

The discovery phase is MANDATORY and INTERACTIVE. Do not skip it. Do not assume.
Before researching anything, interview the user to build a shared understanding.

### Bug Interview (BUG_FIX Intent)

When intent is BUG_FIX, replace the standard interview with these focused questions:
1. Walk me through the exact steps to reproduce this bug.
2. What did you expect to happen? What actually happened instead?
3. When did this start? Was it working before? (if yes: what changed?)
4. Is there an existing failing test that captures this bug?
5. What is the fastest command to reproduce the failure?

After the bug interview, skip approach proposals. Store responses and proceed
directly to research.

### Standard Interview

**Round 1 — Goals and Context** (always ask these):
1. What is the end-user problem this feature solves?
2. What does success look like when this is done? (How would you demo it?)
3. Are there any hard constraints? (Timeline, tech stack, platform, budget, etc.)
4. Is there existing code or prior work this builds on?

**Round 2 — Scope and Priorities** (ask based on Round 1 answers):
5. What is explicitly OUT of scope for this iteration?
6. If you had to cut this in half, what's the must-have vs nice-to-have?
7. Are there any external dependencies? (APIs, services, other teams, approvals)
8. Who are the users? (Internal tool vs public-facing vs API consumers)

**Round 3 — Technical Preferences** (ask if relevant):
9. Do you have a preference on approach? (e.g., library choice, architecture pattern)
10. Are there patterns already in the codebase you want to follow or avoid?
11. What's the testing expectation? (Unit only? Integration? E2E?)
12. Any security, performance, or accessibility requirements?

**Interview Rules**:
- Ask ONE round at a time. Wait for answers before asking the next round.
- Skip questions the user has already answered in their initial request.
- If the user's initial request is detailed enough, summarise what you understood
  and ask "Did I miss anything?" instead of running the full interview.
- After the interview, produce `goals.md` summarising the agreed scope.
- Read `goals.md` back to the user and ask: "Does this capture it? Anything to add
  or change before I start researching?"
- Only proceed to the Research phase once the user confirms goals.md.

**Adaptive Depth**:
- Small feature (e.g., "add a logout button"): Round 1 only, maybe 2 questions
- Medium feature (e.g., "add user authentication"): Rounds 1 and 2
- Large feature (e.g., "rebuild the payment system"): All 3 rounds
- Gauge complexity from the initial request and scale accordingly

## Approach Proposals

After EVERY interview (discovery, research, requirements, design), propose 2-3
distinct approaches and let the user pick. This is NOT optional.

Rules:
- Always present at least 2 approaches (never just 1)
- Maximum 3 approaches (more causes decision fatigue)
- Lead with your recommendation
- Trade-offs must be honest — no straw-man alternatives
- Apply YAGNI: strip unnecessary complexity from all approaches

Example (after discovery interview for auth feature):
```
Based on our discussion, here are the approaches I see:

**(A) [Recommended] Simple JWT auth**
Email/password with bcrypt + jsonwebtoken. Aligns with existing Express patterns.
Trade-off: Fast to build, but no social login.

**(B) Passport.js with local strategy**
Uses the established Passport ecosystem. More boilerplate but easier to add
OAuth later.
Trade-off: More setup now, but social login is a plugin away.

**(C) Auth-as-a-service (Clerk/Auth0)**
Offload auth entirely to a third-party service.
Trade-off: Fastest to ship, but adds dependency and recurring cost.

Which approach fits best?
```

After the user picks, store the chosen approach in `.progress.md` and pass it
as context to the next phase.

## Task Format (tasks.md)

Tasks follow a strict format. Each task must be atomic, automated, and verifiable.

**Sizing rules**: Max 4 Do steps, max 3 files per task. Split if exceeded.

**Parallel markers**: Mark independent tasks with `[P]` for concurrent execution.
Adjacent `[P]` tasks form a parallel group. `[VERIFY]` tasks always break groups.

### Task Structure

```
- [ ] {phase}.{number} {title}
  - **Do**:
    1. {Specific action with file paths}
    2. {Next action}
  - **Files**: {file1}, {file2}
  - **Done when**: {Declarative success criteria — the contract}
  - **Verify**: `{automated command that proves it works}`
  - **Commit**: `{conventional commit message}`
  - _Requirements: FR-1, AC-1.1_
```

### Key Principles

1. **Done when > Do**: The Do steps are guidance; Done when is the contract.
   Instead of "Add validation" → "Done when: invalid inputs return 400 with error"
2. **All verification MUST be automated**: No manual checks. Use curl, test 
   runners, grep, CLI tools, browser automation.
3. **One logical concern per task**: No bundling unrelated changes.
4. **Surgical**: Touch only what the task requires. No drive-by refactors.

### Quality Checkpoints

Insert `[VERIFY]` checkpoints every 2-3 tasks:

```
- [ ] V1 [VERIFY] Quality check: {lint cmd} && {typecheck cmd}
  - **Do**: Run quality commands and verify all pass
  - **Verify**: All commands exit 0
  - **Done when**: No lint errors, no type errors
  - **Commit**: `chore(scope): pass quality checkpoint` (if fixes needed)
```

Final verification sequence (last tasks of every spec):

```
- [ ] V4 [VERIFY] Full local CI: {lint} && {typecheck} && {test} && {build}
- [ ] V5 [VERIFY] CI pipeline passes (gh pr checks shows all green)
- [ ] V6 [VERIFY] AC checklist (programmatically verify each AC-* is satisfied)
```

### Workflow Selection (based on Intent Classification)

**GREENFIELD → POC-first** (5 phases):
| Phase | Goal | Distribution |
|-------|------|-------------|
| 1. Make It Work (POC) | Working prototype, skip tests, validate end-to-end | 50-60% |
| 2. Refactoring | Clean up, error handling, follow patterns | 15-20% |
| 3. Testing | Unit, integration, E2E tests | 15-20% |
| 4. Quality Gates | Lint, types, CI, PR creation | 10-15% |
| 5. PR Lifecycle | CI monitoring, review resolution, final validation | 5-10% |

**Non-GREENFIELD → TDD Red-Green-Yellow** (4 phases):
| Phase | Goal | Distribution |
|-------|------|-------------|
| 1. Red-Green-Yellow Cycles | Test-first implementation in triplets | 60-70% |
| 2. Additional Testing | Integration/E2E beyond unit tests | 10-15% |
| 3. Quality Gates | Local CI, PR creation | 10-15% |
| 4. PR Lifecycle | CI monitoring, review resolution | 5-10% |

**BUG_FIX → Bug TDD** (Phase 0 + TDD):
Prepend Phase 0 (Reproduce) before TDD phases. Confirm the bug is reproducible
with an automated command before writing any code.

### Target Task Counts

| Workflow | Fine (default) | Coarse |
|----------|---------------|--------|
| POC-first | 40-60+ tasks | 10-20 tasks |
| TDD | 30-50+ tasks | 8-15 tasks |

## Boundaries
- Does NOT write implementation code
- Does NOT modify source files
- ONLY produces spec artifacts and hands off to the Lead
- Can READ any file in the codebase for research purposes

## Phase Gates

**Project-level phases** (new app kickoff):
1. Vision Interview → must produce prd.md, confirmed by user
2. Architecture → must produce architecture.md, confirmed by user
3. Feature Decomposition → must produce roadmap.md, confirmed by user
4. Foundation Spec → auto-generates spec for F000 (Project Foundation)
   then hands off to the normal feature-level flow for F000

**Feature-level phases** (adding a feature):
1. Discovery → must produce goals.md, confirmed by user
2. Research → must produce research.md
3. Requirements → must produce requirements.md
4. Design → must produce design.md
5. Tasks → must produce tasks.md with at least one task per involved agent

**User checkpoints** (phases where the Spec agent MUST wait for user input):
- Project level: After PRD, after Architecture, after Roadmap
- Feature level: After Discovery (confirm goals.md), after Requirements
  (confirm acceptance criteria), after Tasks (confirm task list)

Research and Design can run without interruption unless the agent encounters
ambiguity or conflicting constraints, in which case it should ask.

## Completion Signals
- Project level: "PRD COMPLETE — roadmap has {N} features. Starting F000."
- Feature level: "SPEC COMPLETE: {feature-name} — {N} tasks ready for implementation"
```

### 2.2 Modify the Lead Agent's Charter

You need to edit the Lead's existing charter to add a spec-first gate. Find the Lead's charter (typically in `.squad/agents/lead/charter.md` or wherever Squad generates it during `init`) and add a section like this:

```markdown
## Spec-First Workflow

Before dispatching ANY implementation work to the team:

### New App (no prd.md exists):
1. **Check for constitution**: Look for `.squad/constitution.md`
2. **If no constitution**: Route to Spec agent for constitution setup first.
   Say: "Let's establish project principles before we start planning."
3. **After constitution, check for PRD**: Look for `.squad/prd.md`
4. **If no PRD exists**: Route to the Spec agent in project-level mode.
   Say: "This looks like a new project. Routing to Spec for project planning."
5. Spec agent will produce prd.md → architecture.md → roadmap.md → F000 spec
6. Once F000 spec is ready, dispatch F000 tasks to the team.
7. After F000 is complete, auto-transition to the next feature (see Continuous Mode).

### Existing App (prd.md exists):
1. **Check for feature spec**: Look for `.squad/specs/{feature-name}/tasks.md`
2. **If no spec exists**: Route to the Spec agent in feature-level mode.
   Say: "Routing to Spec for planning before we start building."
3. **If spec exists**: Read tasks.md and dispatch tasks to agents based on 
   the Agent column, respecting dependency ordering and parallelism markers.
4. **Never skip the spec phase** unless the user explicitly says "skip spec" 
   or the task is trivially small (single-file fix, typo, etc.)

### Constitution Validation
Every feature spec must be consistent with `.squad/constitution.md`:
- Research phase reads the constitution to understand existing standards
- Requirements phase validates user stories against MUST rules
- Design phase ensures technical decisions follow architecture patterns
- Tasks phase uses constitution's commit conventions and testing requirements
If a feature would violate a MUST rule, flag it during spec review.

## Auto-Merge

When a feature's PR passes ALL quality gates (V4 local CI, V5 CI pipeline,
V6 AC checklist), the Lead auto-merges without waiting for human review:

```bash
gh pr merge --squash --auto --delete-branch
```

**Why squash**: Each feature becomes a single clean commit on main, with the
full task-by-task history preserved in the feature branch.

**When NOT to auto-merge**:
- If CI fails → fix and retry (part of PR Lifecycle phase)
- If the user said "don't auto-merge" or "I want to review PRs" → stop and
  notify the user, wait for manual merge
- If a MUST rule from the constitution was flagged during spec review

**Configure auto-merge** in the Lead charter or via a flag:
- Default: auto-merge ON (maximum automation)
- Override: "Team, build F001 but don't auto-merge" → waits for manual merge

## Continuous Mode (Default)

After a feature completes (build done, PR merged), the Lead automatically:

1. **Extract learnings** from .progress.md → append to .squad/learnings.md
2. **Quick re-index** the codebase (--quick --changed) to pick up new components
3. **Update roadmap** — mark the completed feature as [DONE]
4. **Find next feature** — pick the next [MVP] feature with all dependencies met
5. **Auto-start next spec** — route to the Spec agent for the next feature

The Lead does NOT stop and ask "Ready for the next feature?" — it just starts it.

**Spec mode for auto-started features**:
- If user is actively watching (interactive session): normal mode with interviews
- If user stepped away (no response within 30 seconds): --quick mode
  (skip interviews, auto-generate all artifacts, auto-approve)
- User can always interrupt and steer: "Wait — I want to review the design 
  for F003 before you build it"

**When continuous mode stops**:
- All [MVP] features on the roadmap are [DONE]
- A feature build fails after max retries
- The user interrupts with Ctrl+C or a message
- Context window is exhausted (suggest starting a new session)

**The chain**: Feature complete → merge → learnings → re-index → next spec → 
next build → merge → learnings → ... → MVP complete.

## Task Dispatch from Spec

When reading tasks.md:
- Tasks marked [P] with no unmet dependencies → launch in parallel
- Tasks with dependencies → hold until dependencies are marked complete
- Route each task to the agent specified in the Agent column
- Track completion in `.squad/specs/{feature-name}/progress.md`
```

### 2.3 Add Spec Templates

Create a templates directory that the Spec agent uses as scaffolding:

**File: `.squad/templates/project/constitution.md`**

```markdown
# Project Constitution

Version: 1.0.0
Last Updated: {date}

## 1. Project Identity

### 1.1 Name & Purpose
- **Name**: {project name}
- **Purpose**: {one sentence purpose}
- **Core Domain**: {primary problem domain}

## 2. Principles

### 2.1 MUST Rules (Non-Negotiable)
<!-- Security-critical, legal, breaking if violated -->
- [MUST] {principle}

### 2.2 SHOULD Rules (Strong Recommendations)
<!-- Best practices, can override with justification -->
- [SHOULD] {principle}

### 2.3 MAY Rules (Optional Guidelines)
<!-- Preferences, nice-to-haves -->
- [MAY] {principle}

## 3. Technology Stack

### 3.1 Languages & Frameworks
<!-- Primary language, framework, rationale -->

### 3.2 Tools
- Build: {tool}
- Test: {tool}
- Lint: {tool}
- Format: {tool}

### 3.3 Infrastructure
<!-- Hosting, CI/CD, environments -->

## 4. Architecture Patterns

### 4.1 Code Organisation
<!-- Directory structure, module boundaries -->

### 4.2 Naming Conventions
- Files: {convention}
- Functions: {convention}
- Variables: {convention}
- Commits: {convention e.g., conventional commits}

### 4.3 Error Handling
<!-- Structured errors, logging, correlation IDs -->

### 4.4 API Response Shape
<!-- Standard response format if applicable -->

## 5. Quality Standards

### 5.1 Testing Requirements
- Unit test coverage: {threshold}
- Integration tests: {requirement}
- E2E tests: {requirement}

### 5.2 Performance Targets
<!-- Response time, bundle size, etc. -->

### 5.3 Security Requirements
<!-- Auth, input validation, secrets management -->

## 6. Development Workflow

### 6.1 Branching Strategy
<!-- Branch naming, merge strategy -->

### 6.2 Code Review
<!-- Review requirements, approval count -->

### 6.3 CI/CD
<!-- Pipeline stages, deployment strategy -->

## Changelog

### 1.0.0 - {date}
- Initial constitution
```

**File: `.squad/templates/project/prd.md`**

```markdown
# Product Requirements Document: {app-name}

## Vision
<!-- One paragraph: what is this app and why does it exist? -->

## Target Users
<!-- Who specifically uses this? What's their context? -->

## Core Problem
<!-- What problem does this solve? Why do existing solutions fall short? -->

## Core Features (MVP)
<!-- 3-5 features that make this app minimally useful -->
<!-- For each: one-line description + why it's essential -->

## User Journey
<!-- What does a user's first session look like, step by step? -->

## Out of Scope (v1)
<!-- What are we explicitly NOT building yet? -->

## Non-Functional Requirements
<!-- Performance, security, accessibility, compliance, scalability -->

## Success Metrics
<!-- How do we know this app is working? What would you measure? -->

## Constraints
<!-- Timeline, budget, team size, platform, regulatory -->
```

**File: `.squad/templates/project/architecture.md`**

```markdown
# Architecture: {app-name}

## Tech Stack
<!-- Language, framework, database, hosting — with rationale for each -->

## Project Structure
<!-- Top-level directory layout and what goes where -->

## Data Model (High-Level)
<!-- Core entities and their relationships — not full schema yet -->

## API Design
<!-- REST vs GraphQL, versioning strategy, auth approach -->

## Infrastructure
<!-- Hosting, CI/CD, environments (dev/staging/prod) -->

## Key Decisions
<!-- Document any architectural decisions and their reasoning -->
<!-- Format: Decision | Options Considered | Choice | Why -->

## Development Setup
<!-- How does a dev get this running locally? -->

## Dependencies
<!-- External services, APIs, packages that the app relies on -->
```

**File: `.squad/templates/spec/goals.md`**

```markdown
# Goals: {feature-name}

## Problem Statement
<!-- What end-user problem does this feature solve? -->

## Success Criteria
<!-- How would you demo this? What does "done" look like? -->

## In Scope
<!-- What's included in this iteration? -->

## Out of Scope
<!-- What's explicitly deferred to a future iteration? -->

## Constraints
<!-- Hard constraints: tech stack, timeline, platform, dependencies -->

## Users
<!-- Who uses this? Public, internal, API consumers? -->

## Testing Expectations
<!-- Unit? Integration? E2E? What level of coverage? -->
```

**File: `.squad/templates/spec/research.md`**

```markdown
# Research: {feature-name}

## Executive Summary
<!-- 2-3 sentence overview of findings -->

## External Research

### Best Practices
<!-- Finding with source URL -->

### Prior Art
<!-- Similar solutions found -->

### Pitfalls to Avoid
<!-- Common mistakes from community -->

## Codebase Analysis

### Existing Patterns
<!-- Pattern found in codebase with file path -->

### Dependencies
<!-- Existing deps that can be leveraged -->

### Constraints
<!-- Technical limitations discovered -->

## Quality Commands

| Type | Command | Source |
|------|---------|--------|
| Lint | `{actual command}` | {where found} |
| TypeCheck | `{actual command}` | {where found} |
| Test | `{actual command}` | {where found} |
| Build | `{actual command}` | {where found} |

**Local CI**: `{lint} && {typecheck} && {test} && {build}`

<!-- Discover these from package.json scripts, Makefile, CI configs -->
<!-- NEVER assume commands — always verify they exist -->

## Verification Tooling

| Tool | Command/Value | Detected From |
|------|--------------|---------------|
| Dev Server | `{command}` | {source} |
| Port | `{number}` | {source} |
| Health Endpoint | `{path}` | {source} |
| Browser Automation | `{tool}` | {source} |

**Project Type**: Web App / API / CLI / Library
**Verification Strategy**: {how VE tasks should verify this feature works}

## Related Specs

| Spec | Relationship | May Need Update |
|------|-------------|----------------|
| {spec-name} | {High/Medium/Low — why} | {yes/no} |

## Feasibility Assessment

| Aspect | Assessment | Notes |
|--------|-----------|-------|
| Technical Viability | High/Medium/Low | {why} |
| Effort Estimate | S/M/L/XL | {basis} |
| Risk Level | High/Medium/Low | {key risks} |

## Recommendations for Requirements
1. {Specific recommendation based on research}
2. {Another recommendation}

## Open Questions
- {Questions that need clarification}

## Sources
- {URL or file path}
```

Create similar templates for `requirements.md`, `design.md`, and `tasks.md`. The Spec agent uses these as starting points and fills them in.

### 2.4 File Summary — What You're Adding/Changing

```
.squad/
├── constitution.md              ← NEW (created at project kickoff, before PRD)
├── prd.md                       ← NEW (created at project kickoff)
├── architecture.md              ← NEW (created at project kickoff)
├── roadmap.md                   ← NEW (created at project kickoff)
├── learnings.md                 ← NEW (accumulated across all features)
├── agents/
│   ├── lead/
│   │   └── charter.md          ← MODIFIED (add spec-first gate + roadmap + constitution)
│   ├── spec/
│   │   └── charter.md          ← NEW
│   ├── frontend/
│   │   └── charter.md          (unchanged)
│   ├── backend/
│   │   └── charter.md          (unchanged)
│   └── tester/
│       └── charter.md          (unchanged)
├── specs/
│   ├── .index/                  ← NEW (created by codebase indexing)
│   │   ├── index.md            (summary dashboard)
│   │   ├── .index-state.json   (hashes for incremental re-index)
│   │   ├── components/         (per-component specs)
│   │   └── external/           (external resource specs)
│   └── {feature-name}/         ← NEW (created per feature)
│       ├── .ralph-state.json   (phase, intent, task progress)
│       ├── .progress.md        (interviews, learnings, task status)
│       ├── goals.md
│       ├── research.md
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
├── templates/
│   ├── project/                 ← NEW
│   │   ├── constitution.md
│   │   ├── prd.md
│   │   └── architecture.md
│   └── spec/                    ← NEW
│       ├── goals.md
│       ├── research.md
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
└── decisions.md                 (unchanged — Squad's existing decision log)
```

This keeps your modifications surgical. You're adding the Spec agent charter, project-level templates, feature-level templates, and one edit to the Lead's charter. The project-level artifacts (prd.md, architecture.md, roadmap.md) are generated at runtime during kickoff, not committed as part of the fork — they live per-project. This minimises merge conflicts when pulling upstream updates.

---

## Part 3: End-to-End User Flows

There are two flows depending on where you are in the project lifecycle.

---

### Flow A: Starting a New App (Project Kickoff)

Use this when you're creating a brand new repo and have nothing yet.

#### A1: Create Your Repo and Initialise Squad

```bash
mkdir my-app && cd my-app
git init
npx @YOUR_USERNAME/squad-cli
```

Squad initialises and creates your team. Then start Copilot CLI:

```bash
copilot
/agent squad
```

#### A2: Tell the Team What You're Building

```
You: Team, I want to build a meal planner app. It's a web app where 
     users can plan their weekly meals, get shopping lists, and save 
     recipes. I want to use Azure AI to suggest meals based on 
     preferences and what's in the fridge.
```

#### A3: Lead Detects New Project, Routes to Spec

The Lead sees no `constitution.md` and routes to the Spec agent:

```
🏗️ Lead: No project constitution found. Let's establish principles first.
📋 Spec: Starting project setup for "meal-planner"...
```

#### A4: Constitution (Interactive Mode)

The Spec agent establishes project principles. For a solo dev project, this
is quick — 3-5 questions:

```
📋 Spec: Before we plan features, let's set some ground rules for 
   the project. A few questions:

   1. Commit conventions — conventional commits (feat:, fix:, etc.) 
      or something simpler?
   2. Testing philosophy — TDD, test after, or minimal tests?
   3. Any hard coding standards? (strict TypeScript, no any, etc.)
```

```
You: Conventional commits. Test after — I want working code first, 
     then tests. Strict TypeScript, no any.
```

```
📋 Spec: Got it. Based on your stack (React + Express + PostgreSQL) 
   and preferences, here's the constitution:

   **MUST rules**:
   - TypeScript strict mode, no `any` types
   - Conventional commits (feat:, fix:, chore:, etc.)
   - All API responses follow { data, error, meta } shape
   - Secrets never in code or logs

   **SHOULD rules**:
   - Functions under 50 lines
   - One component per file
   - Error responses include error code + message
   - API endpoints documented with JSDoc

   **MAY rules**:
   - Use Zod for runtime validation at boundaries
   - Feature flags for gradual rollouts

   Does this look right? Anything to add or change?
```

```
You: Add that we use Knex for migrations and all DB changes must 
     have a migration. Otherwise good.
```

```
📋 Spec: Updated — added [MUST] All database changes require a 
   Knex migration.
   constitution.md created ✓
```

#### A5: Vision Interview (Interactive Mode)

The Spec agent now moves to planning. It noticed you already described the app, 
so it summarises what it heard and fills in the gaps:

```
📋 Spec: I've got a good picture from your description. Let me 
   confirm and ask a few things:

   You're building a meal planner web app with AI-powered suggestions,
   weekly planning, shopping lists, and recipe storage.

   A few questions:
   1. Who's this for — just you, or public-facing for other people?
   2. What does a user's first session look like? They sign up and 
      then what?
   3. What's the ONE thing it has to do well to be useful?
   4. Why build it — scratching your own itch?
```

```
You: Just me initially, but I'd like to open it up later. First 
     session: user signs up, sets dietary preferences, and the AI 
     suggests a week of meals. The key thing is the AI suggestions 
     need to be good — if the meal plans are boring, it's useless.
     And yeah, scratching my own itch — I'm tired of deciding what 
     to cook every night.
```

Round 2:

```
📋 Spec: Makes sense. A few more:

   5. What are the core features for v1? I'm thinking: AI meal 
      suggestions, weekly meal plan, shopping list, recipe storage. 
      Anything else, or is that the right set?
   6. What's explicitly NOT in v1?
   7. Any integrations? Supermarket APIs, nutrition data, etc.?
   8. Timeline or milestone driving this?
```

```
You: That's the right set for v1. Not in v1: social features, sharing 
     meal plans, multiple household members, barcode scanning. No 
     supermarket integrations yet — just a plain text shopping list. 
     No hard deadline, but I'd like the foundation up this weekend.
```

Round 3 (technical — the Spec agent asks because it's a greenfield project):

```
📋 Spec: Got it. Technical side:

   9. You mentioned Azure AI — are you set on Azure AI Foundry, 
      or open to alternatives?
   10. Tech stack preference? Frontend framework, database, etc.?
   11. Deployment target?
   12. Just you developing, or will others contribute?
```

```
You: Azure AI Foundry with Kimi K2.5 as the LLM — I've already 
     evaluated this. React frontend, Node/Express backend, PostgreSQL. 
     Deploy to Azure. Solo dev for now.
```

#### A6: PRD Confirmation

The Spec agent produces the PRD and reads it back:

```
📋 Spec: Here's the PRD I've put together:

   **Meal Planner** — An AI-powered web app for weekly meal planning.
   Solo project, initially for personal use with potential to open up.
   
   Target user: Solo home cook who's tired of deciding what to eat.
   
   Core features (MVP):
   1. AI Meal Suggestions — powered by Kimi K2.5 via Azure AI Foundry
   2. Weekly Meal Plan — drag/drop or accept/reject AI suggestions
   3. Shopping List — auto-generated from the meal plan
   4. Recipe Storage — save and browse recipes
   
   Tech: React + Node/Express + PostgreSQL on Azure.
   
   Out of scope (v1): Social features, sharing, multi-user households,
   barcode scanning, supermarket integrations.

   Does this capture it? Anything to change?
```

```
You: Add that I'm using a Ninja Combi multicooker, so the AI should 
     be able to factor in cooking method — like Combi meals, air fry, 
     slow cook. That's a key differentiator.
```

```
📋 Spec: Great addition — updated. PRD confirmed.
   prd.md created ✓
```

#### A7: Architecture

The Spec agent proposes the architecture based on the PRD and your stack choices:

```
📋 Spec: Architecture proposal:

   /meal-planner
   ├── client/          React (Vite), Tailwind
   ├── server/          Express, Knex for migrations
   ├── db/              PostgreSQL schemas
   ├── ai/              Azure AI Foundry integration (Kimi K2.5)
   └── shared/          Types, validation schemas

   Database: PostgreSQL on Azure
   Auth: Simple email/password JWT (feature F001)
   AI Integration: Azure AI Foundry SDK, Kimi K2.5 model
   Deployment: Azure App Service + Azure Database for PostgreSQL
   CI: GitHub Actions

   Key decision: Monorepo with client/server split rather than 
   separate repos — simpler for solo dev.

   Does this work?
```

```
You: Yes, go with that.
```

```
📋 Spec: architecture.md created ✓
```

#### A8: Feature Decomposition (Roadmap)

```
📋 Spec: Here's how I'd break this into features:

   Phase 1 — Foundation
   F000 | Project Foundation | Repo scaffolding, CI, dev tooling,
         | DB setup, base Express + React config | [MVP]

   Phase 2 — Core
   F001 | User Auth | Email/password JWT auth | [MVP]
   F002 | Recipe Storage | CRUD for recipes with categories | [MVP]
   F003 | AI Meal Suggestions | Azure AI integration, preference 
         | engine, cooking method awareness | [MVP]
   F004 | Weekly Meal Plan | Plan view, assign meals to days, 
         | accept/reject AI suggestions | [MVP]
   F005 | Shopping List | Auto-generate from meal plan | [MVP]

   Phase 3 — Polish
   F006 | Preference Tuning | Refine AI suggestions over time | [NEXT]
   F007 | Recipe Import | Import from URL or paste | [NEXT]
   F008 | Multi-user | Household members, sharing | [LATER]

   Ordering rationale: F000 first (foundation), F001 before anything 
   that needs auth, F002 before F003 (AI needs recipes to suggest), 
   F003 before F004 (plan needs suggestions), F004 before F005 
   (list needs a plan).

   Does the ordering make sense? Anything missing or in the wrong phase?
```

```
You: Looks right. Let's go.
```

```
📋 Spec: roadmap.md created ✓
   PRD COMPLETE — roadmap has 9 features. Starting F000.
```

#### A9: Foundation Spec → Build

The Spec agent now automatically generates the feature spec for F000 (Project Foundation). This one is simpler — the goals come directly from the architecture doc, so the discovery interview is minimal:

```
📋 Spec: Generating spec for F000 — Project Foundation...
   goals.md ✓ (derived from architecture.md)
   research.md ✓ (no existing codebase to research — noted stack choices)
   requirements.md ✓ (repo structure, CI pipeline, dev server, DB migration)
   design.md ✓ (mirrors architecture.md decisions)
   tasks.md ✓ — 8 tasks:
     T001 | Initialise monorepo with package.json | Lead | [P]
     T002 | Scaffold React client with Vite + Tailwind | Frontend | [P]
     T003 | Scaffold Express server with base middleware | Backend | [P]
     T004 | Set up PostgreSQL with Knex migrations | Backend | T003
     T005 | Create shared types package | Backend | [P]
     T006 | Set up GitHub Actions CI | Lead | T001
     T007 | Add dev scripts (concurrent client+server) | Lead | T001
     T008 | Verify full stack runs locally | Tester | T002,T003,T004

   Ready to build. Switch to Autopilot?
```

```
You: Yes, go.
```

You switch to Autopilot (Shift+Tab) and Squad builds the foundation.

#### A9b: What Happens During the Build

Autopilot keeps running without asking for approval. You'll see the team
working in parallel:

```
🏗️ Lead: Reading spec — 8 tasks. Dispatching parallel batch 1...

⎡ 🏗️ Lead: T001 — Initialise monorepo with package.json
⎢ ⚛️ Frontend: T002 — Scaffold React client with Vite + Tailwind    [P]
⎢ 🔧 Backend: T003 — Scaffold Express server with base middleware   [P]
⎣ 🔧 Backend: T005 — Create shared types package                    [P]

🏗️ Lead: T001 complete ✓  
   → commit: chore(project): initialise monorepo with package.json
⚛️ Frontend: T002 complete ✓
   → commit: feat(client): scaffold React client with Vite + Tailwind
🔧 Backend: T003 complete ✓
   → commit: feat(server): scaffold Express server with base middleware
🔧 Backend: T005 complete ✓
   → commit: feat(shared): create shared types package

🏗️ Lead: Dependencies met for batch 2. Dispatching...

⎡ 🔧 Backend: T004 — Set up PostgreSQL with Knex migrations  (waited on T003)
⎢ 🏗️ Lead: T006 — Set up GitHub Actions CI                   (waited on T001)
⎣ 🏗️ Lead: T007 — Add dev scripts                            (waited on T001)

🔧 Backend: T004 complete ✓
   → commit: feat(db): set up PostgreSQL with Knex migrations
🏗️ Lead: T006 complete ✓
   → commit: ci: set up GitHub Actions pipeline
🏗️ Lead: T007 complete ✓
   → commit: chore(dev): add concurrent client+server dev scripts

🏗️ Lead: Dependencies met for T008. Dispatching...

🧪 Tester: T008 — Verify full stack runs locally  (waited on T002,T003,T004)
   Running: npm run dev...
   ✓ Client starts on port 5173
   ✓ Server starts on port 3000
   ✓ Database connection successful
   ✓ Health endpoint returns 200
🧪 Tester: T008 complete ✓
   → commit: chore(verify): full stack runs locally
```

At this point all 8 tasks are done. But the spec isn't complete yet —
the Lead still needs to run quality gates:

```
🏗️ Lead: All implementation tasks complete. Running quality gates...

🧪 Tester: V4 [VERIFY] Full local CI
   Running: npm run lint && npm run check-types && npm test && npm run build
   ✓ Lint: 0 errors
   ✓ Types: 0 errors
   ✓ Tests: 3 passed (smoke tests from scaffold)
   ✓ Build: success
🧪 Tester: V4 complete ✓

🏗️ Lead: Creating PR...
   → Branch: feature/f000-project-foundation
   → PR #1: "feat: project foundation — repo scaffolding, CI, dev tooling"

🧪 Tester: V5 [VERIFY] CI pipeline passes
   Waiting for GitHub Actions...
   ✓ All checks green
🧪 Tester: V5 complete ✓

🧪 Tester: V6 [VERIFY] Acceptance criteria checklist
   ✓ AC-1: Monorepo structure with client/server/shared
   ✓ AC-2: React dev server starts
   ✓ AC-3: Express server starts with health endpoint
   ✓ AC-4: PostgreSQL connected with initial migration
   ✓ AC-5: CI pipeline runs lint, types, tests, build
🧪 Tester: V6 complete ✓
```

#### A10: Post-Build — Automatic Transition

Once F000 passes all quality gates, the Lead chains through the post-build
steps automatically — you don't need to do anything:

```
🏗️ Lead: F000 — Project Foundation COMPLETE ✓
   
   [Auto-merge] PR #1 merged via squash → main
   [Learnings] Extracted 2 learnings from F000:
     - Vite proxy config needed for /api routes to reach Express in dev
     - Knex migration filenames need timestamps, not sequential numbers
   [Re-index] Quick codebase scan (--quick --changed)
     Found: 3 controllers, 2 services, 1 model, 4 helpers, 1 migration
   [Roadmap] F000 — Project Foundation [DONE] ✓
   
   Next: F001 — User Auth
   Starting spec...
```

The Lead doesn't pause to ask "Ready for the next feature?" — it reads
the roadmap, picks the next [MVP] feature with all dependencies met,
and starts the Spec agent on it immediately.

**If you're still watching** (interactive session), the Spec agent runs
in normal mode with interviews — you'll see it ask questions about F001
and you can steer the spec:

```
📋 Spec: Starting specification for F001 — User Auth

   Reading context:
   ✓ constitution.md — project standards loaded
   ✓ learnings.md — 2 learnings from F000
   ✓ specs/.index/ — 11 components indexed
   ✓ prd.md — feature scope from PRD
   ✓ architecture.md — tech decisions

   A few questions before I start researching...
```

**If you've stepped away** (no response within 30 seconds), the Spec
agent falls back to --quick mode: it skips interviews, auto-generates
all spec artifacts, runs the automated spec-reviewer on each, and goes
straight to implementation. You can come back later to find PRs merged
and features built.

**If you want to interrupt** at any point:

```
You: Wait — pause before building F003. I want to review that design.
```

The Lead respects this and switches back to interactive mode for that feature.

This is now Flow B (below). The key difference from the very first feature
is that the Spec agent has real context: a constitution, learnings, index,
and a codebase full of patterns to follow.

---

### Flow B: Adding a Feature (Existing App)

Use this when you already have a repo with code and a PRD.

#### B1: Start Copilot CLI and Enter Squad

```bash
copilot
```

Then select the Squad agent:

```
/agent squad
```

Or in VS Code, open Copilot Chat and type `@squad`.

#### B2: Request a Feature

You speak to the team naturally:

```
Team, I need user authentication with JWT tokens. Users should be able 
to register, login, and refresh tokens. We need rate limiting on the 
auth endpoints.
```

#### B3: Lead Routes to Spec Agent (Automatic)

The Lead checks for an existing spec. There isn't one, so it routes to Spec:

```
🏗️ Lead: No spec found for this feature. Routing to Spec for planning.
📋 Spec: Starting specification for "user-authentication"...
```

#### B4: Discovery Interview

The Spec agent interviews you before doing anything else. It reads your initial request and skips questions you've already answered:

```
📋 Spec: Before I start researching, let me make sure I understand what 
   you're after.

   You've mentioned JWT auth with register, login, refresh, and rate 
   limiting. A few questions:

   1. What's the end-user problem? Is this for a public-facing app where
      anyone can sign up, or an internal tool with controlled access?
   2. What does "done" look like — how would you demo this?
   3. Any hard constraints? (e.g., must use a specific auth library, 
      must support mobile clients, deadline)
   4. Is there existing auth code or middleware this builds on?
```

You answer naturally:

```
You: It's for my meal planner app — public-facing, anyone can sign up.
     Done means I can register, login, and hit a protected endpoint 
     with a valid token. No specific library preference. No existing 
     auth code. It's an Express API with PostgreSQL. I'd like to keep 
     it simple — no OAuth yet, just email/password for now.
```

The Spec agent adapts based on your answers and asks Round 2:

```
📋 Spec: Got it — simple email/password auth for a public API. 
   A couple more:

   5. What's explicitly out of scope? (e.g., password reset, email 
      verification, admin roles)
   6. Any external dependencies? Third-party email service, etc.?
   7. Testing expectations — unit tests enough, or do you want 
      integration/E2E as well?
```

```
You: Out of scope: password reset, email verification, roles — all 
     Phase 2 stuff. No external dependencies. Unit tests on the backend,
     and one happy-path integration test for the full register→login→
     access flow.
```

#### B5: Goals Confirmation

The Spec agent summarises what it heard and asks you to confirm:

```
📋 Spec: Here's what I've captured in goals.md:

   **Feature**: User Authentication (email/password)
   **App**: Meal planner — public-facing Express API + PostgreSQL
   **In scope**: Register, login, token refresh, rate limiting on 
   auth endpoints. Unit tests + one integration test.
   **Out of scope (Phase 2)**: Password reset, email verification, 
   roles, OAuth/social login.
   **Constraints**: Keep it simple. No specific library mandated.
   **Demo**: Register a user, login, use token to hit a protected 
   endpoint successfully.

   Does this capture it? Anything to add or change?
```

```
You: Looks good. Go ahead.
```

#### B6: Spec Phases — Research, Requirements, Design, Tasks

Each phase has its own interview, approach proposals, artifact generation, and
approval gate. The Spec agent stops after each phase and waits for you.

**RESEARCH** — the Spec agent reads constitution, learnings, index, then interviews:

```
📋 Spec: Research phase for "user-authentication"

   Context loaded:
   ✓ constitution.md — [MUST] strict TypeScript, conventional commits
   ✓ learnings.md — Knex migration filenames need timestamps
   ✓ specs/.index/ — Found: express middleware pattern, Knex setup
   
   I have a few questions about the technical approach:

   1. You've got Express middleware already set up. Do you want auth
      as middleware (protects routes) or as a standalone service module?
```

```
You: Middleware — consistent with what's already there.
```

```
📋 Spec: Based on our discussion, here are the research approaches:

   **(A) [Recommended] Focus on existing patterns**
   Your Express setup already has middleware patterns. Research bcrypt + 
   jsonwebtoken since they're the standard lightweight choice.
   Trade-off: Fast, proven, but you wire everything yourself.

   **(B) Broad library comparison**
   Compare Passport.js, express-jwt, jose, and roll-your-own.
   Trade-off: More thorough, but probably overkill for email/password only.

   Which approach?
```

```
You: A — keep it simple.
```

The Spec agent researches, then presents findings:

```
📋 Spec: Research complete for "user-authentication"
   Output: .squad/specs/f001-user-auth/research.md

   ## What I Found

   **Summary**: bcrypt + jsonwebtoken is well-suited. Your existing 
   middleware pattern in /middleware/index.ts supports easy integration.

   **Key Recommendations**:
   1. Use bcrypt (not bcryptjs) — native bindings, 3x faster
   2. Store refresh tokens in DB, not just JWT
   3. Rate limiting via express-rate-limit (already in package.json)

   **Quality Commands**: npm run lint, npm run check-types, npm test
   **Feasibility**: High | **Risk**: Low | **Effort**: S

   How do you want to proceed?
   1. ✅ Approve (Recommended)
   2. 🔍 Run review
   3. ✏️ Request changes
```

```
You: Approve.
```

**REQUIREMENTS** — same pattern: interview → approach proposals → generation → approval:

```
📋 Spec: Requirements phase. A couple of questions:

   1. Rate limiting — you mentioned per-IP at 10/15min. Should failed 
      logins also lock the account temporarily, or just slow down the IP?
   2. Token refresh — should refresh tokens expire, and if so, how long?
```

```
You: Just slow the IP, no account locking. Refresh tokens expire after 
     7 days.
```

```
📋 Spec: Requirements complete.
   Output: .squad/specs/f001-user-auth/requirements.md

   **User Stories** (4 total):
   - US-1: User Registration (email/password)
   - US-2: User Login (returns access + refresh tokens)
   - US-3: Token Refresh (swap refresh token for new access token)
   - US-4: Rate Limiting (per-IP, 10 attempts per 15 minutes)

   **Requirements**: 6 functional, 3 non-functional

   How do you want to proceed?
```

```
You: Approve.
```

**DESIGN** — same pattern:

```
📋 Spec: Design phase. One question:

   For the auth middleware, do you want a single `requireAuth` middleware 
   that rejects unauthenticated requests, or a softer `loadUser` that 
   attaches the user if present but doesn't reject?
```

```
You: Both — requireAuth for protected routes, loadUser for optional auth 
     like personalised homepage.
```

```
📋 Spec: Design complete.
   Output: .squad/specs/f001-user-auth/design.md

   Components: AuthController, AuthService, AuthMiddleware (requireAuth + loadUser)
   DB: users table (id, email, password_hash, created_at), 
       refresh_tokens table (id, user_id, token_hash, expires_at)
   API: POST /auth/register, POST /auth/login, POST /auth/refresh
   
   How do you want to proceed?
```

```
You: Approve.
```

**TASKS** — generated from all prior artifacts, then presented for review:

```
📋 Spec: Tasks complete.
   Output: .squad/specs/f001-user-auth/tasks.md
   
   Workflow: POC-first (GREENFIELD intent)
   Total: 38 tasks across 5 phases

   Phase 1 — Make It Work (POC): 21 tasks
     T1.1  Create users table migration | Backend | [P]
     T1.2  Create refresh_tokens table migration | Backend | [P]
     T1.3  Run migrations | Backend | T1.1, T1.2
     T1.4  Create AuthService with register() | Backend | T1.3
     T1.5  Create AuthService with login() | Backend | T1.3
     ...
     T1.19 POC Checkpoint — register, login, access protected endpoint | Tester
   
   Phase 2 — Refactoring: 5 tasks
   Phase 3 — Testing: 7 tasks  
   Phase 4 — Quality Gates: 3 tasks (V4, V5, V6)
   Phase 5 — PR Lifecycle: 2 tasks

   Does the task list look right?
```

```
You: Looks good. Let's build it.
```

#### B7: Switch to Autopilot and Implement

Switch to Autopilot (Shift+Tab) and tell the team to go:

```
You: Team, implement the user-authentication spec.
```

The Lead reads tasks.md and dispatches in dependency order:

```
🏗️ Lead: Reading spec — 38 tasks, POC-first workflow.
   Dispatching Phase 1, batch 1...

⎡ 🔧 Backend: T1.1 — Create users table migration               [P]
⎣ 🔧 Backend: T1.2 — Create refresh_tokens table migration       [P]

🔧 Backend: T1.1 complete ✓ → commit: feat(db): create users table migration
🔧 Backend: T1.2 complete ✓ → commit: feat(db): create refresh_tokens migration

🏗️ Lead: Dispatching batch 2...

🔧 Backend: T1.3 — Run migrations (waited on T1.1, T1.2)
🔧 Backend: T1.3 complete ✓ → commit: chore(db): run initial auth migrations

🏗️ Lead: Dispatching batch 3...

⎡ 🔧 Backend: T1.4 — Create AuthService.register()              [P]
⎣ 🔧 Backend: T1.5 — Create AuthService.login()                  [P]

...tasks continue...

🧪 Tester: V1 [VERIFY] Quality check: npm run lint && npm run check-types
   ✓ 0 lint errors, 0 type errors
🧪 Tester: V1 complete ✓

...more tasks...

🧪 Tester: T1.19 — POC Checkpoint
   Running: curl -X POST localhost:3000/auth/register ...
   ✓ Register returns 201 with { id, email }
   Running: curl -X POST localhost:3000/auth/login ...
   ✓ Login returns 200 with { accessToken, refreshToken }
   Running: curl -H "Authorization: Bearer $TOKEN" localhost:3000/protected
   ✓ Protected endpoint returns 200
🧪 Tester: T1.19 complete ✓ → commit: feat(auth): complete POC

🏗️ Lead: Phase 1 (POC) complete. Moving to Phase 2 (Refactoring)...

...Phase 2-3 tasks run...

🧪 Tester: V4 [VERIFY] Full local CI
   ✓ Lint, types, unit tests, integration test all pass
🧪 Tester: V4 complete ✓

🏗️ Lead: Creating PR...
   → Branch: feature/f001-user-auth
   → PR #2: "feat: user authentication — register, login, refresh, rate limiting"

🧪 Tester: V5 [VERIFY] CI pipeline passes
   ✓ All GitHub Actions checks green

🧪 Tester: V6 [VERIFY] AC checklist
   ✓ AC-1.1: Register with valid email/password returns 201
   ✓ AC-1.2: Register with duplicate email returns 409
   ✓ AC-2.1: Login with correct credentials returns tokens
   ✓ AC-2.2: Login with wrong password returns 401
   ✓ AC-3.1: Valid refresh token returns new access token
   ✓ AC-3.2: Expired refresh token returns 401
   ✓ AC-4.1: 11th request within 15 minutes returns 429
```

The whole process runs autonomously. You can watch, work on something else,
or come back later — the progress is tracked in `.squad/specs/f001-user-auth/.progress.md`.

#### B8: Post-Build — Automatic Transition to Next Feature

Once all quality gates pass, the Lead chains through post-build automatically:

```
🏗️ Lead: F001 — User Auth COMPLETE ✓
   
   [Auto-merge] PR #2 merged via squash → main
   [Learnings] Extracted 3 learnings from F001:
     - bcrypt.compare is async — must await (caught by V1 quality check)
     - express-rate-limit windowMs is in milliseconds, not seconds
     - Refresh token rotation: always invalidate old token on refresh
   [Re-index] Quick codebase scan (--quick --changed)
     New: 2 controllers, 1 service, 1 middleware, 2 migrations
   [Roadmap] F001 — User Auth [DONE] ✓
   
   Next: F002 — Recipe Storage
   Starting spec...
```

No pause. The Spec agent immediately begins F002, reading the constitution,
learnings (now 5 entries from F000 + F001), updated index, and PRD. If you're
watching, you get interviews. If you've stepped away, it falls back to --quick.

```
📋 Spec: Starting specification for F002 — Recipe Storage

   Reading context:
   ✓ constitution.md — [MUST] strict TypeScript, Knex migrations
   ✓ learnings.md — 5 learnings from F000 + F001
   ✓ specs/.index/ — 18 components indexed (including new auth modules)
   ✓ F001 design.md — auth middleware available for protected routes
   
   Research phase — analysing codebase...
```

This chain continues: F002 → F003 → F004 → F005 → ... until all [MVP]
features are [DONE].

#### B9: The Full Autonomous Run

Here's what maximum automation looks like. You kick it off with a single
prompt and come back to a built app:

```
You: Team, build all MVP features from the roadmap.
```

```
🏗️ Lead: Roadmap has 6 [MVP] features (F000-F005).
   F000 [DONE] ✓
   Starting continuous build from F001...
```

The system runs this loop for each feature:

```
┌─────────────────────────────────────────────────────┐
│  For each [MVP] feature on the roadmap:             │
│                                                     │
│  1. Spec (--quick if user absent, interviews if     │
│     user is active)                                 │
│     → research.md → requirements.md → design.md     │
│     → tasks.md                                      │
│  2. Build (Autopilot — parallel task dispatch)      │
│     → implementation → quality gates → PR           │
│  3. Post-build (automatic)                          │
│     → auto-merge PR                                 │
│     → extract learnings                             │
│     → quick re-index                                │
│     → update roadmap                                │
│  4. → Loop to next feature                          │
│                                                     │
│  Stop when: all [MVP] features [DONE], or error,    │
│  or user interrupts                                 │
└─────────────────────────────────────────────────────┘
```

**What you see if you watch:**

```
🏗️ Lead: F001 — User Auth
📋 Spec: [--quick] Generating spec... research ✓ requirements ✓ design ✓ tasks ✓
🏗️ Lead: Dispatching 38 tasks...
   ...Phase 1 (POC)... Phase 2 (Refactor)... Phase 3 (Test)...
🧪 Tester: V4 ✓ V5 ✓ V6 ✓
🏗️ Lead: PR #2 auto-merged ✓ | Learnings: 3 | Re-indexed | F001 [DONE]

🏗️ Lead: F002 — Recipe Storage
📋 Spec: [--quick] Generating spec... research ✓ requirements ✓ design ✓ tasks ✓
🏗️ Lead: Dispatching 42 tasks...
   ...
🏗️ Lead: PR #3 auto-merged ✓ | Learnings: 2 | Re-indexed | F002 [DONE]

🏗️ Lead: F003 — AI Meal Suggestions
📋 Spec: [--quick] Generating spec... research ✓ requirements ✓ design ✓ tasks ✓
🏗️ Lead: Dispatching 51 tasks...
   ...
🏗️ Lead: PR #4 auto-merged ✓ | Learnings: 4 | Re-indexed | F003 [DONE]

...

🏗️ Lead: F005 — Shopping List
   ...
🏗️ Lead: PR #6 auto-merged ✓ | Learnings: 1 | Re-indexed | F005 [DONE]

🏗️ Lead: ALL [MVP] FEATURES COMPLETE ✓
   Roadmap:
   F000 — Project Foundation [DONE] ✓
   F001 — User Auth [DONE] ✓
   F002 — Recipe Storage [DONE] ✓
   F003 — AI Meal Suggestions [DONE] ✓
   F004 — Weekly Meal Plan [DONE] ✓
   F005 — Shopping List [DONE] ✓

   Total: 6 features, 6 PRs merged, 14 learnings accumulated
   
   [NEXT] features remaining on roadmap:
   F006 — Preference Tuning
   F007 — Recipe Import
   
   Continue with [NEXT] features, or stop here?
```

**How to interrupt:**

At any point during the run, you can jump in:

```
You: Hold on — the AI suggestions for F003 need to know about the 
     Ninja Combi cooking methods. Let me give you more context.
```

The Lead pauses, you steer the Spec agent for that feature's spec with
a normal interactive interview, and then autopilot resumes.

**If something breaks:**

```
🏗️ Lead: F003 — AI Meal Suggestions
   ⚠️ T1.12 failed after 5 retries: Azure AI Foundry SDK connection timeout
   
   Logged to .progress.md. Attempting next task...
   ⚠️ T1.13 depends on T1.12 — skipped
   ⚠️ T1.14 depends on T1.12 — skipped
   
   3 tasks blocked. Continuing with independent tasks...
   ...
   ⚠️ Feature F003 incomplete — 3 tasks failed/skipped
   
   Options:
   1. Skip F003, continue with F004 (F003 stays in-progress)
   2. Stop continuous mode — investigate F003
   
   Choosing: Skip and continue (default in continuous mode)
   F003 marked [BLOCKED] on roadmap
   
   Next: F004 — Weekly Meal Plan
   Starting spec...
```

You can come back and fix F003 later. The roadmap shows it as [BLOCKED].

**Resuming after a break:**

If Copilot's context window fills up or the session disconnects, everything
is persisted in files. Start a new session:

```bash
copilot
/agent squad
```

```
You: Team, continue building the roadmap.
```

```
🏗️ Lead: Checking roadmap...
   F000 [DONE] ✓ | F001 [DONE] ✓ | F002 [DONE] ✓
   F003 [BLOCKED] — 3 tasks failed (Azure AI timeout)
   F004 — not started
   
   Resuming from F004...
```

#### B10: Levels of Automation

You control how much automation you want per session:

| Level | Command | Behaviour |
|-------|---------|-----------|
| **Full auto** | "Build all MVP features" | --quick specs, auto-merge, continuous chain |
| **Attended auto** | "Build F001" (and stay in session) | Interactive specs, auto-merge, auto-transition to next |
| **Selective** | "Build F001 but don't auto-merge" | Interactive specs, PR waits for you to merge, then continues |
| **Manual** | "Spec F001" then later "Build F001" | You run each phase separately |

The default is full auto. You dial it back when you want more control over
specific features — e.g., the AI integration (F003) might warrant interactive
spec interviews, while the CRUD features (F002, F005) are fine on full auto.

### Flow Summaries

**Flow A — New App:**

```
You: "I want to build {app description}"
  → Lead (no constitution.md found)
    → Spec Agent — CONSTITUTION [Interactive]
      → constitution.md → you confirm
    → Spec Agent — VISION INTERVIEW [Interactive]
      → prd.md → you confirm
    → Spec Agent — ARCHITECTURE [Interactive]
      → architecture.md → you confirm
    → Spec Agent — FEATURE DECOMPOSITION [Interactive]
      → roadmap.md → you confirm
    → CONTINUOUS MODE BEGINS:
      → F000: Spec [auto] → Build [autopilot] → Auto-merge → Learnings → Re-index
      → F001: Spec [auto] → Build [autopilot] → Auto-merge → Learnings → Re-index
      → F002: Spec [auto] → Build [autopilot] → Auto-merge → Learnings → Re-index
      → ... continues until all [MVP] features [DONE]
```

**Flow B — Continuous Feature Chain (Default):**

```
For each [MVP] feature on the roadmap:
  → Spec Agent — SPEC [--quick if unattended, interviews if attended]
    → research.md → requirements.md → design.md → tasks.md
  → Lead — BUILD [Autopilot — parallel task dispatch]
    → implementation → quality gates → PR
  → Lead — POST-BUILD [automatic]
    → auto-merge PR (gh pr merge --squash --auto)
    → extract learnings → .squad/learnings.md
    → quick re-index (--quick --changed)
    → update roadmap → mark [DONE]
  → Lead — NEXT FEATURE [automatic]
    → pick next [MVP] with dependencies met
    → start spec immediately
    
Stop when: all [MVP] [DONE], or error, or user interrupts (Ctrl+C / message)
```

**Flow C — Indexing (Brownfield / Periodic):**

```
You: "Index the codebase" (or "Index src/api/")
  → Spec Agent — PRE-SCAN INTERVIEW [Interactive]
    → External URLs? Focus areas? Sparse areas?
  → Spec Agent — COMPONENT SCAN [Autopilot]
    → Scans controllers, services, models, helpers, migrations
    → Fetches external resources (URLs, MCP servers)
    → Generates component specs in .squad/specs/.index/
  → Spec Agent — POST-SCAN REVIEW [Interactive]
    → "Found N components. Seem complete?"
  → Index available for all future research phases
```

### Quick Reference: Mode Switching

| Phase                       | Copilot Mode | Automation Level |
|-----------------------------|-------------|------------------|
| Constitution setup          | Interactive | You answer questions, confirm |
| Vision interview (new app)  | Interactive | You answer questions, confirm |
| PRD / Architecture review   | Interactive | You confirm foundational docs |
| Roadmap review              | Interactive | You confirm, then continuous mode begins |
| Spec generation (attended)  | Plan        | Per-phase interview, you approve each |
| Spec generation (unattended)| Autopilot   | --quick auto-generates + auto-reviews |
| Implementation              | Autopilot   | Fully autonomous, parallel dispatch |
| Post-build (merge/learn/index)| Autopilot | Fully automatic, no human needed |
| Feature-to-feature transition| Autopilot  | Lead auto-starts next from roadmap |

### The Full Lifecycle at a Glance

```
Constitution (once — you set the rules)
  → PRD (once — you describe the app)
    → Architecture (once — you confirm the stack)
      → Roadmap (once — you confirm the feature order)
        → CONTINUOUS MODE (runs until MVP complete):
          ┌──────────────────────────────────────────┐
          │ F000: Spec → Build → Merge → Learn → Index│
          │ F001: Spec → Build → Merge → Learn → Index│
          │ F002: Spec → Build → Merge → Learn → Index│
          │ ...                                       │
          │ F005: Spec → Build → Merge → Learn        │
          └──────────────────────────────────────────┘
        → ALL [MVP] FEATURES DONE
```

You set the foundation (constitution + PRD + architecture + roadmap) interactively.
Then continuous mode takes over and chains through every feature on the roadmap
autonomously. You can watch, steer, or walk away — the system adapts.

The only mandatory human touchpoints are the initial project setup (Flow A, steps
A1-A8). Everything after that is automated by default.

---

## Part 4: Escape Hatches

**If spec quality isn't good enough in Copilot**: Fall back to Claude Code + ralph-specum for the spec generation only, then copy the generated `tasks.md` into `.squad/specs/{feature}/tasks.md` and let Squad handle implementation. This is the hybrid approach — use it as a fallback, not the default.

**If autopilot stops prematurely during implementation**: Check if it's a context window issue (Copilot's mediated context is smaller than Claude Code's 200K). For very large features, consider splitting the spec into smaller feature chunks, each with their own spec cycle.

**If a task keeps failing**: The progress.md file tracks what happened. Fix the issue manually, update progress.md to mark the task as ready for retry, and tell the Lead to resume from where it stopped.

**Skipping spec for small changes**: Tell the Lead directly:

```
You: Skip spec — just fix the typo in the README header.
```

The Lead's modified charter should respect this and dispatch directly.

---

## Part 5: Detailed Phase Specifications

This section covers what each phase actually does in detail, aligned with how
ralph-specum structures its workflow. Each phase has its own interview, its own
exploration territory, its own approach proposals, and its own approval gate.

---

### 5.0a Phase: Constitution (One-Time Setup)

**Who does it**: The Spec agent, with codebase discovery for brownfield projects.

**Goal**: Establish project-wide principles that all feature specs must follow.
The constitution is the highest authority — if a feature design violates a MUST
rule, the spec review catches it.

**When it runs**: 
- New project: Before the PRD, as the very first step
- Existing project (no constitution): Before the next feature spec
- Brownfield (joining an existing codebase): After indexing, derived from patterns found

**Interview** (short for solo dev, deeper for teams):
- Commit conventions (conventional commits, etc.)
- Testing philosophy (TDD, test-after, minimal)
- Coding standards (strict types, lint rules, etc.)
- Error handling approach
- Security requirements
- Branching/review strategy

**Discovery process** (codebase-first principle applies):
1. Explore codebase for existing patterns (package.json, .eslintrc, tsconfig, etc.)
2. Check README.md, CONTRIBUTING.md, .editorconfig
3. Infer naming conventions from existing files
4. Only ask the user about things you can't discover from the code

**Output**: `.squad/constitution.md` with:
- Project Identity (name, purpose, domain)
- MUST rules (non-negotiable: security, type safety, migrations)
- SHOULD rules (strong recommendations: function length, component structure)
- MAY rules (optional: nice-to-haves, suggestions)
- Technology Stack (languages, frameworks, tools, infrastructure)
- Architecture Patterns (code organisation, naming, error handling, API shape)
- Quality Standards (testing thresholds, performance targets, security)
- Development Workflow (branching, commits, review, CI/CD)
- Changelog (versioned amendments)

**How it's used**: Every subsequent phase reads the constitution:
- Research validates findings against constitution patterns
- Requirements checks user stories against MUST rules
- Design ensures architecture decisions follow constitution patterns
- Tasks uses constitution's commit format, testing requirements, and quality standards

**Updating**: If you need to change the constitution later (e.g., after learning
something during Feature 3), use semantic versioning: major for breaking changes,
minor for new rules, patch for clarifications. Include a changelog entry.

---

### 5.0b Phase: Codebase Indexing

**Who does it**: The Spec agent scans the codebase and generates component specs.

**Goal**: Make existing code discoverable so that feature research phases have
full visibility into what's already built. Without indexing, the research agent
only sees what it happens to grep for.

**When to run**:
- After project foundation is built (F000 complete)
- After several features are done (the codebase has grown)
- Joining an existing brownfield project
- Periodically as the codebase evolves
- After a major refactor

**Pre-scan interview** (skip with --quick):
1. External documentation URLs to index?
2. MCP servers or skills to document?
3. Specific directories to focus on?
4. Code areas lacking comments needing extra attention?

**What it scans** (detection patterns):

| Category | Patterns |
|----------|---------|
| Controllers | `**/controllers/**/*.{ts,js}`, `*Controller*` |
| Services | `**/services/**/*.{ts,js}`, `*Service*` |
| Models | `**/models/**/*.{ts,js}`, `*Model*` |
| Helpers | `**/helpers/**/*.{ts,js}`, `*util*`, `*helper*` |
| Migrations | `**/migrations/**/*.{ts,js,sql}` |

For each file: extracts exports, methods, dependencies, and generates a
lightweight component spec.

**Incremental re-indexing**: Uses SHA-256 hashes stored in `.index-state.json`.
On re-index, only files that changed since last scan are re-processed.
Use `--force` to regenerate everything.

**Options**:
- `--path=src/api/` — limit scan to a directory
- `--quick` — skip interviews, batch scan only
- `--dry-run` — preview what would be indexed
- `--force` — regenerate all specs
- `--changed` — only git-changed files since last index

**Output**: `.squad/specs/.index/` containing:
- `index.md` — summary dashboard with component counts
- `components/` — per-component specs (`controller-users.md`, `service-auth.md`)
- `external/` — external resource specs (docs URLs, MCP servers)

**Post-scan review** (skip with --quick):
1. Found N components — seem complete?
2. External resources look correct?
3. Any areas to re-scan or adjust?

**How it's used**: The research phase reads `.squad/specs/.index/index.md` and
component specs to understand what already exists. This prevents the Spec agent
from proposing designs that duplicate existing code or conflict with established
patterns.

---

### 5.1 Phase: Research

**Who does it**: The Spec agent delegates to codebase exploration + external research.

**Goal**: Understand the landscape before writing any requirements. Verify assumptions,
discover existing patterns, and surface constraints.

**Before starting, read context**:
1. `.squad/constitution.md` — project standards that constrain the research
2. `.squad/learnings.md` — known gotchas and patterns from previous features
3. `.squad/specs/.index/index.md` — indexed codebase components (if indexing was run)
4. `.squad/specs/{feature}/.progress.md` — goal, intent, and discovery interview responses
5. Previous feature specs (research.md, design.md) for related features

**Interview exploration territory** (hints, not a script — generate actual questions):
- Technical approach preference — follow existing patterns or introduce new ones?
- Known constraints — performance, compatibility, timeline, budget
- Integration surface area — which systems, services, or APIs does this touch?
- Prior knowledge — what does the user already know vs what needs discovery?
- Technologies to evaluate or avoid — specific libraries, frameworks, or patterns

**After the interview**, propose 2-3 research strategies:
- (A) Deep dive on specific technology/library comparison
- (B) Focus on existing codebase patterns with minimal external research
- (C) Broad survey across multiple alternatives before narrowing

**What the research actually does** (in parallel where possible):
1. **External research** — web search for best practices, library docs, known pitfalls
2. **Codebase analysis** — existing architecture, patterns, dependencies, test patterns
3. **Related specs** — scan existing specs for overlap, shared components, conflicts
4. **Quality command discovery** — find actual lint/test/build commands from package.json,
   Makefile, CI configs. Never assume `npm test` exists — discover it.
5. **Verification tooling discovery** — find dev server commands, ports, health endpoints,
   browser automation deps. This feeds the VE (E2E verification) tasks later.

**Output**: `research.md` containing:
- Executive Summary (2-3 sentences)
- External Research (best practices, prior art, pitfalls — all with source URLs)
- Codebase Analysis (existing patterns with file paths, dependencies, constraints)
- Quality Commands table (Lint, TypeCheck, Test, Build — with actual commands and sources)
- Verification Tooling table (Dev server, port, health endpoint, browser automation)
- Feasibility Assessment (viability, effort, risk)
- Related Specs (other specs that overlap or may need updates)
- Recommendations for Requirements (specific, actionable)

**Approval gate**: Display summary, then ask:
1. **Approve** — accept and advance to requirements
2. **Run review** — spawn a reviewer to validate against rubrics, show findings
3. **Request changes** — provide feedback, revise, re-display

**Then STOP.** Do not auto-advance to requirements.

---

### 5.2 Phase: Requirements

**Who does it**: The Spec agent delegates to a product-manager subagent.

**Goal**: Translate the user's goals + research findings into structured, testable
requirements.

**Interview exploration territory**:
- Primary users — who uses this? Developers, end users, specific roles?
- Priority tradeoffs — speed of delivery vs code quality vs feature completeness
- Success criteria — what does success look like? Metrics, behaviours, user outcomes
- Scope boundaries — what is explicitly out of scope for this iteration?
- Compliance or regulatory needs — security, privacy, accessibility

**After the interview**, propose 2-3 scoping approaches:
- (A) Full feature set — comprehensive user stories covering all use cases
- (B) MVP scope — core user stories only, defer edge cases to v2
- (C) Phased delivery — essential stories now, planned expansion later

**Output**: `requirements.md` containing:
- Goal (1-2 sentences)
- User Stories with Acceptance Criteria:
  ```
  ### US-1: [Story Title]
  **As a** [user type]
  **I want to** [action]
  **So that** [benefit]

  **Acceptance Criteria:**
  - [ ] AC-1.1: [Specific, testable criterion]
  - [ ] AC-1.2: [Specific, testable criterion]
  ```
- Functional Requirements table (ID, requirement, priority, how to verify)
- Non-Functional Requirements table (ID, requirement, metric, target)
- Glossary (domain-specific terms)
- Out of Scope (explicit exclusions)
- Dependencies (external prerequisites)
- Success Criteria (measurable outcomes)

**Quality checklist** (before presenting to user):
- Every user story has testable acceptance criteria
- No ambiguous language ("fast", "easy", "simple")
- Clear priority for each requirement
- Out-of-scope section prevents scope creep

**Approval gate**: Same 3-option pattern (Approve / Run Review / Request Changes).

**Then STOP.** Do not auto-advance to design.

---

### 5.3 Phase: Design

**Who does it**: The Spec agent delegates to an architect subagent.

**Goal**: Make all technical decisions before writing tasks. The design doc is the
blueprint the task planner and implementers follow.

**Interview exploration territory**:
- Architecture style — monolith, microservices, serverless, modular monolith?
- Component boundaries — how should responsibilities be divided?
- Data modelling — entity relationships, storage decisions
- API design — REST vs GraphQL, versioning, error formats
- Error handling strategy — how should failures propagate?
- Performance approach — caching, pagination, lazy loading

**Output**: `design.md` containing:
- Overview (technical approach in 2-3 sentences)
- Architecture (component diagram in Mermaid, component responsibilities)
- Data Flow (sequence diagram in Mermaid, numbered steps)
- Technical Decisions table (Decision | Options Considered | Choice | Rationale)
- File Structure table (File | Action: Create/Modify | Purpose)
- Interfaces (TypeScript/language interfaces for key components)
- Error Handling table (Scenario | Strategy | User Impact)
- Edge Cases (identified edge cases and how each is handled)
- Dependencies table (Package | Version | Purpose)
- Security Considerations
- Performance Considerations
- Test Strategy (Unit, Integration, E2E — what to test and what to mock)
- Existing Patterns to Follow (from codebase analysis in research.md)

**Approval gate**: Same 3-option pattern.

**Then STOP.** Do not auto-advance to tasks.

---

### 5.4 Phase: Tasks

**Who does it**: The Spec agent delegates to a task-planner subagent.

**Goal**: Break the design into an executable, ordered task list that the team can
implement autonomously.

**Input**: All prior artifacts — .progress.md (goal, intent, interview responses),
research.md (quality commands, verification tooling), requirements.md (user stories, 
acceptance criteria), design.md (architecture, file structure, interfaces).

**The task planner**:
1. Reads the Intent Classification to select POC-first or TDD workflow
2. Generates tasks following the phase structure for the selected workflow
3. Inserts [VERIFY] quality checkpoints every 2-3 tasks
4. Adds the final verification sequence (V4-V6)
5. Adds VE tasks (E2E verification) if the project has verification tooling
6. Marks parallel-eligible tasks with [P]
7. References actual quality commands from research.md (never hardcodes)
8. Links each task to requirements (FR-*, AC-*)
9. Ensures every Verify field is an automated command (no manual verification)

**Squad-specific addition**: Each task also specifies which Squad agent handles it
(Frontend, Backend, Tester, Lead) so the Lead can dispatch correctly.

**Output**: `tasks.md` — the full ordered task list.

**Approval gate**: Same 3-option pattern. This is the final checkpoint before
implementation begins.

---

### 5.5 Phase: Implementation (Execution)

**Who does it**: The Lead dispatches tasks to Squad agents. This phase runs in
Autopilot mode.

**How it works in Squad**:
1. Lead reads tasks.md
2. Tasks marked [P] with no unmet dependencies → launch to agents in parallel
3. Tasks with dependencies → hold until dependencies complete
4. [VERIFY] tasks route to the Tester agent (not the implementing agent)
5. Each agent follows the task's Do steps and verifies with the Verify command
6. On completion, agent commits with the specified commit message
7. Progress is tracked in `.squad/specs/{feature}/progress.md`

**Verification layers** (before advancing to next task):
1. **Contradiction detection** — if an agent claims completion but also says
   "requires manual" or "could not complete", reject and retry
2. **Completion signal** — agent must explicitly signal task complete
3. **Artifact review** — periodically (every 5th task, phase boundaries, final task),
   run a review of the implementation against the spec

**Recovery**: If a task fails after max retries:
- Log the failure in progress.md
- Skip to the next task if possible
- Surface the failure to the user

**Completion criteria** (ALL must be true):
- All tasks checked off
- All tests passing (zero regressions)
- CI green
- PR created and reviewed
- All review comments resolved
- Code is modular and follows project patterns

---

### 5.6 State Tracking

Each feature spec maintains state across sessions:

**`.squad/specs/{feature}/.ralph-state.json`**:
```json
{
  "featureName": "user-auth",
  "phase": "research|requirements|design|tasks|execution",
  "intent": "GREENFIELD|TRIVIAL|REFACTOR|MID_SIZED|BUG_FIX",
  "workflow": "poc|tdd|bug-tdd",
  "taskIndex": 0,
  "totalTasks": 45,
  "taskIteration": 1,
  "maxTaskIterations": 5,
  "awaitingApproval": false,
  "relatedSpecs": []
}
```

**`.squad/specs/{feature}/.progress.md`** — accumulates context across all phases:
- Intent Classification (type, confidence, keywords matched)
- Interview Responses from each phase (topic-response pairs + chosen approach)
- Learnings discovered during research, requirements, design
- Task completion status during execution
- Errors and recovery actions

This file is the "memory" that prevents the agent from re-asking questions
that were already answered in a prior phase. Every phase reads it first.

---

### 5.7 Quick Mode

For when you want to skip all interviews and just let the agent generate everything:

```
Team, build the auth feature --quick
```

Quick mode:
- Skips all brainstorming interviews
- Auto-generates all artifacts (research → requirements → design → tasks)
- Runs an automated spec-reviewer after each artifact (max 3 revision iterations)
- Goes straight to implementation

Use for: well-defined features where you trust the agent's judgment, or when you
want a first draft to iterate on.

---

### 5.8 What We Simplified from Ralph-Specum

Ralph-specum uses Claude Code-specific features (stop-hooks, Task delegation with
subagent types, Team lifecycle management) that don't exist in Copilot. Our Squad
adaptation makes these substitutions:

| Ralph-Specum | Squad Equivalent |
|-------------|-----------------|
| Stop-hook loop | Copilot Autopilot mode |
| research-analyst subagent | Spec agent (single agent, sequential) |
| product-manager subagent | Spec agent (same agent, different phase) |
| architect-reviewer subagent | Spec agent (same agent, different phase) |
| task-planner subagent | Spec agent (same agent, different phase) |
| spec-executor subagent | Squad team agents (Frontend, Backend, etc.) |
| qa-engineer subagent | Squad Tester agent |
| spec-reviewer subagent | Lead agent (review step in charter) |
| Parallel Team research | Sequential (Copilot doesn't have Teams) |
| AskUserQuestion tool | Copilot interactive mode prompts |

The tradeoff: ralph-specum uses specialised subagents for each role (a product
manager that only thinks about requirements, a researcher that only researches).
In Squad, the Spec agent wears all these hats sequentially. This means the Spec
agent's charter needs to be well-written enough that it shifts its thinking mode
as it moves through phases. The per-phase exploration territories in Part 5 help
enforce this.

If you find the Spec agent producing weaker output for a specific phase, consider
splitting it into multiple Squad agents (e.g., a Research agent and a Requirements
agent). This increases merge conflict surface with upstream Squad but may improve
quality.
---

### 5.9 Cross-Feature Learnings

Ralph-specum appends learnings to `.progress.md` after every phase, and each
subsequent phase reads them. But those learnings are scoped to a single feature.
What's missing is learning ACROSS features — so Feature 3's spec benefits from
what was discovered during Feature 1 and Feature 2.

**`.squad/learnings.md`** — accumulated project-wide learnings:

```markdown
# Project Learnings

## From F001: User Auth
- bcrypt.compare is async — don't forget to await it
- Rate limiting middleware must come before auth middleware in Express chain
- Knex migration rollbacks need explicit down() — don't leave them empty

## From F002: Recipe Storage  
- PostgreSQL JSONB is better than separate tables for recipe ingredients
- File uploads need multer middleware configured before route handlers
- Category slugs must be unique — add DB constraint, not just app validation

## From F003: AI Meal Suggestions
- Kimi K2.5 responses need parsing — they include markdown formatting
- Azure AI Foundry SDK timeout defaults are too short for meal generation
- Prompt engineering: including cooking method in the system prompt 
  dramatically improves Ninja Combi-specific suggestions
```

**When learnings are written**:
After each feature's implementation phase completes, the Lead:
1. Reads `.squad/specs/{feature}/.progress.md` for all Learnings sections
2. Extracts significant discoveries (not trivial ones)
3. Appends them to `.squad/learnings.md` under the feature heading

**When learnings are read**:
At the START of every feature's research phase, the Spec agent:
1. Reads `.squad/learnings.md` in full
2. Identifies learnings relevant to the current feature
3. Incorporates them into the research context
4. Avoids repeating mistakes or rediscovering known constraints

**Why this matters**:
Without cross-feature learnings, the agent will make the same mistakes on
Feature 5 that it already solved on Feature 2. The learnings file acts as
institutional memory. Over time, spec quality improves because the agent
has a growing knowledge base specific to YOUR project — not just generic
best practices from the web.

**Constitution updates from learnings**:
If a learning represents a new project-wide rule (e.g., "always await bcrypt"),
it should be promoted to the constitution as a SHOULD or MUST rule. The Spec
agent can suggest this: "This learning from F001 seems like a project-wide
pattern. Want me to add it to the constitution?"
