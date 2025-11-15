$ErrorActionPreference = 'Continue'
Set-StrictMode -Version Latest

$repoRoot = Split-Path $PSScriptRoot -Parent
$log = Join-Path $repoRoot 'git-cleanup-report.txt'
if (Test-Path $log) { Remove-Item $log -Force }

function Log($text) {
  $text | Tee-Object -FilePath $log -Append | Out-Host
}

Log "[git-clean] Fetching and pruning remotes..."
git fetch --all --prune 2>&1 | Tee-Object -FilePath $log -Append | Out-Host

$protected = @('main','master','develop','dev','staging','release')

Log "[git-clean] Local branches merged into main (candidates):"
$mergedLocal = @(git branch --merged main |
  ForEach-Object { $_.Trim() } |
  Where-Object { $_ -and ($_ -notmatch '^\*') -and ($protected -notcontains $_) })
$mergedLocal | Tee-Object -FilePath $log -Append | Out-Host

if ($mergedLocal.Count -gt 0) {
  Log "[git-clean] Deleting merged local branches..."
  foreach ($b in $mergedLocal) {
    git branch -d $b 2>&1 | Tee-Object -FilePath $log -Append | Out-Host
  }
} else {
  Log "[git-clean] No merged local branches to delete."
}

Log "[git-clean] Pruning stale remote-tracking branches from origin..."
git remote prune origin 2>&1 | Tee-Object -FilePath $log -Append | Out-Host

Log "[git-clean] Remote branches merged into origin/main (candidates):"
$mergedRemote = @(git branch -r --merged origin/main |
  ForEach-Object { $_.Trim() } |
  Where-Object { $_ -match '^origin/' -and ($_ -notmatch 'origin/(HEAD|main)$') })
$mergedRemote | Tee-Object -FilePath $log -Append | Out-Host

if ($mergedRemote.Count -gt 0) {
  Log "[git-clean] Deleting merged remote branches on origin..."
  foreach ($r in $mergedRemote) {
    $name = $r -replace '^origin/',''
    git push origin --delete $name 2>&1 | Tee-Object -FilePath $log -Append | Out-Host
  }
} else {
  Log "[git-clean] No merged remote branches to delete."
}

Log "[git-clean] Remaining local branches:"
git branch -vv 2>&1 | Tee-Object -FilePath $log -Append | Out-Host

Log "[git-clean] Remaining remote branches:"
git branch -r 2>&1 | Tee-Object -FilePath $log -Append | Out-Host

Log "[git-clean] Cleanup complete. Report: $log"
