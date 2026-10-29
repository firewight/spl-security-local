// Leaves unreferenced media out of the HostPapa package. A file under assets/ is dropped only when its
// file name appears in NO deployed text file (HTML, CSS bundles, JS, XML sitemap, JSON, webmanifest,
// .htaccess, PHP, SVG, TXT). Source files in public/ are untouched (some prep scripts still read them).
const fs=require('fs'),path=require('path');
module.exports=function pruneUnusedAssets(web){
  const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
  const all=walk(web);const TEXT=/(\.(html|css|js|xml|json|webmanifest|php|svg|txt|md)|\.htaccess)$/i;
  const corpus=all.filter(f=>TEXT.test(f)).map(f=>fs.readFileSync(f,'utf8')).join('\n');
  const removed=[];let bytes=0;
  for(const f of all){const rel=path.relative(web,f);
    if(!rel.startsWith('assets'+path.sep)||TEXT.test(f))continue;
    const b=path.basename(f);
    if(corpus.includes(b)||corpus.includes(encodeURI(b)))continue;
    bytes+=fs.statSync(f).size;fs.unlinkSync(f);removed.push(rel.split(path.sep).join('/'));}
  return {count:removed.length,kb:Math.round(bytes/1024),removed:removed.sort()};
};
