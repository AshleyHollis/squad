<#
.SYNOPSIS
    Syncs the ralph-specum fork with upstream bradygaster/squad changes.

.DESCRIPTION
    Fetches upstream updates, merges them into main, and rebases the
    ralph-specum branch on top. Handles conflicts by pausing and guiding
    you through resolution.

.EXAMPLE
    ./scripts/sync-upstream.ps1
#>

$ErrorActionPreference = "Stop"

$Branch = "ralph-specum"

function Write-Step($message) {
    Write-Host "`n>> $message" -ForegroundColor Cyan
}

function Write-Success($message) {
    Write-Host "   OK: $message" -ForegroundColor Green
}

function Write-Warn($message) {
    Write-Host "   WARN: $message" -ForegroundColor Yellow
}

function Write-Err($message) {
    Write-Host "   ERROR: $message" -ForegroundColor Red
}

# --- Pre-flight checks ---

Write-Step "Running pre-flight checks"

# Verify we're in a git repo
$gitRoot = git rev-parse --show-toplevel 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Err "Not inside a git repository."
    exit 1
}
Write-Success "Git repo: $gitRoot"

# Check for in-progress rebase
$rebaseDir = Join-Path $gitRoot ".git/rebase-merge"
$rebaseApplyDir = Join-Path $gitRoot ".git/rebase-apply"
if ((Test-Path $rebaseDir) -or (Test-Path $rebaseApplyDir)) {
    Write-Warn "A rebase is already in progress."
    Write-Host ""
    Write-Host "   If you've resolved all conflicts:" -ForegroundColor White
    Write-Host "     git add <resolved-files>"
    Write-Host "     git rebase --continue"
    Write-Host ""
    Write-Host "   Then re-run this script to push." -ForegroundColor White
    Write-Host ""
    Write-Host "   To abort the rebase and start over:" -ForegroundColor White
    Write-Host "     git rebase --abort"
    Write-Host ""
    exit 1
}

# Check upstream remote exists
$remotes = git remote
if ($remotes -notcontains "upstream") {
    Write-Err "No 'upstream' remote found. Add it with:"
    Write-Host "   git remote add upstream https://github.com/bradygaster/squad.git"
    exit 1
}
Write-Success "Upstream remote found"

# Check working tree is clean
$status = git status --porcelain
if ($status) {
    Write-Err "Working tree is not clean. Commit or stash your changes first."
    Write-Host ""
    git status --short
    exit 1
}
Write-Success "Working tree is clean"

# Remember current branch to return to it if needed
$startBranch = git branch --show-current

# --- Fetch upstream ---

Write-Step "Fetching upstream changes"
git fetch upstream
if ($LASTEXITCODE -ne 0) {
    Write-Err "Failed to fetch from upstream."
    exit 1
}
Write-Success "Fetched upstream/main"

# Check if there are actually new commits
$behindCount = git rev-list --count "main..upstream/main" 2>$null
if ($behindCount -eq "0") {
    Write-Success "main is already up to date with upstream."
} else {
    Write-Host "   $behindCount new commit(s) from upstream" -ForegroundColor White
}

# --- Update main ---

Write-Step "Updating main branch"
git checkout main
if ($LASTEXITCODE -ne 0) {
    Write-Err "Failed to checkout main."
    exit 1
}

git merge upstream/main --no-edit
if ($LASTEXITCODE -ne 0) {
    Write-Err "Merge conflict on main. This shouldn't happen if main is kept clean."
    Write-Host "   Resolve the conflicts, then re-run this script."
    exit 1
}
Write-Success "Merged upstream/main into main"

git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Warn "Failed to push main to origin. You may need to push manually."
} else {
    Write-Success "Pushed main to origin"
}

# --- Rebase ralph-specum ---

Write-Step "Rebasing $Branch onto main"
git checkout $Branch
if ($LASTEXITCODE -ne 0) {
    Write-Err "Failed to checkout $Branch."
    exit 1
}

git rebase main 2>&1 | Tee-Object -Variable rebaseOutput
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Warn "Rebase encountered conflicts."
    Write-Host ""
    Write-Host "   Conflicted files:" -ForegroundColor White

    $conflicts = git diff --name-only --diff-filter=U
    foreach ($file in $conflicts) {
        Write-Host "     - $file" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "   To resolve:" -ForegroundColor Cyan
    Write-Host "   1. Open the conflicted files in VS Code" -ForegroundColor White
    Write-Host "      VS Code will show the merge editor with options:" -ForegroundColor White
    Write-Host "        'Accept Current Change'  = your ralph-specum changes" -ForegroundColor White
    Write-Host "        'Accept Incoming Change'  = upstream changes" -ForegroundColor White
    Write-Host "        'Accept Both Changes'     = keep both" -ForegroundColor White
    Write-Host ""
    Write-Host "   2. After resolving each file, stage it:" -ForegroundColor White
    Write-Host "        git add <file>" -ForegroundColor White
    Write-Host ""
    Write-Host "   3. Continue the rebase:" -ForegroundColor White
    Write-Host "        git rebase --continue" -ForegroundColor White
    Write-Host ""
    Write-Host "      If more conflicts appear, repeat steps 1-3." -ForegroundColor White
    Write-Host ""
    Write-Host "   4. When the rebase finishes, re-run this script to push." -ForegroundColor White
    Write-Host ""
    Write-Host "   To abort and undo everything:" -ForegroundColor Yellow
    Write-Host "        git rebase --abort" -ForegroundColor White
    Write-Host ""

    exit 1
}
Write-Success "Rebased $Branch onto main"

# --- Push ---

Write-Step "Ready to push $Branch"
Write-Host "   This will force-push (with lease) to origin/$Branch." -ForegroundColor White
$confirm = Read-Host "   Continue? (y/n)"

if ($confirm -eq "y" -or $confirm -eq "Y") {
    git push origin $Branch --force-with-lease
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Push failed. You may need to push manually."
        exit 1
    }
    Write-Success "Pushed $Branch to origin"
} else {
    Write-Warn "Skipped push. Run manually when ready:"
    Write-Host "   git push origin $Branch --force-with-lease"
}

Write-Host ""
Write-Step "Sync complete!"
Write-Host ""
