// Service pages cover every SPL region (Gold Coast, Brisbane, Northern NSW; showrooms in Bundall and Ballina),
// so their names, headings, link labels and meta must not be framed as Gold Coast-only.
// Regional landing pages (locations/, */brisbane, */gold-coast, etc.) are left alone. Idempotent; run after optimize-seo.
require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
const out=path.join(path.resolve(__dirname,'..'),'public');
const R='Gold Coast, Brisbane & Northern NSW',RW='the Gold Coast, Brisbane and Northern NSW';
// Neutral service names (old label/H1 -> new), used for H1s, breadcrumbs, schema names and Explore more labels.
const names={'Safes on the Gold Coast':'Safes','24/7 Mobile Locksmiths Gold Coast':'24/7 Mobile Locksmiths','Door Hardware Gold Coast':'Door Hardware','Lever Door Handles on the Gold Coast':'Lever Door Handles','Door Closers & Seals Gold Coast':'Door Closers & Seals','Fire Door Hardware on the Gold Coast':'Fire Door Hardware','Trade & Retail Gold Coast':'Trade & Retail'};
// Per-page meta: title and description (SEO area terms kept, but the whole region named).
const pages={
 'locksmith-services':{title:'Locksmith Services | SPL Security Solutions',description:`Searching for a reliable locksmith across ${RW}? We provide 24/7 mobile services and more. Call SPL on (07) 55 888 111.`},
 'locksmiths':{title:'Locksmith Services | SPL Security Solutions',description:`Searching for a reliable locksmith across ${RW}? We provide 24/7 mobile services and more. Call SPL on (07) 55 888 111.`},
 'residential-locksmith':{title:'Residential Locksmiths | SPL Security Solutions',description:`Need a residential locksmith across ${RW}? Lock repair, key duplication, rekeying and more. Call SPL on (07) 55 888 111.`},
 'commercial-locksmith':{title:'Commercial Locksmiths | SPL Security Solutions',description:`Looking for a commercial locksmith across ${RW}? We install locks, master key systems and more. Call SPL on (07) 55 888 111.`},
 'auto-locksmith':{title:'Auto Locksmiths | SPL Security Solutions',description:`Need an auto locksmith across ${RW}? Key replacement, re-entry or broken key extraction. Call SPL on (07) 55 888 111.`},
 'emergency-locksmith':{title:'Emergency Locksmiths | SPL Security Solutions',description:`Need immediate help across ${RW}? Our emergency locksmith services are available 24/7. Call SPL on (07) 55 888 111.`},
 'restricted-keys':{title:'Restricted Keys | SPL Security Solutions',description:`After a restricted key system across ${RW}? We offer patented designs for high-end security. Call SPL on (07) 55 888 111.`},
 'locksmiths/24-7-mobile':{title:'24/7 Mobile & Emergency Locksmiths | SPL Security Solutions',description:`SPL provides mobile locksmith services 24 hours a day across ${RW}. Call (07) 55 888 111.`},
 'locksmiths/lock-hardware':{title:'Lock Hardware & Door Hardware | SPL Security Solutions',description:'Add the finishing touches to your doors, bathrooms and kitchens with the best in door and lock hardware on display in our Bundall and Ballina showrooms.'},
 'safe':{title:'Safes | SPL Security Solutions',description:`Need safe services across ${RW}? We deliver, install, repair and reopen a variety of safes. Call SPL on (07) 55 888 111.`},
 'door-hardware':{title:'Door Hardware | SPL Security Solutions',description:'Add the finishing touches to your doors, bathrooms and kitchens with the very best in door hardware, on display in our Bundall and Ballina showrooms.'},
 'architectural-door-hardware':{title:'Architectural Door Hardware | SPL Security Solutions',description:'Choose from an extensive range of high-quality architectural door hardware at SPL Security Solutions. Visit our Bundall or Ballina showroom.'},
 'door-handles':{title:'Door Handles & Levers | SPL Security Solutions',description:'Need security door levers for your home or business? We offer a selection of types and styles. Call SPL on (07) 55 888 111.'},
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
 'locksmiths/24-7-mobile':[['24 Hour Mobile Locksmiths Gold Coast &amp; Surrounds','24 Hour Mobile Locksmiths'],['24 Hour Mobile Locksmiths Gold Coast & Surrounds','24 Hour Mobile Locksmiths'],['Gold Coast Emergency Locksmith Services','Emergency Locksmith Services'],['throughout Gold Coast &amp; surrounding areas',`throughout ${RW} and surrounding areas`],['home and business locksmith services across the Gold Coast.',`home and business locksmith services across ${RW}.`]],
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
 'locksmith-services':[['commercial-locksmith','Commercial Locksmiths'],['auto-locksmith','Auto Locksmiths'],['residential-locksmith','Residential Locksmiths'],['restricted-keys','Restricted Key Systems'],['emergency-locksmith','Emergency Locksmiths'],['locksmiths/24-7-mobile','24/7 Mobile Locksmiths']],
 'security-systems':[['cctv-system','Security Cameras &amp; CCTV'],['access-control-systems','Access Control Systems'],['intercom','Intercom Systems'],['alarm-system','Alarm Systems'],['alarm-monitoring','Security System Maintenance']],
 'door-hardware':[['architectural-door-hardware','Architectural Door Hardware'],['door-handles','Lever Door Handles'],['door-closers','Door Closers &amp; Seals'],['fire-door-hardware','Fire Door Hardware'],['locksmiths/lock-hardware','Lock Hardware']]};
sectionLinks.locksmiths=sectionLinks['locksmith-services'];
// Explore-more entries removed on request (page -> hrefs); applied on every rebuild.
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
 const rel=path.relative(out,file).replaceAll('\\','/');if(rel.startsWith('locations/'))continue;
 const key=rel.replace(/\/index\.html$/,'');let html=fs.readFileSync(file,'utf8');const before=html;
 const swapAll=(a,b)=>{if(!a||a===b)return;for(const [x,y] of [[a,b],[escT(a),escT(b)],[escA(a),escA(b)],[JSON.stringify(a).slice(1,-1),JSON.stringify(b).slice(1,-1)]])html=html.split(x).join(y);};
 if(pages[key]){const $=load(html);swapAll($('head>title').text(),pages[key].title);swapAll($('meta[name="description"]').attr('content'),pages[key].description);}
 {const $=load(html);const t=$('head>title').text(),d=$('meta[name="description"]').attr('content');if(t&&!/http-equiv="refresh"/.test(html)){swapAll(t,fitTitle(key,t));if(d)swapAll(d,fitDesc(key,d,$('h1').first().text().trim()));}}
 for(const [from,to]of body[key]||[])html=html.split(from).join(to);
 {
  for(const [a,b]of Object.entries(names)){
   // link labels anywhere, plus H1/breadcrumb/schema on the page itself
   html=html.replace(new RegExp('(<a [^>]*>)\\s*'+escT(a).replace(/[.*+?^${}()|[\]\\/]/g,'\\$&')+'(\\s*<span aria-hidden="true">↗</span>)?</a>','g'),(m,o,s)=>o+escT(b)+(s||'')+'</a>');
   if(!regional(rel)){const $=load(html);if($('h1').first().text().trim()===a)swapAll(a,b);}
  }
 }
 if(sectionLinks[key]){const $=load(html),sec=$('.related-links').first();if(sec.length){const up='../'.repeat(key.split('/').length);const want=sectionLinks[key].map(([p,l])=>`<a href="${up}${p}/index.html">${l} <span aria-hidden="true">↗</span></a>`).join('');sec.find('a').remove();sec.append(want);if($.html()!==load(html).html())html=$.html();}}
 if(dropLinks[key]){const $=load(html);const hit=$('.related-links a').filter((i,e)=>dropLinks[key].includes($(e).attr('href')));if(hit.length){hit.remove();html=$.html();}}
 if(selfLinks[key]){const $=load(html);$('.related-links a').filter((i,e)=>$(e).attr('href')===selfLinks[key]).remove();if($.html()!==load(html).html())html=$.html();}
 if(html!==before){fs.writeFileSync(file,html);changed++;}
}
return changed;};
if(require.main===module)console.log(JSON.stringify({filesChanged:module.exports()}));
