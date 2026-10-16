// Builds /blog/ (all articles, newest first, as cards) from the Helpful Articles template, adds 'Blog' to the
// About dropdown on every page, and registers the page in the sitemap and manifest. Idempotent.
// Card images: each post's own featured image (BlogPosting schema), stored locally in assets/blog/.
// Run `node scripts/add-blog-index.cjs --fetch-images` once to download/convert missing ones; builds use local files only.
require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public'),config=require('../seo.config.json'),base=config.siteUrl;
const imgDir=path.join(out,'assets/blog');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const walk=(d,a=[])=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f,a);else if(e.name.endsWith('.html'))a.push(f);}return a;};
function posts(){const list=[];
 for(const f of walk(out)){const rel=path.relative(out,f).replaceAll('\\','/');if(rel==='blog/index.html')continue;const h=fs.readFileSync(f,'utf8');if(!h.includes('class="article-byline"'))continue;
  const $=load(h);let post={};for(const s of $('script[data-seo-schema]').toArray()){try{for(const n of JSON.parse($(s).text())['@graph']||[])if(n['@type']==='BlogPosting')post=n;}catch{}}
  const slug=rel.replace(/\/index\.html$/,'');
  list.push({rel,slug,title:$('h1').first().text().trim(),date:post.datePublished||$('.article-byline time').first().attr('datetime'),desc:$('meta[name="description"]').attr('content')||'',img:post.image,file:slug.split('/').pop()+'.webp'});}
 return list.sort((a,b)=>b.date.localeCompare(a.date));}
async function fetchImages(){const sharp=require('sharp');fs.mkdirSync(imgDir,{recursive:true});let n=0;
 for(const p of posts()){const dest=path.join(imgDir,p.file);if(fs.existsSync(dest)||!p.img)continue;
  try{const r=await fetch(p.img);if(!r.ok)throw Error(r.status);const buf=Buffer.from(await r.arrayBuffer());
   await sharp(buf).resize({width:640,height:400,fit:'cover',withoutEnlargement:true}).webp({quality:90}).toFile(dest);n++;}catch(e){console.error('skip',p.slug,e.message);}}
 return n;}
const fmt=d=>new Date(d).toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric',timeZone:'Australia/Brisbane'});
function run(){
 const list=posts(),url=base+'blog/';
 const title='Blog | Security & Locksmith Tips | SPL Security';
 const description='Security, locksmith, CCTV and door hardware articles from SPL Security Solutions for homes and businesses across the Gold Coast, Brisbane and Northern NSW.';
 const $=load(fs.readFileSync(path.join(out,'articles/index.html'),'utf8'));
 $('head>title').text(title);
 for(const s of ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]'])$(s).attr('content',description);
 for(const s of ['meta[property="og:title"]','meta[name="twitter:title"]'])$(s).attr('content',title);
 for(const s of ['meta[property="og:image:alt"]','meta[name="twitter:image:alt"]'])$(s).attr('content','Blog | SPL Security Solutions');
 for(const s of ['meta[property="og:image"]','meta[name="twitter:image"]'])$(s).attr('content',base+'assets/og/default.png');
 $('link[rel="canonical"]').attr('href',url);$('meta[property="og:url"]').attr('content',url);
 const graph=[{'@type':'WebSite','@id':base+'#website',url:base,name:config.siteName,inLanguage:'en-AU'},
  {'@type':'CollectionPage','@id':url+'#webpage',url,name:title,description,inLanguage:'en-AU',isPartOf:{'@id':base+'#website'},about:{'@id':config.businessUrl+'#business'},
   mainEntity:{'@type':'ItemList',itemListElement:list.map((p,i)=>({'@type':'ListItem',position:i+1,url:base+p.slug+'/',name:p.title}))}},
  {'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:base},{'@type':'ListItem',position:2,name:'Blog',item:url}]}];
 $('script[data-seo-schema]').text(JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c'));
 // Paths: the page lives one level down, same depth as articles/.
 $('.page-hero .breadcrumbs').html('<a href="../index.html">Home</a> / Blog');$('.page-hero h1').text('Blog');
 const cards=list.map(p=>{const has=fs.existsSync(path.join(imgDir,p.file));
  return `<li class="blog-card"><a href="../${p.slug}/index.html">${has?`<img src="../assets/blog/${p.file}" alt="" width="640" height="400" loading="lazy" decoding="async">`:'<span class="blog-card-noimg" aria-hidden="true"></span>'}<span class="blog-card-body"><time datetime="${esc(p.date.slice(0,10))}">${fmt(p.date)}</time><strong>${esc(p.title)}</strong><span>${esc(p.desc)}</span></span></a></li>`;}).join('');
 $('.editorial-layout').replaceWith(`<section class="blog-index" aria-labelledby="blog-list-title"><h2 id="blog-list-title" class="sr-only">All articles</h2><p class="blog-index-lead">${list.length} articles on locks, security systems, CCTV, safes and door hardware, newest first.</p><ul class="blog-grid">${cards}</ul></section>`);
 fs.mkdirSync(path.join(out,'blog'),{recursive:true});fs.writeFileSync(path.join(out,'blog/index.html'),$.html());
 // Manifest + sitemap
 const mf=path.join(root,'page-import-manifest.json'),m=JSON.parse(fs.readFileSync(mf,'utf8'));
 if(!m.pages.some(e=>e.url==='/blog')){m.pages.push({url:'/blog',title:'Blog',file:'blog/index.html',blocks:1,addedAt:'2026-10-16'});fs.writeFileSync(mf,JSON.stringify(m,null,2)+'\n');}
 const smf=path.join(out,'sitemap.xml');let sm=fs.readFileSync(smf,'utf8');const loc=`<url><loc>${url}</loc></url>`;
 if(!sm.includes(`<loc>${url}</loc>`)){sm=sm.replace('</urlset>',loc+'\n</urlset>');fs.writeFileSync(smf,sm);
  const rf=path.join(root,'seo-build-report.json');if(fs.existsSync(rf)){const r=JSON.parse(fs.readFileSync(rf,'utf8'));r.sitemapUrls=(sm.match(/<loc>/g)||[]).length;fs.writeFileSync(rf,JSON.stringify(r,null,2));}}
 // 'Blog' in the About dropdown (after Helpful Articles) on every page.
 let n=0;for(const f of walk(out)){let h=fs.readFileSync(f,'utf8');const b=h;
  h=h.replace(/(<div class="nav-dropdown" id="nav-sub-about"[^>]*>[\s\S]*?<a href="([^"]*)articles\/index\.html">Helpful Articles<\/a>)(?!<a href="[^"]*blog\/index\.html">Blog<\/a>)/,(x,a,up)=>`${a}<a href="${up}blog/index.html">Blog</a>`);
  if(h!==b){fs.writeFileSync(f,h);n++;}}
 return {posts:list.length,navUpdated:n};}
module.exports=run;
if(require.main===module){if(process.argv.includes('--fetch-images'))fetchImages().then(n=>console.log('images',n,JSON.stringify(run())));else console.log(JSON.stringify(run()));}
