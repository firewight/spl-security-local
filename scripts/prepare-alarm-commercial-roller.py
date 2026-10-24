#!/usr/bin/env python3
"""Rebuild the "Commercial Alarm Systems" photo on /alarm-system/ from
assets/source/commercial-multi-bay-roller-doors-bollards.jpg.

Source is 4:3 (1440x1080); slot is 3:2. Crops to 3:2 at full width (trims mostly
sky, keeps the roller doors and yellow bollards), exports 1440x960 JPEG (no
upscaling) and repoints that section's <img> (cache-busted).
"""
from pathlib import Path
import re
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/source/commercial-multi-bay-roller-doors-bollards.jpg'
NAME = 'spl-commercial-multi-bay-roller-doors-bollards.jpg'
OUT = ROOT / 'public/assets/imported' / NAME
PAGE = ROOT / 'public/alarm-system/index.html'
ALT = 'Commercial building with a row of multi-bay loading dock roller doors protected by yellow and black bollards'
CACHE_V = 1
TOP_SHARE = 0.7


def main():
    im = ImageOps.exif_transpose(Image.open(SRC)).convert('RGB')
    w, h = im.size
    ch = min(h, w * 2 // 3); cw = ch * 3 // 2
    left = (w - cw) // 2
    top = int((h - ch) * TOP_SHARE)
    crop = im.crop((left, top, left + cw, top + ch))
    ow, oh = (1920, 1280) if cw >= 1920 else (cw, ch)
    crop = crop.resize((ow, oh), Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    crop.save(OUT, 'JPEG', quality=82, optimize=True, progressive=True)

    html = PAGE.read_text(encoding='utf-8')
    i = html.index('id="section-commercial-alarm-systems"')
    pat = re.compile(r'<img[^>]*?src="\.\./assets/imported/(?:spl-wireless-door-contact-sensor-fitted-glass|spl-commercial-multi-bay-roller-doors-bollards)\.jpg[^"]*"[^>]*>')
    m = pat.search(html, i)
    if not m:
        raise SystemExit('commercial alarm image not found')
    new = (f'<img loading="lazy" src="../assets/imported/{NAME}?v={CACHE_V}" '
           f'alt="{ALT}" width="{ow}" height="{oh}" decoding="async">')
    PAGE.write_text(html[:m.start()] + new + html[m.end():], encoding='utf-8')
    print(f'Wrote {OUT.relative_to(ROOT)} {ow}x{oh} ({OUT.stat().st_size // 1024} KB); updated {PAGE.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
