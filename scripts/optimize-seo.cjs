require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public'),config=require('../seo.config.json'),audit=require('../source-seo-audit.json'),manifest=require('../page-import-manifest.json');
const base=new URL(config.siteUrl),businessId=config.businessUrl+'#business';
if(!['preview','live'].includes(config.indexing))throw Error('Unknown indexing mode');
const clean=s=>String(s||'').replace(/\s+/g,' ').trim(),plain=s=>clean(load('<div>'+s+'</div>')('div').text());
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const sources=new Map(audit.pages.map(p=>[p.path,p]));
const sourcePath=p=>{try{return new URL(sources.get(p)?.canonical||p,config.businessUrl).pathname.replace(/\/$/,'')||'/';}catch{return p;}};
const routeFor=p=>p==='/'?'':p.replace(/^\//,'').replace(/\/$/,'')+'/';
const entries=[{url:'/',file:'index.html'},...manifest.pages,...['cadell-52','timeless-safes','ajax-starterkit'].map(n=>({url:'/products/'+n+'.html',file:'products/'+n+'.html'}))];
const files=new Map(entries.map(p=>[p.url,p.file]));
const href=(from,to,hash='')=>{const canonical=files.has(sourcePath(to))?sourcePath(to):to;return path.relative(path.dirname(from),path.join(out,files.get(canonical)||'index.html')).replaceAll('\\','/')+hash;};
const canonicalUrl=p=>new URL(p.endsWith('.html')?p.replace(/^\//,''):routeFor(files.has(sourcePath(p))?sourcePath(p):p),base).href;
const groups=[{name:'Locksmith services',url:'/locksmith-services',match:/locksmith|restricted-key|car-key|rekey|key-cutting|keyless/},{name:'Electronic security',url:'/security-systems',match:/security-system|cctv|camera|intercom|alarm|access-control/},{name:'Door hardware',url:'/door-hardware',match:/door|hardware|lever|handle/},{name:'Safes & retail',url:'/retail-security',match:/safe|retail/}];
const stats={pages:0,faqPages:0,questions:0,articles:0,aliases:[],answerSummaries:0,tablesOfContents:0,imagesSized:0,contextualLinkPages:0};
const sourceBusiness=audit.pages.find(p=>p.path==='/').schemas.find(s=>s['@type']==='LocalBusiness');
const socials=[...new Set([...sourceBusiness.sameAs,'https://au.linkedin.com/company/spl-security'])];
const contactSource=sources.get('/contact');
const trustedLinks=[{name:'SPL on Facebook',url:sourceBusiness.sameAs[0]},{name:'SPL on Instagram',url:sourceBusiness.sameAs[1]},{name:'SPL on LinkedIn',url:socials[2]},{name:'Find SPL in Bundall',url:contactSource.externalLinks.find(u=>u.includes('maps.app'))},{name:'SPL business listing',url:contactSource.externalLinks.find(u=>u.includes('localsearch.com.au'))}].filter(l=>l.url);
const weekdays=['Monday','Tuesday','Wednesday','Thursday','Friday'];
const usedTitles=new Map(),usedDescriptions=new Map();
function imageSize(file){try{const b=fs.readFileSync(file);if(b.subarray(1,4).toString()==='PNG')return[b.readUInt32BE(16),b.readUInt32BE(20)];if(b[0]===255&&b[1]===216){let i=2;while(i<b.length-9){if(b[i]!==255){i++;continue;}const marker=b[i+1],len=b.readUInt16BE(i+2);if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker))return[b.readUInt16BE(i+7),b.readUInt16BE(i+5)];if(len<2)break;i+=2+len;}}}catch{}return null;}
for(const entry of entries){
 const file=path.join(out,entry.file),original=fs.readFileSync(file,'utf8'),$=load(original),source=sources.get(entry.url),isHome=entry.url==='/',isProduct=entry.url.startsWith('/products/');
 const mainBefore=isHome?original.match(/<main[\s\S]*?<\/main>/)[0]:null,existingDescription=$('meta[name="description"]').attr('content');
 // Remove only our generated additions, making the build idempotent.
 $('[data-seo-generated]').remove();
 if(!isHome){$('main h1').slice(1).each((i,e)=>{const h=$('<h2></h2>').html($(e).html());for(const a of ['id','class'])if($(e).attr(a))h.attr(a,$(e).attr(a));$(e).replaceWith(h);});}
 const heading=clean($('h1').first().text()),oldTitle=clean($('head>title').text());
 let title=source?clean(source.og.find(m=>m.property==='og:title')?.content||source.title).replace(/\s+Time Icon$/,''):oldTitle;
 title=title.replace(/(?:\s*\|\s*SPL Security Solutions){2,}/g,' | SPL Security Solutions');
 if(isHome)title='SPL Security | Locksmiths, Security Systems & Door Hardware';
 if(!title)title=heading+' | '+config.siteName;
 if(!/SPL Security Solutions/i.test(title))title+=' | '+config.siteName;
 const preferredCanonical=canonicalUrl(entry.url);
 if(title===config.siteName||(usedTitles.has(title)&&usedTitles.get(title)!==preferredCanonical))title=heading+' | '+config.siteName;
 if(usedTitles.has(title)&&usedTitles.get(title)!==preferredCanonical)title=entry.url.split('/').filter(Boolean).pop().replace(/-/g,' ')+' | '+config.siteName;
 usedTitles.set(title,preferredCanonical);
 $('head>title').remove();$('head').prepend(`<title>${escape(title)}</title>`);
 const intro=$('.editorial-content .editorial-block p').map((i,e)=>clean($(e).text())).get().find(t=>t.length>100&&!/^(Servicing|FREE QUOTES|GOLD COAST|24\/7 EMERGENCY)/i.test(t));
 let description=clean(source?.description||existingDescription||intro||heading+' — services and advice from SPL Security Solutions.');
 if(isHome)description='Locksmiths, security systems, door hardware and retail/trade advice across the Gold Coast, Brisbane and Northern NSW. Call SPL on (07) 55 888 111.';
 if(usedDescriptions.has(description)&&usedDescriptions.get(description)!==preferredCanonical)description=heading+'. '+description;
 if(description.length>175){const shortened=description.slice(0,172);description=shortened.slice(0,shortened.lastIndexOf(' '))+'…';}
 if(usedDescriptions.has(description)&&usedDescriptions.get(description)!==preferredCanonical)description=title+'. Explore advice, services and contact details from SPL Security Solutions.';
 usedDescriptions.set(description,preferredCanonical);
 const canonical=canonicalUrl(entry.url),alias=sourcePath(entry.url)!==entry.url&&files.has(sourcePath(entry.url));
 if(alias)stats.aliases.push({url:entry.url,canonical:sourcePath(entry.url)});
 const meta=(attr,key,value)=>{$(`meta[${attr}="${key}"]`).remove();$('head').append(`<meta ${attr}="${key}" content="${escape(value)}" data-seo-generated>`);};
 meta('name','description',description);meta('name','robots',config.indexing==='preview'||alias?'noindex, follow':'index, follow, max-image-preview:large');
 $('link[rel="canonical"]').remove();$('head').append(`<link rel="canonical" href="${canonical}" data-seo-generated>`);
 let image=$('.editorial-image img').first().attr('src')||$('.hero-art img').first().attr('src');
 const sourceBlog=source?.schemas.find(s=>s['@type']==='BlogPosting'),blogImage=sourceBlog?.image;
 const sourceShareImage=typeof blogImage==='string'?blogImage:Array.isArray(blogImage)?blogImage[0]:blogImage?.url;
 const shareImage=sourceShareImage&&/^https?:/.test(sourceShareImage)?sourceShareImage:image?new URL(path.relative(out,path.resolve(path.dirname(file),image)).replaceAll('\\','/'),base).href:new URL('assets/spl-social-card.png',base).href;
 for(const [key,value]of Object.entries({'og:type':source?.schemas.some(s=>s['@type']==='BlogPosting')?'article':'website','og:site_name':config.siteName,'og:locale':config.locale,'og:title':title,'og:description':description,'og:url':canonical,'og:image':shareImage,'og:image:alt':heading||config.siteName}))meta('property',key,value);
 for(const [key,value]of Object.entries({'twitter:card':'summary_large_image','twitter:title':title,'twitter:description':description,'twitter:image':shareImage}))meta('name',key,value);
 meta('name','twitter:image:alt',heading||config.siteName);
 if(shareImage.startsWith(base.href)){const size=imageSize(path.join(out,decodeURIComponent(shareImage.slice(base.href.length))));if(size){meta('property','og:image:width',String(size[0]));meta('property','og:image:height',String(size[1]));}}
 $('meta[name="theme-color"]').remove();meta('name','theme-color','#090909');
 if(!$('link[rel="icon"]').length)$('head').append(`<link rel="icon" href="${href(file,'/').replace(/index\.html$/,'assets/spl-round-logo.png?v=20261015')}" type="image/png" data-seo-generated>`);
 // Fonts are self-hosted (assets/fonts, @font-face in styles.css/product.css); preload the two critical files.
 $('link[rel="preconnect"][href^="https://fonts.g"]').remove();
 for(const font of ['manrope-latin-var.woff2','dm-sans-latin-var.woff2'])if(!$(`link[rel="preload"][href$="${font}"]`).length)$('head').append(`<link rel="preload" href="${href(file,'/').replace(/index\.html$/,'assets/fonts/'+font)}" as="font" type="font/woff2" crossorigin data-seo-generated>`);
 if(!isHome)$('head').append(`<link rel="stylesheet" href="${path.relative(path.dirname(file),path.join(out,'seo.css')).replaceAll('\\','/')}?v=20261015" data-seo-generated>`);
 const webpage={'@type':entry.url==='/contact'?'ContactPage':entry.url==='/about'?'AboutPage':entry.url==='/articles'||entry.url==='/all-pages'?'CollectionPage':'WebPage','@id':canonical+'#webpage',url:canonical,name:title,description,inLanguage:'en-AU',isPartOf:{'@id':base.href+'#website'},about:{'@id':businessId}};
 const graph=[{'@type':'WebSite','@id':base.href+'#website',url:base.href,name:config.siteName,inLanguage:'en-AU'},webpage];
 if(isProduct)graph.push({'@type':'Product','@id':canonical+'#product',name:title.split('|')[0].trim(),description,image:shareImage,url:canonical,mainEntityOfPage:{'@id':canonical+'#webpage'}});
 if(!isHome)graph.push({'@type':'BreadcrumbList','@id':canonical+'#breadcrumb',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:base.href},{'@type':'ListItem',position:2,name:heading||title,item:canonical}]});
 {const glance={"/security-systems": "We design, install and maintain security systems, including CCTV and security cameras, alarm systems, round-the-clock alarm monitoring, intercoms and access control.", "/door-hardware": "We supply door hardware from leading brands, including door levers, door seals, door closers, fire door hardware and architectural door hardware, for retail and trade customers.", "/retail-security": "Our retail and trade range covers door handles and levers, safes, lock hardware, door closers and seals, fire door hardware and architectural door hardware.", "/alarm-monitoring": "We maintain and service security systems, including CCTV, access control and intercoms, as well as locks and restricted key systems, and also offer alarm monitoring."};if(glance[entry.url])summary=glance[entry.url];}if(entry.url==='/locksmiths'||entry.url==='/locksmith-services')summary='Our locksmith services cover homes, businesses and vehicles, from lockouts, lock repairs and key duplication to master key and restricted key systems, with 24/7 emergency help.';if(entry.url==='/contact'){
  graph.push({'@type':'Locksmith','@id':businessId,name:config.siteName,url:config.businessUrl,telephone:'+61755888111',email:'info@spl.com.au',address:sourceBusiness.address,image:new URL('assets/spl-social-card.png',base).href,sameAs:socials,areaServed:['Gold Coast','Brisbane','Northern NSW'],department:[{'@type':'LocalBusiness','@id':businessId+'-trade',name:'SPL Security Solutions — Trade Counter',telephone:'+61755888111',address:sourceBusiness.address,openingHoursSpecification:{'@type':'OpeningHoursSpecification',dayOfWeek:weekdays,opens:'07:00',closes:'16:30'}},{'@type':'LocalBusiness','@id':businessId+'-retail',name:'SPL Security Solutions — Retail Showroom',telephone:'+61755888111',address:sourceBusiness.address,openingHoursSpecification:{'@type':'OpeningHoursSpecification',dayOfWeek:weekdays,opens:'08:00',closes:'17:00'}}]});
  $('.contact-draft .kicker').text("LET'S TALK");$('.contact-draft button[type="submit"]').text('Send enquiry ↗');
  $('.editorial-content').prepend(`<section class="business-hours" data-seo-generated><h2>Visit or contact SPL</h2><p><strong>SPL Security Solutions</strong><br>101 Ashmore Rd, Bundall QLD 4217<br><a href="tel:+61755888111">(07) 55 888 111</a> · <a href="mailto:info@spl.com.au">info@spl.com.au</a></p><dl><dt>Trade counter</dt><dd>Monday–Friday, 7:00 am–4:30 pm</dd><dt>Retail showroom</dt><dd>Monday–Friday, 8:00 am–5:00 pm</dd><dt>Saturday & Sunday</dt><dd>Trade counter and retail showroom closed</dd><dt>Emergency locksmith & electronic security</dt><dd>Available 24 hours, 7 days</dd></dl></section>`);
  $('.expanded-footer>div').append(require('./lib/profile-icons.cjs').contactRow());
 }
 if(source){
  const snapshot=path.join(root,'.source-cache',crypto.createHash('sha256').update(entry.url).digest('hex')+'.html'),originalSource=load(fs.readFileSync(snapshot,'utf8')),visible=clean($('.editorial-content').text());
  const questions=[];originalSource('.accordion-item').each((i,e)=>{const name=clean(originalSource(e).find('.accordion-title').text()),text=clean(originalSource(e).find('.accordion-description').text());if(name&&text&&visible.includes(name)&&visible.includes(text))questions.push({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}});});
  if(questions.length){graph.push({'@type':'FAQPage','@id':canonical+'#faq',mainEntity:questions});stats.faqPages++;stats.questions+=questions.length;}
  const blog=source.schemas.find(s=>s['@type']==='BlogPosting');
  if(blog){const article={'@type':'BlogPosting','@id':canonical+'#article',headline:plain(blog.headline||heading),mainEntityOfPage:{'@id':canonical+'#webpage'},image:shareImage,publisher:{'@id':businessId}};for(const key of ['datePublished','dateModified'])if(blog[key]&&!isNaN(Date.parse(blog[key])))article[key]=blog[key];const authorName=clean(blog.author?.name||'');if(authorName)article.author={'@type':'Organization',name:authorName};graph.push(article);stats.articles++;if(article.datePublished){$('.editorial-content').prepend(`<p class="article-byline" data-seo-generated>${escape(authorName||config.siteName)} · Published <time datetime="${escape(article.datePublished)}">${new Intl.DateTimeFormat('en-AU',{day:'numeric',month:'long',year:'numeric',timeZone:'Australia/Brisbane'}).format(new Date(article.datePublished))}</time></p>`);}}
  const group=groups.find(g=>g.match.test(entry.url));
  if(group&&!blog&&!alias&&entry.url!==group.url)graph.push({'@type':'Service','@id':canonical+'#service',name:heading,serviceType:group.name,provider:{'@id':businessId},areaServed:['Gold Coast','Brisbane','Northern NSW'],url:canonical});
  if(intro&&!isHome){const sentences=intro.match(/[^.!?]+[.!?]+(?:\s|$)/g);let summary=sentences?.[0]?.trim()||intro;if(summary.length>460)summary=intro.slice(0,430).replace(/\s+\S*$/,'')+'…';summary=summary.charAt(0).toUpperCase()+summary.slice(1);if(entry.url==='/contact')summary='Visit SPL Security Solutions at 101 Ashmore Rd, Bundall ((07) 55 888 111) or Unit 2/269 River St, Ballina ((02) 6686 7675). Our 24/7 emergency line is (07) 55 888 111.';$('.editorial-content').prepend(`<section class="answer-summary" data-seo-generated aria-label="At a glance"><p class="kicker">AT A GLANCE</p><p>${escape(summary)}</p></section>`);stats.answerSummaries++;}
  const headings=$('.editorial-content h2,.editorial-content h3').filter((i,e)=>clean($(e).text()).length>2).slice(0,12);if(headings.length>=3){const items=[];headings.each((i,e)=>{let id=$(e).attr('id');if(!id){id='section-'+clean($(e).text()).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');if($(`[id="${id}"]`).length)id+='-'+i;$(e).attr('id',id);}items.push(`<a href="#${escape(id)}">${escape(clean($(e).text()))}</a>`);});$('.editorial-content').prepend(`<details class="page-toc" data-seo-generated><summary>On this page</summary><div>${items.join('')}</div></details>`);stats.tablesOfContents++;}
  if(group){const candidates=groups.filter(g=>g!==group).slice(0,2);const related=[{name:group.name,url:group.url},...candidates,{name:'Service areas',url:'/service-area'},{name:'Get advice from SPL',url:'/contact'}].filter(p=>p.url!==entry.url);$('.expert-card').append(`<div class="contextual-links" data-seo-generated><p class="kicker">RELATED SERVICES</p>${related.map(p=>`<a href="${href(file,p.url)}">${escape(p.name)}</a>`).join('')}</div>`);stats.contextualLinkPages++;}
 }
 // Canonicalise internal links so authority isn't divided among known duplicate source aliases.
 $('a[href]').each((i,e)=>{const h=$(e).attr('href');if(/^(https?:|mailto:|tel:|#)/.test(h))return;const resolved=path.resolve(path.dirname(file),h.split(/[?#]/)[0]);const target=entries.find(p=>path.join(out,p.file)===resolved);if(target&&files.has(sourcePath(target.url))&&sourcePath(target.url)!==target.url)$(e).attr('href',href(file,sourcePath(target.url),h.includes('#')?'#'+h.split('#')[1]:''));});
 if(!isHome)$('img[src]').each((i,e)=>{const h=$(e).attr('src');if(/^https?:|^data:/.test(h))return;const size=imageSize(path.resolve(path.dirname(file),h));if(size){$(e).attr('width',size[0]).attr('height',size[1]);stats.imagesSized++;}$(e).attr('decoding','async');if(!$(e).closest('.brand,.hero-art').length)$(e).attr('loading','lazy');if(!$(e).attr('alt'))$(e).attr('alt',$(e).closest('.brand').length?config.siteName:heading+' — SPL Security Solutions');});
 $('script[data-seo-schema]').remove();$('head').append(`<script type="application/ld+json" data-seo-schema>${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')}</script>`);
 let output=$.html();
 // Preserve the homepage's entire visible body byte-for-byte, including its product design.
 if(isHome){const head=output.match(/<head>[\s\S]*?<\/head>/)[0].split('\n').map(line=>line.trimEnd()).join('\n');output=original.replace(/<head>[\s\S]*?<\/head>/,head);if(output.match(/<main[\s\S]*?<\/main>/)[0]!==mainBefore)throw Error('Homepage main changed');}
 fs.writeFileSync(file,isHome?output:output.split('\n').map(line=>line.trimEnd()).join('\n').trimEnd()+'\n');stats.pages++;
}
const primary=entries.filter(e=>!stats.aliases.some(a=>a.url===e.url));
fs.writeFileSync(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${primary.map(e=>`<url><loc>${escape(canonicalUrl(e.url))}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(out,'robots.txt'),`# GitHub project-site robots.txt is informational; host-root robots.txt controls crawling.\n# Preview pages use HTML noindex; allow crawling so crawlers can read that directive.\nUser-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml',base).href}\n`);
fs.writeFileSync(path.join(out,'404.html'),`<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex, follow"><title>Page not found | SPL Security Solutions</title><style>body{font:18px Arial;background:#090909;color:white;margin:10vw;line-height:1.6}a{color:#f7c600}h1{font-size:48px}</style></head><body><h1>Let’s find the right solution.</h1><p>This page isn’t available.</p><p><a href="${base.href}">SPL home</a> · <a href="${new URL('service-area/',base).href}">Our service regions</a> · <a href="tel:+61755888111">(07) 55 888 111</a></p></body></html>\n`);
fs.writeFileSync(path.join(root,'seo-build-report.json'),JSON.stringify({mode:config.indexing,siteUrl:base.href,...stats,sitemapUrls:primary.length},null,2));console.log(JSON.stringify(stats,null,2));
const csv=s=>'"'+String(s).replaceAll('"','""')+'"';
require('./enforce-regional-scope.cjs')();
require('./repair-page-layout.cjs')();
require('./normalize-locksmith-headings.cjs')();
require('./remove-download-resources.cjs')();
require('./consolidate-service-areas.cjs')();
require('./clean-page-consistency.cjs')();
require('./consolidate-action-buttons.cjs')();
require('./clean-import-remnants.cjs')();
require('./neutralize-service-regions.cjs')();
require('./refresh-blog-posts.cjs')();
require('./standardize-editorial-images.cjs')().catch(error=>{console.error(error);process.exitCode=1;});
fs.writeFileSync(path.join(root,'backlink-migration.csv'),['original_url,preferred_production_url,demo_canonical_url,launch_action',...audit.pages.filter(p=>!(config.excludedPaths||[]).includes(p.path)).map(p=>[new URL(p.path,config.businessUrl).href,new URL(sourcePath(p.path),config.businessUrl).href,canonicalUrl(p.path),sourcePath(p.path)===p.path?'Preserve existing production path':'301 redirect alias on production host at launch'].map(csv).join(','))].join('\n')+'\n');
require('./apply-regional-redirects.cjs')();
require('./add-ballina-page.cjs')();
require('./nav-heading-links.cjs')();
