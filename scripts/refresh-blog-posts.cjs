// Light refresh of the 2017-2020 blog posts (Oct 2026): fixes broken/self links, points links at the current
// service pages, removes RSS "The post ... appeared first on" remnants, fixes an apostrophe typo, and marks each
// changed post "Last updated October 2026" (visible byline + schema dateModified). Original publish dates untouched.
// No facts, prices or claims are changed; items needing SPL input are listed in the Oct 2026 report. Idempotent.
require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path');
const out=path.join(path.resolve(__dirname,'..'),'public');
const UPDATED='2026-10-16T00:00:00',LABEL='October 2026';
const rss=/<div class="editorial-block">\s*<p>The post <a [^>]*>[^<]*<\/a>\s*appeared first on <a [^>]*>[\s\S]*?<\/a>\.<\/p>\s*<\/div>\n?/;
const edits={
 '3-reasons-to-install-a-cctv-security-camera-at-your-home-or-business':[[rss,'']],
 '5-questions-to-consider-when-buying-a-gun-safe':[[rss,'']],
 'why-you-need-a-home-security-system-asap':[
  ['<a href="../../blog/why-you-need-a-home-security-system-asap/index.html">What To Consider When Purchasing a Safe</a>','<a href="../../blog/what-to-consider-when-purchasing-a-safe/index.html">What To Consider When Purchasing a Safe</a>'],
  [/<a href="\.\.\/\.\.\/blog\/why-you-need-a-home-security-system-asap\/index\.html">Why You Need A Home Security System ASAP <span aria-hidden="true">↗<\/span><\/a>/,'']],
 'reasons-your-car-key-isnt-working':[['<a href="../../locksmith-services/index.html">emergency locksmith</a>','<a href="../../emergency-locksmith/index.html">emergency locksmith</a>']],
 'reasons-people-need-an-emergency-locksmith':[['<a href="../../locksmith-services/index.html">Emergency locksmith</a>','<a href="../../emergency-locksmith/index.html">Emergency locksmith</a>']],
 'how-technology-is-changing-for-locksmiths':[['Changing for Locksmith’s','Changing for Locksmiths']],
};
// Labels that point at a renamed post, on any page.
const siteWide=[['Changing for Locksmith’s','Changing for Locksmiths']];
const walk=(d,a=[])=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f,a);else if(e.name.endsWith('.html'))a.push(f);}return a;};
module.exports=function run(){const changed=[];
 for(const f of walk(out)){let h=fs.readFileSync(f,'utf8');const b=h;for(const [a,c]of siteWide)h=h.split(a).join(c);if(h!==b)fs.writeFileSync(f,h);}
 for(const [slug,list]of Object.entries(edits)){const f=path.join(out,'blog',slug,'index.html');let h=fs.readFileSync(f,'utf8');const b=h;
  for(const [a,c]of list)h=typeof a==='string'?h.split(a).join(c):h.replace(a,c);
  if(h!==b||!h.includes('Last updated <time')){
   h=h.replace(/(<p class="article-byline"[^>]*>[\s\S]*?<\/time>)(<\/p>)/,(m,x,y)=>m.includes('Last updated')?m:`${x} · Last updated <time datetime="${UPDATED.slice(0,10)}">${LABEL}</time>${y}`);
   h=h.replace(/"dateModified":"[^"]*"/,`"dateModified":"${UPDATED}"`);}
  if(h!==b){fs.writeFileSync(f,h);changed.push(slug);}}
 return changed;};
if(require.main===module)console.log(JSON.stringify(module.exports()));
