#!/usr/bin/env python3
"""Rebuild the Oceans Meriton tile image on /major-projects/ from
assets/source/oceans-meriton-olszewski.jpg (Ocean / Meriton tower,
Surfers Paradise, by Chris Olszewski, Wikimedia Commons, CC BY-SA 4.0).

Source is 1931x3124 portrait. Tiles are 1:1. Crops a full-width square
biased toward the upper tower (crown + Meriton branding), exports
800x800 JPEG + WebP. Tile markup lives in scripts/lib/cro-extras.cjs
(MP_TILES).
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/source/oceans-meriton-olszewski.jpg'
OUT = ROOT / 'public/assets/imported/spl-oceans-meriton.jpg'
SIZE = 800
TOP_SHARE = 0.35  # share of removed height taken from the top


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
