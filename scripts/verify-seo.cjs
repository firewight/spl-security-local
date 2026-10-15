const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public'),config=require('../seo.config.json'),report=require('../seo-build-report.json'),manifest=require('../page-import-manifest.json');
const files=['index.html',...manifest.pages.map(p=>p.file),'all-pages/index.html',...['cadell-52','timeless-safes','ajax-starterkit'].map(p=>'products/'+p+'.html')];
const xml=load(fs.readFileSync(path.join(out,'sitemap.xml'),'utf8'),{xmlMode:true}),sitemap=xml('loc').map((i,e)=>xml(e).text()).get();
assert.equal(sitemap.length,report.sitemapUrls);assert.equal(sitemap.length,new Set(sitemap).size);
for(const p of config.excludedPaths||[]){assert(!fs.existsSync(path.join(out,p,'index.html')),'Retired page must not exist: '+p);assert(!sitemap.some(u=>new URL(u).pathname.endsWith(p+'/')),'Retired page in sitemap: '+p);}
let schemas=0,faqs=0;const titles=new Map(),descriptions=new Map(),broken=[],missingAlts=[];
for(const f of files){const file=path.join(out,f),html=fs.readFileSync(file,'utf8'),$=load(html);
 assert.equal($('head>title').length,1,f+' title');assert.equal($('meta[name="description"]').length,1,f+' description');assert.equal($('link[rel="canonical"]').length,1,f+' canonical');
 assert.equal($('h1').length,1,f+' H1');
 const title=$('head>title').text(),description=$('meta[name="description"]').attr('content'),canonical=$('link[rel="canonical"]').attr('href');assert(title.length>5,f+' title length');assert(description.length>25,f+' description length');assert(canonical.startsWith(config.siteUrl));
 if(config.indexing==='preview')assert($('meta[name="robots"]').attr('content').includes('noindex'),f+' preview protection');
 assert.equal($('meta[property="og:url"]').attr('content'),canonical);assert($('meta[property="og:image"]').attr('content').startsWith('https://'));assert.equal($('meta[name="twitter:card"]').attr('content'),'summary_large_image');
 if(titles.has(title)&&canonical!==titles.get(title))throw Error('Duplicate title on noncanonical pages '+f);titles.set(title,canonical);
 if(descriptions.has(description)&&canonical!==descriptions.get(description))throw Error('Duplicate description on noncanonical pages '+f);descriptions.set(description,canonical);
 const json=$('script[data-seo-schema]');assert.equal(json.length,1,f+' schema script');const graph=JSON.parse(json.text())['@graph'];assert(Array.isArray(graph));schemas+=graph.length;
 for(const node of graph){assert(node['@id'],f+' schema identity');if(node['@type']==='FAQPage'){faqs++;const body=$('body').text().replace(/\s+/g,' ').trim();for(const q of node.mainEntity){assert(body.includes(q.name),f+' FAQ question visible');assert(body.includes(q.acceptedAnswer.text),f+' FAQ answer visible');}}if(node['@type']==='BlogPosting'){for(const key of ['datePublished','dateModified'])if(node[key])assert(!isNaN(Date.parse(node[key])),f+' article date');}}
 $('a[href],link[href],script[src],img[src]').each((i,e)=>{const h=$(e).attr('href')||$(e).attr('src');if(!h||/^(https?:|mailto:|tel:|data:|#)/.test(h))return;const [p,hash]=h.split('#'),target=path.resolve(path.dirname(file),p.split('?')[0]);if(!fs.existsSync(target))broken.push({file:f,link:h});});
 $('img').each((i,e)=>{if($(e).attr('alt')===undefined)missingAlts.push(f);});
 if(f==='index.html'){assert.equal(crypto.createHash('sha256').update(html.match(/<main[\s\S]*?<\/main>/)[0]).digest('hex'),manifest.homepageMainSha256,'Homepage unchanged');}
}
assert.equal(broken.length,0,JSON.stringify(broken.slice(0,8)));assert.equal(missingAlts.length,0);assert.equal(faqs,report.faqPages);
const contact=load(fs.readFileSync(path.join(out,'contact/index.html'),'utf8'));assert(contact('.business-hours').text().includes('7:00 am'));assert(contact('.business-hours').text().includes('8:00 am'));assert.equal(contact('.official-profiles a').length,5);
const about=load(fs.readFileSync(path.join(out,'about/index.html'),'utf8'));for(const [id,label]of [['OurValues','Our Values'],['OurStory','Our Story']]){assert.equal(about('[id="'+id+'"]').length,1);assert.equal(about('[id="'+id+'"]').text().trim(),label);}
assert(contact('.business-hours').next().is('.contact-draft'),'Contact form must follow visit details');assert.equal(contact('.contact-socials img').length,5);assert(!contact('.editorial-content h2').toArray().some(e=>contact(e).text().trim()==='Contact Details'),'Duplicate contact details heading');
for(const [slug,title]of [['locksmith-services','Locksmiths'],['residential-locksmith','Residential Locksmiths'],['commercial-locksmith','Commercial Locksmiths'],['auto-locksmith','Auto Locksmiths'],['emergency-locksmith','Emergency Locksmiths']]){const $=load(fs.readFileSync(path.join(out,slug,'index.html'),'utf8'));assert.equal($('h1').text().trim(),title);if(slug==='locksmith-services')for(const label of ['Residential Locksmiths','Commercial Locksmiths','Automotive Locksmiths','Emergency Locksmiths'])assert($('.editorial-content h2,.editorial-content h3').toArray().some(e=>$(e).text().trim()===label),'Full service heading: '+label);}
const result={pagesVerified:files.length,sitemapUrls:sitemap.length,schemaNodes:schemas,faqPages:faqs,brokenLocalLinks:broken.length,homepageUnchanged:true,indexing:config.indexing};
fs.mkdirSync(path.join(root,'verification'),{recursive:true});fs.writeFileSync(path.join(root,'verification/seo-validation.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
