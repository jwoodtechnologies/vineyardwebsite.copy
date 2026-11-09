#!/usr/bin/env bash
# Re-download mirror files that are too large for GitHub (see source/LARGE_FILES.md) and verify their checksum.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
dest='source/www.vineyardutah.gov/Boards & Commissions/Vineyard Active Transportation Plan_Final.pdf?t=202504021754480'
url='https://www.vineyardutah.gov/Boards%20&%20Commissions/Vineyard%20Active%20Transportation%20Plan_Final.pdf'
want='e05ccbe8823a621d140ee97b99df3325921020d423a001ef291a7556bc6cc7a1'
mkdir -p "$(dirname "$dest")"
[ -f "$dest" ] && echo "$want  $dest" | sha256sum -c - 2>/dev/null && { echo "already present"; exit 0; }
curl -fL --retry 3 -o "$dest" "$url"
echo "$want  $dest" | sha256sum -c - || echo "WARNING: checksum differs – the live file may have been updated since the mirror was taken"
