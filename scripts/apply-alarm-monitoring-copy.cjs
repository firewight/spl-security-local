/**
 * Alarm Monitoring (/alarm-monitoring/) durable copy:
 * 1) Remove Master Locksmith services paragraph (owner request Oct 2026).
 * 2) Ensure a short AS/NZS standards mention under Electronic Security Maintenance.
 *    Numbers verified from ASIAL Electronic Security Standards page and Standards Australia store
 *    (AS/NZS 2201.1:2007; AS/NZS 62676.4:2026 current, supersedes 2020; AS/NZS IEC 60839.11.2:2019).
 *    Wording uses "in line with" — does not claim SPL certification to these standards.
 * Idempotent. Usage: node scripts/apply-alarm-monitoring-copy.cjs
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HTML = path.join(ROOT, 'public/alarm-monitoring/index.html');

const LOCKSMITH_RE =
  /<p>As a Master Locksmith, we offer a full range of residential, commercial and automotive locksmith services,[\s\S]*?enhancing overall security\.<\/p>/;

const STANDARDS_MARKER = 'data-as-nzs-standards=""';
const STANDARDS_P =
  `<p ${STANDARDS_MARKER}>Our electronic security maintenance is carried out in line with the relevant Australian AS/NZS standards, including AS/NZS 2201.1:2007 for intruder alarm systems on clients' premises (design, installation, commissioning and maintenance), AS/NZS 62676.4:2026 for video surveillance (CCTV) application guidelines, and AS/NZS IEC 60839.11.2:2019 for electronic access control application guidelines.</p>`;

function run() {
  let s = fs.readFileSync(HTML, 'utf8');
  const before = s;
  let removed = 0;
  let inserted = 0;

  if (LOCKSMITH_RE.test(s)) {
    s = s.replace(LOCKSMITH_RE, '');
    removed = 1;
  }

  if (!s.includes(STANDARDS_MARKER)) {
    // Insert after the first paragraph in the Electronic Security Maintenance block
    // (the block that follows h2#MaintenanceandServicing).
    const anchor =
      /(<h2 id="MaintenanceandServicing"[^>]*>[\s\S]*?<\/h2>\s*<\/div>\s*<figure[\s\S]*?<\/figure>\s*<div class="editorial-block"><p>[\s\S]*?<\/p>)/;
    if (!anchor.test(s)) {
      throw new Error('Electronic Security Maintenance intro paragraph not found');
    }
    s = s.replace(anchor, `$1${STANDARDS_P}`);
    inserted = 1;
  }

  if (s !== before) fs.writeFileSync(HTML, s);
  const result = { removed, inserted, changed: s !== before };
  if (require.main === module) console.log(JSON.stringify(result));
  return result;
}

module.exports = run;
if (require.main === module) run();
