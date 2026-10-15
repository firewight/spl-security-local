# SEO, AEO and link audit — 15 October 2026

Subsequent content change: `/brochures` was retired at Nato's request. Current generation covers 177 pages and 173 primary sitemap URLs; the original audit counts below describe the initial SEO work. No brochure page or menu/directory link remains.

## Scope and source findings

Audited the original SPL homepage and 173 subpages using the live crawl saved earlier today, refreshing the homepage, contact, about, commercial locksmith and articles pages. The source has canonical URLs on all 174 pages, descriptions on 171, LocalBusiness markup on all pages, 65 BlogPosting records and 7 FAQPage records. Source metadata, actual visible FAQs, business information and established profile links informed the implementation; old tracking and form scripts were not copied.

Source issues corrected rather than replicated:

- Four alias routes point to other source canonicals: `/access-control`, `/alarm-systems0197b34d`, `/locksmiths`, `/commercial-locksmiths`.
- Duplicate/generic titles and descriptions are made page-specific. SVG icon titles are not used as page titles.
- A blank source business `@id` is replaced with a stable entity identity.
- The source applies 24/7 hours to the whole business. The demo distinguishes trade-counter weekday hours, retail-showroom weekday hours and emergency availability, matching the source's visible contact information.

Raw audit: `source-seo-audit.json`. Reproducible audit: `scripts/audit-source-seo.cjs`.

## Applied to the demo

- Unique, relevant titles/descriptions, absolute canonicals, Open Graph and Twitter previews on 178 pages.
- WebSite/WebPage, BreadcrumbList, source-backed business/department, service, article, product and visible-question FAQ schema. No invented prices, reviews, author credentials or publication dates.
- 201 visible FAQ answers on 81 pages are represented in schema. 65 article records preserve source dates and author names where available.
- 172 source-derived introductory answer summaries, 168 page contents menus, descriptive heading anchors and related-service links on 143 pages.
- All existing source paths remain available. Internal links prefer the four aliases' canonical destinations. The XML sitemap includes 174 primary routes, not duplicate aliases.
- Source-backed social/business profile links on Contact; consistent name/address/phone; local share image and favicon; useful 404 recovery links.
- Explicit dimensions for 1,383 image instances, asynchronous decoding and lazy loading below the fold on subpages; font preconnects. These reduce avoidable layout shifts/connections, not a claimed Core Web Vitals score.
- Homepage design was preserved during the SEO work. Nato subsequently authorised replacing its product promotions with four primary service panels, retaining the same theme. The manifest records that approved content baseline; SEO checks ensure metadata generation does not alter it.

The build receipt is `seo-build-report.json`; validation writes `verification/seo-validation.json`. Run `node scripts/optimize-seo.cjs` after any subpage rebuild, then `node scripts/verify-seo.cjs` and the content/browser checks in `REDESIGN.md`.

## Preview and launch

`seo.config.json` intentionally defaults to `indexing: "preview"`, producing HTML `noindex, follow`. This is a preview deployment, not a second competing SPL production site. SEO/AEO changes are prepared, but the demo should not gain search visibility until deliberately launched. No Search Console, Bing or directory submissions have been made.

At launch, set the approved production `siteUrl` and `indexing: "live"`, regenerate, validate and deploy. Canonical duplicate aliases remain noindex. The current sitemap is a launch-ready URL inventory; it has not been submitted for preview indexing. A GitHub project subdirectory's robots.txt is not host-root crawl control; HTML noindex provides the preview directive. A real production host needs its own root robots.txt and sitemap URL.

## Backlink work: delivered versus external follow-up

Delivered: preserved source slugs, canonical consolidation, descriptive crawlable internal links, relevant cross-links, source-backed identity links and `backlink-migration.csv`. The CSV maps all 174 original URLs to preferred production URLs and demo canonicals. The four alias redirects are recommendations for the production host, not claimed live 301 redirects on GitHub Pages.

At an approved production migration, preserve existing paths and put permanent redirects only where URLs really change. Update existing owned Google Business Profile, Bing Places, LinkedIn, Facebook, Instagram and verified business-directory website URLs if the public domain changes. Search Console/Bing backlink reports can then identify valuable inbound links that need recovery. Third-party backlinks cannot be created by changing our own HTML; no outreach, paid links, directory submissions or edits to external profiles were performed.

## Evidence and limits

- [Google: AI-search optimization](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): helpful, accessible, accurate content and standard SEO remain foundational; no special AI markup or llms.txt is required for Google visibility.
- [Google: canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) and [crawlable descriptive links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable).
- [Google: noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing): crawlers must be allowed to fetch pages to see HTML directives.
- [Google: LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business): use real, visible, consistent business information.
- [Google documentation updates](https://developers.google.com/search/updates): FAQ rich results were retired in May 2026. FAQ schema here is machine-readable representation of visible answers, not a promised Google FAQ rich result or AI citation.

Validation checks markup, local references, sitemap canonical consistency, FAQ visibility and unchanged homepage content. It does not prove rankings, indexing, backlinks, AI inclusion or field performance; those require a deliberate public launch and subsequent measurement.
