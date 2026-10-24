#!/usr/bin/env python3
"""Rebuild the first /retail-security/ editorial photo from assets/source/spl-trade-counter-shopfront.jpg.

3:2 crop that trims part of the concrete overhang at the top (keeps sign, staff,
counter and vans reflected in the glass), trims a little off each side to hold 3:2,
applies a selective shadow lift so the staff inside are visible,
exports 1920x1280 JPEG and points the page's first editorial <img> at it (cache-busted).
"""
from pathlib import Path
import re
from PIL import Image, ImageOps, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/source/spl-trade-counter-shopfront.jpg'
NAME = 'spl-trade-counter-shopfront.jpg'
OUT = ROOT / 'public/assets/imported' / NAME
PAGE = ROOT / 'public/retail-security/index.html'
ALT = 'SPL Trade Counter shopfront with three SPL staff behind the counter and SPL vans reflected in the glass'
CACHE_V = 2
SHADOW_LIFT = 0.85   # strength of shadow/midtone lift (0 = off)
HIGHLIGHT_KNEE = 0.62  # luminance above which the lift fades to zero (protects glass/white counter)
TOP_TRIM = 0.075  # fraction of height removed from the top (concrete overhang)


def lift_shadows(im):
    """Selective shadow/midtone lift: gain from a blurred luminance mask (local tone map),
    applied equally to R,G,B to keep natural colour; fades out above HIGHLIGHT_KNEE."""
    a = np.asarray(im).astype(np.float32) / 255.0
    lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    blur = np.asarray(Image.fromarray((lum * 255).astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(radius=max(im.size) / 120))).astype(np.float32) / 255.0
    # target local luminance via gamma curve; weight fades smoothly towards highlights
    target = np.power(np.clip(blur, 1e-4, 1), 0.55)
    w = np.clip(1 - blur / HIGHLIGHT_KNEE, 0, 1) ** 1.5
    gain = 1 + SHADOW_LIFT * w * (target / np.maximum(blur, 1e-3) - 1)
    gain = np.clip(gain, 1, 2.6)
    out = a * gain[..., None]
    # soft shoulder so nothing clips harshly
    out = np.where(out > 0.9, 0.9 + (1 - np.exp(-(out - 0.9) * 10)) * 0.1, out)
    return Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8))


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
    crop = lift_shadows(crop)
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
