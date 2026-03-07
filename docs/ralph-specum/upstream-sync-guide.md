# Upstream Sync Guide

How to keep your ralph-specum fork up to date with bradygaster/squad.

## Branch Strategy

- **`main`** — clean mirror of upstream. Never commit your own work here.
- **`ralph-specum`** — your customisations, rebased on top of main.

This keeps upstream merges conflict-free and your changes in a clean layer on top.

## Quick Start

```powershell
./scripts/sync-upstream.ps1
```

The script handles everything: fetch, merge, rebase, and push. If conflicts occur, it pauses and tells you exactly what to do.

## What the Script Does

```
1. Pre-flight checks
   - Verifies git repo, upstream remote, clean working tree
   - Detects any in-progress rebase from a previous run

2. Fetch upstream
   - git fetch upstream

3. Update main
   - git checkout main
   - git merge upstream/main
   - git push origin main

4. Rebase ralph-specum
   - git checkout ralph-specum
   - git rebase main
   - (pauses here if conflicts occur)

5. Push
   - Prompts for confirmation
   - git push origin ralph-specum --force-with-lease
```

## When Conflicts Occur

If upstream changed a file that you also modified, the rebase will pause.

### What You'll See in the Terminal

The script lists the conflicted files and exits. The rebase is **paused, not aborted** — your progress is preserved.

### How to Resolve in VS Code

1. Open the repo in VS Code. The **Source Control** panel will show conflicted files marked with a `C`.

2. Open a conflicted file. You'll see conflict markers:

   ```
   <<<<<<< HEAD
   Your ralph-specum version of this code
   =======
   The upstream version of this code
   >>>>>>> upstream commit message
   ```

3. VS Code shows inline buttons above each conflict:
   - **Accept Current Change** — keep your ralph-specum version
   - **Accept Incoming Change** — take the upstream version
   - **Accept Both Changes** — keep both (you'll likely need to edit the result)

4. After resolving all conflicts in a file, stage it:
   ```bash
   git add <file>
   ```

5. Continue the rebase:
   ```bash
   git rebase --continue
   ```

6. If more conflicts appear on the next commit, repeat steps 2-5. Rebase replays your commits one at a time, so you may resolve conflicts for multiple commits.

7. When the rebase finishes, re-run the script to push:
   ```powershell
   ./scripts/sync-upstream.ps1
   ```

### How to Abort

If things get messy and you want to start over:

```bash
git rebase --abort
```

This restores ralph-specum to its state before the rebase. No work is lost.

## Difference from Merge Conflicts

If you've resolved merge conflicts before (e.g. merging a feature branch), rebase conflicts work the same way in VS Code. The only difference:

| | Merge | Rebase |
|---|---|---|
| Conflicts | All at once | One commit at a time |
| Result | A merge commit | Linear history (no merge commit) |
| VS Code UI | Identical | Identical |

Rebase may show conflicts for multiple commits sequentially, but each resolution is the same process.

## Troubleshooting

**"No 'upstream' remote found"**
```bash
git remote add upstream https://github.com/bradygaster/squad.git
```

**"Working tree is not clean"**
Commit or stash your changes first:
```bash
git stash
./scripts/sync-upstream.ps1
git stash pop
```

**"A rebase is already in progress"**
You have an unfinished rebase from a previous run. Either resolve remaining conflicts and `git rebase --continue`, or abort with `git rebase --abort`.

**Push fails after rebase**
If someone else pushed to ralph-specum, `--force-with-lease` will refuse. Coordinate with your team or use `--force` if you're the only contributor.
