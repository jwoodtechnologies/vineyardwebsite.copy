# Vineyard City, Utah — website clone for WordPress

A faithful copy of the live Vineyard City government site (vineyardutah.gov, built on **Revize**), packaged so it can be
moved into WordPress as a **classic custom theme + imported pages**.
The real HTML, CSS, JS, images and documents were mirrored from the live site on **2026‑11‑09**; nothing was rebuilt from scratch.

| Path | What it is |
|------|-----------|
| `source/` | wget mirror of `www.vineyardutah.gov` (original `.php` pages incl. `.orig` unconverted copies, images, PDFs, CSS/JS) + `_cdn/` (bootstrap 4.6.0, jQuery 3.5.1, tiny‑slider 2.9.3 from npm – the site loaded these from CDNs) |
| `theme/vineyard/` | WordPress classic theme: `header.php`, `footer.php`, `page.php`, `front-page.php`, `functions.php`, `index.php`, `search.php`, `404.php`; the **original** `layout.css`, `scripts.js`, Font Awesome, etc. in `_assets_/` and `revize/plugins/` (class names unchanged) |
| `content/` | `<slug>.html` main content of each of the 621 pages, `manifest.json` (title, slug, parent, menu order, old URL, page meta), `menu.json` (main nav tree), `media.csv` (files to import) |
| `inventory.csv` | every page / image / document / theme asset with its old URL, local path, size, hash and new location |
| `redirects.csv` | old URL → new URL (pages, folder indexes, every media file, legacy `/DocumentCenter/View/N`) |
| `scripts/` | `import.sh` (WP‑CLI importer), `build_content.py` (regenerates everything above from `source/`), `fill_gaps.py`, `verify.sh`, … |
| `docs/dynamic-features.md` | features that can't be copied (calendar, agendas, forms, search, bill pay, alerts, directory …) + proposed plugins |
| `tests/` | link‑rewrite test and a WordPress‑less render harness used to check the theme |

## What was copied (and what wasn't)

* **621 pages** (+ home) → WordPress pages. 154 use the sidebar layout, 467 the `fullwidth` layout (incl. ~460 staff/board "directory" profile pages `business_detail_T13_R*.php`).
* **646 documents/images** (~1.6 GB; PDFs, DOCX, PNG, JPG) → Media Library under `wp-content/uploads/legacy/<original path>`.
* The **original CSS/JS are enqueued unchanged** (`layout.css?ver=1.02`, bootstrap 4.6, tiny‑slider, Font Awesome, YTPlayer, matchHeight, `scripts.js`). Page-specific Revize CSS/JS (document center, FAQ, business directory) is enqueued per page from the list the importer stores in post meta.
* Header, footer, share modal and the 100‑language translate list are the original markup; the nav is generated from the Menu (`wp_nav_menu` with a walker that outputs the original `menuLI/menuA levelN` classes, so the original mega‑menu CSS/JS work as is).

**Known gaps** (details in `docs/dynamic-features.md`): Revize‑hosted forms, the event calendar feed, the document‑center search box, the directory search/filter, the home‑page "newsletter" form. Two files are not in the mirror: 22 resources returned 404/403 on the live site (`source/_fetch_failures.tsv`, e.g. `Departmnts/Planning/fencing.JPG`, a few directory photos blocked by the origin's Cloudflare), and one 140 MB PDF is not committed to Git (see `source/LARGE_FILES.md`).
There is **no `/documentcenter` on the live site** (that is a CivicPlus URL pattern; the Revize "Document Center" is a module that lists direct file links). Two legacy `/DocumentCenter/View/N` URLs appear in the old sitemap and 404 on the live site, so `redirects.csv` sends `^/DocumentCenter/(View|Home/View)/\d+…` to the Resource Documents page.

## Run a local WordPress

Requirements: Docker, Node 18+ (for wp‑env) **or** Docker Compose; ~5 GB free disk (the mirror alone is 1.6 GB). Python 3 + `beautifulsoup4` + `lxml` only if you want to re‑run `build_content.py`.

### Option A – wp‑env (recommended)

```bash
npm install -g @wordpress/env
scripts/fetch_large_files.sh                    # restores the 140 MB PDF that is not in Git
wp-env start                                    # WordPress on http://localhost:8888  (admin / password)
wp-env run cli wp theme activate vineyard
WP="npx wp-env run cli wp" ROOT=/var/www/html/wp-content/vineyard-import scripts/import.sh
```

`.wp-env.json` mounts the theme and maps the whole repo to `wp-content/vineyard-import` inside the container.

### Option B – Docker Compose

```bash
docker compose up -d
docker compose run --rm wpcli -c 'wp core install --url=http://localhost:8888 --title=Vineyard --admin_user=admin --admin_password=admin --admin_email=admin@example.com --skip-email'
docker compose run --rm wpcli -c 'bash /project/scripts/import.sh'
```

### Option C – an existing WordPress

Copy (or symlink) `theme/vineyard` into `wp-content/themes/`, then from the repo root run `WP="wp --path=/path/to/wordpress" scripts/import.sh`.
Raise PHP `memory_limit`/`upload_max_filesize` (≥256 MB) for the larger PDFs.

### What `import.sh` does (idempotent – safe to re‑run)

1. Activates the theme, sets permalinks to `/%postname%/`.
2. `import-media.php` – copies every file to `uploads/legacy/<old path>` and registers it in the Media Library (stores the old path in `_vc_old_path`).
3. `import-pages.php` – creates pages from `content/manifest.json` (parents first), **rewrites internal links** (page links → new permalinks; file links → Media Library URLs; `?t=` cache‑busters dropped; theme assets → theme URL), saves page chrome (banner images, left nav, contact box, breadcrumbs, layout) as post meta, sets the static front page. Unresolvable internal URLs are written to `content/unresolved-links.txt`.
4. `import-menu.php` – builds the **Primary** menu from `content/menu.json` (109 items, 3 levels) and assigns it to the theme location.
5. Installs `redirects.csv` for the theme's 404 handler (`theme/vineyard/inc/redirects.php`; supports `^regex` rows). For production you can also convert it to server rules (nginx `map` / Apache `RewriteMap`) – the CSV format is `old_path,new_path,status,note`.

Environment switches: `SKIP_MEDIA=1` (pages only), `WPUSER=<admin id>` (needs *unfiltered_html* so iframes/forms survive), `blog_public` is left **off** until you launch.
Third‑party widgets (Google Analytics G‑DMHHVNQ10E, UserWay, Podium) are **off** by default; add `define('VINEYARD_THIRD_PARTY', true);` to `wp-config.php` to load them.

## Verify

```bash
scripts/verify.sh http://localhost:8888      # every manifest page returns 200; all page redirects + 25 media redirects resolve
php tests/test-rewrite.php                   # link rewriter over all 621 content files (no WordPress needed)
```

Then compare by eye with the live site: Home, Government → Building, Government → Finance → Budget (accordions), Government → City Council → a profile page, and the mobile menu (≤ 991 px).
Compare counts: **621 pages** (Pages → All), **646** Media items, 109 menu items.

## Regenerating from a fresh crawl

```bash
cd source && wget --mirror --page-requisites --convert-links --backup-converted --no-parent \
  --domains=www.vineyardutah.gov,vineyardutah.gov --wait=0.4 --random-wait -e robots=off \
  --restrict-file-names=unix -i ../scripts/seeds.txt   # seeds = home page + the URLs in the (stale) /sitemap.xml
python3 -I scripts/fill_gaps.py                  # fetches resources wget's parser missed
python3 -I scripts/build_content.py              # content/, manifest, inventory, redirects, theme assets, legacy map
python3 scripts/gen_theme_parts.py source/www.vineyardutah.gov/index.html.orig theme/vineyard   # share/translate partial (only if the markup changed)
```

(`robots.txt` on the live site is served by Revize's CMS host and is not reachable from the mirror environment; the crawl used a polite 0.4–0.6 s delay between requests.)

## Honest status

* The mirror, inventory, content extraction, link rewriting, redirects and theme were verified here by: PHP lint, running the real importer’s rewriter over all pages, and rendering the actual theme templates through a WordPress‑function stub and comparing screenshots with the live site (Home and Building identical; others within ~45 px of height).
* **`import.sh` and the WP‑CLI scripts have not been run against a real WordPress** – the build environment had no Docker. Expect to fix small issues on the first run (PHP memory on the media step, user capability for unfiltered HTML). Run on a staging site first.
* The site's sitemap.xml is stale (old `vineyardutah.org` `.php` structure), so discovery was by crawling links from the home page and sitemap seeds; pages reachable only through dynamic modules or not linked anywhere were not found.
