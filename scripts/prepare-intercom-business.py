#!/usr/bin/env python3
"""Rebuild the "Intercom Systems for Businesses" photo on /intercom/ from
assets/source/aiphone-gt-glass-entrance-brick.jpg.

Source is 4:3; slot is 3:2. Crops to 3:2 at full width (trims more from the top
ceiling than the paving), exports 1920x1280 JPEG and repoints that section's <img>
(cache-busted).
"""
from pathlib import Path
import re
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/source/aiphone-gt-glass-entrance-brick.jpg'
NAME = 'spl-aiphone-gt-glass-entrance-brick.jpg'
OUT = ROOT / 'public/assets/imported' / NAME
PAGE = ROOT / 'public/intercom/index.html'
ALT = 'Aiphone GT video intercom entry panel on a brick wall beside a glass commercial entrance door'
CACHE_V = 1
TOP_SHARE = 0.55  # share of the removed height taken from the top


def main():
    im = ImageOps.exif_transpose(Image.open(SRC)).convert('RGB')
    w, h = im.size
    cw = w; ch = min(h, w * 2 // 3); cw = ch * 3 // 2
    left = (w - cw) // 2
    top = int((h - ch) * TOP_SHARE)
    crop = im.crop((left, top, left + cw, top + ch)).resize((1920, 1280), Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    crop.save(OUT, 'JPEG', quality=82, optimize=True, progressive=True)

    html = PAGE.read_text(encoding='utf-8')
    i = html.index('id="section-intercom-systems-for-businesses"')
    pat = re.compile(r'<img[^>]*?src="\.\./assets/imported/(?:spl-person-pressing-doorbell-brick-wall|spl-aiphone-gt-glass-entrance-brick)\.jpg[^"]*"[^>]*>')
    m = pat.search(html, i)
    if not m:
        raise SystemExit('intercom business image not found')
    new = (f'<img loading="lazy" src="../assets/imported/{NAME}?v={CACHE_V}" '
           f'alt="{ALT}" width="1920" height="1280" decoding="async">')
    PAGE.write_text(html[:m.start()] + new + html[m.end():], encoding='utf-8')
    print(f'Wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB); updated {PAGE.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
