// Service areas as cards (same .values-grid/.values-card style as About > Our Values), using the existing
// /locations/ wording only. Applies to /locations/ and the service pages' consolidated region lists. Idempotent.
const fs=require('fs'),path=require('path');
const out=path.join(path.resolve(__dirname,'..'),'public');
const areas=[['service-area-gold-coast','SPL Security Gold Coast','The Gold Coast is serviced from our Bundall office.','locations/index.html#gold-coast','Gold Coast showroom'],
 ['brisbane','SPL Security Brisbane','Brisbane is serviced from our Gold Coast office.','locations/index.html#gold-coast','Gold Coast showroom'],
 ['northern-nsw','SPL Security Northern NSW','Northern NSW is serviced from our Ballina showroom.','ballina/index.html','Ballina showroom']];
const walk=(d,a=[])=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f,a);else if(e.name.endsWith('.html'))a.push(f);}return a;};
module.exports=function run(){const changed=[];
 for(const f of walk(out)){const h=fs.readFileSync(f,'utf8');if(!h.includes('class="region-list"')&&!h.includes('<h2 id="service-areas"'))continue;
  const rel=path.relative(out,f).replaceAll('\\','/'),onLoc=rel==='locations/index.html';
  const href=t=>{if(onLoc&&t.startsWith('locations/index.html'))return t.slice('locations/index.html'.length);return path.relative(path.dirname(f),path.join(out,t.split('#')[0])).replaceAll('\\','/')+(t.includes('#')?'#'+t.split('#')[1]:'');};
  const grid=`<ul class="values-grid service-area-cards" aria-label="Service areas">${areas.map(([id,name,line,t,label])=>`<li class="values-card"><h3${onLoc?` id="${id}"`:''}>${name}</h3><p>${line}</p><a href="${href(t)}">${label} <span aria-hidden="true">→</span></a></li>`).join('')}</ul>`;
  let n=h.replace(/<ul class="region-list">[\s\S]*?<\/ul>/,grid);
  if(onLoc)n=n.replace(/(<h2 id="service-areas" class="section-anchor">Service areas<\/h2>)<h3 id="service-area-gold-coast">[\s\S]*?Northern NSW is serviced from our Ballina showroom\.<\/p>/,`$1${grid}`);
  if(n!==h){fs.writeFileSync(f,n);changed.push(rel);}}
 return changed;};
if(require.main===module)console.log(JSON.stringify(module.exports()));
