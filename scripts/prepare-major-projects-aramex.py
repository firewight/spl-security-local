#!/usr/bin/env python3
"""Rebuild the Aramex Warehouse tile image on /major-projects/ from
assets/source/aramex-brisbane-warehouse.jpg (photo from Aramex Australia
Brisbane warehousing page; used with permission implied by SPL for this project).

Source is 720x478 landscape (highest res published on aramex.com.au). Tiles are
1:1. Crops a centred square from full height, upscales to 800x800 JPEG + WebP
(same as Jewel/Mondrian tiles). Tile markup lives in scripts/lib/cro-extras.cjs
(MP_TILES).
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/source/aramex-brisbane-warehouse.jpg'
OUT = ROOT / 'public/assets/imported/spl-aramex-warehouse.jpg'
SIZE = 800


def main():
    im = ImageOps.exif_transpose(Image.open(SRC)).convert('RGB')
    w, h = im.size
    s = min(w, h)
    left = (w - s) // 2
    top = (h - s) // 2
    crop = im.crop((left, top, left + s, top + s)).resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    crop.save(OUT, 'JPEG', quality=80, optimize=True, progressive=True)
    crop.save(OUT.with_suffix('.webp'), 'WEBP', quality=78, method=6)
    print('wrote', OUT.relative_to(ROOT), OUT.stat().st_size, OUT.with_suffix('.webp').stat().st_size)


if __name__ == '__main__':
    main()
