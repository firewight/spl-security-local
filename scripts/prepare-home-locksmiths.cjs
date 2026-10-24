#!/usr/bin/env node
/**
 * Rebuild homepage Locksmiths *section* art (Explore Locksmiths service-feature)
 * from assets/source/locksmith-hands-mortice-hero.jpg.
 *
 * Landscape crop keeps hands, mortice lock, orange tool and SPL chest logo.
 * Outputs public/assets/home-locksmiths.webp (+ -800.webp) at ~1400 wide like
 * sibling section images. Leaves hero-product-locksmiths cutout alone.
 *
 * Usage: node scripts/prepare-home-locksmiths.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'assets/source/locksmith-hands-mortice-hero.jpg');
const OUT = path.join(ROOT, 'public/assets/home-locksmiths.webp');
const OUT800 = path.join(ROOT, 'public/assets/home-locksmiths-800.webp');
const INDEX = path.join(ROOT, 'public/index.html');
const META = path.join(ROOT, 'home-service-images.json');
const CACHE_V = '2';
const ALT = 'SPL locksmith working on a mortice lock at the workbench';
const WIDTH = 1400;
const HEIGHT = 848; // matches section_wide crop ratio after resize

async function main() {
  if (!fs.existsSync(SRC)) throw new Error('missing source: ' + SRC);
  const meta = await sharp(SRC).metadata();
  const w = meta.width;
  const h = meta.height;
  // Keep hands (left-centre), lock, orange tool, SPL logo (right chest).
  const left = Math.round(w * 0.08);
  const top = Math.round(h * 0.06);
  const width = Math.round(w * 0.88);
  const height = Math.round(h * 0.80);

  const pipeline = sharp(SRC)
    .extract({ left, top, width, height })
    .resize({ width: WIDTH, height: HEIGHT, fit: 'cover', position: 'centre' })
    .webp({ quality: 85 });

  await pipeline.clone().toFile(OUT);
  await sharp(SRC)
    .extract({ left, top, width, height })
    .resize({ width: 800, height: Math.round(HEIGHT * (800 / WIDTH)), fit: 'cover', position: 'centre' })
    .webp({ quality: 78 })
    .toFile(OUT800);

  let html = fs.readFileSync(INDEX, 'utf8');
  const artRe =
    /(<section class="[^"]*" id="locksmiths">[\s\S]*?<a class="service-art"[^>]*>)([\s\S]*?)(<\/a><\/section>)/;
  if (!artRe.test(html)) throw new Error('locksmiths service-art block not found in index.html');
  const img =
    `<img src="./assets/home-locksmiths.webp?v=${CACHE_V}" ` +
    `srcset="./assets/home-locksmiths-800.webp?v=${CACHE_V} 800w, ./assets/home-locksmiths.webp?v=${CACHE_V} ${WIDTH}w" ` +
    `sizes="(max-width: 760px) calc(100vw - 40px), min(960px, calc(100vw - 72px))" ` +
    `width="${WIDTH}" height="${HEIGHT}" alt="${ALT}" loading="lazy" decoding="async">`;
  html = html.replace(artRe, (_, a, _inner, b) => a + img + b);
  fs.writeFileSync(INDEX, html);

  const catalog = JSON.parse(fs.readFileSync(META, 'utf8'));
  catalog.locksmiths = {
    file: 'locksmith-hands-mortice-hero.jpg',
    alt: ALT,
    src: 'assets/home-locksmiths.webp',
    source: 'assets/source/locksmith-hands-mortice-hero.jpg',
    width: WIDTH,
    height: HEIGHT,
    cache: CACHE_V,
  };
  fs.writeFileSync(META, JSON.stringify(catalog, null, 2) + '\n');

  // Keep cro-extras VARIANTS dimensions in sync so later CRO passes don't shrink attrs.
  const croPath = path.join(ROOT, 'scripts/lib/cro-extras.cjs');
  let cro = fs.readFileSync(croPath, 'utf8');
  cro = cro.replace(
    /'home-locksmiths\.webp':\['home-locksmiths-800\.webp',\d+,\d+\]/,
    `'home-locksmiths.webp':['home-locksmiths-800.webp',${WIDTH},${HEIGHT}]`
  );
  fs.writeFileSync(croPath, cro);

  const outMeta = await sharp(OUT).metadata();
  console.log(
    JSON.stringify({
      src: path.relative(ROOT, SRC),
      out: path.relative(ROOT, OUT),
      out800: path.relative(ROOT, OUT800),
      crop: { left, top, width, height },
      size: { width: outMeta.width, height: outMeta.height },
      bytes: fs.statSync(OUT).size,
      cache: CACHE_V,
      alt: ALT,
    })
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
