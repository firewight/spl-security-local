// Shared SPL official-profile icon row (footer + contact page). Used by optimize-seo.cjs and apply-profile-icons.cjs.
const svg=(p)=>`<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">${p}</svg>`;
const profiles=[
 {label:'SPL on Facebook',href:'https://www.facebook.com/splsecurity',icon:'<path fill="currentColor" d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9z"/>'},
 {label:'SPL on Instagram',href:'https://www.instagram.com/spl_security/',icon:'<rect x="4" y="4" width="16" height="16" rx="4.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16.9" cy="7.1" r="1.2" fill="currentColor"/>'},
 {label:'SPL on LinkedIn',href:'https://au.linkedin.com/company/spl-security',icon:'<path fill="currentColor" d="M5.2 9.2h3v9.6h-3V9.2zm1.5-4.8a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5zM10 9.2h2.9v1.3h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.6v5.26h-3v-4.66c0-1.12-.02-2.55-1.55-2.55-1.56 0-1.8 1.21-1.8 2.47v4.74H10V9.2z"/>'},
 {label:'Find SPL in Bundall',href:'https://maps.app.goo.gl/gMTHmoGATMh5Bm7XA',icon:'<path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>'},
 {label:'SPL business listing',href:'https://www.localsearch.com.au/profile/spl-security-solutions/bundall-qld/FSwF',icon:'<path fill="currentColor" d="M4 4h16l1.5 5a3 3 0 0 1-5 2.2 3 3 0 0 1-4.5 0 3 3 0 0 1-4.5 0A3 3 0 0 1 2.5 9L4 4zm1 9.3V20h14v-6.7a4.9 4.9 0 0 1-2.5.3V18h-9v-4.4a4.9 4.9 0 0 1-2.5-.3z"/>'}];
const links=()=>profiles.map(p=>`<a class="profile-icon" href="${p.href}" aria-label="${p.label} (opens in a new tab)" title="${p.label}" target="_blank" rel="noopener noreferrer">${svg(p.icon)}</a>`).join('');
const footerRow=()=>`<nav class="footer-socials profile-icons" aria-label="SPL official profiles">${links()}</nav>`;
const contactRow=()=>`<div class="official-profiles profile-icons" data-seo-generated=""><p>Official profiles &amp; business information</p>${links()}</div>`;
module.exports={profiles,links,footerRow,contactRow};
