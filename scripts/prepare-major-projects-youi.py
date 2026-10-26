#!/usr/bin/env python3
"""Rebuild the Youi tile image on /major-projects/ from
assets/source/youi-hq-hutchinson-builders.jpg (exterior of Youi HQ,
Sippy Downs, from Hutchinson Builders project page; same credit pattern
as Mondrian).

Source is 1920x1080 landscape. Tiles are 1:1. Crops a centred square
(building + youi signage), exports 800x800 JPEG + WebP. Tile markup
lives in scripts/lib/cro-extras.cjs (MP_TILES).
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/source/youi-hq-hutchinson-builders.jpg'
OUT = ROOT / 'public/assets/imported/spl-youi.jpg'
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
