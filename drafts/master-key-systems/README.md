# DRAFT: Master key systems for business (31 Oct 2026)

Not published. Not linked from the menu, not in the sitemap or manifest, `noindex, nofollow`. Lives outside `public/` so no build or deploy picks it up.

- `index.html`: the page, built from the `public/restricted-keys/` template (same header, footer, styles, contact CTA and mobile call bar), written as if it sits at `public/master-key-systems/`.
- `build-draft.py`: regenerates `index.html` from the template (run it from the repo root).
- `preview-desktop.png`, `preview-mobile.png`: screenshots of a local preview.
- Schema: WebPage, BreadcrumbList, Service (areaServed Gold Coast, Brisbane, Northern NSW; provider #business + #ballina) and FAQPage (8 Q&As that match the visible FAQ).
- Every claim comes from existing SPL pages: locksmith-services, restricted-keys, major-projects, the Gold Coast and Brisbane commercial locksmith articles, keyless-entry, holiday-security-tips and ballina.

To publish (only after Nathan approves): move it to `public/master-key-systems/index.html`, set robots to `index, follow`, and remove the `/master-key-systems/` -> `/restricted-keys/` 301 from `.htaccess`/`hosting/hostpapa/htaccess.template`. The Ballina redirect map also sends the old `ballinalocksmiths.com.au/master-key-systems/` to `commercial-locksmith`. Then add the menu, sitemap and OG entries.
