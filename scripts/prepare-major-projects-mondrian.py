#!/usr/bin/env python3
"""Rebuild the Mondrian tile image on /major-projects/ from
assets/source/mondrian-hutchinson-builders.jpg (photo: Hutchinson Builders, used with permission).

Source is 3:4 portrait; tiles are 1:1. Crops a full-width square starting just above
the tower tops, exports 800x800 JPEG + WebP (same as the Jewel tile).
Tile markup lives in scripts/lib/cro-extras.cjs (MP_TILES).
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/source/mondrian-hutchinson-builders.jpg'
OUT = ROOT / 'public/assets/imported/spl-mondrian-gold-coast.jpg'
SIZE = 800
TOP_SHARE = 0.55  # share of removed height taken from the top (keeps sky above towers small)


def main():
    im = ImageOps.exif_transpose(Image.open(SRC)).convert('RGB')
    w, h = im.size
    s = min(w, h)
    left = (w - s) // 2
    top = int((h - s) * TOP_SHARE)
    crop = im.crop((left, top, left + s, top + s)).resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    crop.save(OUT, 'JPEG', quality=80, optimize=True, progressive=True)
    crop.save(OUT.with_suffix('.webp'), 'WEBP', quality=78, method=6)
    print('wrote', OUT.relative_to(ROOT), OUT.stat().st_size, OUT.with_suffix('.webp').stat().st_size)


if __name__ == '__main__':
    main()
