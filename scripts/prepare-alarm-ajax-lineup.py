#!/usr/bin/env python3
"""Rebuild the "AJAX Security Systems" graphic on /alarm-system/ from
assets/source/ajax-rule-your-space-lineup-900.webp (official Ajax "Rule your
space" lineup, 900x900, used under SPL's Ajax dealer authority).

The old 1:1 image sat in a 16:9 object-fit:cover slot, cutting off the AJAX
wordmark. This trims only the empty black top/bottom to 4:3 (keeps the full
wordmark, devices and caption icons), and switches the figure to
editorial-media-natural so nothing is cropped at any viewport.
"""
from pathlib import Path
import re
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/source/ajax-rule-your-space-lineup-900.webp'
NAME = 'spl-ajax-rule-your-space-lineup.webp'
OUT = ROOT / 'public/assets/imported' / NAME
PAGE = ROOT / 'public/alarm-system/index.html'
ALT = 'Ajax "Rule your space" lineup: Ajax wordmark with hub, keypad, camera and sensors for intrusion, video, fire and automation'
CACHE_V = 1
TOP = 70  # wordmark starts ~y95; captions end ~y740


def main():
    im = Image.open(SRC).convert('RGB')
    w, h = im.size
    ch = w * 3 // 4
    crop = im.crop((0, TOP, w, TOP + ch))
    crop.save(OUT, 'WEBP', quality=86, method=6)
    html = PAGE.read_text(encoding='utf-8')
    pat = re.compile(r'<figure class="editorial-image editorial-media[^"]*"><img[^>]*?src="\.\./assets/imported/(?:spl-ajax-security-devices-including-hub-keypad|spl-ajax-rule-your-space-lineup)\.webp[^"]*"[^>]*></figure>')
    m = pat.search(html)
    if not m:
        raise SystemExit('ajax image not found')
    new = (f'<figure class="editorial-image editorial-media editorial-media-natural"><img loading="lazy" '
           f'src="../assets/imported/{NAME}?v={CACHE_V}" alt="{ALT.replace(chr(34), "&quot;")}" '
           f'width="{crop.width}" height="{crop.height}" decoding="async"></figure>')
    PAGE.write_text(html[:m.start()] + new + html[m.end():], encoding='utf-8')
    print('wrote', OUT.relative_to(ROOT), crop.size)


if __name__ == '__main__':
    main()
