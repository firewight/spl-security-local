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
 'locksmith-services':{title:`Locksmith Services | ${R} | SPL Security Solutions`,description:`Searching for a reliable locksmith across ${RW}? We provide 24/7 mobile services and more. Contact SPL Security Solutions on (07) 55 888 111.`},
 'locksmiths':{title:`Locksmith Services | ${R} | SPL Security Solutions`,description:`Searching for a reliable locksmith across ${RW}? We provide 24/7 mobile services and more. Contact SPL Security Solutions on (07) 55 888 111.`},
 'residential-locksmith':{title:`Residential Locksmiths | ${R} | SPL Security Solutions`,description:`Need a residential locksmith across ${RW}? We offer lock repair, key duplication, rekeying and more. Call SPL Security Solutions on (07) 55 888 111.`},
 'commercial-locksmith':{title:`Commercial Locksmiths | ${R} | SPL Security Solutions`,description:`Looking for a commercial locksmith across ${RW}? We install locks, master key systems and more. Call SPL Security Solutions on (07) 55 888 111.`},
 'auto-locksmith':{title:`Auto Locksmiths | ${R} | SPL Security Solutions`,description:`Need an auto locksmith across ${RW}? Get a key replacement, re-entry services or broken key extraction. Call SPL Security Solutions on (07) 55 888 111.`},
 'emergency-locksmith':{title:`Emergency Locksmiths | ${R} | SPL Security Solutions`,description:`Need immediate help across ${RW}? Our emergency locksmith services are available 24/7. Call SPL Security Solutions on (07) 55 888 111.`},
 'restricted-keys':{title:`Restricted Keys | ${R} | SPL Security Solutions`,description:`After a restricted key system across ${RW}? We offer patented designs for high-end security. Call SPL Security Solutions on (07) 55 888 111.`},
 'locksmiths/24-7-mobile':{title:`24/7 Mobile & Emergency Locksmiths | ${R} | SPL Security Solutions`,description:`24/7 mobile locksmiths: SPL Security Solutions provides mobile locksmith services 24 hours a day across ${RW}. Call (07) 55 888 111.`},
 'locksmiths/lock-hardware':{title:`Lock Hardware & Door Hardware | ${R} | SPL Security Solutions`,description:'Add the finishing touches to your doors, bathrooms and kitchens with the best in door and lock hardware on display in our Bundall and Ballina showrooms.'},
 'safe':{title:`Safes | ${R} | SPL Security Solutions`,description:`Need safe services across ${RW}? We deliver, install, repair and reopen a variety of safes. Call SPL Security Solutions on (07) 55 888 111.`},
 'door-hardware':{title:`Door Hardware | ${R} | SPL Security Solutions`,description:'Add the finishing touches to your doors, bathrooms and kitchens with the very best in door hardware, on display in our Bundall and Ballina showrooms.'},
 'architectural-door-hardware':{title:`Architectural Door Hardware | ${R} | SPL Security Solutions`,description:'Choose from an extensive range of high-quality architectural door hardware at SPL Security Solutions. Visit our Bundall or Ballina showroom.'},
 'door-handles':{title:`Door Handles | ${R} | SPL Security Solutions`,description:'Need security door levers for your home or business? We offer a selection of types and styles. Call SPL Security Solutions on (07) 55 888 111.'},
 'door-closers':{title:`Door Closers & Seals | ${R} | SPL Security Solutions`,description:`Need reliable closers and seals across ${RW}? We supply overhead closers, acoustic seals and more. Call SPL Security Solutions on (07) 55 888 111.`},
 'fire-door-hardware':{title:`Fire Door Hardware | ${R} | SPL Security Solutions`,description:`Need new fire door hardware across ${RW}? Ensure safety with compliant components. Contact SPL Security Solutions on (07) 55 888 111.`},
 'retail-security':{title:`Retail & Trade Security | ${R} | SPL Security Solutions`,description:`Secure your trade or retail space across ${RW} with SPL Security Solutions. Explore retail security options tailored to you. Call (07) 55 888 111.`},
 'security-systems':{title:`Security Systems | ${R} | SPL Security Solutions`,description:`Need an integrated security system across ${RW}? We install CCTV, alarm systems, intercoms and more. Call SPL Security Solutions on (07) 55 888 111.`},
 'alarm-system':{title:`Alarm Systems | ${R} | SPL Security Solutions`,description:`Need a reliable alarm system across ${RW}? We offer installation, maintenance and 24/7 monitoring. Call SPL Security Solutions on (07) 55 888 111.`},
 'alarm-systems0197b34d':{title:`Alarm Systems | ${R} | SPL Security Solutions`,description:`Need a reliable alarm system across ${RW}? We offer installation, maintenance and 24/7 monitoring. Call SPL Security Solutions on (07) 55 888 111.`},
 'alarm-monitoring':{title:`Alarm Monitoring & Maintenance | ${R} | SPL Security Solutions`,description:`Looking for security system maintenance across ${RW}? We keep your systems operational. Call SPL Security Solutions on (07) 55 888 111.`},
 'cctv-system':{title:`CCTV & Security Cameras | ${R} | SPL Security Solutions`,description:`Protect your property with a reliable CCTV system from SPL Security Solutions, across ${RW}. See our security cameras or call (07) 55 888 111.`},
 'access-control':{title:`Access Control Systems | ${R} | SPL Security Solutions`,description:`Need access control across ${RW}? We offer keyless entry, electronic locks and more. Call SPL Security Solutions on (07) 55 888 111.`},
 'access-control-systems':{title:`Access Control Systems | ${R} | SPL Security Solutions`,description:`Need access control across ${RW}? We offer keyless entry, electronic locks and more. Call SPL Security Solutions on (07) 55 888 111.`},
 'intercom':{title:`Intercom Systems | ${R} | SPL Security Solutions`,description:`Need an intercom across ${RW}? Enhance your security with voice and video intercom solutions. Call SPL Security Solutions on (07) 55 888 111.`},
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
// Explore-more entries removed on request (page -> hrefs); applied on every rebuild.
const dropLinks={'security-systems':['../retail-security/index.html']};
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
 for(const [from,to]of body[key]||[])html=html.split(from).join(to);
 {
  for(const [a,b]of Object.entries(names)){
   // link labels anywhere, plus H1/breadcrumb/schema on the page itself
   html=html.replace(new RegExp('(<a [^>]*>)\\s*'+escT(a).replace(/[.*+?^${}()|[\]\\/]/g,'\\$&')+'(\\s*<span aria-hidden="true">↗</span>)?</a>','g'),(m,o,s)=>o+escT(b)+(s||'')+'</a>');
   if(!regional(rel)){const $=load(html);if($('h1').first().text().trim()===a)swapAll(a,b);}
  }
 }
 if(dropLinks[key]){const $=load(html);const hit=$('.related-links a').filter((i,e)=>dropLinks[key].includes($(e).attr('href')));if(hit.length){hit.remove();html=$.html();}}
 if(selfLinks[key]){const $=load(html);$('.related-links a').filter((i,e)=>$(e).attr('href')===selfLinks[key]).remove();if($.html()!==load(html).html())html=$.html();}
 if(html!==before){fs.writeFileSync(file,html);changed++;}
}
return changed;};
if(require.main===module)console.log(JSON.stringify({filesChanged:module.exports()}));
