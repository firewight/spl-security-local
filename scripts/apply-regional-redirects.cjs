// Regional service sub-pages (e.g. /security-systems/intercoms/gold-coast, /security-systems/brisbane) are consolidated
// into their main service pages. Map: seo.config.json "regionalRedirects" (old path -> final main page, no chains).
// For pages still on disk: writes a meta-refresh/canonical/location.replace redirect page, drops them from the manifest
// and sitemap, and repoints internal links. For every mapped path: writes a launch 301 row in backlink-migration.csv.
// Retired paths (in excludedPaths) get CSV rows only. import-pages.cjs skips mapped paths. Idempotent.
require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public'),config=require('../seo.config.json'),base=config.siteUrl,prod=config.businessUrl.replace(/\/$/,'');
const map=config.regionalRedirects||{},excluded=new Set(config.excludedPaths||[]);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
module.exports=function run(){
 const stats={redirectPages:[],linksRepointed:0,csvRows:0};
 const fileOf=p=>path.join(out,p.replace(/^\//,''),'index.html');
 const titleOf=p=>{try{return load(fs.readFileSync(fileOf(p),'utf8'))('head>title').text().trim();}catch{return 'SPL Security Solutions';}};
 for(const [from,to]of Object.entries(map)){
  if(excluded.has(from))continue;const f=fileOf(from);if(!fs.existsSync(f))continue;
  const html=fs.readFileSync(f,'utf8');
  const rel=path.relative(path.dirname(f),path.join(out,to.replace(/^\//,''))).replaceAll('\\','/')+'/';
  if(!/http-equiv="refresh"/.test(html)||!html.includes(`url=${rel}"`)){
   fs.writeFileSync(f,`<!DOCTYPE html><html lang="en-AU"><head><meta charset="utf-8"><title>${esc(titleOf(to))}</title><meta name="robots" content="noindex, follow"><link rel="canonical" href="${base}${to.replace(/^\//,'')}/"><meta http-equiv="refresh" content="0; url=${rel}"><script>location.replace("${rel}"+location.hash)</script></head><body><p>This page has moved to <a href="${rel}">${esc(titleOf(to).split('|')[0].trim())}</a>.</p></body></html>\n`);
  }
  stats.redirectPages.push(from);
 }
 // manifest + sitemap
 const mf=path.join(root,'page-import-manifest.json'),m=JSON.parse(fs.readFileSync(mf,'utf8'));const n=m.pages.length;m.pages=m.pages.filter(p=>!map[p.url]);if(m.pages.length!==n)fs.writeFileSync(mf,JSON.stringify(m,null,2)+'\n');
 const sf=path.join(out,'sitemap.xml');let sm=fs.readFileSync(sf,'utf8');for(const from of Object.keys(map))sm=sm.split(`<url><loc>${base}${from.replace(/^\//,'')}/</loc></url>\n`).join('');fs.writeFileSync(sf,sm);
 const rf=path.join(root,'seo-build-report.json'),rep=JSON.parse(fs.readFileSync(rf,'utf8'));rep.sitemapUrls=(sm.match(/<loc>/g)||[]).length;rep.faqPages=['index.html',...m.pages.map(p=>p.file)].filter(f=>{const s=load(fs.readFileSync(path.join(out,f),'utf8'))('script[data-seo-schema]').text();return s.includes('"FAQPage"');}).length;fs.writeFileSync(rf,JSON.stringify(rep,null,2));
 // internal links -> final destinations (a bare region link such as "Brisbane" goes to the Locations section instead)
 const targets=new Map(stats.redirectPages.map(p=>[fileOf(p),map[p]]));
 const walk=(d,a=[])=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f,a);else if(e.name.endsWith('.html'))a.push(f);}return a;};
 for(const file of walk(out)){
  if(targets.has(file))continue;let html=fs.readFileSync(file,'utf8');const before=html;
  html=html.replace(/<a\b([^>]*?)href="([^"#?]*)([^"]*)"([^>]*)>([\s\S]*?)<\/a>/g,(all,pre,href,suffix,post,inner)=>{
   if(!href||/^(https?:|mailto:|tel:)/.test(href))return all;let r=path.resolve(path.dirname(file),href);if(!r.endsWith('.html'))r=path.join(r,'index.html');
   if(!targets.has(r))return all;const to=targets.get(r),label=inner.replace(/<[^>]+>/g,'').replace(/[↗›]/g,'').trim();
   let dest=path.relative(path.dirname(file),path.join(out,to.replace(/^\//,''),'index.html')).replaceAll('\\','/');
   if(/^(Gold Coast|Brisbane|Northern NSW)$/.test(label))dest=path.relative(path.dirname(file),path.join(out,'locations/index.html')).replaceAll('\\','/')+'#'+label.toLowerCase().replace(/\s+/g,'-');
   else if(suffix.startsWith('#Contact'))suffix='';
   stats.linksRepointed++;return `<a${pre}href="${dest}${suffix.startsWith('#')&&!dest.includes('#')?suffix:''}"${post}>${inner}</a>`;});
  if(html!==before)fs.writeFileSync(file,html);
 }
 // launch 301 rows
 const cf=path.join(root,'backlink-migration.csv');const lines=fs.readFileSync(cf,'utf8').trimEnd().split('\n');const csv=s=>'"'+String(s).replaceAll('"','""')+'"';
 for(const [from,to]of Object.entries(map)){const row=[prod+from,prod+to,base+to.replace(/^\//,'')+'/',`301 redirect to ${to} at launch (regional service page consolidated${excluded.has(from)?'; retired, not on demo':'; demo uses meta refresh'})`].map(csv).join(',');
  const i=lines.findIndex(l=>l.startsWith(csv(prod+from)+','));if(i>=0)lines[i]=row;else lines.push(row);stats.csvRows++;}
 fs.writeFileSync(cf,lines.join('\n')+'\n');
 return stats;
};
if(require.main===module)console.log(JSON.stringify(module.exports(),null,1));
