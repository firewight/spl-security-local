// Insert top-level "Customer Portal" link immediately before "Contact Us" in every page nav.
// Keeps relative href depths correct for root / depth-1 / depth-2 pages.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'public');

function walk(d, o = []) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) {
      if (f.name !== 'assets') walk(p, o);
    } else if (f.name.endsWith('.html')) o.push(p);
  }
  return o;
}

function portalHref(file) {
  const rel = path.relative(root, path.dirname(file));
  const depth = rel === '' ? 0 : rel.split(path.sep).length;
  if (rel === 'customer-portal') return 'index.html';
  if (depth === 0) return 'customer-portal/index.html';
  return '../'.repeat(depth) + 'customer-portal/index.html';
}

function contactHrefPattern() {
  // Match the Contact Us anchor that closes the main nav (last item before </nav>).
  return /(<a href="([^"]*)">Contact Us<\/a>)(<\/nav>)/;
}

module.exports = function () {
  let n = 0;
  for (const f of walk(root)) {
    let s = fs.readFileSync(f, 'utf8');
    if (!s.includes('id="main-nav"')) continue;
    if (/Customer Portal<\/a>\s*<a href="[^"]*">Contact Us<\/a><\/nav>/.test(s)) {
      // Already present — refresh href if needed
      const href = portalHref(f);
      const next = s.replace(
        /<a href="[^"]*">Customer Portal<\/a>(\s*<a href="[^"]*">Contact Us<\/a><\/nav>)/,
        `<a href="${href}">Customer Portal</a>$1`
      );
      if (next !== s) { fs.writeFileSync(f, next); n++; }
      continue;
    }
    const m = s.match(contactHrefPattern());
    if (!m) continue;
    const href = portalHref(f);
    const next = s.replace(contactHrefPattern(), `<a href="${href}">Customer Portal</a>$1$3`);
    if (next !== s) { fs.writeFileSync(f, next); n++; }
  }
  return n;
};

if (require.main === module) console.log('add-customer-portal-nav', module.exports());
