# SPL HostPapa domain-divert launch checklist — 29 Oct 2026 (Asia/Bangkok)

**Status (29 Oct 2026 08:51 +07):** **LIVE / INDEXABLE on HostPapa.** DNS A for `spl.com.au` + `www` → `66.102.137.241`. Let's Encrypt OK (CN www, SAN apex+www, notAfter 27 Jan 2027). Indexable launch package published to `/home/splco501/public_html`. HTTPS force + www→apex + HSTS enabled. IndexNow submitted (HTTP 202, 96 URLs). **Do not** re-publish staging/noindex over this unless rolling back.

**Production:** https://spl.com.au/ (apex canonical)  
**cPanel:** user `splco501` · docroot `/home/splco501/public_html`  
**MX/mail:** left alone (Outlook). **splsecurity.com.au** A still OntheNet (`203.13.68.170`) — park on HostPapa still pending; OntheNet 301 already works — do not break mail.

---

## Completed on cutover (automated / on-site) — 29 Oct 2026

| Step | Result |
| --- | --- |
| Confirm HTTPS / Let's Encrypt | OK — CN `www.spl.com.au`, SAN `spl.com.au` + `www.spl.com.au`, notAfter **2027-01-27**. AutoSSL not re-run (cert healthy). |
| Rebuild launch package | Rebuilt with `--index` (picked up newer `portal-quote.js`) → `/workspace/deploy/build-hostpapa-launch`. Report: mode `launch (indexable)`, **96** pages indexable, IndexNow key present, 0 demo leftovers. |
| Publish indexable package | cPanel upload/extract to `public_html` (same pattern as staging). **Preserved** server `api/config.php`. Pruned 0 stale. |
| Cutover `.htaccess` | Uncommented HTTPS force + www→apex (`https://spl.com.au`) + HSTS `max-age=31536000` in `hosting/hostpapa/htaccess.template` and rebuilt. On-disk remote `.htaccess` confirms rules + no X-Robots-Tag noindex. |
| robots.txt | On-server: `Allow: /`, `Disallow: /api/`, `Sitemap: https://spl.com.au/sitemap.xml`. |
| Meta robots | Homepage / contact / portal / locksmith-services: `index, follow`. |
| X-Robots-Tag | Removed (no noindex header on launch build). Clean probes show no `X-Robots-Tag`. |
| IndexNow key URL | `https://spl.com.au/f935081ba03dcd8a02b2221c875e3a58.txt` → **200**, body = key. |
| Forms / API | `api/config.php` blocked (**403** when not bot-challenged). `api/contact` → **405** Allow POST. `api/portal-quote` → **405**. Portal from/to remain **service@spl.com.au**. |
| HTTPS redirects | `http://spl.com.au/` → **301** `https://spl.com.au/`. `http://www.spl.com.au/` → **301** `https://spl.com.au/`. `https://www.spl.com.au/contact/` → **301** `https://spl.com.au/contact/` (when request reaches Apache; HostPapa bot challenge sometimes returns a 200 interstitial to datacentre crawlers). |
| Path 301 sample | `/locksmiths/24-7-mobile` → `/auto-locksmith/`; `/commercial-locksmith/` → `/locksmith-services/`. |
| IndexNow submit | `node scripts/indexnow-submit.cjs --build /workspace/deploy/build-hostpapa-launch --yes --confirm-indexed` → **HTTP 202**, 96 URLs. |
| Park splsecurity on HostPapa | **Skipped** — A still `203.13.68.170` (OntheNet). OntheNet 301 already works. Do not park until A points here; leave MX alone. |

**Note:** HostPapa edge bot challenge (“One moment, please…”) intermittently intercepts automated curls from this environment (`cf-edge-cache` interstitial). On-server File Manager reads and successful non-challenged probes are the source of truth above.

**Server `api/config.php` (preserved, not overwritten):** `portal_from_email` / `portal_to_email` = `service@spl.com.au`. Contact `to_email` is still `support@spl.com.au` (comment marked testing) — Nathan may want that switched to `info@` / `service@` when ready; not changed this pass.

---

## What is already scripted (do not reinvent)

| Piece | Staging (default) | Launch (`--index`) — **NOW LIVE** |
| --- | --- | --- |
| HTML `<meta name="robots">` | `noindex, follow` on normal pages | `index, follow` (stubs / 404 / thank-you stay noindex) |
| `robots.txt` | `Disallow: /` | `Allow: /`, `Disallow: /api/`, `Sitemap: https://spl.com.au/sitemap.xml` |
| `.htaccess` `X-Robots-Tag` | `noindex, follow` | header removed |
| HTTPS / www→apex / HSTS | commented | **enabled** |
| Canonicals / schema URLs | rewritten to `https://spl.com.au/` | same |
| IndexNow | key file only | **submitted** 29 Oct 2026 (HTTP 202) |

Source of truth for the flip: `scripts/build-hostpapa.cjs` (`--index` = LAUNCH switch).  
IndexNow submit: `scripts/indexnow-submit.cjs`.

---

## Still manual for Nathan (no GSC/Bing connector available)

### Google Search Console — Change of Address
1. Open https://search.google.com/search-console  
2. Verify property **https://spl.com.au/** (URL-prefix). Also verify www if it appears separately.  
3. Ensure old property **https://splsecurity.com.au/** (or http) is still verified.  
4. On the **old** property: Settings (gear) → **Change of Address** → choose new site **https://spl.com.au/** → follow validation (301s already live from OntheNet + HostPapa path rules).  
5. Submit / refresh sitemap: **https://spl.com.au/sitemap.xml** (Sitemaps → Add).  
6. Watch Coverage / Page indexing while 301s settle.

### Bing Webmaster Tools
1. Open https://www.bing.com/webmasters  
2. Add / verify **https://spl.com.au/** (IndexNow key already on site; Bing may auto-detect).  
3. Submit sitemap **https://spl.com.au/sitemap.xml**.  
4. If an old splsecurity property exists, use Bing’s site-move guidance alongside the 301s.  
5. IndexNow bulk submit already posted to api.indexnow.org (202) — optional to also use Bing URL submission UI.

### Keep 301s ≥ 180 days
- Path 301s and host 301s (`splsecurity.com.au` → `spl.com.au`, Ballina → `/ballina/` when parked) must stay for **at least 180 days** after divert (longer is fine).  
- Do **not** delete redirect rules or take down redirecting old hosts early.

### GBP / Localsearch / reviews / citations — still manual
- Google Business Profile categories, review programme, citations / NAP, technician photos — Nathan / Jeff / Localsearch. Not done site-side.

### Analytics / UTM — still skipped
- Do **not** invent GA4 / GTM / UTM without Nathan’s approved setup.

### Optional later
- Park **splsecurity.com.au** on HostPapa only after its A record points to `66.102.137.241` (currently OntheNet). Leave MX on Outlook.  
- Optionally switch contact `to_email` from `support@` to production inbox.  
- Ballina domain park when ready.

---

## Rollback if needed

Rebuild **without** `--index` and redeploy staging package so `robots.txt` is `Disallow: /` and `X-Robots-Tag: noindex` returns. Do **not** re-run IndexNow after rolling back. Re-comment HTTPS/HSTS in `htaccess.template` only if SSL breaks.

## GSC sample redirect fix (29 Oct 2026, Asia/Bangkok)

- **Problem:** GSC Change of Address warned about sample redirects. Live HostPapa was soft-serving meta-refresh stub `index.html` files (e.g. `/door-hardware/`, `/locksmiths/`) as HTTP 200 via nginx before Apache `.htaccess` 301s could run.
- **HostPapa done:** Deleted 19 stub files/dirs from `public_html`; synced `.htaccess` from launch build; `scripts/build-hostpapa.cjs` now strips redirect stubs from every package.
- **Desired finals for Google samples:** homepage (GMB UTM apex); `/contact/`; `/architectural-door-hardware/`; `/auto-locksmith/`.
- **OntheNet still owns old-domain DNS (A 203.13.68.170):** currently path-preserving 301 → `https://spl.com.au{path}`. Nathan should request one-hop finals — see `ONTHENET-REDIRECTS-FOR-NATHAN-2026-10-29.md`. Do not change NS; do not cancel GSC move.
