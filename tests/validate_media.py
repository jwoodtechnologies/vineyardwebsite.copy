#!/usr/bin/env python3
"""python3 -I tests/validate_media.py   — validates content/media-import-N.xml + media-manifest.csv."""
import csv, glob, os, re, sys, collections, urllib.parse as up
import xml.etree.ElementTree as ET
from pathlib import Path
R = Path(__file__).resolve().parent.parent
ns = {"wp": "http://wordpress.org/export/1.2/"}
BASE = "https://vineyard54.wpcomstaging.com/wp-content/themes/vineyard/files/"
local = {r["old_path"]: R / r["local_path"] for r in csv.DictReader(open(R / "content" / "media.csv", newline="", encoding="utf-8"))}
files = sorted(glob.glob(str(R / "content" / "media-import-*.xml")), key=lambda f: int(re.search(r"-(\d+)\.xml", f).group(1)))
errs, seen_ids, seen_td, seen_paths = [], set(), set(), set()
manifest = list(csv.DictReader(open(R / "content" / "media-manifest.csv", newline="", encoding="utf-8")))
msize = collections.defaultdict(int); mcount = collections.Counter()
for m in manifest: msize[int(m["chunk"])] += int(m["size"]); mcount[int(m["chunk"])] += 1
for f in files:
    ci = int(re.search(r"-(\d+)\.xml", f).group(1))
    items = ET.parse(f).getroot().find("channel").findall("item")   # raises if malformed
    size = 0
    for it in items:
        g = lambda t: it.findtext("wp:" + t, namespaces=ns)
        pid = int(g("post_id")); title = it.findtext("title"); url = g("attachment_url")
        if g("post_type") != "attachment": errs.append(f"{f}: not attachment")
        if g("post_parent") != "0": errs.append(f"{f}: parent != 0")
        if pid in seen_ids: errs.append(f"dup id {pid}")
        seen_ids.add(pid)
        k = (title.casefold(), g("post_date"))
        if k in seen_td: errs.append(f"dup title+date {k}")
        seen_td.add(k)
        if not url.startswith(BASE): errs.append(f"bad url {url}"); continue
        path = up.unquote(url[len(BASE):])
        if path not in local: errs.append(f"no source file for {path}"); continue
        seen_paths.add(path); size += os.path.getsize(local[path])
        mime = g("post_mime_type")
        ext = os.path.splitext(path)[1].lower()
        if (ext == ".pdf") != (mime == "application/pdf") or (ext in (".jpg", ".jpeg") and mime != "image/jpeg") or (ext == ".png" and mime != "image/png"): errs.append(f"mime {mime} for {path}")
        if not title or title.lower().endswith((".pdf", ".jpg", ".png", ".docx")): errs.append(f"unclean title {title!r}")
    if len(items) > 60: errs.append(f"{f}: {len(items)} files > 60")
    if size > 150_000_000: errs.append(f"{f}: {size/1e6:.0f} MB > 150 MB")
    if (len(items), size) != (mcount[ci], msize[ci]): errs.append(f"manifest mismatch chunk {ci}")
    print(f"chunk {ci:>2}: {len(items):>2} files {size/1e6:>5.0f} MB  well-formed")
print(f"total attachments {len(seen_ids)}, distinct files {len(seen_paths)}, manifest rows {len(manifest)}")
if len(seen_paths) != 609 or len(manifest) != 609: errs.append("expected 609 files")
if errs: print("\n".join(errs[:20])); sys.exit(1)
print("OK")
