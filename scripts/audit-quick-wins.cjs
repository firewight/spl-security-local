// Oct 2026 PM audit quick wins (idempotent; runs last in optimize-seo after standardize-editorial-images):
// - BlogPosting schema images point at the local assets/blog/ copies (old Duda CDN goes away at launch)
// - BlogPosting author added where missing (SPL Security Solutions)
// - Blog posts: a 'Related articles' H2 above the imported related-posts tail, and heading-level skips closed
// - geo (from the Gold Coast map embed) and hasMap on the Gold Coast / Ballina Locksmith nodes
// - header/footer logo width/height; tap-target, breadcrumb and label CSS (pages.css block)
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public'),base=require('../seo.config.json').siteUrl;
const walk=(d,a=[])=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f,a);else if(e.name.endsWith('.html'))a.push(f);}return a;};
const PAGES_CSS_V='20261028-doornav';
const GEO={'#gold-coast':{geo:{'@type':'GeoCoordinates',latitude:-28.0092643,longitude:153.4015131},hasMap:'https://www.google.com/maps/search/?api=1&query=-28.0092643%2C153.4015131'},
 '#ballina':{hasMap:'https://maps.google.com/maps?q=SPL%20Ballina%20Locksmiths%2C%20Unit%202%2F269%20River%20Street%2C%20Ballina%20NSW%202478'}};
const CSS=`/* audit-quick-wins */
.menu-toggle{position:relative}.menu-toggle::after{content:"";position:absolute;inset:-13px -12px}
.breadcrumbs a{text-decoration:underline;text-underline-offset:3px;position:relative}.breadcrumbs a::after{content:"";position:absolute;inset:-12px -4px}
.page-toc a{position:relative}.page-toc a::after{content:"";position:absolute;inset:-6px 0}
dd>a[href^="tel:"],p>a[href^="tel:"],p>a[href^="mailto:"],.links a{position:relative}dd>a[href^="tel:"]::after,p>a[href^="tel:"]::after,p>a[href^="mailto:"]::after,.links a::after{content:"";position:absolute;inset:-12px 0}
.service-facts span{font-size:12px}
body .answer-summary .kicker,body .expert-card .kicker,body .contact-option small,body .contact-options .contact-eyebrow,body .hero-copy .kicker{font-size:12px}
form[data-spl-form] .form-error{display:block;color:#a4161a;font-size:13px;font-weight:600;margin-top:6px}form[data-spl-form] [aria-invalid="true"]{border-color:#a4161a;box-shadow:0 0 0 1px #a4161a}.form-status.error{color:#a4161a;font-weight:600}form[data-spl-form] .form-privacy{font-size:13px;line-height:1.6;color:#555;margin:0}
footer>.footer-links{margin:0;font-size:12px;line-height:1.7}footer>.footer-links a{color:#fff;text-underline-offset:3px;white-space:nowrap}
/* end audit-quick-wins */`;
module.exports=function run(){const stats={blogImages:0,authors:0,related:0,headingFixes:0,geo:0,logos:0};
 for(const f of walk(out)){let h=fs.readFileSync(f,'utf8');const b=h;if(/http-equiv="refresh"/.test(h))continue;
  const up=path.relative(path.dirname(f),out).replaceAll('\\','/');
  h=h.replace(/(<script type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g,(m,o,j,c)=>{let d;try{d=JSON.parse(j);}catch{return m;}let ch=false;
   for(const n of d['@graph']||[d]){
    if(n['@type']==='BlogPosting'){const slug=path.basename(path.dirname(f)),loc=path.join(out,'assets/blog',slug+'.webp');
     if(fs.existsSync(loc)&&n.image!==base+'assets/blog/'+slug+'.webp'){n.image=base+'assets/blog/'+slug+'.webp';ch=true;stats.blogImages++;}
     if(!n.author){n.author={'@type':'Organization','name':'SPL Security Solutions'};ch=true;stats.authors++;}}
    for(const [k,v] of Object.entries(GEO))if(n['@id']&&n['@id'].endsWith(k)&&String(n['@type'])==='Locksmith')for(const [p,val] of Object.entries(v))if(JSON.stringify(n[p])!==JSON.stringify(val)){n[p]=val;ch=true;stats.geo++;}}
   return ch?o+JSON.stringify(d).replaceAll('<','\\u003c')+c:m;});
  h=h.replace(/<img src="([^"]*spl-logo-white\.webp)" alt="([^"]*)">/g,(m,s,a)=>{stats.logos++;return `<img src="${s}" alt="${a}" width="300" height="140">`;});
  if(h.includes('class="article-byline"')){
   if(!h.includes('id="section-related-articles"')){const i=h.search(/<div class="editorial-block"><h3 id="[^"]*">\s*<a href="[^"]*">/);
    if(i>0){let s=h.lastIndexOf('\n',i-1);const prev=h.slice(h.lastIndexOf('\n',s-1)+1,s+1);const at=prev.startsWith('<figure')?h.lastIndexOf('\n',s-1)+1:s+1;
     h=h.slice(0,at)+'<div class="editorial-block"><h2 id="section-related-articles">Related articles</h2></div>\n'+h.slice(at);stats.related++;}}
   const a=h.indexOf('<article class="editorial-content">'),e=h.indexOf('</article>',a);
   if(a>0&&e>a){let last=1,shift=0,from=9;const body=h.slice(a,e).replace(/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/g,(m,l,at,t)=>{l=+l;if(l<from){shift=0;from=9;}let n=l-shift;if(n>last+1){shift+=n-(last+1);from=Math.min(from,l);n=last+1;}last=n;if(n===l)return m;stats.headingFixes++;return `<h${n}${at}>${t}</h${n}>`;});h=h.slice(0,a)+body+h.slice(e);}}
  // Performance (Oct 2026): favicon hint so browsers pick the 32px icon, lazy map iframes, LCP image priority.
  h=h.replace(/<link rel="icon" href="([^"]*spl-round-logo\.png[^"]*)" type="image\/png"/g,'<link rel="icon" href="$1" sizes="574x574" type="image/png"');
  h=h.replace(/<iframe (?![^>]*loading=)([^>]*google\.com\/maps[^>]*)>/g,'<iframe loading="lazy" $1>');
  if(/[\\/]locations[\\/]index\.html$/.test(f))h=h.replace(/(<figure class="showroom-photo"><picture>(?:(?!<\/picture>)[\s\S])*?<img )(?!fetchpriority)/,'$1fetchpriority="high" ');
  if(/[\\/]blog[\\/]index\.html$/.test(f)){const i=h.indexOf('<li class="blog-card">'),j=i<0?-1:h.indexOf('>',h.indexOf('<img ',i));if(j>0){const tag=h.slice(h.indexOf('<img ',i),j+1);h=h.replace(tag,tag.replace('loading="lazy"','loading="eager"').replace(/^<img (?!fetchpriority)/,'<img fetchpriority="high" '));}}
  h=h.replace(/pages\.css\?v=[^"]*/,'pages.css?v='+PAGES_CSS_V);
  if(h!==b)fs.writeFileSync(f,h);}
 const cf=path.join(out,'pages.css');let css=fs.readFileSync(cf,'utf8');const n=css.replace(/\n?\/\* audit-quick-wins \*\/[\s\S]*?\/\* end audit-quick-wins \*\//,'').trimEnd()+'\n'+CSS+'\n';if(n!==css)fs.writeFileSync(cf,n);
 return stats;};
if(require.main===module)console.log(module.exports());
