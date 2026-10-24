#!/usr/bin/env python3
"""Rebuild hero-product-locksmiths png/webp from assets/source/locksmith-hands-mortice-hero.jpg.

Keeps hands, mortice lock, orange tool and SPL chest logo. rembg u2net cutout with
navy-shirt restore so the dark polo/logo is not keyed out. 900px tall hub-float style.
"""
from pathlib import Path
import re
import numpy as np
from PIL import Image
from rembg import remove, new_session

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/source/locksmith-hands-mortice-hero.jpg'
OUT_PNG = ROOT / 'public/assets/hero-product-locksmiths.png'
OUT_WEBP = ROOT / 'public/assets/hero-product-locksmiths.webp'
INDEX = ROOT / 'public/index.html'


def main():
    im = Image.open(SRC)
    w, h = im.size
    crop = im.crop((int(w * 0.10), int(h * 0.00), int(w * 0.95), int(h * 0.98)))
    crop.thumbnail((2000, 2000), Image.Resampling.LANCZOS)
    cut = remove(crop, session=new_session('u2net'))
    c = np.array(crop.convert('RGBA'))
    m = np.array(cut)
    r, g, b = c[:, :, 0].astype(np.int16), c[:, :, 1].astype(np.int16), c[:, :, 2].astype(np.int16)
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    shirt = (lum > 18) & (lum < 90) & (b + 5 >= r) & (b + 5 >= g) & ((b - r) > 3)
    logo = (lum > 90) & (lum < 230) & (
        shirt | np.roll(shirt, 5, 0) | np.roll(shirt, -5, 0) | np.roll(shirt, 5, 1) | np.roll(shirt, -5, 1)
    )
    restore = (shirt | logo) & (m[:, :, 3] < 180)
    m[restore, 0:3] = c[restore, 0:3]
    m[restore, 3] = 255
    out = Image.fromarray(m)
    bbox = out.getbbox()
    pad = 20
    bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(out.width, bbox[2] + pad), min(out.height, bbox[3] + pad))
    out = out.crop(bbox)
    th = 900
    nw = max(1, int(round(out.width * (th / out.height))))
    out = out.resize((nw, th), Image.Resampling.LANCZOS)
    tw = max(nw, 780)
    canvas = Image.new('RGBA', (tw, th), (0, 0, 0, 0))
    canvas.paste(out, ((tw - nw) // 2, 0), out)
    canvas.save(OUT_PNG, optimize=True)
    canvas.save(OUT_WEBP, 'WEBP', quality=90, method=6)
    if INDEX.exists():
        htm = INDEX.read_text()
        htm2, n = re.subn(
            r'srcset="\./assets/hero-product-locksmiths\.webp(?:\?v=\d+)?"><img src="\./assets/hero-product-locksmiths\.png(?:\?v=\d+)?" alt="[^"]*" width="\d+" height="\d+"',
            f'srcset="./assets/hero-product-locksmiths.webp?v=2"><img src="./assets/hero-product-locksmiths.png?v=2" alt="SPL locksmith working on a mortice lock" width="{tw}" height="{th}"',
            htm,
            count=1,
        )
        if n:
            INDEX.write_text(htm2)
    print(f'hero-product-locksmiths {tw}x{th}')


if __name__ == '__main__':
    main()
