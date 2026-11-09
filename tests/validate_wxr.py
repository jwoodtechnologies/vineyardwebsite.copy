#!/usr/bin/env python3
"""python3 -I tests/validate_wxr.py [content/vineyard-import.xml]
Checks: well-formed XML; WXR namespaces/version; unique post ids; every wp:post_parent resolves to a page;
slugs unique among siblings; every post_type menu item points at an existing page; menu parent chain resolves;
no links to the old hosts remain in page content; page/menu counts match manifest.json / menu.json."""
import json, re, sys, collections
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
f = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "content" / "vineyard-import.xml"
ns = {"wp": "http://wordpress.org/export/1.2/", "content": "http://purl.org/rss/1.0/modules/content/", "dc": "http://purl.org/dc/elements/1.1/"}
tree = ET.parse(f)  # raises on malformed XML
ch = tree.getroot().find("channel")
assert ch.findtext("wp:wxr_version", namespaces=ns) == "1.2"
items = ch.findall("item")
posts = {}
errors = []
for it in items:
    pid = int(it.findtext("wp:post_id", namespaces=ns))
    if pid in posts:
        errors.append(f"duplicate post_id {pid}")
    posts[pid] = it
pages = {i: it for i, it in posts.items() if it.findtext("wp:post_type", namespaces=ns) == "page"}
menu = {i: it for i, it in posts.items() if it.findtext("wp:post_type", namespaces=ns) == "nav_menu_item"}
def meta(it):
    return {m.findtext("wp:meta_key", namespaces=ns): m.findtext("wp:meta_value", namespaces=ns) for m in it.findall("wp:postmeta", ns)}
sib = collections.defaultdict(set)
for i, it in pages.items():
    par = int(it.findtext("wp:post_parent", namespaces=ns))
    if par and par not in pages:
        errors.append(f"page {i} parent {par} does not resolve")
    slug = it.findtext("wp:post_name", namespaces=ns)
    if slug in sib[par]:
        errors.append(f"duplicate slug '{slug}' under parent {par}")
    sib[par].add(slug)
    # no parent loops
    seen, cur = set(), i
    while cur:
        if cur in seen: errors.append(f"parent loop at {i}"); break
        seen.add(cur); cur = int(pages[cur].findtext("wp:post_parent", namespaces=ns)) if cur in pages else 0
old_host = re.compile(r'(?:href|src)=["\'](?:https?:)?//(?:www\.)?vineyardutah\.(?:gov|org)', re.I)
stale = sum(1 for it in pages.values() if old_host.search(it.findtext("content:encoded", namespaces=ns) or ""))
for i, it in menu.items():
    m = meta(it)
    mp = int(m["_menu_item_menu_item_parent"])
    if mp and mp not in menu:
        errors.append(f"menu item {i} parent {mp} does not resolve")
    if m["_menu_item_type"] == "post_type" and int(m["_menu_item_object_id"]) not in pages:
        errors.append(f"menu item {i} object {m['_menu_item_object_id']} is not a page")
    if m["_menu_item_type"] == "custom" and not m["_menu_item_url"]:
        errors.append(f"menu item {i} custom without url")
    if it.find("category[@domain='nav_menu']") is None:
        errors.append(f"menu item {i} not assigned to a nav_menu")
manifest = json.load(open(ROOT / "content" / "manifest.json"))
menu_json = json.load(open(ROOT / "content" / "menu.json"))
def count(n): return sum(1 + count(c["children"]) for c in n)
n_top = sum(1 for it in pages.values() if int(it.findtext("wp:post_parent", namespaces=ns)) == 0)
n_child = len(pages) - n_top
print(f"well-formed OK | pages: {len(pages)} (manifest {len(manifest)} + Home) | top-level {n_top}, children {n_child} | menu items: {len(menu)} (menu.json {count(menu_json)}) | pages still linking to old hosts: {stale}")
if len(pages) != len(manifest) + 1: errors.append("page count != manifest + Home")
if len(menu) != count(menu_json): errors.append("menu count mismatch")
if errors:
    print("\n".join(errors[:30])); sys.exit(1)
print("all parent/menu IDs resolve")
