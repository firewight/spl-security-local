#!/usr/bin/env python3
"""Rebuild hero-product-locksmiths png/webp from assets/source/locksmith-hands-mortice-hero.jpg.

Keeps hands, mortice lock, orange tool and SPL chest logo. rembg u2net cutout plus a
spatial torso/logo restore (dark polo is otherwise keyed out). Soft alpha feather.
~900px tall hub-float style.
"""
from pathlib import Path
import re
import numpy as np
from PIL import Image, ImageFilter
from rembg import remove, new_session
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/source/locksmith-hands-mortice-hero.jpg'
OUT_PNG = ROOT / 'public/assets/hero-product-locksmiths.png'
OUT_WEBP = ROOT / 'public/assets/hero-product-locksmiths.webp'
INDEX = ROOT / 'public/index.html'
CACHE_V = 3


def main():
    im = Image.open(SRC)
    w, h = im.size
    # Crop keeps hands, lock, and SPL chest logo (logo ~0.80x, 0.28y in source).
    crop = im.crop((int(w * 0.16), int(h * 0.04), int(w * 0.92), int(h * 0.84)))
    crop.thumbnail((2000, 2000), Image.Resampling.LANCZOS)
    cw, ch = crop.size

    cut = remove(crop, session=new_session('u2net'))
    c = np.array(crop.convert('RGBA'))
    m = np.array(cut)

    ys, xs = np.mgrid[0:ch, 0:cw]
    # Ellipse over chest + logo (right side) and forearm toward the hands.
    torso = ((xs - cw * 0.78) / (cw * 0.28)) ** 2 + ((ys - ch * 0.32) / (ch * 0.38)) ** 2 <= 1.0
    arm = ((xs - cw * 0.62) / (cw * 0.22)) ** 2 + ((ys - ch * 0.48) / (ch * 0.28)) ** 2 <= 1.0
    spatial_f = ndimage.gaussian_filter((torso | arm).astype(np.float32), 8)

    alpha = m[:, :, 3].astype(np.float32)
    restored_a = np.maximum(alpha, spatial_f * 255.0)
    out = m.astype(np.float32)
    restore_w = np.clip((restored_a - alpha) / 255.0, 0, 1)[..., None]
    out[:, :, :3] = out[:, :, :3] * (1 - restore_w) + c[:, :, :3].astype(np.float32) * restore_w
    out[:, :, 3] = restored_a

    # Drop disconnected workbench fringe; keep largest component + anything on torso core.
    binmask = out[:, :, 3] > 40
    label, n = ndimage.label(binmask)
    if n:
        sizes = ndimage.sum(binmask, label, range(1, n + 1))
        keep = {1 + int(np.argmax(sizes))}
        core = spatial_f > 0.5
        for i in range(1, n + 1):
            if i not in keep and np.any(core & (label == i)):
                keep.add(i)
        keepmask = np.isin(label, list(keep))
        out[:, :, 3] = np.where(keepmask, out[:, :, 3], 0)

    # Gentle alpha feather so the float blends on the dark hero.
    a = ndimage.gaussian_filter(out[:, :, 3], 1.5)
    a = np.clip((a - 12) * (255 / (255 - 12)), 0, 255)
    out[:, :, 3] = a
    out[out[:, :, 3] < 1, :3] = 0

    result = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
    bbox = result.getbbox()
    pad = 16
    bbox = (
        max(0, bbox[0] - pad),
        max(0, bbox[1] - pad),
        min(result.width, bbox[2] + pad),
        min(result.height, bbox[3] + pad),
    )
    result = result.crop(bbox)
    th = 900
    nw = max(1, int(round(result.width * (th / result.height))))
    result = result.resize((nw, th), Image.Resampling.LANCZOS)
    tw = max(nw, 780)
    canvas = Image.new('RGBA', (tw, th), (0, 0, 0, 0))
    canvas.paste(result, ((tw - nw) // 2, 0), result)
    canvas.save(OUT_PNG, optimize=True)
    canvas.save(OUT_WEBP, 'WEBP', quality=90, method=6)

    if INDEX.exists():
        htm = INDEX.read_text()
        htm2, n = re.subn(
            r'srcset="\./assets/hero-product-locksmiths\.webp(?:\?v=\d+)?"><img src="\./assets/hero-product-locksmiths\.png(?:\?v=\d+)?" alt="[^"]*" width="\d+" height="\d+"',
            f'srcset="./assets/hero-product-locksmiths.webp?v={CACHE_V}"><img src="./assets/hero-product-locksmiths.png?v={CACHE_V}" alt="SPL locksmith working on a mortice lock" width="{tw}" height="{th}"',
            htm,
            count=1,
        )
        if n:
            INDEX.write_text(htm2)
    print(f'hero-product-locksmiths {tw}x{th} v={CACHE_V}')


if __name__ == '__main__':
    main()
