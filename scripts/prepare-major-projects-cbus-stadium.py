#!/usr/bin/env python3
"""Rebuild the CBUS Stadium tile image on /major-projects/ from
assets/source/cbus-stadium-western-grandstand.jpg (Western Grandstand of
Robina Stadium / Cbus Super Stadium by Jason L, Wikimedia Commons,
CC BY-SA 4.0). Crop keeps the visible "cbus super" grandstand signage.

Source is 4128x2322 landscape. Tiles are 1:1. Crops a left-biased square
from the top of the frame (roof + cbus super signs + seating), exports
800x800 JPEG + WebP.
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/source/cbus-stadium-western-grandstand.jpg'
OUT = ROOT / 'public/assets/imported/spl-cbus-stadium.jpg'
SIZE = 800


def main():
    im = ImageOps.exif_transpose(Image.open(SRC)).convert('RGB')
    w, h = im.size
    s = min(w, h)
    # Bias left so both "cbus super" signs stay in frame
    left = min(w - s, max(0, int(w * 0.35) - s // 2))
    top = 0
    crop = im.crop((left, top, left + s, top + s)).resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    crop.save(OUT, 'JPEG', quality=80, optimize=True, progressive=True)
    crop.save(OUT.with_suffix('.webp'), 'WEBP', quality=78, method=6)
    print('wrote', OUT.relative_to(ROOT), OUT.stat().st_size, OUT.with_suffix('.webp').stat().st_size)


if __name__ == '__main__':
    main()
