# SPL Security local demonstration

Run `npm start` from this folder, then open `http://localhost:8080` or `http://<this-PC's-LAN-IP>:8080`.

The callback form saves submissions to `submissions.json` on the host computer. Update the placeholder phone number before sharing the site.

For another device to connect, Windows may need an inbound rule for TCP 8080 on the Private profile. An administrator can add one with:

`New-NetFirewallRule -DisplayName 'SPL Security Local Demo (LAN)' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8080 -RemoteAddress LocalSubnet -Profile Private`

## Website forms (pending backend)

The homepage callback form (`#enquiry-form`) and contact page form (`#contact-draft`) are marked `data-spl-form` and handled by `public/forms.js`. They POST JSON to the endpoint in `public/form-config.js` (currently the placeholder `/api/contact`; **no backend is connected yet**, so submissions on GitHub Pages show the inline error message with phone/email fallback). No third-party form service is used.

To connect the in-house backend: set `endpoint` (and `thankYouUrl` if needed) in `public/form-config.js`, then run `node scripts/apply-forms.cjs` to update the no-JS fallback `action` attributes. The backend should accept `name`, `phone`, `email`, `service`, `message`, `form_name`, discard submissions where the honeypot `website` is filled, and redirect non-JS POSTs to `/thank-you/`. Recipient address (e.g. support@ for testing, info@ later) belongs in the backend config.

## Contact form backend (HostPapa / cPanel, PHP 8.x)

`hosting/api/` holds the in-house endpoint. It lives outside `public/` on purpose: GitHub Pages would serve `.php` files as downloads. On GitHub Pages the forms show the inline "not available" message. The local `npm start` server also accepts `POST /api/contact` and saves to `submissions.json`, which is gitignored.

Files: `contact.php` (endpoint), `.htaccess` (maps `/api/contact` to `contact.php` and blocks config/vendor), `vendor/` (PHPMailer 6, committed so no Composer is needed on the host; `composer.json` is included if you prefer `composer install`), `config.example.php`.

What it does: accepts POST (JSON from `forms.js`, or a normal form post without JS) with `form_name, name, phone, email, service, message` and the honeypot `website`. It checks that Origin/Referer is in `allowed_origins`, silently accepts and drops honeypot hits, and rate-limits per IP (default 5 per 10 minutes, file-based). It validates the fields (name, phone, valid email and message are required) and sends via SMTP with PHPMailer, setting Reply-To to the visitor. It returns `{"ok":true}` or `{"ok":false,"error":...,"fields":{...}}` (422/403/429/502) to fetch requests, and 303-redirects non-JS posts to `thank_you_url`.

### Deploy (at launch; nothing is deployed yet)
1. Upload the contents of `public/` to the web root (e.g. `public_html/`). Upload `hosting/api/` to `public_html/api/`, including `.htaccess` and `vendor/`.
2. On the server, copy `api/config.example.php` to `api/config.php` and fill in the SMTP settings. Never commit `config.php`; it is gitignored.
3. Set `allowed_origins` to the live origins (e.g. `https://www.splsecurity.com.au` and `https://splsecurity.com.au`). Check that `rate_dir` is writable (or point it outside `public_html`).
4. If the site is not at the domain root, update `endpoint`/`thankYouUrl` in `public/form-config.js`, run `node scripts/apply-forms.cjs`, and set `thank_you_url` in `config.php` to match.
5. Test one submission from each form (homepage callback dialog and contact page).

SMTP details needed: host, port and encryption, a username and password (or app password), and a From mailbox the account may send as.
- HostPapa cPanel mailbox: the host is usually `mail.<domain>`, port 465 (ssl) or 587 (tls).
- Microsoft 365: `smtp.office365.com`, port 587 (tls). SMTP AUTH must be enabled for the mailbox, and the From address must be that mailbox or one it can send as.

For deliverability, make sure the domain's SPF/DKIM allow the sending server.

### Switching recipient to info@
Edit `to_email` in the server's `api/config.php` from `support@spl.com.au` to `info@spl.com.au`. No site rebuild is needed.
