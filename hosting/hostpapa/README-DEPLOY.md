# SPL website – HostPapa deploy package

**Account:** HostPapa AU-WP Elite (cPanel). cPanel user `splco501`, server `sh-cp18-au.yyz2.servername.online`, IP `66.102.137.241`, document root `/home/splco501/public_html`.

**Status:** spl.com.au has not been moved to this host yet, and the current site stays live elsewhere. This package is a **staging build**:
- every page has `noindex`;
- `.htaccess` also sends an `X-Robots-Tag: noindex` header;
- the HTTPS and canonical-host redirects are commented out.

## What's in the zip

| Path | Purpose |
|---|---|
| `public_html/` | Upload the **contents** of this folder into `/home/splco501/public_html/`. It holds the whole static site, built for `https://spl.com.au/` (canonicals, sitemap, schema IDs, Open Graph). |
| `public_html/.htaccess` | 404 page, the 82 old-path 301 redirects and the 37 ballinalocksmiths.com.au redirects, the old splsecurity.com.au → spl.com.au host redirect, caching, compression, security headers, `Options -Indexes`, and the `/api/contact` route. The HTTPS and www rules are **commented out**. |
| `public_html/robots.txt` | Allows crawling, blocks `/api/`, and points to `https://spl.com.au/sitemap.xml`. |
| `public_html/api/` | The contact form endpoint (`contact.php`) with PHPMailer in `vendor/`, plus `config.php` set up for HostPapa. `config.php`, `composer.*` and `vendor/` are blocked from the web. |
| `build-report.json` | The build settings and counts: redirects, files rewritten, and any demo URLs left over (none). |
| `deploy-hostpapa.sh` | Optional SFTP upload script using lftp. It does a dry run by default. |
| `build-hostpapa.cjs` | The build script that produced this package. Run it from the repo, not from here. |

## 1. Before uploading (cPanel)

1. **Set the PHP version.** In MultiPHP Manager, set spl.com.au to **PHP 8.2 or 8.3**. The minimum is 8.1, because `contact.php` uses `never` and `str_contains`.
2. **Create the form's sender mailbox.** Under Email Accounts, create `info@spl.com.au`. This is a placeholder name; use another if you prefer, and change `from_email` in `api/config.php` to match.
3. **Back up the existing files.** If `public_html` already contains anything, such as a HostPapa default page or a WordPress install from the AU-WP plan, download a backup first, then remove it. The WP plan may have pre-installed WordPress, and its `index.php` and `.htaccess` would conflict with this site.

## 2. Upload

**Option A – cPanel File Manager (simplest):**
1. Open File Manager and go to `public_html`.
2. Upload `spl-hostpapa-*.zip`, right-click it and choose **Extract**. This creates a `public_html/` subfolder.
3. Select everything **inside** the extracted `public_html/` folder (turn on Settings → *Show Hidden Files* so `.htaccess` is included) and **Move** it up to `/home/splco501/public_html/`.
4. Delete the zip and the empty folder.

**Option B – SFTP:**
1. Connect with FileZilla or similar to `sh-cp18-au.yyz2.servername.online`, port 22 (SFTP) or 21 (FTPS), as user `splco501`. Some HostPapa plans disable SSH/SFTP; if so, use FTPS on port 21.
2. Upload the *contents* of `public_html/` to `/home/splco501/public_html/`.

   Alternatively, from the repo: `HOSTPAPA_FTP_PASSWORD=… scripts/deploy-hostpapa.sh --live --yes`. On first deploy, upload `api/config.php` by hand; the script deliberately skips it after that so it never overwrites the server copy.

**Permissions:** folders 755, files 644. File Manager and SFTP normally set these already.

## 3. Preview before DNS moves

**Recommended: a hosts-file entry.** Add this line, then browse to **http://spl.com.au/** (plain http; there's no SSL certificate until DNS moves):
```
66.102.137.241  spl.com.au www.spl.com.au
```
- **Windows:** `C:\Windows\System32\drivers\etc\hosts`. Edit it as Administrator.
- **macOS/Linux:** `/etc/hosts`, edited with sudo.

**Remove the line afterwards**, or you'll keep seeing the staging server instead of the live site.

**Testing the form over http:** temporarily add `'http://spl.com.au'` to `allowed_origins` in `api/config.php`.

**Command-line check without editing hosts:**
```
curl -I --resolve spl.com.au:80:66.102.137.241 http://spl.com.au/
```

**cPanel temporary URL:** something like `http://66.102.137.241/~splco501/` or a HostPapa-provided preview link. I haven't checked whether this account has one; it isn't recommended either way. The site uses root-relative links (`/assets/…`), so styles and images break under a `~user` path. Use the hosts file instead.

## 4. Testing the contact form

- `api/config.php` uses `transport => 'mail'`, which sends through the server's own mail service, with no password stored.
- The sender is `info@spl.com.au` (a placeholder) and the recipient is **support@spl.com.au** (for testing).
- For more reliable delivery, switch to `transport => 'smtp'` using that mailbox's settings (cPanel → Email Accounts → Connect Devices). Set `smtp_pass` **on the server only**.
- **SPF/DKIM:** spl.com.au's SPF and DKIM records must cover this server, or mail may land in spam. Check cPanel → Email Deliverability once DNS is managed here. Until then, this has to be done wherever spl.com.au's DNS is hosted.
- **Rate-limit files** go in `/home/splco501/spl-ratelimit/`, which is outside the web root and created automatically.
- **To test:** send an enquiry from `/contact/`. You should land on `/thank-you/`, and the email should arrive at support@spl.com.au.

## 5. Pre-launch checklist

- [ ] PHP 8.2/8.3 is set; `/api/contact` answers **405** to a GET request.
- [ ] Every page checked via the hosts-file preview: styles, images, menus, the 404 page (`/some-missing-page`), and old URLs redirecting (for example `/locksmiths/24-7-mobile` → `/auto-locksmith/`).
- [ ] A test enquiry arrives at support@spl.com.au, and Reply goes to the customer.
- [ ] `to_email` is switched to **info@spl.com.au**.
- [ ] Decided: **non-www** (`spl.com.au`, the default in this build) or **www**. To use www, rebuild with `--www`.
- [ ] DNS for spl.com.au (and www) points to `66.102.137.241`. Lower the TTL to 300 a day before.
- [ ] Email (MX) records are **unchanged** unless SPL's mail is moving too. Moving the website's DNS must not break Microsoft 365 or the existing mail.
- [ ] AutoSSL certificate issued for spl.com.au and www.spl.com.au (cPanel → SSL/TLS Status → Run AutoSSL).
- [ ] In `.htaccess`, **uncomment** the HTTPS/canonical-host block and the `Strict-Transport-Security` line.
- [ ] **Remove noindex:** rebuild with `node scripts/build-hostpapa.cjs --index` (add `--www` if chosen) and upload. That build has no noindex meta tags and no X-Robots-Tag header; the 404, thank-you and redirect pages stay noindex.
- [ ] If splsecurity.com.au and ballinalocksmiths.com.au are added to this account as aliases (parked domains), their 301s in `.htaccess` take effect automatically. Otherwise, set up 301s on their current host.
- [ ] Google Search Console and Bing Webmaster Tools: verify spl.com.au, submit `https://spl.com.au/sitemap.xml`, and use the *Change of Address* tool from splsecurity.com.au.
- [ ] Add GA4 if wanted. The privacy policy already describes it.
- [ ] Final check: https://spl.com.au/ returns 200, http:// and the other host 301 to the canonical address, and the old URLs return 301.

## 6. Rollback

- **Before DNS changes:** nothing is live, so there's nothing to roll back. Remove the hosts-file line.
- **After DNS changes:** point spl.com.au's A (and www) records back to the previous host's IP. Keep a note of the old values *before* changing them. With a TTL of 300, most visitors return within minutes to an hour. Leave the old site untouched until the new one has been stable for at least two weeks.
- **A bad upload on HostPapa:** re-upload the previous zip, which you should keep every package, or restore `public_html` from cPanel → Backup (JetBackup), if the plan includes it.
- **Indexing:** if the indexable build went out by mistake before launch, re-upload the staging build. noindex takes effect on the next crawl.

## Publishing (staging preview — the main way to publish until the domain moves)

GitHub Pages is no longer relied on. After every change on `main`:

```bash
git checkout hostpapa-package && git rebase main
HOSTPAPA_CPANEL_TOKEN=… scripts/deploy-hostpapa-staging.sh
```

It builds the noindex staging package, uploads and extracts it via the cPanel API, keeps the server's `api/config.php`, `.well-known`, `cgi-bin` and cPanel's PHP lines, prunes files from earlier deploys, deletes the zip, and checks the preview at http://66.102.137.241/~splco501/. Options: `--no-build`, `--no-prune`, `--verify-only`.
