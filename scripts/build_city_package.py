#!/usr/bin/env python3
"""Build the two installable zips (WordPress: Plugins/Themes -> Add New -> Upload):
     content/vineyard-city-theme-<version>.zip     theme folder  vineyard-city/          (display only; WITHOUT the 1.6 GB files folder)
     content/vineyard-city-content-<version>.zip   plugin folder vineyard-city-content/  (content types, settings, blocks, seed data)
   python3 -I scripts/build_city_package.py        (run scripts/build_city_data.py first)
"""
import zipfile
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
def build(src: Path, out: Path):
    n = 0
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for p in sorted(src.rglob("*")):
            if p.is_file() and not p.name.endswith((".orig", ".pyc")) and "__pycache__" not in p.parts and p.name != ".DS_Store":
                z.write(p, Path(src.name) / p.relative_to(src)); n += 1
    print(f"{out.relative_to(ROOT)}: {n} files, {out.stat().st_size/1e6:.2f} MB")
import re
def version(f):
    return re.search(r"^\s*\*?\s*Version:\s*([0-9.]+)", f.read_text(encoding="utf-8"), re.M).group(1)
tv = version(ROOT / "theme" / "vineyard-city" / "style.css")
pv = version(ROOT / "plugin" / "vineyard-city-content" / "vineyard-city-content.php")
for old in list((ROOT / "content").glob("vineyard-city-theme*.zip")) + list((ROOT / "content").glob("vineyard-city-content*.zip")):
    old.unlink()   # only the current version is kept, so nobody uploads an old one by mistake
build(ROOT / "theme" / "vineyard-city", ROOT / "content" / f"vineyard-city-theme-{tv}.zip")
build(ROOT / "plugin" / "vineyard-city-content", ROOT / "content" / f"vineyard-city-content-{pv}.zip")
