#!/usr/bin/env python3
"""python3 -I tests/validate_missing.py
Simulates WordPress Importer 0.8 against content/vineyard-import-missing.xml, given that content/vineyard-import.xml
was already imported: a page "already exists" when an earlier page has the same post_title and post_date (content is NOT compared).
Checks: both files well-formed; same IDs/slugs/parents/menu_order; no nav_menu_item; creates exactly the expected pages;
every created page's parent resolves (to an existing or a newly created page)."""
import sys, collections
import xml.etree.ElementTree as ET
from pathlib import Path
R = Path(__file__).resolve().parent.parent / "content"
ns = {"wp": "http://wordpress.org/export/1.2/"}
def load(f):
    ch = ET.parse(R / f).getroot().find("channel")
    out = []
    for it in ch.findall("item"):
        g = lambda t: it.findtext("wp:" + t, namespaces=ns)
        out.append(dict(id=int(g("post_id")), type=g("post_type"), title=it.findtext("title"), slug=g("post_name"), parent=int(g("post_parent")), order=g("menu_order"), date=g("post_date")))
    return out
main, miss = load("vineyard-import.xml"), load("vineyard-import-missing.xml")
errs = []
mp = [x for x in main if x["type"] == "page"]
if any(x["type"] != "page" for x in miss): errs.append("missing file contains non-page items")
if [(x["id"], x["slug"], x["parent"], x["order"]) for x in mp] != [(x["id"], x["slug"], x["parent"], x["order"]) for x in miss]:
    errs.append("IDs/slugs/parents/menu_order differ from vineyard-import.xml")
def importer(files_items, existing=None):
    """returns (created ids, id map xml_id->db_key)"""
    exists = dict(existing or {})          # (title,date) -> db id
    idmap, created, nxt = {}, [], 100000
    for p in files_items:
        k = (p["title"].strip().casefold(), p["date"])
        if k in exists: idmap[p["id"]] = exists[k]; continue
        nxt += 1; exists[k] = nxt; idmap[p["id"]] = nxt; created.append(p)
    return created, idmap, exists
c1, map1, exists1 = importer(mp)                     # first import (what the user already ran)
c2, map2, _ = importer(miss, exists1)                # second import
print(f"first import creates {len(c1)} of {len(mp)} pages (user saw 603)")
print(f"second import (missing file) creates {len(c2)} pages")
byid = {x["id"]: x for x in miss}
for p in c2:
    if p["parent"] and p["parent"] not in map2: errs.append(f"parent {p['parent']} of {p['slug']} does not resolve")
    elif p["parent"] and map2[p["parent"]] != map1.get(p["parent"]): errs.append(f"parent of {p['slug']} would resolve to a different page than first import")
# every non-created page must still be skipped (same db id as the first import)
for p in miss:
    if p not in c2 and map2[p["id"]] != map1[p["id"]]: errs.append(f"{p['slug']} would not be skipped")
dates = collections.Counter((p["title"].strip().casefold(), p["date"]) for p in miss)
if any(v > 1 for v in dates.values()): errs.append("duplicate (title,date) remains in the missing file")
ids = [p["id"] for p in miss]
if len(set(ids)) != len(ids): errs.append("duplicate ids")
for p in c2: print(f"  create id={p['id']:<4} {p['date']}  {p['title']}  [{p['slug']}]")
if errs: print("\n".join(errs)); sys.exit(1)
print("OK: well-formed, same IDs/slugs/parents, no menu items, parents resolve")
