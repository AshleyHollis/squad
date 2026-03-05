---
name: "git-workflow"
description: "Squad branching model: dev-first workflow with insiders preview channel"
domain: "version-control"
confidence: "high"
source: "team-decision"
---

## Context

Squad uses a three-branch model. **All feature work starts from `dev`, not `main`.**

| Branch | Purpose | Publishes |
|--------|---------|-----------|
| `main` | Released, tagged, in-npm code only | `npm publish` on tag |
| `dev` | Integration branch — all feature work lands here | `npm publish --tag preview` on merge |
| `insiders` | Early-access channel — synced from dev | `npm publish --tag insiders` on sync |

## Branch Naming Convention

Issue branches MUST use: `squad/{issue-number}-{kebab-case-slug}`

Examples:
- `squad/195-fix-version-stamp-bug`
- `squad/42-add-profile-api`

## Workflow for Issue Work

1. **Branch from dev:**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b squad/{issue-number}-{slug}
   ```

2. **Mark issue in-progress:**
   ```bash
   gh issue edit {number} --add-label "status:in-progress"
   ```

3. **Create draft PR targeting dev:**
   ```bash
   gh pr create --base dev --title "{description}" --body "Closes #{issue-number}" --draft
   ```

4. **Do the work.** Make changes, write tests, commit with issue reference.

5. **Push and mark ready:**
   ```bash
   git push -u origin squad/{issue-number}-{slug}
   gh pr ready
   ```

6. **After merge to dev:**
   ```bash
   git checkout dev
   git pull origin dev
   git branch -d squad/{issue-number}-{slug}
   git push origin --delete squad/{issue-number}-{slug}
   ```

## Anti-Patterns

- ❌ Branching from main (branch from dev)
- ❌ PR targeting main directly (target dev)
- ❌ Non-conforming branch names (must be squad/{number}-{slug})
- ❌ Committing directly to main or dev (use PRs)

## Promotion Pipeline

- dev → insiders: Automated sync on green build
- dev → main: Manual merge when ready for stable release, then tag
- Hotfixes: Branch from main as `hotfix/{slug}`, PR to dev, cherry-pick to main if urgent
