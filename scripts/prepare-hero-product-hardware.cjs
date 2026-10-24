// Rebuild public/assets/hero-product-hardware.{png,webp} from assets/source/mortice-lock-hero.jpg
// Cut out near-white background, feather alpha edge for soft blend on dark hero, ~900px tall.
// Depth comes from .hub-float CSS drop-shadow; this script softens the hard cutout edge.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const src = path.join(root, 'assets/source/mortice-lock-hero.jpg');
const outPng = path.join(root, 'public/assets/hero-product-hardware.png');
const outWebp = path.join(root, 'public/assets/hero-product-hardware.webp');
const CACHE_V = 3;

(async () => {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const dist = Math.hypot(255 - r, 255 - g, 255 - b);
    const a = Math.max(0, Math.min(255, Math.round(((dist - 8) / (40 - 8)) * 255)));
    data[i + 3] = a;
    if (a === 0) data[i] = data[i + 1] = data[i + 2] = 0;
  }

  const raw = { width: info.width, height: info.height, channels: 4 };
  const alphaBlurred = await sharp(data, { raw })
    .extractChannel(3)
    .blur(1.8)
    .raw()
    .toBuffer();
  const a = Buffer.from(alphaBlurred);
  for (let i = 0; i < a.length; i++) {
    // Slight shrink after blur: soft edge without chalky halo growth.
    a[i] = Math.max(0, Math.min(255, Math.round((a[i] - 12) * (255 / 243))));
  }
  const rgb = await sharp(data, { raw }).removeAlpha().raw().toBuffer();
  const joined = await sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } })
    .joinChannel(a, { raw: { width: info.width, height: info.height, channels: 1 } })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const th = 900;
  let img = sharp(joined.data, {
    raw: { width: joined.info.width, height: joined.info.height, channels: 4 },
  }).trim({ threshold: 4 });
  const meta = await img.metadata();
  const nw = Math.max(1, Math.round(meta.width * (th / meta.height)));
  const tw = Math.max(nw, 860);
  const left = Math.floor((tw - nw) / 2);
  img = img.resize(nw, th, { fit: 'fill' }).extend({
    top: 0,
    bottom: 0,
    left,
    right: tw - nw - left,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  await img.png().toFile(outPng);
  await sharp(outPng).webp({ quality: 90 }).toFile(outWebp);
  const m = await sharp(outPng).metadata();
  console.log('hero-product-hardware', m.width + 'x' + m.height, 'v=' + CACHE_V);

  const index = path.join(root, 'public/index.html');
  if (fs.existsSync(index)) {
    let h = fs.readFileSync(index, 'utf8');
    h = h.replace(
      /srcset="\.\/assets\/hero-product-hardware\.webp(?:\?v=\d+)?"><img src="\.\/assets\/hero-product-hardware\.png(?:\?v=\d+)?" alt="[^"]*" width="\d+" height="\d+"/,
      `srcset="./assets/hero-product-hardware.webp?v=${CACHE_V}"><img src="./assets/hero-product-hardware.png?v=${CACHE_V}" alt="Mortice lock set with keys" width="${m.width}" height="${m.height}"`
    );
    fs.writeFileSync(index, h);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
