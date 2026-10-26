#!/usr/bin/env python3
"""Rebuild the "The SPL SECURITY Team" photo on /our-team/ from
assets/source/spl-team-fleet-gold-coast-hero.png (SPL-supplied fleet/team hero).

Slot is 16:9 (editorial-media cover). Source is wider than 16:9 (1920x988);
centre-crop to 16:9 at full height so the SPL sign, central staff cluster, and
branded vans stay readable. No upscaling. Cache-busts the <img>. Does not touch
the homepage slider (hero-team.webp/png).
"""
from pathlib import Path
import re
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/source/spl-team-fleet-gold-coast-hero.png'
NAME = 'spl-team-fleet-gold-coast-hero.jpg'
OUT = ROOT / 'public/assets/imported' / NAME
PAGE = ROOT / 'public/our-team/index.html'
ALT = 'SPL Security team and branded van fleet posed with the SPL sign on grass against the Gold Coast skyline'
CACHE_V = 1


def main():
    im = ImageOps.exif_transpose(Image.open(SRC)).convert('RGB')
    w, h = im.size
    # 16:9 crop using full height (source is wider than 16:9)
    ch = h
    cw = min(w, ch * 16 // 9)
    left = (w - cw) // 2  # centred — keeps SPL sign + central team
    top = 0
    crop = im.crop((left, top, left + cw, top + ch))
    ow, oh = crop.size
    OUT.parent.mkdir(parents=True, exist_ok=True)
    crop.save(OUT, 'JPEG', quality=85, optimize=True, progressive=True)

    html = PAGE.read_text(encoding='utf-8')
    # Anchor near the Team heading so we only swap that section image
    i = html.index('The SPL SECURITY')
    pat = re.compile(
        r'<img[^>]*?src="\.\./assets/imported/(?:spl-smiling-spl-team-member-wearing-headset|spl-team-fleet-gold-coast-hero)\.jpg[^"]*"[^>]*>'
    )
    m = pat.search(html, i)
    if not m:
        raise SystemExit('our-team SPL SECURITY Team image not found')
    new = (
        f'<img loading="lazy" src="../assets/imported/{NAME}?v={CACHE_V}" '
        f'alt="{ALT}" width="{ow}" height="{oh}" decoding="async">'
    )
    PAGE.write_text(html[:m.start()] + new + html[m.end():], encoding='utf-8')
    print(f'Wrote {OUT.relative_to(ROOT)} {ow}x{oh} ({OUT.stat().st_size // 1024} KB); updated {PAGE.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
