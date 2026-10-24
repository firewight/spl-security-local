#!/usr/bin/env node
/**
 * Alarm Monitoring FIRST editorial photo: SPL technician servicing an intercom panel.
 * Source: assets/source/spl-tech-intercom-panel.jpg (6000x4000, 3:2).
 * Full-frame cover resize to 1000x667 (same slot as old lever-handle image), keeping
 * the SPL staff member (hi-vis, SPL logo) and intercom panel. Updates src/alt + cache-bust.
 * Usage: node scripts/prepare-alarm-monitoring-intercom.cjs
 */
const fs = require('fs'), path = require('path'), sharp = require('sharp');
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'assets/source/spl-tech-intercom-panel.jpg');
const NAME = 'spl-technician-servicing-intercom-panel.jpg';
const OUT = path.join(ROOT, 'public/assets/imported', NAME);
const HTML = path.join(ROOT, 'public/alarm-monitoring/index.html');
const ALT = 'SPL technician in hi-vis servicing an apartment intercom panel';
const V = '1';
(async () => {
  await sharp(SRC).rotate().resize(1000, 667, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, mozjpeg: true }).toFile(OUT);
  let s = fs.readFileSync(HTML, 'utf8');
  const re = /<img([^>]*?)src="\.\.\/assets\/imported\/(?:spl-technician-fitting-lever-handle-lock-door|spl-technician-servicing-intercom-panel)\.jpg(?:\?v=\w+)?"([^>]*?)alt="[^"]*"/;
  if (!re.test(s)) throw new Error('alarm-monitoring first img not found');
  s = s.replace(re, `<img$1src="../assets/imported/${NAME}?v=${V}"$2alt="${ALT}"`);
  fs.writeFileSync(HTML, s);
  console.log('wrote', path.relative(ROOT, OUT));
})().catch(e => { console.error(e.message); process.exit(1); });
