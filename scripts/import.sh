#!/usr/bin/env bash
# Import the Vineyard City clone into a WordPress site using WP-CLI.
#
#   scripts/import.sh                      # uses `wp` on PATH, repo root auto-detected
#   WP="wp --path=/var/www/html" scripts/import.sh
#   WP="npx wp-env run cli wp" ROOT=/var/www/html/wp-content/vineyard-import scripts/import.sh   # inside wp-env
#
# What it does (idempotent – safe to re-run):
#   1. activate the theme, set permalinks to /%postname%/
#   2. import every image/PDF/doc into the Media Library (scripts/import-media.php)
#   3. create pages from content/manifest.json and rewrite internal links (scripts/import-pages.php)
#   4. build the primary menu from content/menu.json (scripts/import-menu.php)
#   5. install redirects.csv for the theme's 404 handler
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="${ROOT:-$(dirname "$HERE")}"
WP="${WP:-wp}"
WPUSER="${WPUSER:-1}"           # an administrator (needed so unfiltered HTML is allowed)
SKIP_MEDIA="${SKIP_MEDIA:-0}"   # SKIP_MEDIA=1 to import pages only

say() { printf '\n==> %s\n' "$*"; }

say "Checking WordPress"
$WP core is-installed || { echo "WordPress is not installed yet. Run: $WP core install --url=... --title=... --admin_user=... --admin_email=..."; exit 1; }

say "Theme + permalinks"
THEME_DIR="$($WP theme path vineyard 2>/dev/null || true)"
if ! $WP theme is-installed vineyard 2>/dev/null; then
  echo "Theme 'vineyard' not found in wp-content/themes. Copy or symlink $ROOT/theme/vineyard there first."; exit 1
fi
$WP theme activate vineyard
$WP rewrite structure '/%postname%/' --hard
$WP option update blogname "Vineyard City, Utah"
$WP option update blog_public 0   # keep staging out of search engines until launch; set to 1 at go-live

if [ "$SKIP_MEDIA" != "1" ]; then
  say "Media Library import ($(($(wc -l < "$ROOT/content/media.csv") - 1)) files) – this takes a while"
  $WP --user="$WPUSER" eval-file "$ROOT/scripts/import-media.php" "$ROOT"
fi

say "Pages"
$WP --user="$WPUSER" eval-file "$ROOT/scripts/import-pages.php" "$ROOT"

say "Menus"
$WP --user="$WPUSER" eval-file "$ROOT/scripts/import-menu.php" "$ROOT"

say "Redirects"
$WP eval "copy('$ROOT/redirects.csv', get_theme_root().'/vineyard/inc/redirects.csv') ? WP_CLI::success('redirects.csv installed in theme') : WP_CLI::warning('could not copy redirects.csv');"

$WP cache flush >/dev/null 2>&1 || true
$WP rewrite flush --hard >/dev/null 2>&1 || true
say "Done. Verify with: scripts/verify.sh  (see README.md)"
