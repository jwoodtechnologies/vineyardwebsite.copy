#!/usr/bin/env python3
"""Second pass after wget: find same-site URLs referenced by the mirrored pages/CSS that are not on disk
(wget's HTML parser skips resources after malformed inline scripts, and CSS url() fonts) and fetch them politely.

Usage: python3 -I scripts/fill_gaps.py [--delay 0.4] [--dry-run]
Writes scripts/../source/_fetch_failures.tsv for URLs that could not be fetched (404/403/timeouts).
"""
import argparse, html, posixpath, re, sys, time, urllib.parse as up, urllib.request, urllib.error, ssl, os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "source" / "www.vineyardutah.gov"
HOSTS = {"www.vineyardutah.gov", "vineyardutah.gov", "www.vineyardutah.org", "vineyardutah.org", "cms3.revize.com", "cdn1-global.revize.com"}
BASE = "https://www.vineyardutah.gov/"
UA = "Mozilla/5.0 (compatible; VineyardMigrationMirror/1.0)"

ap = argparse.ArgumentParser()
ap.add_argument("--delay", type=float, default=0.4)
ap.add_argument("--dry-run", action="store_true")
a = ap.parse_args()

URL_RE = re.compile(r"""(?:href|src|data-src|poster)\s*=\s*["']([^"']+)["']|url\(\s*(?:'([^']*)'|"([^"]*)"|([^)'"]*))\s*\)""", re.I)
SKIP_EXT_PAGE = {".php", ".html", ".htm", ""}  # pages are the crawler's job; here only resources + pages that are missing


def local_path(url):
    p = up.urlparse(url)
    path = up.unquote(p.path)
    if path.endswith("/"):
        path += "index.html"
    q = ("?" + p.query) if p.query else ""
    return SRC / (path.lstrip("/") + q)


def exists(url):
    lp = local_path(url)
    if lp.exists():
        return True
    # wget stores some files without the query, and ours may lack it
    p = up.urlparse(url)
    bare = SRC / up.unquote(p.path).lstrip("/")
    if bare.exists():
        return True
    # any file starting with the name + "?" (cache-buster stored with a different t=)
    d = bare.parent
    if d.exists():
        pref = bare.name + "?"
        return any(x.name.startswith(pref) for x in d.iterdir())
    return False


def normalize(u, base):
    u = html.unescape(u.strip())
    if not u or u.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return None
    full = up.urljoin(base, u)
    p = up.urlparse(full)
    if p.scheme not in ("http", "https") or p.netloc.lower() not in HOSTS:
        return None
    path = re.sub(r"^/revize/vineyard/", "/", p.path)
    path = posixpath.normpath(path) if path not in ("", "/") else path
    if p.netloc.lower() in ("cms3.revize.com", "cdn1-global.revize.com"):
        return None  # same files are reachable on the main host
    return up.urlunparse(("https", "www.vineyardutah.gov", path, "", p.query, ""))


def collect():
    found = {}
    for p in SRC.rglob("*"):
        if not p.is_file():
            continue
        if p.suffix in (".orig",) or True:
            name = p.name
        if name.endswith(".orig") or (p.suffix.lower() in (".php", ".html", ".htm", ".css") and "?" not in name and not (Path(str(p) + ".orig").exists() and not name.endswith(".orig"))):
            pass
        is_text = name.endswith(".orig") or p.suffix.lower() in (".css",) or (p.suffix.lower() in (".php", ".html", ".htm") and not Path(str(p) + ".orig").exists())
        if not is_text:
            continue
        txt = p.read_text(encoding="utf-8", errors="replace")
        rel = p.relative_to(SRC).as_posix().removesuffix(".orig")
        base = BASE + rel if rel.endswith(".css") else BASE  # pages carry <base href="https://www.vineyardutah.gov/">
        # strip RZ editor scripts' fake markup (they contain escaped quotes that confuse regexes)
        for m in URL_RE.finditer(txt):
            raw = m.group(1) or m.group(2) or m.group(3) or m.group(4)
            n = normalize(raw, base)
            if n:
                found.setdefault(n, rel)
    return found


def main():
    ctx = ssl.create_default_context()
    cabundle = os.environ.get("SSL_CERT_FILE") or "/root/.ccr/ca-bundle.crt"
    if os.path.exists(cabundle):
        ctx = ssl.create_default_context(cafile=cabundle)
    found = collect()
    skip_ext = {".php", ".html", ".htm"}
    todo = []
    for u, referer in sorted(found.items()):
        ext = Path(up.urlparse(u).path).suffix.lower()
        if "%5C" in u or '\\"' in u or "{" in u or "}" in u or "'+" in u:
            continue
        if not exists(u):
            todo.append(u)
    print(f"referenced same-site URLs: {len(found)}; missing on disk: {len(todo)}")
    if a.dry_run:
        for u in todo[:80]:
            print("  ", u)
        return
    fails = []
    got = 0
    for u in todo:
        pu = up.urlparse(u)
        ru = up.urlunparse((pu.scheme, pu.netloc, up.quote(up.unquote(pu.path), safe="/()'!$&,;=:@~"), "", up.quote(pu.query, safe="=&%"), ""))
        req = urllib.request.Request(ru, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=40, context=ctx) as r:
                data = r.read()
                ctype = r.headers.get("content-type", "")
                final = r.geturl()
        except urllib.error.HTTPError as e:
            fails.append((u, e.code)); time.sleep(a.delay); continue
        except Exception as e:
            fails.append((u, type(e).__name__)); time.sleep(a.delay); continue
        # a missing resource that returns an HTML 404 page with status 200 is not a real file
        if "text/html" in ctype and Path(up.urlparse(u).path).suffix.lower() not in (".php", ".html", ".htm", ""):
            fails.append((u, "html-instead-of-file")); time.sleep(a.delay); continue
        lp = local_path(u)
        lp.parent.mkdir(parents=True, exist_ok=True)
        lp.write_bytes(data)
        got += 1
        time.sleep(a.delay)
    print(f"fetched {got}, failed {len(fails)}")
    with open(ROOT / "source" / "_fetch_failures.tsv", "w") as f:
        for u, c in fails:
            f.write(f"{c}\t{u}\n")


if __name__ == "__main__":
    main()
