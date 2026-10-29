# OntheNet / Localsearch redirect list for Nathan

**Date:** 29 Oct 2026 (Asia/Bangkok)
**Why:** Google Search Console Change of Address (splsecurity.com.au → spl.com.au) warned about sample-page redirects. Old-domain traffic still hits OntheNet (`203.13.68.170`), not HostPapa, until the domain is parked on HostPapa. Do **not** change nameservers without Nathan.

## Current OntheNet behaviour (as of check)
Apex and www `splsecurity.com.au` already **301 path-preserve** to `https://spl.com.au{same-path}` (query string kept). That is useful, but Google prefers each important old URL to land on its **final** matching new page in as few hops as possible.

## HostPapa status (done this session)
- Path→path 301 rules already in live `public_html/.htaccess` (from `seo.config.json` + `backlink-migration.csv`).
- Removed 19 meta-refresh **stub** `index.html` files that HostPapa nginx was soft-serving as HTTP 200 before Apache could 301 (broke GSC samples for `/door-hardware`, `/locksmiths`, etc.).
- `scripts/build-hostpapa.cjs` now strips those stubs from every HostPapa package so they cannot return.
- When `splsecurity.com.au` is later parked/aliased on HostPapa, the existing host rule + path rules will apply without OntheNet.

## Google sample URLs — current vs desired

| Old URL (Google sample) | Current landing (today) | Desired final landing |
|---|---|---|
| `https://splsecurity.com.au/?utm_source=google&utm_medium=organic&utm_campaign=gmb` | https://spl.com.au/?utm_source=google&utm_medium=organic&utm_campaign=gmb (homepage 200) | `https://spl.com.au/ (UTM may be preserved)` |
| `https://www.splsecurity.com.au/contact` | https://spl.com.au/contact (200 contact page) | `https://spl.com.au/contact/` |
| `https://www.splsecurity.com.au/door-hardware` | https://spl.com.au/door-hardware then HostPapa 301 → /architectural-door-hardware/ (when Apache sees it) | `https://spl.com.au/architectural-door-hardware/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-surfers-paradise` | https://spl.com.au/locksmiths/24-7-mobile-surfers-paradise then HostPapa 301 → /auto-locksmith/ | `https://spl.com.au/auto-locksmith/` |

## Please ask OntheNet / Localsearch to set these **301** rules on the old host
Prefer **one hop** from old host → final `https://spl.com.au/...` (not a catch-all to the homepage). Keep www and non-www covered.

| From (old path on splsecurity.com.au / www) | To (final on spl.com.au) |
|---|---|
| `https://www.splsecurity.com.au/` (and non-www) | `https://spl.com.au/` |
| `https://www.splsecurity.com.au/contact` (and non-www) | `https://spl.com.au/contact/` |
| `https://www.splsecurity.com.au/door-hardware` (and non-www) | `https://spl.com.au/architectural-door-hardware/` |
| `https://www.splsecurity.com.au/architectural-door-hardware` (and non-www) | `https://spl.com.au/architectural-door-hardware/` |
| `https://www.splsecurity.com.au/auto-locksmith` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/alarm-system` (and non-www) | `https://spl.com.au/alarm-system/` |
| `https://www.splsecurity.com.au/cctv-system` (and non-www) | `https://spl.com.au/cctv-system/` |
| `https://www.splsecurity.com.au/security-systems` (and non-www) | `https://spl.com.au/security-systems/` |
| `https://www.splsecurity.com.au/locksmith-services` (and non-www) | `https://spl.com.au/locksmith-services/` |
| `https://www.splsecurity.com.au/access-control` (and non-www) | `https://spl.com.au/access-control-systems/` |
| `https://www.splsecurity.com.au/alarm-systems0197b34d` (and non-www) | `https://spl.com.au/alarm-system/` |
| `https://www.splsecurity.com.au/articles` (and non-www) | `https://spl.com.au/blog/` |
| `https://www.splsecurity.com.au/circle-on-cavill` (and non-www) | `https://spl.com.au/major-projects/` |
| `https://www.splsecurity.com.au/commercial-locksmith` (and non-www) | `https://spl.com.au/locksmith-services/` |
| `https://www.splsecurity.com.au/commercial-locksmiths` (and non-www) | `https://spl.com.au/locksmith-services/` |
| `https://www.splsecurity.com.au/how-to-protect-your-home-from-intruders` (and non-www) | `https://spl.com.au/how-to-protect-your-home-from-intruders-effectively/` |
| `https://www.splsecurity.com.au/locations/locksmith-ashmore` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-broadbeach` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-bundall` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-burleigh` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-carrara` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-coolangatta` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-coomera` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-currumbin` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-elanora` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-helensvale` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-hope-island` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-kingscliff` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-main-beach` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-mermaid` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-molendinar` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-nerang` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-pacific-pines` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-palm-beach` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-pimpama` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-robina` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-runaway-bay` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-southport` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-surfers-paradise` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-yatala` (and non-www) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locksmith-tweed-heads` (and non-www) | `https://spl.com.au/locksmith-services/` |
| `https://www.splsecurity.com.au/locksmiths` (and non-www) | `https://spl.com.au/locksmith-services/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-arundel` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-ashmore` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-biggera-waters` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-broadbeach-waters` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-bundall` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-burleigh-heads` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-coolangatta` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-currumbin-waters` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-helensvale` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-highland-park` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-hope-island` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-kingscliff` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-main-beach` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-mermaid-beach` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-molendinar` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-oxenford` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-pacific-pines` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-pimpama` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-robina` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-runaway-bay` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-southport` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-surfers-paradise` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-tweed-heads` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-upper-coomera` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-varsity-lakes` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-worongary` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-yatala` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24/7-mobile-locksmith-elanora` (and non-www) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/brisbane` (and non-www) | `https://spl.com.au/locksmith-services/` |
| `https://www.splsecurity.com.au/locksmiths/paradise-point` (and non-www) | `https://spl.com.au/locksmith-services/` |
| `https://www.splsecurity.com.au/residential-locksmith` (and non-www) | `https://spl.com.au/locksmith-services/` |
| `https://www.splsecurity.com.au/safes/bundall` (and non-www) | `https://spl.com.au/safe/` |
| `https://www.splsecurity.com.au/safes/hope-island` (and non-www) | `https://spl.com.au/safe/` |
| `https://www.splsecurity.com.au/safes/surfers-paradise` (and non-www) | `https://spl.com.au/safe/` |
| `https://www.splsecurity.com.au/safes/tweed-heads` (and non-www) | `https://spl.com.au/safe/` |
| `https://www.splsecurity.com.au/security-cameras-bundall` (and non-www) | `https://spl.com.au/cctv-system/` |
| `https://www.splsecurity.com.au/security-cameras-gold-coast-airport` (and non-www) | `https://spl.com.au/cctv-system/` |
| `https://www.splsecurity.com.au/security-cameras-hope-island` (and non-www) | `https://spl.com.au/cctv-system/` |
| `https://www.splsecurity.com.au/security-cameras-robina` (and non-www) | `https://spl.com.au/cctv-system/` |
| `https://www.splsecurity.com.au/security-cameras-southport` (and non-www) | `https://spl.com.au/cctv-system/` |
| `https://www.splsecurity.com.au/security-cameras-surfers-paradise` (and non-www) | `https://spl.com.au/cctv-system/` |
| `https://www.splsecurity.com.au/security-systems/brisbane` (and non-www) | `https://spl.com.au/security-systems/` |
| `https://www.splsecurity.com.au/security-systems/cctv-systems/tweed-heads` (and non-www) | `https://spl.com.au/cctv-system/` |
| `https://www.splsecurity.com.au/security-systems/intercoms/gold-coast` (and non-www) | `https://spl.com.au/intercom/` |
| `https://www.splsecurity.com.au/security-systems/intercoms/tweed-heads` (and non-www) | `https://spl.com.au/intercom/` |
| `https://www.splsecurity.com.au/security-systems/security-cameras-tweed-heads` (and non-www) | `https://spl.com.au/cctv-system/` |
| `https://www.splsecurity.com.au/the-oracle-on-broadbeach` (and non-www) | `https://spl.com.au/major-projects/` |
| `https://www.splsecurity.com.au/why-every-business-needs-a-trusted-commercial-locksmith` (and non-www) | `https://spl.com.au/locksmith-services/` |

### Catch-all (after the specific rules above)
Any other `https://(www.)splsecurity.com.au/*` path → `https://spl.com.au/$1` (path-preserving), **or** `https://spl.com.au/` only if Localsearch cannot do path preserve. Prefer path-preserving so deep links are not collapsed.

## Do not
- Do not cancel the GSC Change of Address.
- Do not change nameservers without Nathan.
- Do not point every old URL at the homepage only — that is what triggered Google’s sample warning.

