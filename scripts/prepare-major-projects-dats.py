#!/usr/bin/env python3
"""Rebuild the DATS Warehouse tile image on /major-projects/ from
assets/source/dats-warehouse-interior.jpg (photo from DATS Our Company
page, "Our Team Image": warehouse interior with racking, mezzanine and forklift).

Source is 4724x2067 landscape. Tiles are 1:1. Crops a slightly right-biased square
(racking, mezzanine stairs and forklift),
exports 800x800 JPEG + WebP (same as Jewel/Mondrian/Aramex). Tile markup
lives in scripts/lib/cro-extras.cjs (MP_TILES).
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/source/dats-warehouse-interior.jpg'
OUT = ROOT / 'public/assets/imported/spl-dats-warehouse.jpg'
SIZE = 800


def main():
    im = ImageOps.exif_transpose(Image.open(SRC)).convert('RGB')
    w, h = im.size
    s = min(w, h)
    # Slight right bias: keep forklift + mezzanine stairs in frame
    left = min(w - s, max(0, int(w * 0.62) - s // 2))
    top = (h - s) // 2
    crop = im.crop((left, top, left + s, top + s)).resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    crop.save(OUT, 'JPEG', quality=80, optimize=True, progressive=True)
    crop.save(OUT.with_suffix('.webp'), 'WEBP', quality=78, method=6)
    print('wrote', OUT.relative_to(ROOT), OUT.stat().st_size, OUT.with_suffix('.webp').stat().st_size)


if __name__ == '__main__':
    main()
