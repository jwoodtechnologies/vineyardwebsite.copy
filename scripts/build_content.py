#!/usr/bin/env python3
"""Build WordPress migration artifacts from the wget mirror in ./source.

Outputs (relative to repo root):
  content/<slug>.html        main content of each page (the old  #post  block, cleaned of Revize editor chrome)
  content/manifest.json      title, slug, parent, menu_order, old_url, new_path, meta (banner, left nav, contact box ...)
  content/menu.json          the main navigation tree (from the live <ul id="nav">)
  inventory.csv              every page / asset / document with its old URL
  redirects.csv              old URL -> new URL
  theme/vineyard/inc/legacy-map.php   old page path -> new WP path (used by the theme's vineyard_url())
  theme/vineyard/_assets_/   original CSS/JS/images/fonts copied from the mirror (unchanged)

Usage: python3 -I scripts/build_content.py            (run from the repo root)
"""
import csv, hashlib, json, mimetypes, os, re, shutil, sys
import urllib.parse as up
from pathlib import Path
from bs4 import BeautifulSoup, Comment

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "source" / "www.vineyardutah.gov"
CDN = ROOT / "source" / "_cdn"
THEME = ROOT / "theme" / "vineyard"
CONTENT = ROOT / "content"
HOSTS = {"www.vineyardutah.gov", "vineyardutah.gov", "www.vineyardutah.org", "vineyardutah.org"}
BASE = "https://www.vineyardutah.gov/"

PAGE_EXT = {".php", ".html", ".htm"}
SECTION_DIRS = {  # old folder -> (slug, title) of the section landing page
    "government": ("government", "Government"),
    "community_": ("community", "Community"),
    "services": ("services", "Services"),
    "contact": ("contact", "Contact"),
    "transparency_portal": ("transparency-portal", "Transparency Portal"),
}


def slugify(name: str) -> str:
    name = up.unquote(name)
    name = re.sub(r"\.(php|html?)$", "", name, flags=re.I)
    name = name.lower().replace("&", "and")
    name = re.sub(r"[^a-z0-9]+", "-", name).strip("-")
    return name or "page"


def strip_query(fname: str) -> str:
    """wget stores 'file.pdf?t=2026...' on disk; the canonical name has no query."""
    return fname.split("?", 1)[0]


def read_source(path: Path) -> str:
    orig = Path(str(path) + ".orig")  # wget -K keeps the unconverted original
    p = orig if orig.exists() else path
    return p.read_text(encoding="utf-8", errors="replace")


# ------------------------------------------------------------------ discover
def list_files():
    files = []
    for p in sorted(SRC.rglob("*")):
        if p.is_file() and not p.name.endswith(".orig"):
            files.append(p)
    return files


def is_page(p: Path) -> bool:
    if "?" in p.name:
        return False
    return p.suffix.lower() in PAGE_EXT and "?" not in p.name and "_assets_" not in p.parts and "revize" not in p.relative_to(SRC).parts[:1]


def old_url_for(rel: str) -> str:
    return BASE + up.quote(strip_query(rel), safe="/()'!$&,;=:@%~")


# ------------------------------------------------------------------ content
EDITOR_SELECTORS = [".rzBtn", ".enablerbtns", ".user-logged-in", ".file-edit", ".cat-edit", ".rz-sort-options",
                    ".loginOnly", ".rzAdmin", ".rzContainer"]


def clean_post(container):
    for s in list(container.find_all("script")):
        txt = s.string or s.get_text() or ""
        if "RZ" in txt or "RZaction" in txt or (not s.get("src") and not txt.strip()):
            s.decompose()
    for sel in EDITOR_SELECTORS:
        for el in container.select(sel):
            el.decompose()
    for c in container.find_all(string=lambda t: isinstance(t, Comment)):
        c.extract()
    # empty leading wrapper div (it only held the Revize edit buttons)
    post = container.select_one("#post")
    if post is not None:
        for d in post.find_all("div", recursive=False)[:1]:
            if not d.get_text(strip=True) and not d.find(["img", "a", "iframe"]):
                d.decompose()
    html = container.decode_contents()
    html = re.sub(r"\n{3,}", "\n\n", html).strip()
    return html


HOME_ASSETS = set()


def head_resources(soup):
    out = []
    for l in soup.find_all("link", rel=lambda v: v and "stylesheet" in v):
        out.append(("css", l.get("href", "")))
    for sc in soup.find_all("script", src=True):
        out.append(("js", sc["src"]))
    return out


def norm_asset(u):
    """Return theme-relative path for same-site resources, else None."""
    p = up.urlparse(u)
    if p.netloc and p.netloc.lower() not in HOSTS:
        return None
    path = p.path.lstrip("/")
    if path.startswith("revize/plugins/setup/"):
        return None  # Revize editor UI
    return path or None


def extract_page(path: Path):
    rel = path.relative_to(SRC).as_posix()
    raw = read_source(path)
    # Revize's document-center include leaves an unclosed editor-only <div class="user-logged-in seq-alert"> that browsers
    # close at the next </section>; lxml would swallow the whole category list into it, so drop that block up front.
    raw = re.sub(r'<div class="user-logged-in seq-alert">.*?(</section><!-- /\.doc-search-form -->)', r"\1", raw, flags=re.S)
    soup = BeautifulSoup(raw, "lxml")
    fm = soup.select_one("#freeform-main")
    post = fm
    h1 = soup.select_one("#page-title")
    title = h1.get_text(" ", strip=True) if h1 else (soup.title.get_text(strip=True) if soup.title else rel)
    meta = {}
    if post is None:
        return None
    caption = soup.select_one("#inner-caption")
    if caption:
        meta["vc_banner_caption"] = caption.get_text(" ", strip=True)
    imgs = []
    for el in soup.select("section#slider [data-style]"):
        m = re.search(r"url\(\s*(?:'([^']*)'|\"([^\"]*)\"|([^)]*))\s*\)", el.get("data-style", ""))
        if m:
            imgs.append(m.group(1) or m.group(2) or m.group(3))
    if imgs:
        meta["vc_banner_images"] = json.dumps(imgs)
    ib = soup.select_one("#inner-buttons")
    if ib and ib.find("a"):
        meta["vc_inner_buttons"] = ib.decode_contents().strip()
    fl = soup.select_one("ul#flyout")
    if fl:
        meta["vc_leftnav"] = str(fl)
    cb = soup.select_one("#contact-box")
    if cb and cb.get_text(strip=True):
        meta["vc_contact_box"] = cb.decode_contents().strip()
    extras = []
    for kind, u in head_resources(soup):
        a = norm_asset(u)
        if not a or (kind, a) in HOME_ASSETS:
            continue
        if a.startswith(("revize/plugins/", "_assets_/css/business-directory")) and (kind, a) not in extras:
            extras.append((kind, a))
    if extras:
        meta["vc_head_assets"] = json.dumps(extras)
    bodyid = soup.body.get("id") if soup.body else None
    if bodyid:
        meta["vc_body_id"] = bodyid
    bodycls = " ".join(soup.body.get("class") or []) if soup.body else ""
    if bodycls:
        meta["vc_body_class"] = bodycls  # e.g. "fullwidth" (layout.css has #freeform.fullwidth rules)
    desc = soup.find("meta", attrs={"name": "description"})
    if desc and desc.get("content"):
        meta["vc_meta_description"] = desc["content"]
    # main content = everything inside #freeform-main except the title, edit buttons and the button strip
    container = BeautifulSoup("<div></div>", "lxml").div
    for ch in list(fm.children):
        if getattr(ch, "get", None) and (ch.get("id") in ("page-title", "inner-buttons") or "enablerbtns" in (ch.get("class") or [])):
            continue
        container.append(ch.extract())
    meta["vc_layout"] = "sidebar" if soup.select_one("main aside") else "full"
    crumbs = []
    for li in soup.select("#breadcrumbs li"):
        a = li.find("a")
        crumbs.append({"title": li.get_text(" ", strip=True), "url": a.get("href", "") if a else ""})
    if crumbs:
        meta["vc_breadcrumbs"] = json.dumps(crumbs)
    return {"rel": rel, "title": title, "html": clean_post(container), "meta": meta}


# ------------------------------------------------------------------ nav
def parse_nav():
    home = SRC / "index.html"
    if not home.exists():
        home = SRC / "index.php"
    soup = BeautifulSoup(read_source(home), "lxml")
    nav = soup.select_one("ul#nav")

    def walk(ul):
        out = []
        for li in ul.find_all("li", recursive=False):
            a = li.find("a", recursive=False)
            if not a:
                continue
            node = {"title": a.get_text(" ", strip=True), "url": a.get("href", ""), "target": a.get("target", "_self"), "children": []}
            sub = li.find("ul", recursive=False)
            if sub:
                node["children"] = walk(sub)
            out.append(node)
        return out

    return walk(nav) if nav else []


def old_path_from_url(u: str):
    """Return site-relative path (no leading slash, no query/fragment) if u points at this site, else None."""
    if not u:
        return None
    p = up.urlparse(u)
    if p.scheme in ("mailto", "tel", "javascript", "data"):
        return None
    if p.netloc and p.netloc.lower() not in HOSTS:
        return None
    path = up.unquote(p.path)
    if path.startswith("/./"):
        path = path[2:]
    return path.lstrip("/")


# ------------------------------------------------------------------ main
def main():
    if not SRC.exists():
        sys.exit("source mirror not found: %s" % SRC)
    files = list_files()
    nav = parse_nav()
    hs = BeautifulSoup(read_source(SRC / "index.html"), "lxml")
    for kind, u in head_resources(hs):
        a = norm_asset(u)
        if a:
            HOME_ASSETS.add((kind, a))
    # layout.css is always enqueued by the theme; the calendar bundle is enqueued on its own pages
    HOME_ASSETS.add(("css", "_assets_/css/layout.css"))

    # ---- pages
    pages = {}
    for p in files:
        if not is_page(p):
            continue
        rel = p.relative_to(SRC).as_posix()
        if rel in ("index.html",):
            continue
        d = extract_page(p)
        if d:
            pages[rel] = d

    # home page
    home_rel = "index.php"

    # ---- slugs / parents
    slug_used = set()
    entries = {}
    for rel, d in pages.items():
        parts = rel.split("/")
        fname = parts[-1]
        if len(parts) == 1:
            slug = slugify(fname)
            parent_dir = None
            new_path = slug + "/"
        else:
            folder = parts[0]
            if len(parts) == 2 and fname.lower() in ("index.php", "index.html"):
                slug = SECTION_DIRS.get(folder, (slugify(folder), None))[0]
                new_path = slug + "/"
                parent_dir = None
            else:
                sec_slug = SECTION_DIRS.get(folder, (slugify(folder), None))[0]
                if fname.lower() in ("index.php", "index.html"):
                    slug = slugify(parts[-2])
                    parent_dir = "/".join(parts[:-2]) or None
                    parent_slug = sec_slug if len(parts) > 2 else None
                else:
                    slug = slugify(fname)
                    parent_slug = sec_slug
                new_path = (parent_slug + "/" if parent_slug else "") + slug + "/"
                if fname.lower() in ("index.php", "index.html"):
                    new_path = sec_slug + "/" + slug + "/"
                parent_dir = parent_slug
        entries[rel] = {"slug": slug, "parent_slug": None if len(parts) == 1 or (len(parts) == 2 and fname.lower() in ("index.php", "index.html")) else (SECTION_DIRS.get(parts[0], (slugify(parts[0]), None))[0]), "new_path": new_path}
    # ensure unique slugs among siblings
    seen = {}
    for rel, e in sorted(entries.items()):
        key = (e["parent_slug"], e["slug"])
        if key in seen:
            n = 2
            while (e["parent_slug"], f"{e['slug']}-{n}") in seen:
                n += 1
            e["slug"] = f"{e['slug']}-{n}"
            e["new_path"] = (e["parent_slug"] + "/" if e["parent_slug"] else "") + e["slug"] + "/"
            key = (e["parent_slug"], e["slug"])
        seen[key] = rel

    # ---- menu order: position of each page in nav (depth-first)
    nav_order = {}
    counter = [0]

    def order_walk(nodes):
        for n in nodes:
            counter[0] += 1
            op = old_path_from_url(n["url"])
            if op is not None and op not in nav_order:
                nav_order[op] = counter[0]
            order_walk(n["children"])

    order_walk(nav)

    # ---- write content + manifest
    CONTENT.mkdir(exist_ok=True)
    for old in CONTENT.glob("*.html"):
        old.unlink()
    manifest = []
    legacy_map = {}
    for rel, d in sorted(pages.items()):
        e = entries[rel]
        # file name must be unique: use parent-qualified name when slug collides across sections
        fname = e["slug"] if not e["parent_slug"] else f"{e['parent_slug']}__{e['slug']}"
        if not e["parent_slug"]:
            fname = e["slug"]
        (CONTENT / f"{fname}.html").write_text(d["html"] + "\n", encoding="utf-8")
        order = nav_order.get(rel, 1000 + len(manifest))
        item = {
            "title": d["title"],
            "slug": e["slug"],
            "parent": e["parent_slug"],
            "menu_order": order,
            "old_url": old_url_for(rel),
            "old_path": rel,
            "new_path": e["new_path"],
            "content_file": f"{fname}.html",
            "front_page": rel == home_rel,
            "meta": d["meta"],
        }
        manifest.append(item)
        legacy_map[rel] = e["new_path"]
        legacy_map[rel.replace("index.php", "")] = e["new_path"] if rel.endswith("index.php") else legacy_map.get(rel.replace("index.php", ""), e["new_path"])

    # home page is the WP front page (served by front-page.php); no content file needed.
    manifest = [m for m in manifest if not m["front_page"]]
    legacy_map.pop("index.php", None)
    legacy_map.pop("", None)
    # section landing pages must exist first (parents before children)
    manifest.sort(key=lambda m: (m["parent"] is not None, m["menu_order"], m["slug"]))
    (CONTENT / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (CONTENT / "menu.json").write_text(json.dumps(nav, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # legacy map for the theme
    lm = "<?php\n// Generated by scripts/build_content.py — old Revize page path => new WordPress path.\nreturn array(\n"
    for k, v in sorted(legacy_map.items()):
        if k:
            lm += "\t%s => %s,\n" % (json.dumps(k, ensure_ascii=False).replace("$", "\\$"), json.dumps(v))
    lm += ");\n"
    (THEME / "inc").mkdir(parents=True, exist_ok=True)
    (THEME / "inc" / "legacy-map.php").write_text(lm, encoding="utf-8")

    # ---- assets / documents
    media_exts = {".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".ico", ".bmp"}
    doc_exts = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".csv", ".txt", ".rtf", ".zip", ".mp4", ".mp3", ".odt", ".ods", ".kml", ".kmz"}
    theme_exts = {".css", ".js", ".woff", ".woff2", ".ttf", ".eot", ".otf", ".map", ".swf"}
    inv = []
    media_rows = []  # (old_path, local_path)
    for p in files:
        rel = p.relative_to(SRC).as_posix()
        clean_rel = strip_query(rel)
        ext = Path(clean_rel).suffix.lower()
        if is_page(p):
            kind = "page"
        elif ext in doc_exts:
            kind = "document"
        elif ext in media_exts:
            kind = "image"
        elif ".php?" in rel or ".html?" in rel:
            kind = "page-variant"  # e.g. calendar.php?view=month… (dynamic view of an existing page)
        elif ext in theme_exts or ext == "":
            kind = "theme-asset" if ("_assets_" in rel or rel.startswith("revize/")) else "asset"
        else:
            kind = "asset"
        in_assets = rel.startswith("_assets_/") or rel.startswith("revize/")
        if kind in ("document", "image") and not in_assets:
            media_rows.append((clean_rel, rel))
        sha = hashlib.sha1(p.read_bytes()).hexdigest()[:12]
        new_ref = ""
        if kind == "page":
            e = entries.get(rel)
            new_ref = "/" + e["new_path"] if e else "/"
        elif kind in ("document", "image") and not in_assets:
            new_ref = "/wp-content/uploads/legacy/" + clean_rel
        elif in_assets:
            new_ref = "theme: _assets_/" + clean_rel.split("_assets_/", 1)[-1] if "_assets_/" in rel else "theme: _assets_/revize_" + clean_rel[len("revize/"):]
        inv.append({"type": kind, "old_url": old_url_for(rel), "local_path": "source/www.vineyardutah.gov/" + rel,
                    "bytes": p.stat().st_size, "sha1_12": sha, "new_location": new_ref})
    # nav-only / unmirrored URLs are listed separately by the verifier
    with open(ROOT / "inventory.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["type", "old_url", "local_path", "bytes", "sha1_12", "new_location"])
        w.writeheader()
        for r in sorted(inv, key=lambda r: (r["type"], r["old_url"])):
            w.writerow(r)

    # media list for import
    with open(CONTENT / "media.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["old_path", "local_path"])
        for old, local in sorted(set(media_rows)):
            w.writerow([old, "source/www.vineyardutah.gov/" + local])

    # ---- redirects
    redirects = []
    for rel, e in sorted(entries.items()):
        if rel == home_rel:
            continue
        old_p = "/" + strip_query(rel)
        redirects.append((old_p, "/" + e["new_path"], 301, "page"))
        if rel.endswith("/index.php"):
            redirects.append(("/" + rel[: -len("index.php")], "/" + e["new_path"], 301, "page-folder"))
    redirects.append(("/index.php", "/", 301, "page"))
    redirects.append(("/index.html", "/", 301, "page"))
    for old, local in sorted(set(media_rows)):
        redirects.append(("/" + old, "/wp-content/uploads/legacy/" + old, 301, "media"))
    # Revize document links that appear without /wp-content (spaces are kept encoded by the web server)
    redirects.append(("/search.php", "/", 301, "search (query string q= is mapped to ?s= by the theme)"))
    redirects.append(("/DocumentCenter/View/319", "/government/resource-documents/", 301, "legacy CivicPlus URL; file id unknown"))
    redirects.append(("/DocumentCenter/View/2375/Building-Portal-Account-Guide", "/government/resource-documents/", 301, "legacy CivicPlus URL; file id unknown"))
    redirects.append(("^/DocumentCenter/(View|Home/View)/\\d+(/.*)?$", "/government/resource-documents/", 301, "REGEX: any legacy /DocumentCenter/View/N link"))
    with open(ROOT / "redirects.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["old_path", "new_path", "status", "note"])
        w.writerows(redirects)

    # ---- copy theme assets (unchanged)
    dst = THEME / "_assets_"
    if dst.exists():
        shutil.rmtree(dst)
    for p in (SRC / "_assets_").rglob("*"):
        if p.is_file():
            rel = p.relative_to(SRC / "_assets_").as_posix()
            out = dst / strip_query(rel)
            out.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, out)
    vend = dst / "vendor"
    if CDN.exists():
        for p in CDN.rglob("*"):
            if p.is_file():
                out = vend / p.relative_to(CDN)
                out.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(p, out)
    rz = SRC / "revize"
    rdst = THEME / "revize"
    if rdst.exists():
        shutil.rmtree(rdst)
    if rz.exists():
        for p in rz.rglob("*"):
            if p.is_file() and "plugins/setup" not in p.as_posix() and not p.name.endswith(".orig"):
                out = rdst / p.relative_to(rz).as_posix().split("?")[0]
                out.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(p, out)
    shutil.copy2(ROOT / "redirects.csv", THEME / "inc" / "redirects.csv")

    print("pages:", len(manifest), "| media files:", len(set(media_rows)), "| inventory rows:", len(inv), "| redirects:", len(redirects))


if __name__ == "__main__":
    main()
