# How to Implement with Copilot CLI

## Setup

### 1. Put the files in your forked Squad repo

Copy both files into your cloned Squad fork:

```bash
cd /path/to/your/squad-fork

# Create the docs directory
mkdir -p docs/speckit

# Copy both files (adjust source path to wherever you downloaded them)
cp squad-speckit-guide.md docs/speckit/
cp implementation-spec.md docs/speckit/
```

### 2. Create your working branch

```bash
git checkout -b speckit-integration
```

### 3. Commit the spec files so Copilot can see them

```bash
git add docs/speckit/
git commit -m "docs: add speckit implementation spec and guide"
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
Read docs/speckit/implementation-spec.md and docs/speckit/squad-speckit-guide.md.

CRITICAL CONSTRAINTS:
- Do NOT modify any source code files (.ts, .js, package.json, package-lock.json)
- Do NOT modify CHANGELOG.md or README.md
- ONLY create new files and append to one existing file

Follow the Implementation Order in section 4 of the implementation spec.

Step 1: Create ALL template files in .squad/templates/ (project/ and spec/ 
subdirectories). There should be 8 new template files.

Step 2: Create .squad/agents/spec/charter.md — this is the Spec agent. 
It is the LARGEST new file. Extract all rules, formats, and procedures 
from the guide. This is NOT a summary — it needs the full intent 
classification table, codebase-first principle, per-phase interview 
territories, approach proposal rules, task format with sizing rules, 
workflow selection (POC-first vs TDD), state tracking, and quick mode. 
Write it as instructions for an AI agent, not prose for a human.

Step 3: APPEND to .squad/agents/keaton/charter.md (the Lead). Add sections 
for spec-first workflow, auto-merge, continuous mode, constitution 
validation, and task dispatch. Do NOT remove or rewrite existing content.

Do not touch any other files.
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
Read docs/speckit/implementation-spec.md section 3 and the corresponding 
templates in docs/speckit/squad-speckit-guide.md (Part 2.3).

Create all template files in .squad/templates/ — both project/ and spec/ 
subdirectories. Use the exact markdown structures from the guide.
```

**Phase 2** — Spec agent charter:
```
Read docs/speckit/implementation-spec.md section 1 and docs/speckit/squad-speckit-guide.md 
Parts 2.1, 5.0a, 5.0b, 5.1-5.7, and 5.9.

Create .squad/agents/spec/charter.md with the full charter covering all 
three operating levels (constitution, project-level, feature-level), 
intent classification, codebase-first principle, per-phase interviews, 
approach proposals, task format, state tracking, quick mode, and 
cross-feature learnings.
```

**Phase 3** — Lead charter modifications:
```
Read docs/speckit/implementation-spec.md section 2 and docs/speckit/squad-speckit-guide.md 
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
git commit -m "feat: add speckit integration — spec agent, templates, lead charter modifications"
git push origin speckit-integration
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

**Copilot doesn't use the spec files**: Make sure docs/speckit/ is committed to
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
