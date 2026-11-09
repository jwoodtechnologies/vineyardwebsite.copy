#!/usr/bin/env bash
# Create / update the two GitHub-Deployments branches with NORMAL pushes only (never force):
#   deploy/theme  repo root == contents of theme/vineyard           -> deploy to /wp-content/themes/vineyard
#   deploy/files  only documents+images, old-site folder layout     -> deploy to /wp-content/uploads/vineyard-files
# Run from anywhere inside the repo with the main branch checked out and committed. Set NO_PUSH=1 to skip pushing.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
REMOTE="${REMOTE:-origin}"
BATCH_MB="${BATCH_MB:-300}"          # keep every push well below GitHub's per-push limits
MAXFILE_MB="${MAXFILE_MB:-95}"       # GitHub rejects files > 100 MB (see source/LARGE_FILES.md)

echo "== deploy/theme"
SPLIT="$(git subtree split --prefix=theme/vineyard HEAD)"   # deterministic: same history => fast-forward on later runs
echo "theme commit: $SPLIT"
[ "${NO_PUSH:-0}" = 1 ] || git push "$REMOTE" "$SPLIT:refs/heads/deploy/theme"
git branch -f deploy/theme "$SPLIT"

echo "== deploy/files"
WT="$(mktemp -d)"
trap 'git worktree remove --force "$WT" >/dev/null 2>&1 || true' EXIT
if git ls-remote --exit-code --heads "$REMOTE" deploy/files >/dev/null 2>&1; then
  git fetch -q "$REMOTE" deploy/files
  git worktree add -q -B deploy/files "$WT" "$REMOTE/deploy/files"
else
  git worktree add -q --detach "$WT" HEAD
  git -C "$WT" checkout -q --orphan deploy/files
  git -C "$WT" rm -rq --cached . ; find "$WT" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
fi
python3 -I - "$WT" "$BATCH_MB" "$MAXFILE_MB" "${NO_PUSH:-0}" "$REMOTE" <<'PY'
import csv, os, shutil, subprocess, sys
wt, batch_mb, max_mb, no_push, remote = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4] == "1", sys.argv[5]
rows = list(csv.DictReader(open("content/media.csv", newline="", encoding="utf-8")))
files, skipped = [], []
for r in rows:
    src = r["local_path"]
    if not os.path.isfile(src):
        skipped.append((r["old_path"], "missing")); continue
    sz = os.path.getsize(src)
    if sz > max_mb * 1024 * 1024:
        skipped.append((r["old_path"], f"{sz/1e6:.0f} MB > limit")); continue
    dst = os.path.join(wt, r["old_path"])
    if os.path.exists(dst) and os.path.getsize(dst) == sz:
        continue                                             # already deployed (same size)
    files.append((r["old_path"], src, sz))
files.sort()
batches, cur, tot = [], [], 0
for f in files:
    if cur and tot + f[2] > batch_mb * 1024 * 1024:
        batches.append(cur); cur, tot = [], 0
    cur.append(f); tot += f[2]
if cur: batches.append(cur)
print(f"{len(files)} files to add in {len(batches)} batches; skipped: {skipped}")
def git(*a): return subprocess.run(["git", "-C", wt, *a], check=True, capture_output=True, text=True).stdout
for i, b in enumerate(batches, 1):
    for old, src, _ in b:
        dst = os.path.join(wt, old); os.makedirs(os.path.dirname(dst) or wt, exist_ok=True); shutil.copy2(src, dst)
    git("add", "-A")
    git("commit", "-q", "-m", f"Add site files batch {i}/{len(batches)}\n\nCo-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_0182QwimvgWX9ecFFcR5XiXR")
    if not no_push:
        git("push", "-q", "-u", remote, "deploy/files")      # normal push, never --force
    print(f"batch {i}/{len(batches)}: {len(b)} files, {sum(x[2] for x in b)/1e6:.0f} MB pushed", flush=True)
PY
echo done
