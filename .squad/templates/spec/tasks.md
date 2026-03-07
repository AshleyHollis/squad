# Tasks: {feature-name}

## Overview
- **Intent:** {GREENFIELD | MID_SIZED | REFACTOR | BUG_FIX | TRIVIAL}
- **Workflow:** {POC-first | TDD | Bug TDD}
- **Total Tasks:** {count}
- **Phase Distribution:** {phase-to-percentage summary}

## Completion Criteria
- All implementation tasks are checked off.
- All Verify commands pass with zero manual-only steps.
- Final verification sequence V4, V5, and V6 is complete.
- Progress and learnings are reflected in the feature state files.

## Task Writing Guide

### Sizing Rules
- Max 4 **Do** steps per task.
- Max 3 files per task.
- Split tasks that exceed either limit.

### Parallel Markers
- Mark parallel-eligible tasks with `[P]`.
- Adjacent `[P]` tasks form a parallel group.
- `[VERIFY]` tasks always break parallel groups.

### Core Principles
1. **Done when > Do**: the success criteria are the contract.
2. **Automated verification only**: every Verify field must be a command, test, or script.
3. **One logical concern per task**: avoid bundling unrelated work.
4. **Surgical changes**: touch only the files needed for the task.
5. Insert `[VERIFY]` checkpoints every 2-3 tasks.

### Task Format

```markdown
- [ ] {phase}.{number} {title}
  - **Agent**: {Squad agent}
  - **Do**:
    1. {specific action with file paths}
    2. {next action}
  - **Files**: {file1}, {file2}
  - **Depends on**: {task ids or none}
  - **Done when**: {declarative success criteria}
  - **Verify**: `{automated command}`
  - **Commit**: `{conventional commit message}`
  - _Requirements: FR-1, AC-1.1_
```

## Workflow Phase Structure

### GREENFIELD -> POC-first
1. **Make It Work (POC)** - 50-60%
2. **Refactoring** - 15-20%
3. **Testing** - 15-20%
4. **Quality Gates** - 10-15%
5. **PR Lifecycle** - 5-10%

### Non-GREENFIELD -> TDD Red-Green-Yellow
1. **Red-Green-Yellow Cycles** - 60-70%
2. **Additional Testing** - 10-15%
3. **Quality Gates** - 10-15%
4. **PR Lifecycle** - 5-10%

### BUG_FIX -> Bug TDD
- Add **Phase 0 (Reproduce)** before the TDD phases.
- Confirm the bug is reproducible with an automated command before editing code.

## Quality Checkpoint Format

```markdown
- [ ] V1 [VERIFY] Quality check: {lint cmd} && {typecheck cmd}
  - **Agent**: Hockney
  - **Do**: Run quality commands and fix any issues required for the checkpoint.
  - **Done when**: No lint or type errors remain.
  - **Verify**: `{lint cmd} && {typecheck cmd}`
  - **Commit**: `chore(scope): pass quality checkpoint`
```

## Final Verification Sequence
- **V4 [VERIFY]** Full local CI: `{lint} && {typecheck} && {test} && {build}`
- **V5 [VERIFY]** CI pipeline passes: `gh pr checks --watch`
- **V6 [VERIFY]** Acceptance criteria checklist: `{programmatic AC verification command}`
