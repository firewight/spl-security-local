#!/usr/bin/env python3
"""Rebuild the DATS Warehouse tile image on /major-projects/ from
assets/source/dats-warehouse-distribution-drive.jpg (photo from DATS
Our Company page; exterior of facility with DATS signage).

Source is 2435x1624 landscape. Tiles are 1:1. Crops a right-biased square (keeps DATS pylon),
exports 800x800 JPEG + WebP (same as Jewel/Mondrian/Aramex). Tile markup
lives in scripts/lib/cro-extras.cjs (MP_TILES).
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/source/dats-warehouse-distribution-drive.jpg'
OUT = ROOT / 'public/assets/imported/spl-dats-warehouse.jpg'
SIZE = 800


def main():
    im = ImageOps.exif_transpose(Image.open(SRC)).convert('RGB')
    w, h = im.size
    s = min(w, h)
    # Bias right: keep the DATS / Distribution Drive pylon in frame
    left = w - s
    top = (h - s) // 2
    crop = im.crop((left, top, left + s, top + s)).resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    crop.save(OUT, 'JPEG', quality=80, optimize=True, progressive=True)
    crop.save(OUT.with_suffix('.webp'), 'WEBP', quality=78, method=6)
    print('wrote', OUT.relative_to(ROOT), OUT.stat().st_size, OUT.with_suffix('.webp').stat().st_size)


if __name__ == '__main__':
    main()
