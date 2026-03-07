# How to Implement with Copilot CLI

## Setup

### 1. Put the files in your forked Squad repo

Copy both files into your cloned Squad fork:

```bash
cd /path/to/your/squad-fork

# Create the docs directory
mkdir -p docs/ralph-specum

# Copy both files (adjust source path to wherever you downloaded them)
cp squad-spec-guide.md docs/ralph-specum/
cp implementation-spec.md docs/ralph-specum/
```

### 2. Create your working branch

```bash
git checkout -b ralph-specum
```

### 3. Commit the spec files so Copilot can see them

```bash
git add docs/ralph-specum/
git commit -m "docs: add ralph-specum implementation spec and guide"
```

---

## Running Copilot CLI

### 4. Start Copilot CLI in your Squad fork

```bash
cd /path/to/your/squad-fork
copilot
```

### 5. Use Plan Mode first

Press **Shift+Tab** to cycle to **Plan mode**. Then enter the prompt:

```
Read docs/ralph-specum/implementation-spec.md and docs/ralph-specum/squad-spec-guide.md.

The implementation-spec.md is your build plan. The squad-spec-guide.md 
is detailed reference material — use it to fill in the content when the 
implementation spec references specific sections.

Follow the Implementation Order in section 4 of the spec:
1. Create all template files in .squad/templates/
2. Create the Spec agent charter at .squad/agents/spec/charter.md
3. Modify the Lead agent charter at .squad/agents/lead/charter.md
4. Copy docs/ralph-specum/squad-spec-guide.md (already done)
5. Update any Squad README/team docs to reference the Spec agent

For the Spec agent charter: extract the rules, formats, and instructions 
from the guide — not the prose explanations. The charter is instructions 
the agent follows, not a tutorial for humans.

For the Lead charter: ADD new sections. Do not remove or rewrite existing 
Lead charter content — append the new sections (spec-first workflow, 
auto-merge, continuous mode, constitution validation, task dispatch).
```

### 6. Review the plan, then switch to Autopilot

Copilot will show you an implementation plan. Review it — make sure it:
- Creates all the template files listed in the spec
- Creates the Spec agent charter with all sections from 1.1–1.8
- Modifies (not replaces) the Lead charter with sections from 2.1–2.5
- Follows the right implementation order

If the plan looks good, press **Shift+Tab** to switch to **Autopilot** and
let it execute.

### 7. If Copilot's context window fills up

The full guide is 2,400+ lines. If Copilot struggles to hold everything in
context, break it into phases:

**Phase 1** — Templates only:
```
Read docs/ralph-specum/implementation-spec.md section 3 and the corresponding 
templates in docs/ralph-specum/squad-spec-guide.md (Part 2.3).

Create all template files in .squad/templates/ — both project/ and spec/ 
subdirectories. Use the exact markdown structures from the guide.
```

**Phase 2** — Spec agent charter:
```
Read docs/ralph-specum/implementation-spec.md section 1 and docs/ralph-specum/squad-spec-guide.md 
Parts 2.1, 5.0a, 5.0b, 5.1-5.7, and 5.9.

Create .squad/agents/spec/charter.md with the full charter covering all 
three operating levels (constitution, project-level, feature-level), 
intent classification, codebase-first principle, per-phase interviews, 
approach proposals, task format, state tracking, quick mode, and 
cross-feature learnings.
```

**Phase 3** — Lead charter modifications:
```
Read docs/ralph-specum/implementation-spec.md section 2 and docs/ralph-specum/squad-spec-guide.md 
Part 2.2.

Open .squad/agents/lead/charter.md. APPEND (do not replace existing 
content) new sections for: spec-first workflow, auto-merge, continuous 
mode, constitution validation, and task dispatch from spec.
```

---

## After Implementation

### 8. Review what Copilot built

```bash
# See what was created/modified
git status
git diff --stat

# Review the Spec agent charter (the most important file)
cat .squad/agents/spec/charter.md

# Review Lead charter changes
git diff .squad/agents/lead/charter.md

# Check all templates exist
ls -la .squad/templates/project/
ls -la .squad/templates/spec/
```

### 9. Commit and push

```bash
git add -A
git commit -m "feat: add ralph-specum integration — spec agent, templates, lead charter modifications"
git push origin ralph-specum
```

### 10. Test it

Create a test project and initialise Squad using your fork:

```bash
mkdir ~/test-app && cd ~/test-app
git init

# Install Squad from your fork (adjust to your npm publish or local path)
# If not published to npm, symlink:
ln -s /path/to/your/squad-fork/.squad .squad
ln -s /path/to/your/squad-fork/.github .github

# Start Copilot CLI
copilot
/agent squad
```

Then test the flow:

```
Team, I want to build a simple todo app with a REST API.
```

The Lead should detect no constitution.md and route to the Spec agent.
If it doesn't, the Lead charter modification may need adjustment.

---

## Troubleshooting

**Copilot doesn't use the spec files**: Make sure docs/ralph-specum/ is committed to
the branch. Copilot CLI can only read files that exist in the working tree.

**Charter is too long for context**: The Spec agent charter will be large.
If Copilot truncates it during generation, break it into Phase 2 sub-steps
(constitution section first, then project-level, then feature-level).

**Lead charter gets overwritten**: Emphasise "APPEND, do not replace" in
the prompt. If Copilot still replaces content, do Phase 3 manually or use
a more targeted prompt: "Add the following sections AFTER the existing 
content in .squad/agents/lead/charter.md: [paste sections]"

**Copilot generates tutorial prose instead of charter instructions**: 
Remind it: "The charter is instructions for an AI agent to follow. Write 
it as rules and procedures, not as explanations for a human reader."
