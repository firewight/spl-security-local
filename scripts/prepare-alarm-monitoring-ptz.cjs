#!/usr/bin/env node
/**
 * Alarm Monitoring editorial photo: SPL technician adjusting a PTZ dome camera.
 * Source: assets/source/spl-tech-ptz-dome-adjust.jpg (6000x4000).
 * Near-full-frame crop to 1000x668 (same as the old wall-mounted-bullet image),
 * keeping the SPL staff member and PTZ dome. Updates alarm-monitoring HTML src/alt + cache-bust.
 * Usage: node scripts/prepare-alarm-monitoring-ptz.cjs
 */
const fs = require('fs'), path = require('path'), sharp = require('sharp');
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'assets/source/spl-tech-ptz-dome-adjust.jpg');
const NAME = 'spl-technician-adjusting-ptz-dome-camera.jpg';
const OUT = path.join(ROOT, 'public/assets/imported', NAME);
const HTML = path.join(ROOT, 'public/alarm-monitoring/index.html');
const ALT = 'SPL technician adjusting a PTZ dome security camera';
const V = '1';
(async () => {
  const m = await sharp(SRC).rotate().metadata();
  const ratio = 1000 / 668, h = m.height, w = Math.min(m.width, Math.round(h * ratio));
  await sharp(SRC).rotate().extract({ left: 0, top: 0, width: w, height: h })
    .resize(1000, 668, { fit: 'cover' }).jpeg({ quality: 82, mozjpeg: true }).toFile(OUT);
  let s = fs.readFileSync(HTML, 'utf8');
  const re = /<img([^>]*?)src="\.\.\/assets\/imported\/(?:spl-technician-adjusting-wall-mounted-bullet-security|spl-technician-adjusting-ptz-dome-camera)\.jpg(?:\?v=\w+)?"([^>]*?)alt="[^"]*"/;
  if (!re.test(s)) throw new Error('alarm-monitoring img not found');
  s = s.replace(re, `<img$1src="../assets/imported/${NAME}?v=${V}"$2alt="${ALT}"`);
  fs.writeFileSync(HTML, s);
  console.log('wrote', path.relative(ROOT, OUT));
})().catch(e => { console.error(e.message); process.exit(1); });
