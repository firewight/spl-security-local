# SPL Security local demonstration

Run `npm start` from this folder, then open `http://localhost:8080` or `http://<this-PC's-LAN-IP>:8080`.

The callback form saves submissions to `submissions.json` on the host computer. Update the placeholder phone number before sharing the site.

For another device to connect, Windows may need an inbound rule for TCP 8080 on the Private profile. An administrator can add one with:

`New-NetFirewallRule -DisplayName 'SPL Security Local Demo (LAN)' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8080 -RemoteAddress LocalSubnet -Profile Private`

## Website forms (pending backend)

The homepage callback form (`#enquiry-form`) and contact page form (`#contact-draft`) are marked `data-spl-form` and handled by `public/forms.js`. They POST JSON to the endpoint in `public/form-config.js` (currently the placeholder `/api/contact`; **no backend is connected yet**, so submissions on GitHub Pages show the inline error message with phone/email fallback). No third-party form service is used.

To connect the in-house backend: set `endpoint` (and `thankYouUrl` if needed) in `public/form-config.js`, then run `node scripts/apply-forms.cjs` to update the no-JS fallback `action` attributes. The backend should accept `name`, `phone`, `email`, `service`, `message`, `form_name`, discard submissions where the honeypot `website` is filled, and redirect non-JS POSTs to `/thank-you/`. Recipient address (e.g. support@ for testing, info@ later) belongs in the backend config.
