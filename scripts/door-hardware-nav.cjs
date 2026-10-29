// Door Hardware nav dropdown: ONLY "Architectural Door Hardware" (no Retail & Trade product links).
// Idempotent: ensure Architectural primary link exists, then strip levers/closers/fire/lock dupes.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..','public');
function walk(d,o=[]){for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);if(f.isDirectory()){if(f.name!=='assets')walk(p,o);}else if(f.name.endsWith('.html'))o.push(p);}return o;}
module.exports=function(){let n=0;for(const f of walk(root)){let s=fs.readFileSync(f,'utf8');
 const reLead=/(<a class="nav-top-link" href="([^"]*)architectural-door-hardware\/index\.html">Door Hardware<\/a>[\s\S]*?<div class="nav-dropdown" id="nav-sub-door-hardware"[^>]*>)(?!<a class="nav-primary-link")/;
 let t=s.replace(reLead,(m,a,pre)=>a+`<a class="nav-primary-link" href="${pre}architectural-door-hardware/index.html">Architectural Door Hardware</a>`);
 const reDrop=/(<div class="nav-dropdown" id="nav-sub-door-hardware"[^>]*>)([\s\S]*?)(<\/div>)/;
 t=t.replace(reDrop,(m,open,inner,close)=>{
   const keep=[...inner.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map(x=>x[0]).filter(a=>a.includes('Architectural Door Hardware'));
   if(!keep.length) return m;
   const next=open+keep.join('')+close;
   return next===open+inner+close?m:next;
 });
 if(t!==s){fs.writeFileSync(f,t);n++;}}return n;};
if(require.main===module)console.log('door-hardware-nav',module.exports());
