# SPL Security local demonstration

Run `npm start` from this folder, then open `http://localhost:8080` or `http://<this-PC's-LAN-IP>:8080`.

The callback form saves submissions to `submissions.json` on the host computer. Update the placeholder phone number before sharing the site.

For another device to connect, Windows may need an inbound rule for TCP 8080 on the Private profile. An administrator can add one with:

`New-NetFirewallRule -DisplayName 'SPL Security Local Demo (LAN)' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8080 -RemoteAddress LocalSubnet -Profile Private`
