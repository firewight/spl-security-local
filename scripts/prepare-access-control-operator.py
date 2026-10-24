#!/usr/bin/env python3
"""Rebuild the first /access-control-systems/ editorial photo from
assets/source/spl-monitoring-operator-headset.jpg (SPL staff member with headset at monitors).
Centre 3:2 crop, 1920x1280 JPEG, points the first editorial <img> at it (cache-busted)."""
from pathlib import Path
import re
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/source/spl-monitoring-operator-headset.jpg'
NAME = 'spl-monitoring-operator-headset.jpg'
OUT = ROOT / 'public/assets/imported' / NAME
PAGE = ROOT / 'public/access-control-systems/index.html'
ALT = 'SPL Security staff member wearing a headset, smiling at his monitors in the SPL control room'
CACHE_V = 1


def main():
    im = ImageOps.exif_transpose(Image.open(SRC)).convert('RGB')
    w, h = im.size
    cw = min(w, h * 3 // 2); ch = cw * 2 // 3
    l = (w - cw) // 2; t = (h - ch) // 2
    crop = im.crop((l, t, l + cw, t + ch)).resize((1920, 1280), Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    crop.save(OUT, 'JPEG', quality=82, optimize=True, progressive=True)
    html = PAGE.read_text(encoding='utf-8')
    pat = re.compile(r'<figure class="editorial-image editorial-media"><img[^>]*?src="\.\./assets/imported/(?:spl-person-pressing-button-doorbell|spl-monitoring-operator-headset)\.jpg[^"]*"[^>]*></figure>')
    new = (f'<figure class="editorial-image editorial-media"><img loading="lazy" src="../assets/imported/{NAME}?v={CACHE_V}" '
           f'alt="{ALT}" width="1920" height="1280" decoding="async"></figure>')
    html2, n = pat.subn(new, html, count=1)
    if n != 1:
        raise SystemExit('access-control first editorial image not found')
    PAGE.write_text(html2, encoding='utf-8')
    print(f'Wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB); updated {PAGE.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
