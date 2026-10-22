// CRO extras (Oct 2026), applied per page by cro-fixes.cjs. Idempotent: every block it adds carries data-cro="" and is
// stripped by cro-fixes before re-adding; in-place rewrites only match markup they have not already rewritten.
// Facts only from the site / agreed brief: no prices, response times or guarantees.
const fs=require('fs'),path=require('path');
const pub=path.join(__dirname,'..','..','public');
const MAIN_TEL='tel:+61755888111',MAIN_NUM='(07) 55 888 111';
const telA=(num,href)=>`<a class="cro-tel" data-cro-tel="" href="${href}">${num}</a>`;
const T=telA(MAIN_NUM,MAIN_TEL),TB=telA('(02) 6686 7675','tel:+61266867675');

// ---- 3. Page-specific wording for the contact panel's form link ----
const COMMERCIAL=new Set(['commercial-locksmith','access-control-systems','major-projects','circle-on-cavill','the-oracle-on-broadbeach','architectural-door-hardware','door-hardware','door-closers','door-handles','fire-door-hardware','retail-security']);
const SECURITY=new Set(['security-systems','alarm-system','alarm-monitoring','cctv-system','intercom','products']);
const LOCKSMITH=new Set(['locksmith-services','residential-locksmith','restricted-keys','safe','locksmiths','ballina','locations','service-area']);
const EMERGENCY=new Set(['emergency-locksmith','auto-locksmith']);
function kind(rel){const dir=rel.split('/')[0],slug=rel.replace(/\/index\.html$/,'').split('/').pop();
  if(rel==='contact/index.html')return'contact';
  if(EMERGENCY.has(dir)||/emergency|locked-out|lost-your-keys|broken-key|lockdown/.test(slug))return'emergency';
  if(COMMERCIAL.has(dir)||/business|commercial|workplace/.test(slug))return'commercial';
  if(SECURITY.has(dir)||/security-system|cctv|camera|alarm|surveillance|smart-home/.test(slug))return'security';
  if(LOCKSMITH.has(dir)||/lock|key/.test(slug))return'locksmith';
  return'general';}
const LABEL={contact:'Send us an enquiry',emergency:'Request a non-urgent quote',commercial:'Get a free quote for my business',security:'Get a free security quote',locksmith:'Get a free locksmith quote',general:'Get a free quote'};
function buttons(h,k){
  h=h.replace(/(<a class="contact-option" href="[^"]*#contact-enquiry"><span><small>)([^<]*)(<\/small><strong>)[^<]*(<\/strong>)/,(m,a,s,b,c)=>a+(k==='contact'?'SEND AN ENQUIRY':'FREE QUOTES &amp; GENERAL ENQUIRIES')+b+LABEL[k]+c);
  h=h.replace(/(<a class="contact-option contact-option-primary" href="tel:[^"]*"><span><small>)[^<]*(<\/small>)/,(m,a,b)=>a+(k==='emergency'?'LOCKED OUT? CALL NOW · 24/7':'CALL SPL · 24/7 EMERGENCIES')+b);
  return h;}

// ---- 4. Major projects link on commercial pages ----
const PROJECT_PAGES=new Set(['commercial-locksmith','access-control-systems','architectural-door-hardware','door-hardware','fire-door-hardware']);
function projects(h,rel,up){const dir=rel.split('/')[0];if(!PROJECT_PAGES.has(dir)||rel!==dir+'/index.html'||!fs.existsSync(path.join(pub,'major-projects/index.html')))return h;
  return h.replace(/(<section class="contact-options")/,`<p class="cro-projects" data-cro=""><a href="${up}major-projects/index.html">See our major projects</a></p>$1`);}

// ---- 5. FAQs (visible + FAQPage JSON-LD) ----
const FAQ={
 'index.html':[
  ['Is SPL available 24/7 for emergencies?',`Yes. Our emergency locksmith and electronic security technicians are available 24 hours a day, 7 days a week. Call ${T}.`],
  ['How long has SPL been in business?','SPL was founded in 1990 as Surfers Paradise Locksmiths and has been securing the Gold Coast ever since. Today our team is close to 100 staff.'],
  ['What areas do you service?','We service the Gold Coast from our Bundall office, Brisbane from our Gold Coast office, and Northern NSW from our Ballina showroom.'],
  ['Are you licensed and accredited?','Yes. We hold QLD Security Licence 3247282 and NSW Security Licence 000102071, and we are members of the Master Locksmiths Association of Australia and the Australian Security Industry Association Limited (ASIAL member C908). All our locksmiths and technicians hold the correct QLD and NSW security licences.'],
  ['Do you offer free quotes?',`Yes, free quotes are available. Call ${T} or use our <a href="__CF__">contact form</a>.`]],
 'locksmith-services/index.html':[
  ['What locksmith services do you offer?','We cover homes, businesses and vehicles, from lockouts, lock repairs and key duplication to master key and restricted key systems, with 24/7 emergency help.'],
  ['Is SPL a member of the Master Locksmiths Association?','Yes. SPL is a member of the Master Locksmiths Association of Australia (member 6386).'],
  ['Can you help with car keys and vehicle lockouts?',`Yes. Our automotive locksmiths can help if you are locked out of your car, have a jammed ignition or need a car key cut. Call ${T}.`],
  ['Do you offer free locksmith quotes?',`Yes, free quotes are available. Call ${T} or use our <a href="__CF__">contact form</a>.`]],
 'emergency-locksmith/index.html':[
  ['Is your emergency locksmith service available 24/7?',`Yes. Our emergency locksmith and electronic security technicians are available 24 hours a day, 7 days a week. Call ${T}.`],
  ['What emergencies can you help with?','Lockouts from your home, office or vehicle, lost or broken keys, securing your property after a break-in, and electronic lock, access control and security system issues.'],
  ['I’m locked out right now. What should I do?',`Call us on ${T}. Calling is the fastest way to reach our 24/7 team; the online form is best for non-urgent enquiries.`],
  ['Do you cover Northern NSW for emergencies?',`Yes. For Northern NSW, call our Ballina team on ${TB}, 24 hours a day. For the Gold Coast and Brisbane, call ${T}.`]],
 'security-systems/index.html':[
  ['What security systems do you install?','We design, install and maintain security systems, including CCTV and security cameras, alarm systems, alarm monitoring, intercoms and access control.'],
  ['Do you maintain and service security systems?','Yes. As well as designing and installing systems, we provide maintenance and servicing.'],
  ['Do you work with Gallagher access control?','Yes. SPL is a certified Gallagher channel partner, and our technicians are trained in Integriti.'],
  ['Are you a member of a security industry association?','Yes. SPL is a member of the Australian Security Industry Association Limited (ASIAL member C908) and holds QLD Security Licence 3247282 and NSW Security Licence 000102071.'],
  ['Can I get help with a security system outside business hours?',`Yes. Our electronic security technicians are available 24/7 for emergencies. Call ${T}.`]],
 'contact/index.html':[
  ['Where are your showrooms?','Our Gold Coast showroom is at 101 Ashmore Road, Bundall QLD 4217, and our Ballina showroom is at Unit 2/269 River Street, Ballina NSW 2478.'],
  ['What are your opening hours?','In Bundall, the retail showroom is open Monday–Friday, 8:00 am–5:00 pm, and the trade counter Monday–Friday, 7:00 am–4:30 pm. The Ballina showroom is open Monday–Friday, 8:00 am–5:00 pm. Both showrooms are closed on weekends, and our emergency line is open 24/7.'],
  ['How do I get a free quote?',`Fill in the enquiry form on this page or call ${T}. If you are locked out, please call rather than using the form.`],
  ['Who do I contact in Northern NSW?',`Call SPL Ballina Locksmiths on ${TB} or email ballina@spl.com.au.`]]};
// ---- Payments (facts supplied by SPL, Oct 2026). Icons are local SVG files written by this script (no CDN). ----
const PAY_Q='What payment methods do you accept?',PAY_A='We accept all major payment methods, including Visa, Mastercard, American Express, EFTPOS, Apple Pay and Google Pay. If you’d like to use another method, just ask our team before we start.';
const badge=(inner)=>`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="30" viewBox="0 0 48 30"><rect x=".5" y=".5" width="47" height="29" rx="4" fill="#fff" stroke="#d0d0d0"/>${inner}</svg>\n`;
const txt=(t,fill,size,extra='')=>`<text x="24" y="19.5" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="${size}" fill="${fill}"${extra}>${t}</text>`;
const PAY=[['visa','Visa',badge(txt('VISA','#1a1f71',12,' font-style="italic" letter-spacing=".5"'))],
 ['mastercard','Mastercard',badge('<circle cx="19.5" cy="15" r="8" fill="#eb001b"/><circle cx="28.5" cy="15" r="8" fill="#f79e1b" fill-opacity=".9"/>')],
 ['amex','American Express',badge('<rect x="4" y="5" width="40" height="20" rx="2" fill="#2e77bc"/>'+txt('AMEX','#fff',10.5))],
 ['eftpos','EFTPOS',badge(txt('eftpos','#111',10.5))],
 ['apple-pay','Apple Pay',badge('<path fill="#111" d="M12.6 10.2c.5-.6.8-1.4.7-2.2-.7 0-1.6.5-2.1 1.1-.5.5-.8 1.3-.7 2.1.8.1 1.6-.4 2.1-1zm.7 1.1c-1.2-.1-2.2.7-2.7.7s-1.4-.6-2.3-.6a3.4 3.4 0 0 0-2.9 1.8c-1.2 2.1-.3 5.3.9 7 .6.8 1.3 1.8 2.2 1.7.9 0 1.2-.6 2.3-.6s1.4.6 2.3.6c1 0 1.6-.9 2.2-1.7.7-1 1-2 1-2a3.1 3.1 0 0 1-1.9-2.9 3.2 3.2 0 0 1 1.5-2.7 3.3 3.3 0 0 0-2.6-1.3z"/>'+'<text x="31" y="19.5" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="10" fill="#111">Pay</text>')],
 ['google-pay','Google Pay',badge('<text x="14" y="19.5" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="12"><tspan fill="#4285f4">G</tspan></text><text x="29" y="19.5" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="10" fill="#3c4043">Pay</text>')]];
function writeIcons(){const d=path.join(pub,'assets','payments');fs.mkdirSync(d,{recursive:true});for(const [f,,svg] of PAY){const p=path.join(d,f+'.svg');if(!fs.existsSync(p)||fs.readFileSync(p,'utf8')!==svg)fs.writeFileSync(p,svg);}}
const payRow=(up,cls)=>`<span class="${cls}">${PAY.map(([f,alt])=>`<img src="${up}assets/payments/${f}.svg" alt="${alt}" width="48" height="30" loading="lazy" decoding="async">`).join('')}</span>`;
function footerPay(h,up){return h.replace(/<\/footer>/,`<p class="cro-pay" data-cro=""><span class="cro-pay-label">We accept</span>${payRow(up,'cro-pay-icons')}</p></footer>`);}
for(const k of Object.keys(FAQ))FAQ[k].push([PAY_Q,PAY_A]);
// Pricing, accounts and warranty facts confirmed by SPL (Oct 2026). No dollar figures.
const F_PRICE=['Will I know the price before you start?','Yes. We give you a fixed price before we come out, so you know the cost upfront.'],
 F_AH=['Do you charge more after hours?','Yes, an after-hours rate applies outside business hours. We’ll confirm the price with you before we come out.'],
 F_ACC=['Do you offer business accounts?','Yes, we offer commercial accounts for businesses. Contact our team to set one up.'],
 F_WAR=['Is your work guaranteed?','Yes. All our work comes with a 12-month warranty on parts and labour.'];
const ADD={'index.html':[F_PRICE,F_ACC,F_WAR],'locksmith-services/index.html':[F_PRICE,F_AH,F_WAR],'emergency-locksmith/index.html':[F_PRICE,F_AH],'security-systems/index.html':[F_ACC,F_WAR],'contact/index.html':[F_PRICE,F_AH,F_ACC,F_WAR]};
for(const [k,v] of Object.entries(ADD)){const i=FAQ[k].findIndex(x=>x[0]===PAY_Q);FAQ[k].splice(i,0,...v);}
// Commercial locksmith already has an FAQ (seo build): add the accounts question to its list and its FAQPage node.
function commercialFaq(h,rel){if(rel!=='commercial-locksmith/index.html')return h;
  h=h.replace(/<li data-cro-faq="">[\s\S]*?<\/li>/g,'');
  const i=h.indexOf('id="section-frequently-asked-questions"');if(i<0)return h;const j=h.indexOf('</ul>',i);if(j<0)return h;
  h=h.slice(0,j)+`<li data-cro-faq=""><h3>${F_ACC[0]}</h3><p>${F_ACC[1]}</p></li>`+h.slice(j);
  return h.replace(/(<script type="application\/ld\+json" data-seo-schema="">)([\s\S]*?)(<\/script>)/,(m,a,json,c)=>{const d=JSON.parse(json),n=(d['@graph']||[]).find(x=>x['@type']==='FAQPage');if(!n)return m;
    n.mainEntity=n.mainEntity.filter(q=>q.name!==F_ACC[0]);n.mainEntity.push({'@type':'Question',name:F_ACC[0],acceptedAnswer:{'@type':'Answer',text:F_ACC[1]}});return a+JSON.stringify(d)+c;});}
// Warranty badge beside the contact panel and above the contact page form.
const SHIELD='<svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24"><path fill="#f7c600" d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3z"/><path fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="m8.5 12.2 2.4 2.4 4.8-5"/></svg>';
const WBADGE=`<p class="cro-warranty" data-cro="">${SHIELD}<span>12-month warranty on all parts &amp; labour</span></p>`;
function warranty(h,rel){h=h.replace(/(<div class="contact-options-copy">[\s\S]*?)(<\/div>)/,`$1${WBADGE}$2`);
  if(rel==='contact/index.html')h=h.replace(/(<form id="contact-draft")/,WBADGE.replace('class="cro-warranty"','class="cro-warranty cro-warranty-light"')+'$1');return h;}
const strip=s=>s.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&');
function faq(h,rel,up){const list=FAQ[rel];if(!list)return h;
  const html=`<section class="cro-faq" data-cro="" aria-labelledby="cro-faq-title"><h2 id="cro-faq-title">Frequently asked questions</h2>${list.map(([q,a])=>`<details><summary>${q}</summary><p>${a.replace(/__CF__/g,rel==='contact/index.html'?'#contact-enquiry':up+'contact/#contact-enquiry')}</p>${q===PAY_Q?payRow(up,'cro-pay-icons cro-pay-faq'):''}</details>`).join('')}</section>`;
  const ld={'@context':'https://schema.org','@type':'FAQPage',mainEntity:list.map(([q,a])=>({'@type':'Question',name:strip(q),acceptedAnswer:{'@type':'Answer',text:strip(a)}}))};
  return h.replace(/(<section class="contact-options")/,html+'$1').replace(/<\/head>/,`<script type="application/ld+json" data-cro="">${JSON.stringify(ld).replace(/</g,'\\u003c')}</script>\n</head>`);}

// ---- 6. Supplier/retailer links in body copy become plain text (Google reviews, MLAA, social profiles, citations and legal links stay) ----
const OFFSITE=/^https?:\/\/(?:www\.)?(?:sentinelsafes\.com\.au|ajax\.systems|getic\.com|iotrend\.co\.za|locktonsecurity\.com|goldcoastsmartlocks\.com\.au|dormakaba\.com|lockweb\.com\.au)\//;
function offsite(h){return h.replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g,(m,href,inner)=>OFFSITE.test(href)?inner.replace(/<span class="sr-only"> \(opens in a new tab\)<\/span>/,''):m);}

// ---- 7. Every visible phone number is a tap-to-call link ----
const PHONE=/\(0([2378])\)\s?(\d{2}\s?\d{3}\s?\d{3}|\d{4}\s?\d{4})|\b0([2378])\s(\d{2}\s\d{3}\s\d{3}|\d{4}\s\d{4})\b/g;
function phones(h){const i=h.indexOf('<body'),j=h.lastIndexOf('</body>');if(i<0||j<0)return h;
  let skip=0,inA=0;const parts=h.slice(i,j).split(/(<[^>]+>)/);
  for(let k=0;k<parts.length;k++){const p=parts[k];
    if(p.startsWith('<')){const t=(p.match(/^<\/?([a-zA-Z0-9]+)/)||[])[1];if(!t)continue;const tl=t.toLowerCase(),close=p[1]==='/';
      if(tl==='a')inA+=close?-1:1;else if(['script','style','textarea','select','option','title','button','summary'].includes(tl))skip+=close?-1:1;continue;}
    if(inA>0||skip>0||!p)continue;
    parts[k]=p.replace(PHONE,(m,a1,b1,a2,b2)=>{const d=('0'+(a1||a2)+(b1||b2)).replace(/\D/g,'');return d.length===10?telA(m,'tel:+61'+d.slice(1)):m;});}
  return h.slice(0,i)+parts.join('')+h.slice(j);}

// ---- 1. Mobile sticky call / quote bar ----
function sticky(h,rel,up){const quote=rel==='contact/index.html'?'#contact-enquiry':`${up}contact/#contact-enquiry`;
  return h.replace(/<\/body>/,`<div class="mobile-cta" data-cro="" role="navigation" aria-label="Quick contact"><a class="mobile-cta-call" data-cro-tel="" href="${MAIN_TEL}"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>Call now</a><a class="mobile-cta-quote" href="${quote}">Free quote</a></div>\n<script data-cro="">(function(){var b=document.querySelector('.mobile-cta'),t=document.querySelectorAll('.contact-options,#contact-enquiry,footer');if(!b||!t.length||!window.IntersectionObserver)return;var on=new Set();var io=new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?on.add(e.target):on.delete(e.target);});b.classList.toggle('is-hidden',on.size>0);});t.forEach(function(el){io.observe(el);});})();</script>\n</body>`);}

// ---- 2. Quote form ----
const NEEDS=['Locksmith','Emergency lockout','Security system','Access control','CCTV','Alarm','Intercom','Door hardware','Other'];
function form(h,rel){if(rel!=='contact/index.html')return h;
  return h.replace(/(<form id="contact-draft"[^>]*>)([\s\S]*?)(<\/form>)/,(m,open,body,close)=>{
    const keep=(body.match(/^(?:<input type="hidden"[^>]*>)?(?:<input type="text" name="website"[^>]*>)?/)||[''])[0];
    const privacyLink=(body.match(/<a href="([^"]*privacy-policy[^"]*)"/)||[])[1]||'../privacy-policy/index.html';
    return open+keep+
     `<p class="full form-urgent" data-cro-form="">Locked out now? Call ${T}, it’s faster.</p>`+
     '<label>Name<input name="name" type="text" required="" autocomplete="name" autocapitalize="words" enterkeyhint="next"></label>'+
     '<label>Phone<input name="phone" type="tel" inputmode="tel" required="" autocomplete="tel" enterkeyhint="next"></label>'+
     '<label>Email<input name="email" type="email" required="" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" enterkeyhint="next"></label>'+
     `<label>What do you need?<select name="service" required=""><option value="">Please choose</option>${NEEDS.map(n=>`<option>${n}</option>`).join('')}</select></label>`+
     '<label class="full">How can we help?<textarea name="message" rows="5" required="" autocomplete="off" enterkeyhint="send"></textarea></label>'+
     '<button type="submit">Get my free quote</button><p class="full form-fixed" data-cro-form="">Fixed price quoted upfront, before we come out.</p><p class="full form-status" role="status" aria-live="polite"></p>'+
     `<p class="full form-privacy">We only use your details to respond to your enquiry. See our <a href="${privacyLink}">Privacy policy</a>.</p>`+close;});}

// ---- 8. Image cheap wins ----
const VARIANTS={'home-locksmiths.webp':['home-locksmiths-800.webp',1000,667],'home-security.webp':['home-security-800.webp',1400,1050],'home-retail-trade.webp':['home-retail-trade-800.webp',1400,933]};
function images(h){
  if(fs.existsSync(path.join(pub,'assets/imported/spl-black-lever-handle-fingerprint-reader-showroom-900.webp')))
    h=h.replace(/<img\b[^>]*spl-black-lever-handle-fingerprint-reader-showroom\.jpg[^>]*>/g,t=>t.replace('showroom.jpg','showroom-900.webp').replace('width="1536"','width="900"').replace('height="2048"','height="1200"'));
  h=h.replace(/<img\b(?![^>]*srcset)([^>]*?)src="([^"]*\/assets\/)(home-(?:locksmiths|security|retail-trade)\.webp)"([^>]*)>/g,(t,a,dir,file,b)=>{const v=VARIANTS[file];if(!v||!fs.existsSync(path.join(pub,'assets',v[0])))return t;
    return `<img${a}src="${dir}${file}" srcset="${dir}${v[0]} 800w, ${dir}${file} ${v[1]}w" sizes="(max-width: 760px) calc(100vw - 40px), min(960px, calc(100vw - 72px))" width="${v[1]}" height="${v[2]}"${b}>`;});
  return h;}

const CSS=`
.cro-tel{color:inherit;text-decoration:underline;text-underline-offset:3px}
.mobile-cta{display:none}
@media(max-width:760px){.mobile-cta{display:grid;grid-template-columns:1fr 1fr;position:fixed;left:0;right:0;bottom:0;z-index:60;background:#101010;border-top:1px solid #333;padding:8px 10px calc(8px + env(safe-area-inset-bottom));gap:8px;box-shadow:0 -6px 20px #0004}.mobile-cta a{display:flex;align-items:center;justify-content:center;gap:8px;min-height:46px;font:700 16px/1.1 Manrope,sans-serif;text-decoration:none;border-radius:6px}.mobile-cta-call{background:var(--yellow,#f7c600);color:#111}.mobile-cta-quote{background:#202020;color:#fff;border:1px solid #555}.mobile-cta.is-hidden{visibility:hidden}.mobile-cta a:focus-visible{outline:3px solid #fff;outline-offset:2px}body{padding-bottom:calc(64px + env(safe-area-inset-bottom))}html{scroll-padding-bottom:calc(72px + env(safe-area-inset-bottom))}}
@media print{.mobile-cta{display:none}}
.cro-projects{max-width:1200px;margin:0 auto;padding:28px max(5vw,24px)}.cro-projects a{display:inline-block;font-weight:700;color:#111;background:var(--yellow,#f7c600);padding:12px 18px;border-radius:6px;text-decoration:none}.cro-projects a::after{content:" ↗"}.cro-projects a:focus-visible{outline:3px solid #111;outline-offset:3px}
.cro-faq{max-width:1000px;margin:0 auto;padding:48px max(5vw,24px)}.cro-faq h2{font-size:clamp(26px,3vw,36px);margin:0 0 18px}.cro-faq details{border-top:1px solid #ddd;padding:4px 0}.cro-faq details:last-child{border-bottom:1px solid #ddd}.cro-faq summary{cursor:pointer;font-weight:700;padding:14px 28px 14px 0;position:relative;list-style:none}.cro-faq summary::-webkit-details-marker{display:none}.cro-faq summary::after{content:"+";position:absolute;right:4px;top:10px;font-size:22px;color:#725c00}.cro-faq details[open] summary::after{content:"−"}.cro-faq summary:focus-visible{outline:3px solid #725c00;outline-offset:2px}.cro-faq p{margin:0 0 16px;line-height:1.7}.cro-faq p a{color:#725a00;text-decoration:underline;text-underline-offset:3px}
.cro-pay-icons{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.cro-pay-icons img{display:block;width:48px;height:30px;border-radius:4px}.cro-pay-faq{margin:0 0 16px}
.cro-pay{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;margin:18px 0 0;padding-top:16px;border-top:1px solid #333;width:100%;flex-basis:100%;grid-column:1/-1}.cro-pay-label{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#bbb}
.cro-ls-cta{margin:4px 0 8px}.cro-ls-cta a,.editorial-content .cro-ls-cta a{display:inline-block;font-weight:700;color:#111;background:var(--yellow,#f7c600);padding:12px 18px;border-radius:6px;text-decoration:none}.cro-ls-cta a::after{content:" ↗"}.cro-ls-cta a:focus-visible{outline:3px solid #111;outline-offset:3px}
.cro-warranty{display:inline-flex;align-items:center;gap:10px;margin:22px 0 0;padding:10px 14px;border:1px solid #f7c600;border-radius:6px;color:#f7c600;font-weight:700;font-size:14px;line-height:1.3;max-width:100%}.cro-warranty span{color:#fff}.cro-warranty svg{flex:none}.contact-options-copy>p:nth-last-child(2){color:#bbb;font-size:14px;line-height:1.8;margin:0}
.cro-warranty-light{background:#111;margin:0 0 18px}.contact-draft .form-fixed{margin:-8px 0 0;font-size:14px;font-weight:600;color:#333}
.contact-draft .form-urgent{margin:0;padding:12px 16px;background:#fff8d6;border-left:4px solid var(--yellow,#f7c600);font-weight:600}.contact-draft .form-urgent a{color:#111}
`;
// No response-time claims (agreed brief).
function claims(h){return h.replace('Emergency locksmiths understand the urgency of your situation. Most services aim to reach you within 30 to 60 minutes, depending on your location.','Emergency locksmiths understand the urgency of your situation. When you call, ask how long it will take for a locksmith to reach your location.');}
// ---- Locksmith services: Key cutting + Smart & digital locks (copy from existing SPL pages only, Oct 2026) ----
const LS_SECTIONS=[['section-key-cutting','Key cutting',
 'Our locksmiths duplicate keys for homes and businesses, and our <a href="../auto-locksmith/index.html">auto locksmiths</a> cut new car keys and can reprogram electronic car keys (see <a href="../all-you-need-to-know-about-car-key-cutting/index.html">car key cutting</a> and <a href="../can-electronic-car-keys-be-reprogrammed/index.html">reprogramming electronic car keys</a>). For tighter control, a <a href="../restricted-keys/index.html">restricted key system</a> uses patent-protected keys that we only duplicate with a letter or order signed by one of your system’s signatories. If keys are lost, <a href="../blog/what-does-rekey-a-lock-mean/index.html">re-keying</a> changes the lock’s internals so the old keys no longer work.',
 'Get a free locksmith quote'],
 ['section-smart-digital-locks','Smart &amp; digital locks',
 'We supply smart locks such as the <a href="../products/cadell-52.html">Cadell 52</a>, an electronic lever lock with fingerprint, PIN, RFID, app and mechanical key access, and we can help match the lock and mortice option to your door. For businesses, <a href="../keyless-entry-systems-are-they-right-for-your-business/index.html">keyless entry</a> and <a href="../access-control-systems/index.html">access control</a> use cards, fobs, phone credentials or PIN codes, so access can be added or removed in software. If your digital lock’s battery dies, our <a href="../steps-to-take-when-your-digital-door-lock-battery-dies/index.html">battery guide</a> explains what to do, and our <a href="../how-to-choose-the-best-smart-home-security-system-for-your-needs/index.html">smart home security guide</a> and <a href="../door-hardware/index.html">door hardware</a> range can help you plan an upgrade.',
 'Ask about smart locks']];
function lsSections(h,rel){if(rel!=='locksmith-services/index.html')return h;
  h=h.replace(/<a href="#section-(?:key-cutting|smart-digital-locks)"[^>]*>[^<]*<\/a>/g,'');
  const html=`<section class="cro-ls" data-cro="">${LS_SECTIONS.map(([id,t,body,cta])=>`<div class="editorial-block"><h2 id="${id}">${t}</h2><p>${body}</p><p class="cro-ls-cta"><a href="../contact/#contact-enquiry">${cta}</a></p></div>`).join('')}</section>`;
  h=h.replace(/(<div class="editorial-block"> <h2 id="section-master-locksmith-services">)/,html+'$1');
  return h.replace(/(<a href="#section-master-locksmith-services">)/,LS_SECTIONS.map(([id,t])=>`<a href="#${id}">${t}</a>`).join('')+'$1');}
// ---- In-body service links that pointed at the page itself or the homepage (approved Oct 2026) ----
const LINKFIX={'locksmith-services/index.html':[['<a href="index.html">commercial locksmith</a>','<a href="../commercial-locksmith/index.html">commercial locksmith</a>'],['<a href="../index.html">restricted key systems</a>','<a href="../restricted-keys/index.html">restricted key systems</a>']],
 'door-hardware/index.html':[['<a href="../index.html">fire-rated hardware</a>','<a href="../fire-door-hardware/index.html">fire-rated hardware</a>']],
 'locksmiths/lock-hardware/index.html':[['<a href="../../locksmiths/lock-hardware/index.html">lock hardware</a>','lock hardware']]};
function linkFix(h,rel){for(const [a,b] of LINKFIX[rel]||[])h=h.split(a).join(b);return h;}
// ---- Contact prompts in body copy link to the enquiry form (Oct 2026). Skips links, menus, buttons, headings, forms, header/footer. ----
const CONTACT_PHRASE=/\b(contact us|contact our team|contact the team|contact SPL|get in touch|send us an enquiry|request a quote|ask our team)\b/gi;
const SKIP_TAGS=['a','script','style','textarea','select','option','title','button','summary','h1','h2','h3','h4','h5','h6','nav','header','footer','label','noscript','svg','form'];
function contactLinks(h,rel,up){const keep=[];h=h.replace(/<section class="(?:related-links|service-menu|contact-options|how-it-works)[\s\S]*?<\/section>|<p class="breadcrumbs[\s\S]*?<\/p>|<div class="(?:mobile-cta|page-directory|contextual-links)[\s\S]*?<\/div>/g,m=>{keep.push(m);return `\u0000${keep.length-1}\u0000`;});
  const out=contactLinks2(h,rel,up);return out.replace(/\u0000(\d+)\u0000/g,(m,n)=>keep[+n]);}
function contactLinks2(h,rel,up){const i=h.indexOf('<body'),j=h.lastIndexOf('</body>');if(i<0||j<0)return h;const href=rel==='contact/index.html'?'#contact-enquiry':up+'contact/#contact-enquiry';
  const parts=h.slice(i,j).split(/(<[^>]+>)/);const depth={};let skip=0;
  for(let k=0;k<parts.length;k++){const p=parts[k];
    if(p.startsWith('<')){const t=((p.match(/^<\/?([a-zA-Z0-9]+)/)||[])[1]||'').toLowerCase();if(!SKIP_TAGS.includes(t)||p.endsWith('/>'))continue;if(p[1]==='/'){if(depth[t]>0){depth[t]--;skip--;}}else{depth[t]=(depth[t]||0)+1;skip++;}continue;}
    if(skip>0||!p.trim())continue;
    parts[k]=p.replace(CONTACT_PHRASE,m=>`<a class="cro-contact-link" data-cro-cf="" href="${href}">${m}</a>`);}
  return h.slice(0,i)+parts.join('')+h.slice(j);}
// 'Explore more' lists: the plain-text contact item becomes a link to the enquiry form (Oct 2026).
function relatedContact(h,up){return h.replace(/(<section class="related-links">[\s\S]*?)<span>Contact SPL Security Solutions <span aria-hidden="true">↗<\/span><\/span>/g,`$1<a href="${up}contact/#contact-enquiry">Contact SPL Security Solutions <span aria-hidden="true">↗</span></a>`);}
module.exports={relatedContact,contactLinks,commercialFaq,warranty,linkFix,lsSections,writeIcons,footerPay,claims,kind,buttons,projects,faq,offsite,phones,sticky,form,images,CSS,FAQ};
