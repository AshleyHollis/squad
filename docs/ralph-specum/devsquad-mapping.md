# DevSquad ↔ Squad Concept Mapping (Rosetta Stone)

> **Purpose:** This document maps Squad concepts to Microsoft's [DevSquad Copilot](https://microsoft.github.io/devsquad-copilot/) framework. When you encounter DevSquad terminology in Squad's coordinator template, charters, or docs, this is the canonical reference for what it means and how Squad implements it.

## Why this exists

Squad and DevSquad are both built on the SpecKit lineage of spec-driven development. We've aligned Squad's *vocabulary and conceptual structure* with DevSquad's where it makes sense — so users coming from DevSquad can map concepts directly, and we can leverage DevSquad's public documentation rather than reinventing it.

Squad keeps its distinct execution patterns (casting, parallel fan-out, worktrees, per-agent model selection, personal squad). The alignment is at the *concept layer*, not the implementation layer. The result: Squad is "DevSquad-compatible on the surface, Squad-native underneath."

## How alignment works

We align in three tiers:

| Tier | What aligns | What stays Squad-native |
|------|-------------|------------------------|
| **1. Vocabulary** | Concept names, term definitions, canonical references to DevSquad docs | All implementation |
| **2. Structure** | Phase progression, state detection, artifact paths, sub-agent breakdown | Casting, drop-box, eager fan-out, model selection |
| **3. Behavior** | Action protocol (selective: `[ASK]`, `[CHECKPOINT]`), Comprehension Checkpoints, Spec Amendment flow | Direct artifact writes by agents (drop-box pattern preserved) |

When you read Squad docs and see a DevSquad term, jump to the [Concept Mapping](#concept-mapping) section below.

## The four design decisions

In adopting DevSquad concepts, four genuine conflicts required choices. The decisions made:

| # | Conflict | Decision | What we kept | What we accepted |
|---|----------|----------|--------------|------------------|
| 1 | Action Protocol vs Eager Parallel Fan-Out | **Selective protocol** — `[ASK]` and `[CHECKPOINT]` only | Parallel fan-out (3-5x throughput on multi-agent tasks) | Behavioral enforcement of "no inline work" via dispatch gate, not structural |
| 2 | Impact Classification vs Response Mode Selection | **Both, orthogonal** — risk axis (Impact) + time axis (Response Mode) | Direct mode for fast factual answers; tiered ceremony | Two classifiers — small mental cost, clear separation |
| 3 | Conductor/Delivery/Support taxonomy vs Casting | **Tag, don't rename** — taxonomy is metadata, names stay cast (Ripley, Dallas, etc.) | Casting + Persistent Naming + Personal Squad | Doc-translation tax (DevSquad uses `devsquad.specify`-style names) |
| 4 | ADRs vs `decisions.md`/inbox | **Both, tiered** — ADRs for architectural decisions, inbox for routine | Drop-box pattern for routine writes (conflict-free parallel) | Two artifact types — clear criterion needed |

## Concept mapping

### Workflow & Phases

| DevSquad concept | Squad implementation | Notes / link |
|------------------|---------------------|--------------|
| **Conductor** | Coordinator (in `packages/squad-cli/templates/squad.agent.md.template`) | Same role, name stays "Coordinator" or "Squad" — DevSquad name used in docs and section headers as alias. [DevSquad: Conductor](https://microsoft.github.io/devsquad-copilot/agents/conductor) |
| **Intent (Why)** phase | `envision` phase (optional, Lead-led) | Fired when user prompt is ambiguous. Skipped when intent is clear. |
| **Specification (What)** phase | `spec.constitution` → `spec.prd` → `spec.feature` (sub-agents) | Split for narrow scope per invocation. [DevSquad: specify agent](https://microsoft.github.io/devsquad-copilot/agents/lifecycle) |
| **Architecture Decisions (How)** phase | `architecture` phase (Lead + domain specialists, fan-out) | Owned by Lead per `routing.md`; produces ADRs |
| **Delivery (When)** phase | `implement` phase (per-task fan-out across roster) | Eager parallel fan-out preserved. This is Squad's key strength. |

### Guardrails (Core concepts)

| DevSquad concept | Squad implementation | Notes / link |
|------------------|---------------------|--------------|
| **Impact Classification** | Section in coordinator template, alongside Response Mode | Risk axis: Low / Medium / High — gates ADRs, security review, approval. [DevSquad: Impact](https://microsoft.github.io/devsquad-copilot/concepts/impact-classification) |
| **Comprehension Checkpoints** | Post-implementation gate in `review` phase | Coordinator presents diff, asks "do you understand what changed?". [DevSquad: Comprehension](https://microsoft.github.io/devsquad-copilot/concepts/comprehension-checkpoints) |
| **Spec Amendment** | `/spec amend` flow + spec sub-agent in revision mode | Produces a spec amendment artifact alongside original spec. [DevSquad: Amendment](https://microsoft.github.io/devsquad-copilot/concepts/spec-amendment) |

### Agents

| DevSquad concept | Squad implementation | Notes / link |
|------------------|---------------------|--------------|
| **Conductor** | Squad / Coordinator (one per project) | See above |
| **Delivery Agents** | Tagged in `team.md`: Lead, Frontend, Backend, Tester, etc. (the work agents) | Squad-native: cast names (Ripley, Dallas, etc.) preserved. [DevSquad: Delivery agents](https://microsoft.github.io/devsquad-copilot/agents/lifecycle) |
| **Support Agents** | Tagged in `team.md`: Scribe, Ralph (process / non-domain) | Squad-native role definition. [DevSquad: Support agents](https://microsoft.github.io/devsquad-copilot/agents/support) |
| **Advisory Agents** *(Squad extension)* | Personal Squad agents (Ghost Protocol, consult mode) | DevSquad has no equivalent — Squad-only third tier. |

### Decisions & Records

| DevSquad concept | Squad implementation | Notes / link |
|------------------|---------------------|--------------|
| **ADR (Architecture Decision Record)** | `.squad/architecture/decisions/{NNN}-{slug}.md` | One file per significant decision, ranked priorities, structured trade-offs. Used for architectural / load-bearing decisions. [DevSquad: Decisions](https://microsoft.github.io/devsquad-copilot/decisions) |
| **(none — Squad extension)** | `.squad/decisions.md` + `.squad/decisions/inbox/` | Lightweight append-only logbook for routine team decisions. Drop-box pattern enables conflict-free parallel writes. |

**Tier rule:** Promote to ADR if the decision would survive a rewrite. Otherwise inbox.

### Skills

| DevSquad concept | Squad implementation | Notes / link |
|------------------|---------------------|--------------|
| **Skills** | `.copilot/skills/` (process) and `.squad/skills/` (team-earned) | Two-tier skill system. [DevSquad: Skills](https://microsoft.github.io/devsquad-copilot/skills) |
| **Skill categories** (Plan, Work Items, Quality, Dev, Init) | Phase 3: subdirectories under `skills/{category}/` | Reorganization in Phase 3. |
| **(none — Squad extension)** | Skill Confidence Lifecycle (low → medium → high) | Earned-knowledge progression; DevSquad skills are static. |
| **(none — Squad extension)** | Skill-aware routing | Coordinator checks skills before spawning. |

### Components

| DevSquad concept | Squad implementation | Notes / link |
|------------------|---------------------|--------------|
| **Custom Instructions** | `.squad/charter.md`, agent charters, skills | Same concept, different paths. |
| **Automation Hooks** | Squad's hooks system (already aligned) | Same concept. |
| **MCP / Tool Servers** | Squad's MCP integration (already aligned) | Same concept. |
| **Context Management** *(named concept)* | `history.md` per agent + `decisions.md` + `orchestration-log/` | Already implemented; Phase 3 names and documents the pattern. [DevSquad: Context](https://microsoft.github.io/devsquad-copilot/core-components/context-management) |
| **Reasoning & Handoff** *(named concept)* | Spawn prompts + decisions inbox + drop-box | Already implemented; Phase 3 names and documents the pattern. [DevSquad: Reasoning](https://microsoft.github.io/devsquad-copilot/concepts/reasoning-and-handoff) |

### Action Protocol (Phase 3)

| DevSquad action | Squad implementation | Notes |
|-----------------|---------------------|-------|
| `[ASK]` | Adopted — agents return `[ASK]` blocks; coordinator relays via `ask_user` | Already conceptually present; Phase 3 formalizes the syntax. |
| `[CHECKPOINT]` | Adopted — agents return `[CHECKPOINT]` blocks; coordinator presents summary, requires user confirmation | Already conceptually present in Spec phase gates; Phase 3 standardizes. |
| `[CREATE path]` / `[EDIT path]` | **Not adopted** — agents continue to write artifacts directly via tools | Drop-box pattern preserved; eager fan-out preserved. Dispatch gate (commit c65837e3) remains the behavioral guard. |
| `[DONE]` | Implicit — agent return signals phase completion | Coordinator advances to next phase suggestion. |

## Squad-only features (no DevSquad equivalent)

These are kept as-is, no alignment needed:

- **Casting & Persistent Naming** — character cast names (Ripley, Dallas, etc.) per universe
- **Personal Squad / Ghost Protocol** — personal agents that overlay project agents
- **Per-Agent Model Selection** — 4-layer cost-first model resolution (user override → charter → task-aware → default)
- **Drop-Box Pattern + `merge=union`** — conflict-free parallel writes to shared files
- **Worktree-Local State Strategy** — branch-isolated `.squad/` state with auto-merging
- **Eager Parallel Fan-Out + Anticipatory Spawns** — "Tester writes test cases while Backend builds API"
- **Skill Confidence Lifecycle** — low / medium / high earned-knowledge progression
- **Plain-Language Interview Pattern** — "Option N means..." framing (lives in spec sub-agents)
- **Response Mode Selection** — Direct / Lightweight / Standard / Full (orthogonal to Impact)
- **VS Code / CLI Compatibility Matrix** — multi-platform dispatch (DevSquad is Copilot-only)
- **Issue Awareness with `squad:*` labels** — auto-pickup of GitHub issues
- **Directive Capture** — "Always..." / "Never..." → decisions inbox
- **Acknowledge Immediately ("Feels Heard")** — UX pattern before agent spawn
- **Ralph (Work Monitor)** — keep-alive / backlog agent
- **Scribe (Memory / Logger)** — persistent context maintenance
- **Consult Mode** — personal agent → project agent handoff

## DevSquad concepts not adopted (with reason)

| DevSquad concept | Why deferred |
|------------------|--------------|
| `[CREATE path]` / `[EDIT path]` action protocol | Conflicts with eager parallel fan-out (Conflict 1, Option A chosen) |
| Functional sub-agent naming (`devsquad.specify`-style) | Conflicts with Casting (Conflict 3, Option A chosen) |
| Single-classifier ceremony model | Lose Direct Mode "instant" responses (Conflict 2, Option A chosen) |
| ADRs as sole decision artifact | Lose drop-box conflict-free routine writes (Conflict 4, Option A chosen) |

## Reading the docs

When reading DevSquad's docs at https://microsoft.github.io/devsquad-copilot/:
- Concepts and guardrails apply to Squad with the mapping above
- Agent names like `devsquad.specify` map to Squad's `spec.feature` sub-agent (or your cast equivalent)
- File paths under `.github/plugins/devsquad/` map to `.squad/` in Squad
- The Conductor's intent table maps to Squad's routing logic in the coordinator template

When reading Squad's docs and seeing a DevSquad term, this Rosetta Stone is the bridge.

## Maintenance

When DevSquad publishes a new core concept, evaluate against the four-conflict framework:
1. Does it conflict with a Squad-only feature? If yes, decide A/B/A trade-off as in the original four.
2. If no conflict, adopt by name and update this Rosetta Stone.
3. Update the coordinator template and/or charters to use DevSquad's name.

This document evolves with each upstream concept adoption.
