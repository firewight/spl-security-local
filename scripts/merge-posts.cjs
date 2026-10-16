// Merge two overlapping posts into their keepers and turn the old URLs into redirects. Idempotent.
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public'),SITE='https://firewight.github.io/spl-security-local/';
const MERGES=[
 {from:'how-to-protect-your-home-from-intruders',to:'how-to-protect-your-home-from-intruders-effectively',toTitle:'How to Protect Your Home from Intruders Effectively',
  anchor:'text:Upgrade Your Safety with Modern Home Security Systems',id:'section-9-more-ways-to-keep-intruders-out',h:'9. More Ways to Keep Intruders Out',
  html:`<div class="editorial-block merged-content"><h2 id="section-9-more-ways-to-keep-intruders-out">9. More Ways to Keep Intruders Out</h2>
<h3>Fortify your perimeter</h3><p>A strong fence or wall around your property can deter burglars. Make sure your gates have sturdy locks and consider installing an <a href="../intercom/index.html">intercom system</a> for added security.</p>
<h3>Upgrade your locks</h3><p>High-quality locks are a must for securing your home. SPL Security Solutions provides an extensive range of locks, including deadbolts and window locks. Talk to our team to find the best lock solutions for your home.</p>
<h3>Get a locksmith’s advice</h3><p>Our <a href="../locksmith-services/index.html">locksmiths</a> can help you upgrade your locks, check your property’s weak spots and give you personalised security recommendations.</p>
<h3>Stay alert</h3><p>Report any suspicious activity to the police, and store important documents and expensive items in a secure <a href="../safe/index.html">safe</a>.</p>
<h3>Prepare for emergencies</h3><p>Create a safety plan for your family: agree on a meeting spot, make sure everyone knows what to do if a break-in occurs, and review the plan when your home or household changes.</p></div>`},
 {from:'why-every-business-needs-a-trusted-commercial-locksmith',to:'commercial-locksmith',toTitle:'Commercial Locksmith',
  anchor:'section-frequently-asked-questions',id:'section-how-a-commercial-locksmith-supports-your-business',h:'How a Commercial Locksmith Supports Your Business',
  html:`<div class="editorial-block merged-content"><h2 id="section-how-a-commercial-locksmith-supports-your-business">How a Commercial Locksmith Supports Your Business</h2>
<p>Alarms and surveillance get plenty of attention, but door and lock security is where business protection starts. A commercial locksmith supports you well beyond emergencies.</p>
<h3>Commercial-grade locks</h3><p>Commercial-grade locks and high-security cylinders are built to resist drilling, picking and bumping, and can be fitted to every access point, from external doors to storerooms and restricted areas.</p>
<h3>Emergency access</h3><p>A lockout, jammed lock or failed <a href="../access-control-systems/index.html">access control</a> system can halt operations. Our <a href="../emergency-locksmith/index.html">24/7 emergency</a> service helps restore access quickly.</p>
<h3>Master key systems</h3><p>One master key opens all designated locks while other keys are limited to specific areas, ideal for multiple departments, floors or buildings.</p>
<h3>Digital lock upgrades</h3><p>Keypads, card readers, smart locks and biometric systems make access easy to manage, with codes that can be changed when staff leave and access logs that show who entered and when.</p>
<h3>Maintenance, safes and rekeying</h3><p>Routine servicing catches wear before it causes jammed doors or stuck exits. Commercial <a href="../safe/index.html">safes</a> protect cash, files and stock. After staff turnover, rekeying makes old keys stop working without replacing the whole lock.</p>
<h3>Tailored security advice</h3><p>A site assessment identifies weak points, such as doors without closers or keys that are easy to copy, so you can plan upgrades that protect your people and operations long term.</p></div>`}];
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(e.name==='assets'&&d===out?[]:walk(path.join(d,e.name))):[path.join(d,e.name)])}
module.exports=function(){const r={merged:0,linksUpdated:0};
 for(const m of MERGES){
  // 1. merge content into keeper
  const tf=path.join(out,m.to,'index.html');let $=load(fs.readFileSync(tf,'utf8'));
  if(!$('#'+m.id).length){const tgt=m.anchor.startsWith('text:')?$('main h2').filter((i,e)=>$(e).text().trim()===m.anchor.slice(5)).first():$('#'+m.anchor);if(!tgt.length)throw new Error('merge anchor missing: '+m.to);tgt.closest('.editorial-block').before(m.html+'\n');
   const toc=m.anchor.startsWith('text:')?$('details a[href^="#section-8-"]').first():$(`details a[href="#${m.anchor}"]`).first();if(toc.length)toc[m.anchor.startsWith('text:')?'after':'before'](`<a href="#${m.id}">${m.h}</a>`);
   fs.writeFileSync(tf,$.html());r.merged++;}
  // 2. redirect stub
  const ff=path.join(out,m.from,'index.html'),stub=`<!DOCTYPE html><html lang="en-AU"><head><meta charset="utf-8"><title>${m.toTitle} | SPL Security Solutions</title><meta name="robots" content="noindex, follow"><link rel="canonical" href="${SITE}${m.to}/"><meta http-equiv="refresh" content="0; url=../${m.to}/"><script>location.replace("../${m.to}/"+location.hash)</script></head><body><p>This page has moved to <a href="../${m.to}/">${m.toTitle}</a>.</p></body></html>`;
  if(fs.readFileSync(ff,'utf8')!==stub)fs.writeFileSync(ff,stub);
  // 3. internal links
  for(const f of walk(out).filter(f=>f.endsWith('.html')&&f!==ff)){let h=fs.readFileSync(f,'utf8');if(!h.includes(m.from+'/'))continue;const $$=load(h);
   $$('li.blog-card').filter((i,e)=>($$(e).find('a').attr('href')||'').includes('/'+m.from+'/')).remove();
   $$('a[href]').each((i,e)=>{const a=$$(e),href=a.attr('href');if(!new RegExp('(^|/)'+m.from+'/(index\\.html)?$').test(href))return;
    const nh=href.replace(m.from+'/',m.to+'/');const dup=a.parent().children('a').filter((j,x)=>$$(x).attr('href')===nh).length;
    if(dup)a.remove();else{a.attr('href',nh);const arrow=a.find('[aria-hidden]').toArray().map(x=>$$.html(x)).join('');if(a.text().trim())a.html(m.toTitle+(arrow?' '+arrow:''));}r.linksUpdated++;});
   $$('script[type="application/ld+json"]').each((i,e)=>{try{const j=JSON.parse($$(e).html());let ch=false;const fix=o=>{if(Array.isArray(o)){const n=o.filter(x=>!(x&&x['@type']==='ListItem'&&x.url===SITE+m.from+'/'));if(n.length!==o.length){n.forEach((x,k)=>{if(x.position)x.position=k+1});ch=true;}o.splice(0,o.length,...n);o.forEach(fix);}else if(o&&typeof o==='object')Object.values(o).forEach(fix)};fix(j);if(ch)$$(e).text(JSON.stringify(j));}catch{}});
   const o=$$.html();if(o!==h)fs.writeFileSync(f,o);}
  // 4. manifest, sitemap, launch redirects
  const mf=path.join(root,'page-import-manifest.json'),man=JSON.parse(fs.readFileSync(mf,'utf8'));const before=man.pages.length;man.pages=man.pages.filter(p=>!p.file.startsWith(m.from+'/'));if(man.pages.length!==before)fs.writeFileSync(mf,JSON.stringify(man,null,2)+'\n');
  const smf=path.join(out,'sitemap.xml');let sm=fs.readFileSync(smf,'utf8');sm=sm.replace(new RegExp('<url><loc>'+SITE.replace(/\./g,'\\.')+m.from+'/</loc>[\\s\\S]*?</url>\\s*'),'');fs.writeFileSync(smf,sm);
  const rf=path.join(root,'seo-build-report.json'),rep=JSON.parse(fs.readFileSync(rf,'utf8'));rep.sitemapUrls=(sm.match(/<loc>/g)||[]).length;fs.writeFileSync(rf,JSON.stringify(rep,null,2));
  const cf=path.join(root,'seo.config.json'),cfg=JSON.parse(fs.readFileSync(cf,'utf8'));const key=Object.keys(cfg).find(k=>cfg[k]&&cfg[k]['/articles']);if(key&&cfg[key]['/'+m.from]!=='/'+m.to){cfg[key]['/'+m.from]='/'+m.to;fs.writeFileSync(cf,JSON.stringify(cfg,null,2)+'\n');}
  const csv=path.join(root,'backlink-migration.csv');let c=fs.readFileSync(csv,'utf8');
  c=c.replace(new RegExp(`^"https://www\\.splsecurity\\.com\\.au/${m.from}","[^"]*","[^"]*","[^"]*"$`,'m'),`"https://www.splsecurity.com.au/${m.from}","https://www.splsecurity.com.au/${m.to}","${SITE}${m.to}/","301 redirect to /${m.to} at launch (post merged; demo uses meta refresh)"`);fs.writeFileSync(csv,c);}
 // Complete the intruders post's On this page list: every real H2, with ids.
 {const tf=path.join(out,'how-to-protect-your-home-from-intruders-effectively','index.html'),h=fs.readFileSync(tf,'utf8'),$=load(h);const toc=$('.page-toc > div');
  if(toc.length){const items=[];$('main h2').each((i,e)=>{const el=$(e),t=el.text().replace(/\s+/g,' ').trim();if(el.attr('id')==='contact-options-title'||/^(Explore more|Related articles)$/i.test(t)||el.closest('.page-toc,.service-menu').length)return;if(!el.attr('id'))el.attr('id','section-'+t.toLowerCase().replace(/&/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));items.push(`<a href="#${el.attr('id')}">${$('<i>').text(t).html()}</a>`);});toc.html(items.join(''));const o=$.html();if(o!==h)fs.writeFileSync(tf,o);}}
 // Real space in the contact heading (text otherwise extracts as 'localsecurity').
 for(const f of walk(out).filter(f=>f.endsWith('.html'))){const h=fs.readFileSync(f,'utf8');if(h.includes('local<br>security')){fs.writeFileSync(f,h.split('local<br>security').join('local <br>security'));r.headingFixed=(r.headingFixed||0)+1;}}
 return r;};
if(require.main===module)console.log('merge-posts',module.exports());
