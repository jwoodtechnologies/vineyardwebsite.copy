#!/usr/bin/env python3
"""Build the two installable zips (WordPress: Plugins/Themes -> Add New -> Upload):
     content/vineyard-city-theme.zip     theme folder  vineyard-city/          (display only; WITHOUT the 1.6 GB files folder)
     content/vineyard-city-content.zip   plugin folder vineyard-city-content/  (content types, settings, blocks, seed data)
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
build(ROOT / "theme" / "vineyard-city", ROOT / "content" / "vineyard-city-theme.zip")
build(ROOT / "plugin" / "vineyard-city-content", ROOT / "content" / "vineyard-city-content.zip")
