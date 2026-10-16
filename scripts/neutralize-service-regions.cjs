// Service pages cover every SPL region (Gold Coast, Brisbane, Northern NSW; showrooms in Bundall and Ballina),
// so their names, headings, link labels and meta must not be framed as Gold Coast-only.
// Regional landing pages (locations/, */brisbane, */gold-coast, etc.) are left alone. Idempotent; run after optimize-seo.
require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
const out=path.join(path.resolve(__dirname,'..'),'public');
const R='Gold Coast, Brisbane & Northern NSW',RW='the Gold Coast, Brisbane and Northern NSW';
// Neutral service names (old label/H1 -> new), used for H1s, breadcrumbs, schema names and Explore more labels.
const names={'Safes on the Gold Coast':'Safes','24/7 Mobile Locksmiths Gold Coast':'24/7 Mobile Locksmiths','Door Hardware Gold Coast':'Door Hardware','Lever Door Handles on the Gold Coast':'Lever Door Handles','Door Closers & Seals Gold Coast':'Door Closers & Seals','Fire Door Hardware on the Gold Coast':'Fire Door Hardware','Trade & Retail Gold Coast':'Trade & Retail','24/7 Mobile Locksmiths':'24/7 Auto Locksmiths','24/7 Mobile Auto Locksmiths':'24/7 Auto Locksmiths'};
// Link-label-only renames (anchor text exactly equal), no H1 swap.
const labelOnly={'Auto Locksmiths':'24/7 Auto Locksmiths','Automotive':'24/7 Automotive'};
// Per-page meta: title and description (SEO area terms kept, but the whole region named).
const pages={
 'locksmith-services':{title:'Locksmith Services | SPL Security Solutions',description:`Searching for a reliable locksmith across ${RW}? We provide 24/7 mobile services and more. Call SPL on (07) 55 888 111.`},
 'locksmiths':{title:'Locksmith Services | SPL Security Solutions',description:`Searching for a reliable locksmith across ${RW}? We provide 24/7 mobile services and more. Call SPL on (07) 55 888 111.`},
 'residential-locksmith':{title:'Residential Locksmiths | SPL Security Solutions',description:`Need a residential locksmith across ${RW}? Lock repair, key duplication, rekeying and more. Call SPL on (07) 55 888 111.`},
 'commercial-locksmith':{title:'Commercial Locksmiths | SPL Security Solutions',description:`Looking for a commercial locksmith across ${RW}? We install locks, master key systems and more. Call SPL on (07) 55 888 111.`},
 'auto-locksmith':{title:'24/7 Auto Locksmiths | Mobile Car Keys | SPL',description:`24/7 mobile auto locksmiths across ${RW}: car lockouts, jammed ignitions, car and transponder keys. Call (07) 55 888 111.`},
 'emergency-locksmith':{title:'24/7 Emergency Locksmiths | SPL Security Solutions',description:`24/7 emergency locksmiths for homes, businesses and vehicles across ${RW}: lockouts and break-ins. Call (07) 55 888 111.`},
 'restricted-keys':{title:'Restricted Keys | SPL Security Solutions',description:`After a restricted key system across ${RW}? We offer patented designs for high-end security. Call SPL on (07) 55 888 111.`},
 'locksmiths/24-7-mobile':{title:'24/7 Mobile Auto Locksmiths | SPL Security Solutions',description:`Locked out of your car or need a car key? SPL's mobile auto locksmiths come to you 24/7 across ${RW}. Call (07) 55 888 111.`},
 'locksmiths/lock-hardware':{title:'Lock Hardware & Door Hardware | SPL Security Solutions',description:'Add the finishing touches to your doors, bathrooms and kitchens with the best in door and lock hardware on display in our Bundall and Ballina showrooms.'},
 'safe':{title:'Safes | SPL Security Solutions',description:`Need safe services across ${RW}? We deliver, install, repair and reopen a variety of safes. Call SPL on (07) 55 888 111.`},
 'door-hardware':{title:'Door Hardware | SPL Security Solutions',description:'Add the finishing touches to your doors, bathrooms and kitchens with the very best in door hardware, on display in our Bundall and Ballina showrooms.'},
 'architectural-door-hardware':{title:'Architectural Door Hardware | SPL Security Solutions',description:'Choose from an extensive range of high-quality architectural door hardware at SPL Security Solutions. Visit our Bundall or Ballina showroom.'},
 'door-handles':{title:'Door Handles & Levers | SPL Security Solutions',description:'Security door levers and handles for homes and businesses, on display at our Bundall (Gold Coast) and Ballina showrooms. Call SPL on (07) 55 888 111.'},
 'door-closers':{title:'Door Closers & Seals | SPL Security Solutions',description:`Need reliable closers and seals across ${RW}? Overhead closers, acoustic seals and more. Call SPL on (07) 55 888 111.`},
 'fire-door-hardware':{title:'Fire Door Hardware | SPL Security Solutions',description:`Need new fire door hardware across ${RW}? Ensure safety with compliant components. Call SPL on (07) 55 888 111.`},
 'retail-security':{title:'Retail & Trade Security | SPL Security Solutions',description:`Door hardware, locks, safes and security for trade and retail customers across ${RW}. Call SPL on (07) 55 888 111.`},
 'security-systems':{title:'Security Systems | SPL Security Solutions',description:`Need an integrated security system across ${RW}? CCTV, alarms, intercoms and more. Call SPL on (07) 55 888 111.`},
 'alarm-system':{title:'Alarm Systems | SPL Security Solutions',description:`Need a reliable alarm system across ${RW}? Installation, maintenance and 24/7 monitoring. Call SPL on (07) 55 888 111.`},
 'alarm-systems0197b34d':{title:'Alarm Systems | SPL Security Solutions',description:`Need a reliable alarm system across ${RW}? Installation, maintenance and 24/7 monitoring. Call SPL on (07) 55 888 111.`},
 'alarm-monitoring':{title:'Alarm Monitoring & Maintenance | SPL Security Solutions',description:`Looking for security system maintenance across ${RW}? We keep your systems operational. Call SPL on (07) 55 888 111.`},
 'cctv-system':{title:'CCTV & Security Cameras | SPL Security Solutions',description:`CCTV and security camera systems for homes and businesses across ${RW}. Call SPL on (07) 55 888 111.`},
 'access-control':{title:'Access Control Systems | SPL Security Solutions',description:`Need access control across ${RW}? We offer keyless entry, electronic locks and more. Call SPL on (07) 55 888 111.`},
 'access-control-systems':{title:'Access Control Systems | SPL Security Solutions',description:`Need access control across ${RW}? We offer keyless entry, electronic locks and more. Call SPL on (07) 55 888 111.`},
 'intercom':{title:'Intercom Systems | SPL Security Solutions',description:`Need an intercom across ${RW}? Enhance your security with voice and video intercom solutions. Call SPL on (07) 55 888 111.`},
};
// Body-copy fixes (page -> [from, to]); genuine facts (Bundall address, "Based on the Gold Coast", etc.) are not touched.
const body={
 'locksmiths/24-7-mobile':[['24 Hour Mobile Locksmiths Gold Coast &amp; Surrounds','24 Hour Mobile Locksmiths'],['24 Hour Mobile Locksmiths Gold Coast & Surrounds','24 Hour Mobile Locksmiths'],['Gold Coast Emergency Locksmith Services','Emergency Locksmith Services'],['throughout Gold Coast &amp; surrounding areas',`throughout ${RW} and surrounding areas`],['home and business locksmith services across the Gold Coast.',`home and business locksmith services across ${RW}.`],
  ['<p>Here at SPL Security Solutions, we provide our customers with professional mobile locksmith service 24 hours a day. From emergency entry to replacement key cutting, we are the experts. Our fully equipped vans provide all locksmith services to residential or commercial buildings throughout\n<a href="../../locations/index.html#gold-coast">Gold Coast</a> &amp; surrounding areas</p>',`<p>Here at SPL Security Solutions, we provide professional mobile locksmith service 24 hours a day, and our fully equipped vans come to you. Locked out of your car, stuck with a jammed ignition, or need a car key cut or a transponder key? Our mobile auto locksmiths can help across ${RW}. For homes and businesses, see our <a href="../../emergency-locksmith/index.html">24/7 emergency locksmiths</a>.</p>`],
  ['<p>Here at SPL Security Solutions, we provide our customers with professional mobile locksmith service 24 hours a day.</p></section>','<p>Our mobile auto locksmiths come to your vehicle 24 hours a day, from opening a locked car and freeing jammed ignitions to car key cutting and transponder keys.</p></section>']],

 'locksmith-services':[["<section class=\"service-menu-description\"><div class=\"editorial-block\"> <h2 id=\"section-24-7-mobile-locksmith\">24/7 Mobile Locksmiths</h2>\n</div><div class=\"editorial-block\"><p>Our\n<a href=\"../locksmiths/24-7-mobile/index.html\">24/7 mobile locksmith</a> services are designed to provide fast and reliable assistance whenever you need it. Whether you’re locked out of your property, require urgent repairs or need a security upgrade, our mobile team comes fully equipped to handle the job.<br><br></p></div></section>", ""], ["<a href=\"#section-24-7-mobile-locksmith\">24/7 Mobile Auto Locksmiths</a>", ""], ["and providing emergency lockout services.<br><br></p>", "and providing emergency lockout services. Our mobile auto locksmiths are available 24/7.<br><br></p>"]],
 'locksmiths':[["<section class=\"service-menu-description\"><div class=\"editorial-block\"> <h2 id=\"section-24-7-mobile-locksmith\">24/7 Mobile Locksmiths</h2>\n</div><div class=\"editorial-block\"><p>Our\n<a href=\"../locksmiths/24-7-mobile/index.html\">24/7 mobile locksmith</a> services are designed to provide fast and reliable assistance whenever you need it. Whether you’re locked out of your property, require urgent repairs or need a security upgrade, our mobile team comes fully equipped to handle the job.<br><br></p></div></section>", ""], ["<a href=\"#section-24-7-mobile-locksmith\">24/7 Mobile Auto Locksmiths</a>", ""], ["and providing emergency lockout services.<br><br></p>", "and providing emergency lockout services. Our mobile auto locksmiths are available 24/7.<br><br></p>"]],
 'auto-locksmith-h1':[],
 // /locksmiths/24-7-mobile/ is merged into /auto-locksmith/ (redirect via seo.config.json regionalRedirects).
 'auto-locksmith':[['<p>At SPL Security Solutions, we understand how disruptive it can be to lose or damage your car keys.</p></section>','<p>Our mobile auto locksmiths are available 24/7 for car lockouts and jammed ignitions, and we cut and program car and transponder keys at our Bundall workshop.</p></section>'],
  ['<a href="#section-fast-efficient-key-replacement">','<a href="#section-24-7-mobile-auto-locksmiths">Mobile Auto Locksmiths, 24/7</a><a href="#section-fast-efficient-key-replacement">'],
  ['<div class="editorial-block"> <h2 id="section-fast-efficient-key-replacement">',`<div class="editorial-block"><h2 id="section-24-7-mobile-auto-locksmiths">Mobile Auto Locksmiths, 24/7</h2>\n<p>Our mobile locksmith service runs 24 hours a day, and our fully equipped vans come to you across ${RW}. If you're locked out of your car, have a jammed ignition or need a car key cut, call (07) 55 888 111.</p><ul><li>Opening a locked vehicle when you're locked out of your car</li><li>Jammed ignitions</li><li>Car key cutting, spare keys and broken keys</li><li>Transponder keys</li></ul><p>For homes and businesses, see our <a href="../emergency-locksmith/index.html">24/7 emergency locksmiths</a>.</p></div>\n<div class="editorial-block"> <h2 id="section-fast-efficient-key-replacement">`]],
 'locksmiths/lock-hardware':[['>Lock Hardware Gold Coast<','>Designer Door &amp; Lock Hardware<'],['"Lock Hardware Gold Coast"','"Designer Door & Lock Hardware"'],['section-lock-hardware-gold-coast','section-designer-door-lock-hardware']],
 'alarm-system':[['for homes and businesses on the Gold Coast for many reasons',`for homes and businesses across ${RW} for many reasons`],['for your Gold Coast home or business','for your home or business']],
 'alarm-systems0197b34d':[['for homes and businesses on the Gold Coast for many reasons',`for homes and businesses across ${RW} for many reasons`],['for your Gold Coast home or business','for your home or business']],
 'alarm-monitoring':[['across the Gold Coast, Brisbane and Tweed Heads',`across ${RW}`]],
 'commercial-locksmith':[[`services throughout the\n<a href="../locations/index.html">Gold Coast locksmith</a>,\n<a href="../locations/index.html">Brisbane commercial locksmith</a> and Northern NSW.`,`services throughout <a href="../locations/index.html">${RW}</a>.`]],
};
// Explore-more entries that point back at the locksmith overview itself.
const selfLinks={'locksmith-services':'index.html','locksmiths':'../locksmith-services/index.html'};
// Overview pages: Explore more lists only that section's own sub-pages, in main-menu order (paths from public/).
const sectionLinks={
 'retail-security':[['door-handles','Lever Door Handles'],['door-closers','Door Closers &amp; Seals'],['fire-door-hardware','Fire Door Hardware'],['locksmiths/lock-hardware','Lock Hardware'],['safe','Safes']],
 'locksmith-services':[['commercial-locksmith','Commercial Locksmiths'],['auto-locksmith','24/7 Auto Locksmiths'],['residential-locksmith','Residential Locksmiths'],['restricted-keys','Restricted Key Systems'],['emergency-locksmith','Emergency Locksmiths']],
 'security-systems':[['cctv-system','Security Cameras &amp; CCTV'],['access-control-systems','Access Control Systems'],['intercom','Intercom Systems'],['alarm-system','Alarm Systems'],['alarm-monitoring','Security System Maintenance']],
 'door-hardware':[['architectural-door-hardware','Architectural Door Hardware'],['door-handles','Lever Door Handles'],['door-closers','Door Closers &amp; Seals'],['fire-door-hardware','Fire Door Hardware'],['locksmiths/lock-hardware','Lock Hardware']]};
sectionLinks.locksmiths=sectionLinks['locksmith-services'];
// Contextual links to otherwise-orphaned product pages and articles (one short paragraph before Explore more).
const contextual={
 'alarm-system':'<p>Looking for a starting point? See the <a href="../products/ajax-starterkit.html">Ajax StarterKit</a>, a wireless alarm kit that can be expanded as your property changes.</p>',
 'safe':'<p>Browse the <a href="../products/timeless-safes.html">Sentinel Timeless safes</a> in our range.</p>',
 'residential-locksmith':'<p>Considering keyless entry for your home? See the <a href="../products/cadell-52.html">Cadell 52 smart digital lock</a>.</p>',
 'locksmiths/lock-hardware':'<p>Upgrading to keyless entry? See the <a href="../../products/cadell-52.html">Cadell 52 smart digital lock</a>.</p>',
 'cctv-system':'<p>Related reading: <a href="../blog/security-cameras-do-more-than-security/index.html">Security cameras do more than security</a>.</p>'};
// Descriptive alt text for imported images that only had a generic '<Page> — SPL Security Solutions' alt.
const altText={"63c599caf440f2d0c832.jpg": "SPL Security Solutions van parked by the beach", "18508613c64164a9a2e8.jpg": "Technician fitting a lever handle and lock to a door", "7a90cac60b11173abe01.jpg": "Monitoring operator wearing a headset at a computer workstation", "75bc03b779049fe8482a.jpg": "Technician adjusting a wall-mounted bullet security camera", "c7fd6e3f017e82a9d83e.jpg": "Wireless motion sensor with built-in camera mounted on a pillar in an office", "88f3036fddd8af2ac36b.jpg": "Wireless motion detector mounted on a wall", "ec3a6472e38cc5702eee.jpg": "Wireless door contact sensor fitted to a glass door", "c8864cee60c3cb542d5b.webp": "Cutaway illustration of a house fitted with wireless alarm sensors", "34a1ca427c077c1d3ef2.webp": "Ajax security devices, including a hub, keypad, camera and sensors", "8b24c01d4d30a07ec6a8.jpg": "Display wall of architectural door levers and pull handles", "306aa4bc0a4c4b19cd1e.jpg": "Brushed steel commercial door lever on a display stand", "46c4d5838d7efbee92bc.jpg": "Operator with a headset reviewing maps and data on a curved monitor", "2f7350ed775a084d5837.jpg": "Car key fob in a vehicle ignition", "e7836b4328aa87eaa705.jpeg": "SPL technician in hi-vis workwear sitting in the back of a service van", "00cbcfee22ec01b0e6a3.jpg": "Ceiling dome camera with live footage viewed on a smartphone", "067d353c75e99d65b16b.jpg": "Multi-storey commercial office building", "41d9c3b90243b98debb8.jpg": "Security plans on a desk with a camera, sensors and drawing tools", "ed27b53ee36d2e604ed4.jpg": "Double fire exit doors with push bars and an exit sign", "f21f1426bbfd2fd85d8c.jpg": "Overhead door closer fitted to a timber door", "7afcb1a0300b37128b61.jpg": "Technician using a screwdriver on a door lever lock", "8e3fb6a2e80efc2d9067.jpg": "SPL 24-hour locksmith van parked in a driveway", "ead1dacee881e68b47d8.jpg": "Locksmith servicing a mortice lock on a glass door", "00690d9d3f442fbcdfd2.jpeg": "SPL technician working on a mortice lock body", "cc75221cd73f80268db5.jpg": "Showroom display wall of door levers and handles", "33ae1faf93cc7dffb0b4.jpeg": "SPL technician installing a ceiling-mounted security device", "892205986bc01ef1d2e3.jpg": "Smiling SPL team member wearing a headset at a desk", "88d38623d61d9a7cc600.jpg": "SPL technician standing beside an SPL van in a park", "8f7093aacce2602ecf0b.jpg": "Technician using a cordless drill to install a door lock", "f013c5dbf9b8d60c2d92.jpg": "Set of keys on a ring with an SPL-branded key", "977b56adf0add41ba981.jpg": "Keys on a red key ring in a lock", "83bec79f52a8db9ef23a.jpg": "Rows of key blanks on a key-cutting display", "f08bf671e86ae96d9448.jpg": "SPL showroom shopfront with the slogan Be secure in our knowledge"};
// Explore-more entries removed on request (page -> hrefs); applied on every rebuild.
// Ballina showroom: one factual line in each service page's At a glance box, and the #ballina LocalBusiness as a Service provider.
const ballinaLine={};
for(const k of ['locksmith-services','locksmiths','residential-locksmith','commercial-locksmith','auto-locksmith','emergency-locksmith','restricted-keys'])ballinaLine[k]='Northern NSW is serviced from our Ballina showroom.';
for(const k of ['door-hardware','architectural-door-hardware','door-handles','door-closers','fire-door-hardware','locksmiths/lock-hardware','safe','retail-security'])ballinaLine[k]='Retail and trade customers can buy over the counter at our Bundall (Gold Coast) and Ballina showrooms.';
for(const k of ['security-systems','alarm-system','alarm-systems0197b34d','alarm-monitoring','cctv-system','access-control','access-control-systems','intercom'])ballinaLine[k]='We work across the Gold Coast, Brisbane and Northern NSW from our Bundall (Gold Coast) and Ballina showrooms.';
const addLinks={'emergency-locksmith':[['../auto-locksmith/index.html','24/7 Auto Locksmiths']]};
const dropLinks={'security-systems':['../retail-security/index.html']};
// Length limits for every page (titles <= 60, descriptions <= 160). Long article titles get hand-written short forms.
const titleOverrides={
 'index.html':'SPL Security | Locksmiths, Security Systems & Door Hardware',
 '5-signs-your-business-needs-a-commercial-locksmith-upgrade':'5 Signs You Need a Commercial Locksmith Upgrade | SPL',
 'blog/3-reasons-to-install-a-cctv-security-camera-at-your-home-or-business':'3 Reasons to Install CCTV at Home or Work | SPL Security',
 'blog/smart-home-security-systems-which-is-best-for-you':'Smart Home Security Systems: Which Is Best? | SPL',
 'blog/wired-vs-wireless-security-cameras':'Wired vs Wireless Security Cameras | SPL Security',
 'common-mistakes-people-make-when-searching-for-a-locksmith':'Common Mistakes When Searching for a Locksmith | SPL',
 'do-you-need-a-new-key-when-replacing-an-ignition-switch':'New Key When Replacing an Ignition Switch? | SPL',
 'home-security-for-renters-5-practical-solutions-for-non-permanent-living-spaces':'Home Security for Renters: 5 Practical Solutions | SPL',
 'how-on-site-security-support-reduces-stress-in-urgent-situations':'How On-Site Security Support Reduces Stress | SPL',
 'how-to-choose-the-best-smart-home-security-system-for-your-needs':'How to Choose a Smart Home Security System | SPL',
 'keyless-entry-systems-are-they-right-for-your-business':'Keyless Entry: Is It Right for Your Business? | SPL',
 'locksmith-insights-commercial-security-systems-for-2024':'Commercial Security Systems for 2024 | SPL Security',
 'the-benefits-of-using-mobile-locksmiths-for-emergency-situations':'Benefits of Mobile Locksmiths in Emergencies | SPL',
 'the-importance-of-long-term-security-planning-in-brisbane':'Long-Term Security Planning in Brisbane | SPL Security',
 'the-importance-of-professional-lock-installation-for-your-home-or-business':'Why Professional Lock Installation Matters | SPL',
 'what-sets-a-master-locksmith-apart-from-a-standard-locksmith':'Master Locksmith vs Standard Locksmith | SPL Security',
 'when-should-you-consider-changing-the-locks-after-buying-a-new-house':'Changing the Locks After Buying a House | SPL Security',
 'why-brisbane-businesses-need-a-professional-commercial-locksmith':'Why Brisbane Businesses Need a Commercial Locksmith | SPL',
 'why-every-business-needs-a-trusted-commercial-locksmith':'Why Businesses Need a Trusted Commercial Locksmith | SPL',
 'why-gold-coast-businesses-need-a-professional-commercial-locksmith':'Why Gold Coast Businesses Need a Commercial Locksmith | SPL',
 'why-quick-response-times-are-critical-for-emergency-locksmith-services':'Why Fast Response Matters for Emergency Locksmiths | SPL'};
const descOverrides={'index.html':'Locksmiths, security systems, door hardware and retail/trade advice across the Gold Coast, Brisbane and Northern NSW. Call SPL on (07) 55 888 111.'};
function fitTitle(key,t){if(titleOverrides[key])return titleOverrides[key];if(t.length<=60)return t;const b=t.replace(/\s*\|\s*SPL Security Solutions$/,'');for(const sfx of [' | SPL Security',' | SPL'])if((b+sfx).length<=60)return b+sfx;throw Error('Title too long, add an override: '+key+' '+t);}
function fitDesc(key,d,h1){if(descOverrides[key])return descOverrides[key];if(d.length<=160)return d;let x=d.replace(/…$/,'');if(h1&&x.startsWith(h1+' '))x=x.slice(h1.length+1);if(x.length<=159)return d.endsWith('…')?x+'…':x;x=x.slice(0,158);return x.slice(0,x.lastIndexOf(' ')).replace(/[\s,;:–-]+$/,'')+'…';}
const escA=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;'),escT=s=>s.replaceAll('&','&amp;');
function walk(d,a=[]){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f,a);else if(e.name.endsWith('.html'))a.push(f);}return a;}
const regional=rel=>/^(locations\/|locksmiths\/(brisbane|paradise)|security-systems\/(brisbane|intercoms|cctv-systems))/.test(rel)||rel==='404.html';
let changed=0;
module.exports=function run(){
for(const file of walk(out)){
 const rel=path.relative(out,file).replaceAll('\\','/');
 if(rel==='locations/index.html'){const h=fs.readFileSync(file,'utf8'),n=h.replace('<h3 id="ballina">SPL Security Ballina</h3>','<h3 id="ballina">SPL Security Ballina, Locksmith &amp; Security, Northern NSW</h3>');if(n!==h){fs.writeFileSync(file,n);changed++;}}
 if(rel.startsWith('locations/'))continue;
 const key=rel.replace(/\/index\.html$/,'');let html=fs.readFileSync(file,'utf8');const before=html;
 const swapAll=(a,b)=>{if(!a||a===b)return;for(const [x,y] of [[a,b],[escT(a),escT(b)],[escA(a),escA(b)],[JSON.stringify(a).slice(1,-1),JSON.stringify(b).slice(1,-1)]])html=html.split(x).join(y);};
 if(pages[key]){const $=load(html);swapAll($('head>title').text(),pages[key].title);swapAll($('meta[name="description"]').attr('content'),pages[key].description);}
 {const $=load(html);const t=$('head>title').text(),d=$('meta[name="description"]').attr('content');if(t&&!/http-equiv="refresh"/.test(html)){swapAll(t,fitTitle(key,t));if(d)swapAll(d,fitDesc(key,d,$('h1').first().text().trim()));}}
 for(const [from,to]of body[key]||[])if(!(to&&html.includes(to)&&to.includes(from)))html=html.split(from).join(to);
 if(key==='auto-locksmith'){html=html.replace('<h1>Auto Locksmiths</h1>','<h1>24/7 Auto Locksmiths</h1>').replace('/ Auto Locksmiths</','/ 24/7 Auto Locksmiths</').replaceAll('"name":"Auto Locksmiths"','"name":"24/7 Auto Locksmiths"');}
 for(const [a,b]of Object.entries(labelOnly))html=html.replace(new RegExp('(<a [^>]*>)'+a.replace(/[/]/g,'\\/')+'(\\s*<span aria-hidden="true">↗</span>)?</a>','g'),(m,o,sp)=>o+b+(sp||'')+'</a>');
 {const $=load(html);const seen=new Set();let d=false;$('.related-links > a').each((i,e)=>{const h=$(e).attr('href');if(seen.has(h)){$(e).remove();d=true;}seen.add(h);});if(d)html=$.html();}
 {
  for(const [a,b]of Object.entries(names)){
   // link labels anywhere, plus H1/breadcrumb/schema on the page itself
   html=html.replace(new RegExp('(<a [^>]*>)\\s*'+escT(a).replace(/[.*+?^${}()|[\]\\/]/g,'\\$&')+'(\\s*<span aria-hidden="true">↗</span>)?</a>','g'),(m,o,s)=>o+escT(b)+(s||'')+'</a>');
   if(!regional(rel)){const $=load(html);if($('h1').first().text().trim()===a)swapAll(a,b);}
  }
 }
 if(sectionLinks[key]){const $=load(html),sec=$('.related-links').first();if(sec.length){const up='../'.repeat(key.split('/').length);const want=sectionLinks[key].map(([p,l])=>`<a href="${up}${p}/index.html">${l} <span aria-hidden="true">↗</span></a>`).join('');sec.find('a').remove();sec.append(want);if($.html()!==load(html).html())html=$.html();}}
 if(contextual[key]&&!html.includes('class="editorial-block related-product"')){const $=load(html),rl=$('.related-links').first();const blk=`<div class="editorial-block related-product">${contextual[key]}</div>\n`;if(rl.length)rl.before(blk);else $('.editorial-content').append(blk);html=$.html();}
 {let n=0;html=html.replace(/<img\b[^>]*>/g,tag=>{const src=(tag.match(/\bsrc="([^"]*)"/)||[])[1]||'',alt=(tag.match(/\balt="([^"]*)"/)||[])[1];const f=src.split('/').pop().split('?')[0];if(altText[f]&&alt!==undefined&&/ — SPL Security Solutions$/.test(alt)){n++;return tag.replace(/\balt="[^"]*"/,'alt="'+altText[f].replaceAll('&','&amp;').replaceAll('"','&quot;')+'"');}return tag;});}
 if(ballinaLine[key]){const $=load(html),p=$('.answer-summary p').not('.kicker').first();let ch=false;if(p.length&&!p.html().includes('ballina/index.html')){const up='../'.repeat(key.split('/').length),line=ballinaLine[key];p.html(p.html().replace(' '+line,'')+' '+line.replace(/Ballina(?= showroom)/,m=>`<a href="${up}ballina/index.html">${m}</a>`));ch=true;}
  const sc=$('script[data-seo-schema]').first();if(sc.length){const j=JSON.parse(sc.text());for(const n of j['@graph']||[])if(n['@type']==='Service'&&!JSON.stringify(n.provider).includes('#ballina')){n.provider=[{'@id':require('../seo.config.json').businessUrl.replace(/\/$/,'')+'/#business'},{'@id':require('../seo.config.json').businessUrl.replace(/\/$/,'')+'/#ballina'}];ch=true;sc.text(JSON.stringify(j).replaceAll('<','\\u003c'));}}
  if(ch)html=$.html();}
 if(addLinks[key]){const $=load(html),sec=$('.related-links').first();let ch=false;for(const [h,l] of addLinks[key])if(sec.length&&!sec.find(`a[href="${h}"]`).length){const reg=sec.children('.related-regions');const a=`<a href="${h}">${l} <span aria-hidden="true">↗</span></a>`;if(reg.length)reg.before(a);else sec.append(a);ch=true;}if(ch)html=$.html();}
 if(dropLinks[key]){const $=load(html);const hit=$('.related-links a').filter((i,e)=>dropLinks[key].includes($(e).attr('href')));if(hit.length){hit.remove();html=$.html();}}
 if(selfLinks[key]){const $=load(html);$('.related-links a').filter((i,e)=>$(e).attr('href')===selfLinks[key]).remove();if($.html()!==load(html).html())html=$.html();}
 if(html!==before){fs.writeFileSync(file,html);changed++;}
}
return changed;};
if(require.main===module)console.log(JSON.stringify({filesChanged:module.exports()}));
