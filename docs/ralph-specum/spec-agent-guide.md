# Spec Agent Guide

> ⚠️ **This guide is superseded.** It described the original monolithic Spec agent (a single 746-line charter handling four operating levels). As of the [DevSquad alignment refactor](devsquad-mapping.md), Spec has been split into four narrowly-scoped sub-agents and several phase-aligned skills. Use the references below for the current architecture.

## Where to read instead

### For users — "how do I use spec-driven development in my project?"

1. **[devsquad-mapping.md](devsquad-mapping.md)** — the Rosetta Stone. Maps Squad concepts to [DevSquad's public docs](https://microsoft.github.io/devsquad-copilot/) so you can leverage their documentation and onboarding material.
2. **[Phase Routing in the coordinator template](../../packages/squad-cli/templates/squad.agent.md.template)** — describes how the coordinator detects state and routes to the correct phase agent. This is the canonical workflow reference.

### For builders — "how do the spec sub-agents work?"

The four sub-agents replace the original Spec agent. Each owns exactly one phase from Phase Routing:

| Sub-agent | Phase | Charter |
|-----------|-------|---------|
| **spec-constitution** | `constitution` — project principles, coding standards, tech baseline | [`.squad/agents/spec-constitution/charter.md`](../../.squad/agents/spec-constitution/charter.md) |
| **spec-prd** | `prd` — product vision, target users, scope, MVP shape | [`.squad/agents/spec-prd/charter.md`](../../.squad/agents/spec-prd/charter.md) |
| **spec-feature** | `spec.feature` + `tasks` — per-feature discovery, research, requirements, task decomposition | [`.squad/agents/spec-feature/charter.md`](../../.squad/agents/spec-feature/charter.md) |
| **spec-index** | `index` — lightweight component specs from existing code | [`.squad/agents/spec-index/charter.md`](../../.squad/agents/spec-index/charter.md) |

The original `.squad/agents/spec/charter.md` is now a **family index** pointing at the four sub-agents — it doesn't run any workflow itself.

### Responsibilities that moved out of Spec

The original Spec agent owned three responsibilities that no longer belong to the Spec family. They moved to Lead's domain via skills:

| Original Spec content | New owner | Skill |
|-----------------------|-----------|-------|
| Project architecture (Level 2) | Lead + domain specialists (fan-out) | [`.squad/skills/architecture-design/SKILL.md`](../../.squad/skills/architecture-design/SKILL.md) |
| Project roadmap + Spec Status Dashboard + status.json | Lead | [`.squad/skills/roadmap-planning/SKILL.md`](../../.squad/skills/roadmap-planning/SKILL.md) |
| Per-feature design.md (Level 4 Phase 4) | Domain specialists (fan-out) | [`.squad/skills/feature-design/SKILL.md`](../../.squad/skills/feature-design/SKILL.md) |

### Shared interview pattern

The "Option N means…" plain-language interview pattern that distinguishes Squad's interview UX is captured in [`.squad/skills/plain-language-interview/SKILL.md`](../../.squad/skills/plain-language-interview/SKILL.md). All four spec sub-agents reference and apply it.

## Why the split

The original Spec agent operated at four levels in a single charter (constitution, project-level PRD+architecture+roadmap, indexing, feature-level). Every Spec invocation risked absorbing all four — the "Spec doing too much" symptom that triggered this refactor. Splitting into narrowly-scoped sub-agents per phase eliminates the scope-bleed.

The full design rationale (the four conflict decisions, what we kept, what we accepted) is in [devsquad-mapping.md](devsquad-mapping.md). See also `memory/project_devsquad_alignment.md` in the user's project memory for the locked decisions.

## What about the contents of this old guide?

The original 508-line guide covered:

- **What the Spec Agent Does** → covered by individual sub-agent charters (each charter has a precise "What I do / What I don't do" section)
- **Getting Started flow** → driven by [Phase Routing](../../packages/squad-cli/templates/squad.agent.md.template) state-detection table; the coordinator picks which sub-agent to spawn based on repo state
- **Interview structure** → preserved verbatim across sub-agent charters and the shared `plain-language-interview` skill
- **Templates and outputs** → unchanged; `.squad/templates/spec/*.md` and `.squad/templates/project/*.md` still apply

If you have a bookmark or link pointing at this guide for a specific section, search the four charters and the Rosetta Stone — the content was preserved, just re-located.

## See also

- [Rosetta Stone (devsquad-mapping.md)](devsquad-mapping.md)
- [Coordinator template (squad.agent.md.template)](../../packages/squad-cli/templates/squad.agent.md.template) — Phase Routing, Action Protocol, Comprehension Checkpoint, Spec Amendment, Reasoning & Handoff, Context Management
- [Skill index (.squad/skills/README.md)](../../.squad/skills/README.md) — categorized list of all skills
- [DevSquad Copilot docs](https://microsoft.github.io/devsquad-copilot/) — public docs you can now reference directly
