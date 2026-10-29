# OntheNet redirect request — splsecurity.com.au → spl.com.au

**Date:** 29 Oct 2026 (Asia/Bangkok)  
**For:** Nathan → OntheNet support  
**Do not change:** DNS/nameservers, GSC Change of Address

## Current behaviour (verified)

OntheNet already issues **path-preserving** 301s from `splsecurity.com.au` / `www.splsecurity.com.au` (A `203.13.68.170`) to `https://spl.com.au{same-path}` (including query strings on `/`).

HostPapa (`66.102.137.241`) then applies path→path 301s for renamed URLs (e.g. `/door-hardware` → `/architectural-door-hardware/`).

Google Change of Address warned that sample pages collapse to one target. Prefer **one-hop page-to-page** 301s on OntheNet to the **final** matching `https://spl.com.au` URL (trailing slash on non-home pages), instead of relying on a second hop for renames.

## Please set these 301s (from → to)

Apply for both apex and `www` on `splsecurity.com.au`. Keep homepage query strings.

| From (old) | To (final) |
|---|---|
| `https://splsecurity.com.au/` (and www; keep `?*`) | `https://spl.com.au/` |
| `https://www.splsecurity.com.au/contact` (and apex, ±`/`) | `https://spl.com.au/contact/` |
| `https://www.splsecurity.com.au/access-control/` (and apex, no-slash) | `https://spl.com.au/access-control-systems/` |
| `https://www.splsecurity.com.au/alarm-systems0197b34d/` (and apex, no-slash) | `https://spl.com.au/alarm-system/` |
| `https://www.splsecurity.com.au/articles/` (and apex, no-slash) | `https://spl.com.au/blog/` |
| `https://www.splsecurity.com.au/circle-on-cavill/` (and apex, no-slash) | `https://spl.com.au/major-projects/` |
| `https://www.splsecurity.com.au/commercial-locksmith/` (and apex, no-slash) | `https://spl.com.au/locksmith-services/` |
| `https://www.splsecurity.com.au/commercial-locksmiths/` (and apex, no-slash) | `https://spl.com.au/locksmith-services/` |
| `https://www.splsecurity.com.au/door-hardware/` (and apex, no-slash) | `https://spl.com.au/architectural-door-hardware/` |
| `https://www.splsecurity.com.au/elisa-valitutti/` (and apex, no-slash) | `https://spl.com.au/major-projects/` |
| `https://www.splsecurity.com.au/how-to-protect-your-home-from-intruders/` (and apex, no-slash) | `https://spl.com.au/how-to-protect-your-home-from-intruders-effectively/` |
| `https://www.splsecurity.com.au/locations/locksmith-ashmore/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-broadbeach/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-bundall/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-burleigh/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-carrara/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-coolangatta/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-coomera/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-currumbin/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-elanora/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-gold-coast/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-helensvale/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-hope-island/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-kingscliff/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-main-beach/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-mermaid/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-molendinar/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-nerang/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-northern-nsw/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-pacific-pines/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-palm-beach/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-pimpama/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-robina/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-runaway-bay/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-southport/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-surfers-paradise/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locations/locksmith-yatala/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/locksmith-tweed-heads/` (and apex, no-slash) | `https://spl.com.au/locksmith-services/` |
| `https://www.splsecurity.com.au/locksmiths/` (and apex, no-slash) | `https://spl.com.au/locksmith-services/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-arundel/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-ashmore/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-biggera-waters/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-broadbeach-waters/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-bundall/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-burleigh-heads/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-coolangatta/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-currumbin-waters/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-helensvale/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-highland-park/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-hope-island/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-kingscliff/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-main-beach/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-mermaid-beach/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-molendinar/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-oxenford/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-pacific-pines/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-pimpama/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-robina/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-runaway-bay/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-southport/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-surfers-paradise/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-tweed-heads/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-upper-coomera/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-varsity-lakes/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-worongary/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24-7-mobile-yatala/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/24/7-mobile-locksmith-elanora/` (and apex, no-slash) | `https://spl.com.au/auto-locksmith/` |
| `https://www.splsecurity.com.au/locksmiths/brisbane/` (and apex, no-slash) | `https://spl.com.au/locksmith-services/` |
| `https://www.splsecurity.com.au/locksmiths/paradise-point/` (and apex, no-slash) | `https://spl.com.au/locksmith-services/` |
| `https://www.splsecurity.com.au/residential-locksmith/` (and apex, no-slash) | `https://spl.com.au/locksmith-services/` |
| `https://www.splsecurity.com.au/safes/bundall/` (and apex, no-slash) | `https://spl.com.au/safe/` |
| `https://www.splsecurity.com.au/safes/hope-island/` (and apex, no-slash) | `https://spl.com.au/safe/` |
| `https://www.splsecurity.com.au/safes/surfers-paradise/` (and apex, no-slash) | `https://spl.com.au/safe/` |
| `https://www.splsecurity.com.au/safes/tweed-heads/` (and apex, no-slash) | `https://spl.com.au/safe/` |
| `https://www.splsecurity.com.au/security-cameras-bundall/` (and apex, no-slash) | `https://spl.com.au/cctv-system/` |
| `https://www.splsecurity.com.au/security-cameras-gold-coast-airport/` (and apex, no-slash) | `https://spl.com.au/cctv-system/` |
| `https://www.splsecurity.com.au/security-cameras-hope-island/` (and apex, no-slash) | `https://spl.com.au/cctv-system/` |
| `https://www.splsecurity.com.au/security-cameras-robina/` (and apex, no-slash) | `https://spl.com.au/cctv-system/` |
| `https://www.splsecurity.com.au/security-cameras-southport/` (and apex, no-slash) | `https://spl.com.au/cctv-system/` |
| `https://www.splsecurity.com.au/security-cameras-surfers-paradise/` (and apex, no-slash) | `https://spl.com.au/cctv-system/` |
| `https://www.splsecurity.com.au/security-systems/brisbane/` (and apex, no-slash) | `https://spl.com.au/security-systems/` |
| `https://www.splsecurity.com.au/security-systems/cctv-systems/tweed-heads/` (and apex, no-slash) | `https://spl.com.au/cctv-system/` |
| `https://www.splsecurity.com.au/security-systems/intercoms/gold-coast/` (and apex, no-slash) | `https://spl.com.au/intercom/` |
| `https://www.splsecurity.com.au/security-systems/intercoms/tweed-heads/` (and apex, no-slash) | `https://spl.com.au/intercom/` |
| `https://www.splsecurity.com.au/security-systems/security-cameras-tweed-heads/` (and apex, no-slash) | `https://spl.com.au/cctv-system/` |
| `https://www.splsecurity.com.au/service-area/` (and apex, no-slash) | `https://spl.com.au/locations/` |
| `https://www.splsecurity.com.au/the-oracle-on-broadbeach/` (and apex, no-slash) | `https://spl.com.au/major-projects/` |
| `https://www.splsecurity.com.au/why-every-business-needs-a-trusted-commercial-locksmith/` (and apex, no-slash) | `https://spl.com.au/locksmith-services/` |

## Catch-all (unmapped paths)

Any other `splsecurity.com.au` path not listed: 301 to `https://spl.com.au{same-path}` (current behaviour is fine), or to `https://spl.com.au/` only if the path 404s on the new site.

**Rename rules in this list:** 87 (excluding bare `/`).

