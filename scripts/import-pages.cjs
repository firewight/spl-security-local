// Rebuild the authorised SPL subpage redesign from current source snapshots.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'), out=path.join(root,'public'), cache=path.join(root,'.source-cache');
fs.mkdirSync(cache,{recursive:true});
const origin='https://www.splsecurity.com.au';
const excluded=new Set(require('../seo.config.json').excludedPaths||[]);
const esc=s=>String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const homeFile=path.join(out,'index.html'), home=fs.readFileSync(homeFile,'utf8');
const mainBefore=home.match(/<main[\s\S]*?<\/main>/)[0];
const href=(p,base='')=>{const u=new URL(p,origin);if(u.origin!==origin)return p;if(u.pathname==='/'||u.pathname==='/home')return base+'index.html'+u.hash;return base+u.pathname.replace(/^\//,'').replace(/\/$/,'')+'/index.html'+u.hash;};
async function fetchPage(p){const file=path.join(cache,crypto.createHash('sha256').update(p).digest('hex')+'.html');if(process.argv.includes('--cached')&&fs.existsSync(file))return fs.readFileSync(file,'utf8');const response=await fetch(origin+p,{signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error(response.status+' '+p);const text=await response.text();fs.writeFileSync(file,text);return text;}
async function run(){
 const source=await fetchPage('/'), $home=load(source);
 const navTree=$home('nav').first().find('>ul>li').map((i,li)=>{const a=$home(li).children('a').first();return {label:clean(a.text()),url:a.attr('href'),children:$home(li).find('>ul>li>a').map((j,a)=>({label:clean($home(a).text()),url:$home(a).attr('href')})).get()};}).get();
 for(const group of navTree)group.children=group.children.filter(a=>!excluded.has(new URL(a.url,origin).pathname));
 const sitemap=await fetchPage('/sitemap.xml');
 const queue=new Set(['/']);
 for(const m of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)){const u=new URL(m[1]);if(u.origin===origin&&!/\.xml$/.test(u.pathname))queue.add(u.pathname.replace(/\/$/,'')||'/');}
 const addLinks=text=>{const $=load(text);$('a[href]').each((i,a)=>{try{const u=new URL($(a).attr('href'),origin);if(u.origin===origin&&!path.extname(u.pathname)&&!u.pathname.startsWith('/feed/')&&!u.pathname.includes('/api/'))queue.add(u.pathname.replace(/\/$/,'')||'/');}catch{}});};
 addLinks(source);
 for(const p of excluded)queue.delete(p);
 const pages=[], failures=[];let done=0;
 // Small batches avoid overloading the source website.
 const visited=new Set(['/',...excluded]);
 while([...queue].some(p=>!visited.has(p))){const batch=[...queue].filter(p=>!visited.has(p)).slice(0,5);await Promise.all(batch.map(async p=>{visited.add(p);try{const text=await fetchPage(p);addLinks(text);pages.push({url:p,html:text});}catch(e){failures.push({url:p,error:e.message});}done++;if(done%20===0)console.log('Fetched',done,'of',queue.size-1);}));}
 if(failures.length){fs.writeFileSync(path.join(root,'import-failures.json'),JSON.stringify(failures,null,2));throw Error('Source fetch failures: '+JSON.stringify(failures));}
 const routes=new Set(pages.map(p=>p.url));
 const nav=base=>`<nav id="main-nav" aria-label="Main navigation"><a href="${base}index.html">Home</a>${navTree.map(g=>g.children.length?`<details class="nav-group"><summary>${esc(g.label)}</summary><div class="nav-dropdown"><a href="${href(g.url,base)}">${esc(g.label)} overview</a>${g.children.map(a=>`<a href="${href(a.url,base)}">${esc(a.label)}</a>`).join('')}</div></details>`:`<a href="${href(g.url,base)}">${esc(g.label)}</a>`).join('')}</nav>`;
 const header=base=>`<div class="service-bar">24/7 EMERGENCY ASSISTANCE <span>•</span> Gold Coast · Brisbane · Northern NSW <a href="tel:0755888111">(07) 55 888 111</a></div><header class="site-header"><a class="brand" href="${base}index.html"><img src="${base}assets/spl-logo-white.png" alt="SPL Security Solutions"></a><button class="menu-toggle" aria-expanded="false" aria-controls="main-nav">Menu</button>${nav(base)}</header>`;
 const footer=base=>`<footer class="expanded-footer"><a class="brand" href="${base}index.html"><img src="${base}assets/spl-logo-white.png" alt="SPL Security Solutions"></a><div><p>Master Locksmiths · Electronic Security · Door Hardware</p><a href="tel:0755888111">(07) 55 888 111</a><p>101 Ashmore Rd, Bundall QLD 4217</p></div><p>© ${new Date().getFullYear()} SPL Security Solutions</p></footer>`;
 const doc=(title,description,body,base)=>`<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} | SPL Security Solutions</title><meta name="description" content="${esc(description)}"><link rel="stylesheet" href="${base}styles.css?v=20261015"><link rel="stylesheet" href="${base}pages.css?v=20261015"></head><body class="subpage">${header(base)}${body}${footer(base)}<script src="${base}navigation.js?v=20261015"></script></body></html>`;
 const index=[];
 for(const page of pages){
  const $=load(page.html), content=$('.dmContent').first();
  if(!content.length)throw Error('No source content for '+page.url);
  content.find('script,style,nav,form,.dmFooter,.dmHeader,iframe').remove();
  const title=clean(content.find('h1').first().text())||clean($('title').text()).split('|')[0].trim();
  const desc=clean($('meta[name="description"]').attr('content'));
  const base='../'.repeat(page.url.split('/').filter(Boolean).length);
  // Keep editorial text, original section anchors, links and images; discard builder layout and tracking.
  const allowed=new Set(['p','h1','h2','h3','h4','h5','h6','ul','ol','li','a','strong','b','em','i','br','table','thead','tbody','tr','td','th','blockquote']);
  const sanitize=node=>{if(node.type==='text')return esc(node.data);if(node.type!=='tag')return '';const tag=node.tagName;if(['script','style','form','input','button','select','textarea','svg'].includes(tag))return '';const inner=(node.children||[]).map(sanitize).join('');if(!allowed.has(tag))return inner;if(tag==='a'){let h=$(node).attr('href')||'';if(!h||/^javascript:/i.test(h))return inner;try{const u=new URL(h,origin+page.url);if(u.origin===origin){if(excluded.has(u.pathname.replace(/\/$/,'')))return inner;if(u.pathname==='/'||u.pathname==='/home')h=base+'index.html'+u.hash;else if(routes.has(u.pathname.replace(/\/$/,'')))h=href(u.pathname+u.hash,base);else h=u.href;}else h=u.href;}catch{return inner;}return `<a href="${esc(h)}">${inner}</a>`;}return `<${tag}>${inner}</${tag}>`;};
  const blocks=[],seen=new Set();
  const editorial='.dmNewParagraph,.dmBlogPost,.accordion-wrapper,p,h1,h2,h3,h4,h5,h6,ul,ol,table,blockquote';
  content.find(editorial+',img,.dmButtonLink,a[name],[data-anchor]').each((i,e)=>{
   if($(e).parents(editorial).length)return;
   const anchor=$(e).attr('data-anchor')||$(e).attr('name');
   if(anchor)blocks.push(`<span id="${esc(anchor)}" class="section-anchor"></span>`);
   if($(e).is(editorial)){const html=$(e).is('.dmNewParagraph,.dmBlogPost')?(e.children||[]).map(sanitize).join(''):sanitize(e);const text=clean($(e).text());if(text&&text!==title&&!seen.has(text)){seen.add(text);blocks.push(`<div class="editorial-block">${html}</div>`);}}
   else if($(e).is('.dmButtonLink')){const html=sanitize(e),text=clean($(e).text());if(text&&text!=='Button'&&!seen.has(text)){seen.add(text);blocks.push(`<div class="editorial-action">${html}</div>`);}}
   else if($(e).is('img')){let src=$(e).attr('src')||$(e).attr('data-src');const alt=$(e).attr('alt')||'';if(src&&!/data:|spacer|icon|logo/i.test(src)&&!seen.has(src)){seen.add(src);if(src.startsWith('//'))src='https:'+src;blocks.push(`<figure class="editorial-image"><img loading="lazy" src="${esc(src)}" alt="${esc(alt)}"></figure>`);}}
  });
  // Preserve source section IDs referenced by menus, without exposing builder wrappers.
  const anchors=new Set();content.find('[id],[name]').each((i,e)=>{const id=$(e).attr('id')||$(e).attr('name');if(id&&!/^\d+$/.test(id)&&!/^dm|^u_/.test(id))anchors.add(id);});
  // Article listings use builder widgets; reproduce their editorial links as cards.
  const articleLinks=[];content.find('a[href]').each((i,a)=>{const h=$(a).attr('href'),text=clean($(a).text());try{const u=new URL(h,origin);if(routes.has(u.pathname)&&text&&!seen.has(text)&&text!=='Button'){seen.add(text);articleLinks.push(`<a href="${href(u.pathname,base)}">${esc(text)} <span>↗</span></a>`);}}catch{}});
  if(!blocks.length)throw Error('Empty extracted page '+page.url);
  const body=`<main id="top"><section class="page-hero"><div class="page-hero-inner"><p class="breadcrumbs"><a href="${base}index.html">Home</a> / ${esc(title)}</p><p class="kicker">SPL SECURITY SOLUTIONS</p><h1>${esc(title)}</h1><div class="page-hero-actions"><a href="${base}contact/index.html">Talk to an expert <span>↗</span></a><a href="tel:0755888111">(07) 55 888 111</a></div></div></section><div class="editorial-layout"><article class="editorial-content">${[...anchors].map(a=>`<span class="section-anchor" id="${esc(a)}"></span>`).join('')}${blocks.join('\n')}${articleLinks.length?`<section class="related-links"><h2>Explore more</h2>${articleLinks.join('')}</section>`:''}</article><aside class="expert-card"><p class="kicker">LOCAL EXPERTISE</p><h2>Protection starts with a conversation.</h2><p>Gold Coast, Brisbane & Northern NSW.</p><a href="tel:0755888111">Call (07) 55 888 111 ↗</a><a href="mailto:info@spl.com.au">Email SPL ↗</a><a href="${base}service-area/index.html">Our service regions ↗</a></aside></div><section class="page-cta"><p class="kicker">LET’S GET YOUR SECURITY SORTED</p><h2>Expert advice.<br>Considered solutions.</h2><a href="${base}contact/index.html">Get in touch ↗</a></section></main>`;
  const target=path.join(out,page.url,'index.html');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,doc(title,desc,body,base));
  index.push({url:page.url,title,file:path.relative(out,target).replaceAll('\\','/'),blocks:blocks.length});
 }
 const directory=`<main><section class="page-hero"><div class="page-hero-inner"><p class="kicker">EXPLORE SPL</p><h1>Every solution.<br>One place.</h1><p class="directory-lead">Services, expertise, local coverage and helpful advice.</p><label class="directory-search">Find a page<input type="search" id="page-search" placeholder="Search services, articles or locations"></label><p id="search-count" role="status">${index.length} pages</p></div></section><section class="page-directory">${index.sort((a,b)=>a.title.localeCompare(b.title)).map(p=>`<a href="${href(p.url,'../')}" data-page-title="${esc(p.title.toLowerCase())}">${esc(p.title)} <span>↗</span></a>`).join('')}</section></main>`;
 // The public all-pages directory is intentionally retired.
 let newHome=home.replace(/<nav id="main-nav"[^>]*>[\s\S]*?<\/nav>/,nav(''));
 if(!newHome.includes('pages.css'))newHome=newHome.replace('</head>','<link rel="stylesheet" href="./pages.css?v=20261015">\n</head>');
 if(!newHome.includes('navigation.js'))newHome=newHome.replace('</body>','<script src="./navigation.js?v=20261015"></script>\n</body>');
 if(newHome.match(/<main[\s\S]*?<\/main>/)[0]!==mainBefore)throw Error('Homepage content changed');
 fs.writeFileSync(homeFile,newHome);
 fs.writeFileSync(path.join(root,'page-import-manifest.json'),JSON.stringify({source:origin,importedAt:new Date().toISOString(),homepageMainSha256:crypto.createHash('sha256').update(mainBefore).digest('hex'),pages:index,failures},null,2));
 require('./enforce-regional-scope.cjs')();
 console.log('Generated',index.length,'subpages; homepage main unchanged.');
}
run().catch(e=>{console.error(e);process.exitCode=1});
