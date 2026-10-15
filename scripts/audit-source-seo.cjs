const fs=require('fs'),path=require('path'),crypto=require('crypto'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),m=require('../page-import-manifest.json'),origin=m.source;
(async()=>{
const pages=[];const paths=['/',...m.pages.map(p=>p.url)];
for(const p of paths){const file=path.join(root,'.source-cache',crypto.createHash('sha256').update(p).digest('hex')+'.html');let html=fs.readFileSync(file,'utf8');if(['/','/contact','/about','/commercial-locksmith','/articles'].includes(p)){const r=await fetch(origin+p);if(!r.ok)throw Error(r.status+' '+p);html=await r.text();fs.writeFileSync(file,html);}
const $=load(html),schemas=[];$('script[type="application/ld+json"]').each((i,e)=>{try{schemas.push(JSON.parse($(e).text()));}catch{}});
pages.push({path:p,title:$('title').text(),description:$('meta[name="description"]').attr('content'),canonical:$('link[rel="canonical"]').attr('href'),robots:$('meta[name="robots"]').attr('content'),h1:$('h1').map((i,e)=>$(e).text().trim()).get(),og:$('meta[property^="og:"]').map((i,e)=>({property:$(e).attr('property'),content:$(e).attr('content')})).get(),schemas,socialLinks:[...new Set($('a[href]').map((i,e)=>$(e).attr('href')).get().filter(u=>/facebook|linkedin|instagram|youtube|maps\.app|g\.page/.test(u)))],externalLinks:[...new Set($('.dmContent a[href]').map((i,e)=>$(e).attr('href')).get().filter(u=>/^https?:/.test(u)&&!u.includes('splsecurity.com.au')))]});}
const robots=await fetch(origin+'/robots.txt').then(r=>r.text());
const report={auditedAt:new Date().toISOString(),origin,pages,robots};fs.writeFileSync(path.join(root,'source-seo-audit.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({pages:pages.length,withDescriptions:pages.filter(p=>p.description).length,withCanonicals:pages.filter(p=>p.canonical).length,withStructuredData:pages.filter(p=>p.schemas.length).length,samples:pages.filter(p=>['/','/contact','/about','/commercial-locksmith'].includes(p.path)),robots},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
