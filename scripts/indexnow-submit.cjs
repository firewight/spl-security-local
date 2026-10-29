#!/usr/bin/env node
// IndexNow bulk submit for SPL after an indexable HostPapa launch.
// Default is DRY RUN (lists URLs, posts nothing). Never ping while staging/noindex.
//
//   node scripts/indexnow-submit.cjs
//   node scripts/indexnow-submit.cjs --build /workspace/deploy/build-hostpapa-launch
//   node scripts/indexnow-submit.cjs --yes --confirm-indexed   # live POST after DNS + --index publish
//
// Requires: public/{key}.txt (and seo.config.json indexNowKey), sitemap in the launch build,
// and that https://spl.com.au/{key}.txt is publicly reachable (search engines verify ownership).
const fs = require('fs');
const path = require('path');
const https = require('https');
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const YES = args.includes('--yes');
const CONFIRM = args.includes('--confirm-indexed');
const buildIdx = args.indexOf('--build');
const buildRoot = buildIdx >= 0
  ? path.resolve(args[buildIdx + 1])
  : '/workspace/deploy/build-hostpapa-launch';
const web = path.join(buildRoot, 'public_html');
const config = require('../seo.config.json');
const HOST = 'spl.com.au';
const SITE = `https://${HOST}/`;
const KEY = config.indexNowKey;
const KEY_FILE = config.indexNowKeyFile || `${KEY}.txt`;

function die(msg) {
  console.error(msg);
  process.exit(1);
}

if (!KEY || !/^[A-Za-z0-9-]{8,128}$/.test(KEY)) die('seo.config.json indexNowKey missing or invalid');
const keyPathPublic = path.join(root, 'public', KEY_FILE);
const keyPathBuild = path.join(web, KEY_FILE);
if (!fs.existsSync(keyPathPublic)) die(`Missing key file: ${keyPathPublic}`);
if (fs.readFileSync(keyPathPublic, 'utf8').trim() !== KEY) die('public key file contents do not match seo.config.json');
if (!fs.existsSync(web)) die(`No launch build at ${web} (run: node scripts/build-hostpapa.cjs --index --out ${buildRoot})`);
if (!fs.existsSync(keyPathBuild)) die(`Launch build missing ${KEY_FILE}; rebuild with --index so public/ is copied`);
const robots = fs.readFileSync(path.join(web, 'robots.txt'), 'utf8');
if (/Disallow:\s*\/\s*$/m.test(robots) && !/Allow:\s*\//.test(robots)) {
  die('Launch build robots.txt still Disallow: / — rebuild with --index before IndexNow');
}
const reportPath = path.join(buildRoot, 'build-report.json');
if (fs.existsSync(reportPath)) {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  if (report.mode !== 'launch (indexable)') {
    die(`build-report mode is "${report.mode}", need "launch (indexable)"`);
  }
}

const sitemap = fs.readFileSync(path.join(web, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
if (!urls.length) die('No <loc> entries in launch sitemap.xml');
const badHost = urls.filter((u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '') !== HOST;
  } catch {
    return true;
  }
});
if (badHost.length) die(`Sitemap still has non-${HOST} URLs (sample: ${badHost[0]}). Rebuild with build-hostpapa.cjs --index.`);

const keyLocation = `${SITE}${KEY_FILE}`;
const payload = {
  host: HOST,
  key: KEY,
  keyLocation,
  urlList: urls,
};

console.log(JSON.stringify({
  mode: YES && CONFIRM ? 'LIVE submit' : 'DRY RUN (no POST)',
  host: HOST,
  keyFile: KEY_FILE,
  keyLocation,
  urlCount: urls.length,
  sample: urls.slice(0, 5),
  endpoint: 'https://api.indexnow.org/indexnow',
  gate: 'Requires both --yes and --confirm-indexed after DNS points to HostPapa and the --index package is live',
}, null, 2));

if (!(YES && CONFIRM)) {
  console.log('\nStopped before POST. When Nathan confirms DNS + indexed publish is live:');
  console.log(`  node scripts/indexnow-submit.cjs --build ${buildRoot} --yes --confirm-indexed`);
  process.exit(0);
}

const body = JSON.stringify(payload);
const req = https.request(
  {
    hostname: 'api.indexnow.org',
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(body),
    },
  },
  (res) => {
    let data = '';
    res.on('data', (c) => (data += c));
    res.on('end', () => {
      console.log('HTTP', res.statusCode, data.slice(0, 500));
      // 200 = accepted; 202 = accepted pending key verify
      process.exit(res.statusCode === 200 || res.statusCode === 202 ? 0 : 1);
    });
  },
);
req.on('error', (e) => die(String(e)));
req.write(body);
req.end();
