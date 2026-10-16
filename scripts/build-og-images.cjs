// Builds branded 1200x630 Open Graph cards (dark background, gold glow, original SPL logo artwork,
// title in Manrope) into public/assets/og/, then writes og:/twitter: share tags on every HTML page.
// Main/service pages get their own card; everything else uses og/default.png.
// Base URL comes from seo.config.json siteUrl (demo now; switches to spl.com.au at launch, then re-run).
// Usage: node scripts/build-og-images.cjs [--meta-only]
require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public'),ogDir=path.join(out,'assets/og'),base=require('../seo.config.json').siteUrl;
const cards={
 'default':{title:'Locksmiths, Security Systems & Door Hardware',kicker:'BE SECURE IN OUR KNOWLEDGE'},
 'home':{title:'Locksmiths, Security Systems & Door Hardware',kicker:'GOLD COAST · BRISBANE · NORTHERN NSW',pages:['index.html']},
 'locksmiths':{title:'Locksmith Services',pages:['locksmith-services/index.html','locksmiths/index.html']},
 'residential-locksmiths':{title:'Residential Locksmiths',pages:['residential-locksmith/index.html']},
 'commercial-locksmiths':{title:'Commercial Locksmiths',pages:['commercial-locksmith/index.html']},
 'auto-locksmiths':{title:'24/7 Auto Locksmiths',pages:['auto-locksmith/index.html']},
 'emergency-locksmiths':{title:'24/7 Emergency Locksmiths',pages:['emergency-locksmith/index.html']},
 'restricted-keys':{title:'Restricted Key Systems',pages:['restricted-keys/index.html']},
 'security-systems':{title:'Security Systems',pages:['security-systems/index.html']},
 'alarm-systems':{title:'Alarm Systems',pages:['alarm-system/index.html','alarm-systems0197b34d/index.html']},
 'alarm-monitoring':{title:'Security System Maintenance & Alarm Monitoring',pages:['alarm-monitoring/index.html']},
 'cctv':{title:'Security Cameras & CCTV Systems',pages:['cctv-system/index.html']},
 'access-control':{title:'Access Control Systems',pages:['access-control-systems/index.html','access-control/index.html']},
 'intercoms':{title:'Intercom Systems',pages:['intercom/index.html']},
 'door-hardware':{title:'Door Hardware',pages:['door-hardware/index.html']},
 'architectural-door-hardware':{title:'Architectural Door Hardware',pages:['architectural-door-hardware/index.html']},
 'door-handles':{title:'Lever Door Handles',pages:['door-handles/index.html']},
 'door-closers':{title:'Door Closers & Seals',pages:['door-closers/index.html']},
 'fire-door-hardware':{title:'Fire Door Hardware',pages:['fire-door-hardware/index.html']},
 'lock-hardware':{title:'Lock Hardware',pages:['locksmiths/lock-hardware/index.html']},
 'safes':{title:'Safes',pages:['safe/index.html']},
 'retail-trade':{title:'Retail & Trade',pages:['retail-security/index.html']},
 'about':{title:'About SPL Security Solutions',pages:['about/index.html']},
 'contact':{title:'Contact SPL Security Solutions',pages:['contact/index.html']},
 'locations':{title:'Locations & Service Areas',pages:['locations/index.html']},
 'articles':{title:'Helpful Articles',pages:['articles/index.html']},
 'holiday-security-tips':{title:'Holiday Security Tips for Homes & Businesses',pages:['holiday-security-tips/index.html']},
};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function cardHtml(c,logo){return `<!doctype html><html><head><style>
*{margin:0;box-sizing:border-box}html,body{width:1200px;height:630px;overflow:hidden}
body{background:#060606;font-family:'DM Sans',sans-serif;color:#fff;position:relative}
.glow{position:absolute;inset:0;background:radial-gradient(ellipse 620px 460px at 1060px 640px,rgba(247,198,0,.42),rgba(247,198,0,.12) 45%,transparent 72%),radial-gradient(ellipse 420px 300px at 80px -40px,rgba(247,198,0,.14),transparent 70%)}
.frame{position:absolute;inset:28px;border:1px solid rgba(247,198,0,.22);border-radius:22px}
.wrap{position:absolute;inset:0;padding:74px 86px;display:flex;flex-direction:column}
.logo{width:300px;height:auto}
.kicker{margin-top:auto;font:700 21px 'DM Sans';letter-spacing:.18em;color:#F7C600}
.bar{width:84px;height:5px;background:#F7C600;border-radius:3px;margin:22px 0 24px}
h1{font-family:'Manrope';font-weight:800;font-size:${c.title.length>34?62:76}px;line-height:1.06;letter-spacing:-.02em;max-width:960px}
</style></head><body><div class="glow"></div><div class="frame"></div><div class="wrap"><img class="logo" src="${logo}" alt=""><p class="kicker">${esc(c.kicker||'SPL SECURITY SOLUTIONS')}</p><div class="bar"></div><h1>${esc(c.title)}</h1></div></body></html>`;}
async function render(){
 const {chromium}=require('playwright');fs.mkdirSync(ogDir,{recursive:true});
 const logo='data:image/png;base64,'+fs.readFileSync(path.join(out,'assets/spl-logo-white-600.png')).toString('base64');
 const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1200,height:630}});
 for(const [slug,c]of Object.entries(cards)){await page.setContent(cardHtml(c,logo));await page.evaluate(()=>document.fonts.ready);
  const fonts=await page.evaluate(()=>[...document.fonts].length);
  const buf=await page.screenshot({type:'png'});
  await require('sharp')(buf).png({compressionLevel:9,palette:true,quality:90}).toFile(path.join(ogDir,slug+'.png'));}
 await browser.close();
}
function walk(d,a=[]){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f,a);else if(e.name.endsWith('.html'))a.push(f);}return a;}
function applyMeta(){
 const bySlug=new Map();for(const [slug,c]of Object.entries(cards))for(const p of c.pages||[])bySlug.set(p,slug);
 let n=0;
 for(const file of walk(out)){
  const rel=path.relative(out,file).replaceAll('\\','/');if(rel.startsWith('assets/'))continue;
  let html=fs.readFileSync(file,'utf8');const isHome=rel==='index.html';
  const headMatch=html.match(/<head>[\s\S]*?<\/head>/);if(!headMatch)continue;
  const $=load(headMatch[0].replace(/^<head>|<\/head>$/g,''),null,false);
  const slug=bySlug.get(rel)||'default',img=base+'assets/og/'+slug+'.png';
  const title=($('title').first().text()||'SPL Security Solutions').trim();
  const desc=$('meta[name="description"]').attr('content')||'SPL Security Solutions: locksmiths, security systems and door hardware across the Gold Coast, Brisbane and Northern NSW.';
  const canonical=$('link[rel="canonical"]').attr('href')||(rel==='404.html'?null:base+rel.replace(/index\.html$/,''));
  const alt=(cards[slug].title)+' | SPL Security Solutions';
  const set=(attr,key,value)=>{if(value==null)return;const el=$(`meta[${attr}="${key}"]`);if(el.length){el.first().attr('content',value);el.slice(1).remove();}else $.root().append(`<meta ${attr}="${key}" content="${esc(value)}" data-seo-generated="">`);};
  set('property','og:type',$('meta[property="og:type"]').attr('content')||'website');
  set('property','og:site_name','SPL Security Solutions');
  set('property','og:title',$('meta[property="og:title"]').attr('content')||title);
  set('property','og:description',$('meta[property="og:description"]').attr('content')||desc);
  set('property','og:url',canonical);
  set('property','og:image',img);set('property','og:image:width','1200');set('property','og:image:height','630');set('property','og:image:type','image/png');set('property','og:image:alt',alt);
  set('name','twitter:card','summary_large_image');
  set('name','twitter:title',$('meta[name="twitter:title"]').attr('content')||title);
  set('name','twitter:description',$('meta[name="twitter:description"]').attr('content')||desc);
  set('name','twitter:image',img);set('name','twitter:image:alt',alt);
  let head='<head>'+$.html()+'</head>';
  if(isHome)head=head.split('\n').map(l=>l.trimEnd()).join('\n');
  html=html.replace(headMatch[0],()=>head);
  // keep schema image references in step for products/articles that pointed at a hotlinked image
  fs.writeFileSync(file,html);n++;
 }
 console.log(JSON.stringify({ogCards:Object.keys(cards).length,pagesTagged:n}));
}
(async()=>{if(!process.argv.includes('--meta-only'))await render();applyMeta();})().catch(e=>{console.error(e);process.exit(1);});
