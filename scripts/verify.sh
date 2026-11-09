#!/usr/bin/env bash
# Smoke-test an imported site.  Usage: scripts/verify.sh [BASE_URL]   (default http://localhost:8888)
# Checks: every page in content/manifest.json returns 200, redirects.csv rows redirect correctly,
# and prints counts. Exit code 1 if anything fails.
set -uo pipefail
BASE="${1:-http://localhost:8888}"; BASE="${BASE%/}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; ROOT="$(dirname "$HERE")"
fail=0; ok=0

code() { curl -s -o /dev/null -m 30 -w '%{http_code}' "$@"; }

echo "== front page"; c=$(code "$BASE/"); echo "$c $BASE/"; [ "$c" = 200 ] || fail=$((fail+1))

echo "== pages from manifest"
python3 -I - "$ROOT/content/manifest.json" <<'PY' > /tmp/vc_paths.txt
import json,sys
for m in json.load(open(sys.argv[1])): print(m["new_path"])
PY
while read -r p; do
  c=$(code "$BASE/$p")
  if [ "$c" = 200 ]; then ok=$((ok+1)); else echo "FAIL $c /$p"; fail=$((fail+1)); fi
done < /tmp/vc_paths.txt
echo "pages OK: $ok"

echo "== redirects (sample: all page rows + 25 media rows)"
python3 -I - "$ROOT/redirects.csv" <<'PY' > /tmp/vc_redirects.txt
import csv,sys,itertools
rows=[r for r in csv.DictReader(open(sys.argv[1], newline="")) if not r["regex"]=="1"]
pages=[r for r in rows if not r["source"].startswith("/wp-content") and "uploads" not in r["target"]]
media=[r for r in rows if "uploads" in r["target"]][:25]
for r in pages+media: print(r["source"]+"\t"+r["target"])
PY
rok=0
while IFS=$'\t' read -r old new; do
  # curl follows the redirect; final URL must end with the expected path (media files must return 200)
  final=$(curl -s -o /dev/null -L -m 30 -w '%{http_code} %{url_effective}' "$BASE$old")
  c=${final%% *}; u=${final#* }
  un=$(python3 -I -c 'import sys,urllib.parse as u;print(u.unquote(sys.argv[1]))' "$u"); nn=$(python3 -I -c 'import sys,urllib.parse as u;print(u.unquote(sys.argv[1]))' "$new")
  if [ "$c" = 200 ] && [[ "$un" == *"$nn" ]]; then rok=$((rok+1)); else echo "REDIRECT FAIL $old -> $new (got $c $u)"; fail=$((fail+1)); fi
done < /tmp/vc_redirects.txt
echo "redirects OK: $rok"

[ $fail -eq 0 ] && echo "ALL GOOD" || { echo "$fail problem(s)"; exit 1; }
