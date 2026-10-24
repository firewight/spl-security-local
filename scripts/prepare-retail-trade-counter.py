#!/usr/bin/env python3
"""Rebuild the first /retail-security/ editorial photo from assets/source/spl-trade-counter-shopfront.jpg.

3:2 crop that trims part of the concrete overhang at the top (keeps sign, staff,
counter and vans reflected in the glass), trims a little off each side to hold 3:2,
exports 1920x1280 JPEG and points the page's first editorial <img> at it (cache-busted).
"""
from pathlib import Path
import re
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/source/spl-trade-counter-shopfront.jpg'
NAME = 'spl-trade-counter-shopfront.jpg'
OUT = ROOT / 'public/assets/imported' / NAME
PAGE = ROOT / 'public/retail-security/index.html'
ALT = 'SPL Trade Counter shopfront with three SPL staff behind the counter and SPL vans reflected in the glass'
CACHE_V = 1
TOP_TRIM = 0.075  # fraction of height removed from the top (concrete overhang)


def main():
    im = ImageOps.exif_transpose(Image.open(SRC)).convert('RGB')
    w, h = im.size
    top = int(h * TOP_TRIM)
    ch = h - top
    cw = min(w, ch * 3 // 2)
    ch = cw * 2 // 3
    left = (w - cw) // 2
    crop = im.crop((left, top, left + cw, top + ch)).resize((1920, 1280), Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    crop.save(OUT, 'JPEG', quality=82, optimize=True, progressive=True)

    html = PAGE.read_text(encoding='utf-8')
    pat = re.compile(r'<figure class="editorial-image editorial-media"><img[^>]*?src="\.\./assets/imported/(?:spl-hand-opening-safe-has-electronic-keypad|spl-trade-counter-shopfront)\.jpg[^"]*"[^>]*></figure>')
    new = (f'<figure class="editorial-image editorial-media"><img loading="lazy" src="../assets/imported/{NAME}?v={CACHE_V}" '
           f'alt="{ALT}" width="1920" height="1280" decoding="async"></figure>')
    html2, n = pat.subn(new, html, count=1)
    if n != 1:
        raise SystemExit('retail-security first editorial image not found')
    PAGE.write_text(html2, encoding='utf-8')
    print(f'Wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB); updated {PAGE.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
