#!/usr/bin/env bash
# Create / update the single GitHub-Deployments branch with NORMAL pushes only (never force):
#   deploy/site   repo root = contents of theme/vineyard
#                 + files/                      documents+images in old-site folder layout (content/media.csv)
#                 + files/_import/              vineyard-import.xml, redirects.csv
#   -> deploy to /wp-content/themes/vineyard
# Run with the main branch checked out and committed (the theme is taken from HEAD). NO_PUSH=1 skips pushing.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
REMOTE="${REMOTE:-origin}"
BATCH_MB="${BATCH_MB:-300}"      # keep every commit/push well below GitHub's per-push limits
MAXFILE_MB="${MAXFILE_MB:-95}"   # GitHub rejects files > 100 MB (see source/LARGE_FILES.md)

THEME="$(git subtree split --prefix=theme/vineyard HEAD)"   # theme-only history; deterministic
echo "theme commit: $THEME"
WT="$(mktemp -d)"
trap 'git worktree remove --force "$WT" >/dev/null 2>&1 || true' EXIT
if git ls-remote --exit-code --heads "$REMOTE" deploy/site >/dev/null 2>&1; then
  git fetch -q "$REMOTE" deploy/site
  git worktree add -q -B deploy/site "$WT" "$REMOTE/deploy/site"
  # refresh the theme part (everything except files/ and .git), then lay the new theme over it
  find "$WT" -mindepth 1 -maxdepth 1 ! -name .git ! -name files -exec rm -rf {} +
  git archive "$THEME" | tar -x -C "$WT"
else
  git worktree add -q -B deploy/site "$WT" "$THEME"
fi
git -C "$WT" add -A
git -C "$WT" diff --cached --quiet || git -C "$WT" commit -q -m "Update theme

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0182QwimvgWX9ecFFcR5XiXR"

python3 -I - "$WT" "$BATCH_MB" "$MAXFILE_MB" "${NO_PUSH:-0}" "$REMOTE" <<'PY'
import csv, os, shutil, subprocess, sys
wt, batch_mb, max_mb, no_push, remote = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4] == "1", sys.argv[5]
def git(*a): return subprocess.run(["git", "-C", wt, *a], check=True, capture_output=True, text=True).stdout
MSG = "\n\nCo-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_0182QwimvgWX9ecFFcR5XiXR"
def push():
    if not no_push: git("push", "-q", "-u", remote, "deploy/site")   # normal push, never --force
rows = list(csv.DictReader(open("content/media.csv", newline="", encoding="utf-8")))
files, skipped = [], []
for r in rows:
    src = r["local_path"]
    if not os.path.isfile(src): skipped.append((r["old_path"], "missing")); continue
    sz = os.path.getsize(src)
    if sz > max_mb * 1024 * 1024: skipped.append((r["old_path"], f"{sz/1e6:.0f} MB > limit")); continue
    dst = os.path.join(wt, "files", r["old_path"])
    if os.path.exists(dst) and os.path.getsize(dst) == sz: continue
    files.append((r["old_path"], src, sz))
files.sort()
batches, cur, tot = [], [], 0
for f in files:
    if cur and tot + f[2] > batch_mb * 1024 * 1024: batches.append(cur); cur, tot = [], 0
    cur.append(f); tot += f[2]
if cur: batches.append(cur)
print(f"{len(files)} files to add in {len(batches)} batches; skipped: {skipped}")
push()  # theme commit(s) first
for i, b in enumerate(batches, 1):
    for old, src, _ in b:
        dst = os.path.join(wt, "files", old); os.makedirs(os.path.dirname(dst), exist_ok=True); shutil.copy2(src, dst)
    git("add", "-A"); git("commit", "-q", "-m", f"Add files/ batch {i}/{len(batches)}" + MSG); push()
    print(f"batch {i}/{len(batches)}: {len(b)} files, {sum(x[2] for x in b)/1e6:.0f} MB", flush=True)
# import helpers, reachable at /wp-content/themes/vineyard/files/_import/
imp = os.path.join(wt, "files", "_import"); os.makedirs(imp, exist_ok=True)
for name, src in (("vineyard-import.xml", "content/vineyard-import.xml"), ("redirects.csv", "redirects.csv")):
    shutil.copy2(src, os.path.join(imp, name))
git("add", "-A")
if git("status", "--porcelain").strip():
    git("commit", "-q", "-m", "Add files/_import (WXR + redirects)" + MSG); push(); print("pushed files/_import")
PY
echo done
