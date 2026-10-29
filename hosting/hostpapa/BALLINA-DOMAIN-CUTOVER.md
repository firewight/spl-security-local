# ballinalocksmiths.com.au → spl.com.au cutover (prepared 29 Oct 2026)

**Goal:** every old Ballina Locksmiths URL 301s (one hop) to the best page on https://spl.com.au, default https://spl.com.au/ballina/.

## Current state (checked 29 Oct 2026 via Google public DNS)
| Record | Value |
|---|---|
| Registrant | SPL Security Solutions (SPL-owned) — registrar Synergy Wholesale via reseller **Localsearch** |
| NS | AWS Route 53: ns-125.awsdns-15.com, ns-586.awsdns-09.net, ns-1191.awsdns-20.org, ns-1857.awsdns-40.co.uk (zone is in Localsearch's AWS account, not ours) |
| Apex A | 141.193.213.10, 141.193.213.11 (WP Engine) |
| www | CNAME wp.wpenginepowered.com |
| MX | `0 mail.ballinalocksmiths.com.au` → A **69.90.66.140** (check with Nathan whether any ballinalocksmiths.com.au mailbox is still used before DNS moves; if yes, recreate MX + mail A exactly) |
| TXT | `google-site-verification=5s7Fx88mYk6wX1LOz9VkweyscDW_WO54CNTUH9gAHlo` — **keep it**: it's the existing Google Search Console verification for the domain. Recreating it in the new DNS keeps the GSC property verified, which the Change of Address needs. |
| CAA / DMARC | none |

## Already done on HostPapa (inert until DNS points here)
- `public_html/.htaccess` has host-scoped rules for `^(www\.)?ballinalocksmiths\.com\.au$`: 44 path 301s, then a catch-all → `https://spl.com.au/ballina/`. They run **before** the SPL path redirects and the HTTPS/canonical rules, so each old URL is one hop to its final page (http or https, www or apex).
- Source: `backlink-migration.csv` (ballinalocksmiths rows) → `scripts/build-hostpapa.cjs` → `hosting/hostpapa/htaccess.template` `{{BALLINA}}`.
- Full URL inventory + mapping: `hosting/hostpapa/ballina-redirect-map.csv` (crawled 29 Oct 2026: sitemap_index → page + project_category sitemaps, internal links, WP REST; 52 URLs incl. 6 project posts, WP default/archive URLs, and 118 upload images. Images and anything else use the catch-all.) Old images are archived off-repo in `/workspace/deploy/ballina-crawl/images/`.
- Tested on the server with `curl -k --resolve ballinalocksmiths.com.au:443:66.102.137.241` (see SEO launch checklist).

## Steps
1. **Release/transfer** (Nathan with Localsearch): get the domain released to SPL's own registrar account (or keep at Synergy Wholesale under SPL's login) **and** get either (a) control of the DNS, or (b) Localsearch to change the records below. Ask Localsearch for an export of the Route 53 zone first so nothing (MX, TXT) is lost.
2. **DNS** — choose one:
   - **Keep registrar DNS (simplest):** at the registrar/DNS host set apex **A → 66.102.137.241** and **www A → 66.102.137.241** (replace the CNAME). Recreate the Google TXT above, and MX/mail A only if Ballina mail is still used. TTL 300 during the change.
   - **HostPapa DNS:** set NS to HostPapa's nameservers after the park in step 3 creates the zone; then re-add the TXT (and MX if needed) in cPanel Zone Editor.
3. **Park/alias on HostPapa:** cPanel → Domains → Create a New Domain → `ballinalocksmiths.com.au`, document root **public_html** (shares spl.com.au's docroot, so the `.htaccess` rules apply), untick "share/redirect" options as needed.
   - ⚠ **Same blocker as splsecurity.com.au:** cPanel refuses to add a domain whose DNS doesn't point at this server ("remote domains not allowed"). So do step 2 (A records → 66.102.137.241) **first**, wait for it to resolve, then park. If it still refuses, ask HostPapa support to add it as an alias of spl.com.au.
4. **AutoSSL:** cPanel → SSL/TLS Status → Run AutoSSL; confirm the cert covers `ballinalocksmiths.com.au` and `www.` (otherwise https://old URLs show a certificate warning before the 301).
5. **Verify** (from any machine):
   `curl -sI https://ballinalocksmiths.com.au/cctv/` → `301` `location: https://spl.com.au/cctv-system/`;
   `curl -sI http://www.ballinalocksmiths.com.au/anything` → `301` `https://spl.com.au/ballina/`.
6. **Google Search Console:** add a **Domain property** for `ballinalocksmiths.com.au` (DNS TXT; the existing token above may already verify it — otherwise add the new TXT GSC gives you). Then Settings → **Change of Address** → `https://spl.com.au/`. Keep the property; watch Pages → "Page with redirect".
7. **Bing Webmaster Tools:** add/import the site, then Configure My Site → **Site Moves** → ballinalocksmiths.com.au → spl.com.au.
8. **Listings/backlinks:** update the Google Business Profile, Localsearch/True Local, Yellow Pages and any directory still linking to ballinalocksmiths.com.au → `https://spl.com.au/ballina/`.
9. **Keep the redirects and the domain registered for at least 12 months** (renew the domain; don't let it lapse — the 301s pass its history to spl.com.au).

## Don't
- Don't point the Ballina domain at the Bundall Google Maps short link; Ballina = Unit 2/269 River Street, Ballina NSW 2478.
- Don't remove the Google site-verification TXT.
