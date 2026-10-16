// Main menu: each top-level dropdown heading is a real link to its overview page, with a separate chevron
// button (aria-expanded/aria-controls) that opens the submenu. The '<X> overview' items are removed.
// Locations links to /locations/ (consistent with the others). Converts the <details class="nav-group">
// markup that import-pages.cjs generates; idempotent. Behaviour lives in public/navigation.js, styles in pages.css.
require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path');
const out=path.join(path.resolve(__dirname,'..'),'public');
const slug=s=>s.toLowerCase().replace(/&amp;|&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const walk=(d,a=[])=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f,a);else if(e.name.endsWith('.html'))a.push(f);}return a;};
module.exports=function run(){let n=0;
 for(const f of walk(out)){const h=fs.readFileSync(f,'utf8');if(!h.includes('<details class="nav-group">'))continue;
  const rel=p=>path.relative(path.dirname(f),path.join(out,p)).replaceAll('\\','/');
  const x=h.replace(/<details class="nav-group"><summary>([^<]*)<\/summary><div class="nav-dropdown">([\s\S]*?)<\/div><\/details>/g,(m,label,items)=>{
   let href=null;
   items=items.replace(/<a href="([^"]*)"[^>]*>[^<]*? overview<\/a>/,(mm,u)=>{href=u;return '';});
   if(!href&&label==='Locations')href=rel('locations/index.html');
   if(!href)return m;
   const cur=/^(?:index\.html|\.\/index\.html)$/.test(href)?'':'';
   const id='nav-sub-'+slug(label);
   return `<div class="nav-group"><a class="nav-top-link" href="${href}">${label}</a><button type="button" class="nav-expand" aria-expanded="false" aria-controls="${id}" aria-label="Show ${label} menu"></button><div class="nav-dropdown" id="${id}" hidden>${items}</div></div>`;});
  if(x!==h){fs.writeFileSync(f,x);n++;}}
 // Top-menu 'Contact Us' goes to the contact page (not the #contact-options panel at the bottom).
 for(const f of walk(out)){const h=fs.readFileSync(f,'utf8');const href=path.relative(path.dirname(f),path.join(out,'contact/index.html')).replaceAll('\\','/');
  const x=h.replace(/(<\/div><\/div>)<a href="#contact-options">Contact Us<\/a>(<\/nav>)/,`$1<a href="${href}">Contact Us</a>$2`);
  if(x!==h){fs.writeFileSync(f,x);n++;}}
 return n;};
if(require.main===module)console.log(JSON.stringify({files:module.exports()}));
