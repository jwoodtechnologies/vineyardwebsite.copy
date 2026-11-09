#!/usr/bin/env python3
"""python3 -I tests/validate_city.py — sanity checks on the editable-site package (data, zips, forms, clean HTML)."""
import json, re, sys, zipfile
from pathlib import Path
R = Path(__file__).resolve().parent.parent
errs = []
seed = json.load(open(R / "plugin/vineyard-city-content/data/seed.json")); pages = json.load(open(R / "plugin/vineyard-city-content/data/pages.json"))
man = json.load(open(R / "content/manifest.json"))
if len(pages) != len(man): errs.append("pages.json does not cover every page")
bad_chrome = [k for k, p in pages.items() if k != "calendar.php" and re.search(r'id="post"|class="clearfix"|<style|<script|RZ\.|rzBtn|docs-toggle|outer-cat|formwizard', p["html"])]
if bad_chrome: errs.append(f"Revize chrome left in {len(bad_chrome)} pages: {bad_chrome[:3]}")
old = [k for k, p in pages.items() if re.search(r'(href|src)="https?://(www\.)?vineyardutah\.(gov|org)', p["html"])]
print(f"pages with links still on the old host (files/pages not mirrored): {len(old)}")
for k, p in pages.items():
    if p["html"].count("[contact-form") != p["html"].count("[/contact-form]"): errs.append(f"unbalanced form in {k}")
forms = [k for k, p in pages.items() if p["form"]]
print("forms:", len(forms))
nd = sum(p["html"].count("<details") for p in pages.values()); print("document groups (<details>):", nd)
if len(seed["quicklinks"]) != 11 or len(seed["tiles"]) != 3: errs.append("quick links / tiles count")
menus = {m["name"] for m in seed["related_menus"]}
for k, p in pages.items():
    if p.get("related_menu") and p["related_menu"] not in menus: errs.append(f"missing related menu {p['related_menu']}")
for z in ("content/vineyard-city-theme.zip", "content/vineyard-city-content.zip"):
    zf = zipfile.ZipFile(R / z); names = zf.namelist(); root = names[0].split("/")[0]
    if any(not n.startswith(root + "/") for n in names): errs.append(f"{z}: files outside {root}/")
    if any("/files/" in n and n.count("/") > 2 and root == "vineyard-city" and n.startswith("vineyard-city/files/") for n in names): errs.append("theme zip contains the files folder")
    print(f"{z}: {len(names)} files, root '{root}/', {sum(i.file_size for i in zf.infolist())/1e6:.1f} MB unpacked")
    if zf.testzip(): errs.append(f"{z} corrupt")
    if root == "vineyard-city":
        s = zf.read("vineyard-city/style.css").decode(); assert "Theme Name: Vineyard City" in s
    else:
        s = zf.read("vineyard-city-content/vineyard-city-content.php").decode(); assert "Plugin Name: Vineyard City Content" in s
if errs: print("\n".join(errs[:20])); sys.exit(1)
print("OK")
