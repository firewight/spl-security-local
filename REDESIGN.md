# SPL demo subpage redesign

The homepage retains its original black/gold theme, hero and large centred panel styling. On 15 October 2026 Nato authorised replacing the three product promotions with four primary services: Locksmiths, Security Systems, Door Hardware and Retail/Trade. Their source-site images and detail-page links are recorded in `home-service-images.json`. The menu follows the source site's seven top-level groups. A searchable all-pages directory exposes every imported route.

Brochures was subsequently retired at Nato's request: its About-menu entry, page and directory/sitemap links are removed. `seo.config.json` lists `/brochures` in `excludedPaths` so imports do not recreate it. The original source audit is retained as historical evidence.

Service-area lists and the Service Area navigation dropdown are consolidated to Gold Coast, Brisbane and Northern NSW via `scripts/consolidate-service-areas.cjs` after SEO generation. Individual suburb pages remain accessible through the full page directory; no location URLs are removed.

173 subpages were fetched from the live sitemap and internal links on 15 October 2026. Editorial copy, FAQs, expandable text, article links and brochures are retained in black/gold editorial layouts. 203 images and PDFs are stored under `public/assets/imported/`. The original website and Shopify theme are not modified.

## Rebuild

1. `npm ci`
2. `node scripts/import-pages.cjs` (or `--cached` for local snapshots)
3. `node scripts/localize-assets.cjs`
4. `node scripts/refine-pages.cjs`
5. `node scripts/optimize-seo.cjs`
6. `node scripts/audit-pages.cjs`
7. `node scripts/verify-seo.cjs`
8. `node scripts/verify-browser.cjs`

See `SEO-REPORT.md` for the audit, preview indexing policy and backlink migration plan. SEO configuration is in `seo.config.json`; preview mode keeps this demo out of search results until a deliberate launch.

SEO generation also runs `scripts/standardize-editorial-images.cjs`: it removes within-page duplicate photos (including near-identical resized copies), removes imported placeholder gallery labels and applies shared 16:9 editorial frames. Transparent logos, diagrams and very wide assets use contain rather than cover. Homepage service panels and the Contact social row are excluded. `editorial-media-report.json` records the last run. Browser checks include desktop/mobile CCTV frame proportions and image rendering.

The importer records coverage and homepage-main SHA-256 in `page-import-manifest.json`. Source snapshots and verification artifacts are ignored by Git. Audit verifies editorial text and local links for all imported pages. Browser verification covers representative desktop/mobile layouts, navigation and search. Set `VERIFY_URL` to verify a remote deployment.

GitHub Pages is static: the contact page prepares an email in the visitor's mail app, clearly labeled for review and sending. Source form handlers and tracking scripts are not copied. The pre-existing homepage enquiry modal remains unchanged and requires its original local Node backend; this change does not add a hosted form service.
