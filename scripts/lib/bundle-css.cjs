// Build-time CSS bundling for the HostPapa package (source pages in public/ keep their
// individual <link> tags so the generator scripts stay idempotent).
// For every HTML page, each run of consecutive local <link rel="stylesheet"> tags in <head>
// (not interrupted by a <style> block) is replaced by ONE link to a content-hashed bundle in
// assets/css/. The bundle is the exact concatenation of the original files in the original
// order, with url() references rebased, so the cascade and appearance are unchanged.
// The original CSS files stay in the package (harmless, and keeps old cached HTML working).
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const attr=(tag,n)=>{const m=tag.match(new RegExp('\\s'+n+'\\s*=\\s*("([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'));return m?(m[2]??m[3]??m[4]):null;};
module.exports=function bundleCss(web,opts={}){
  const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
  const outDir=path.join(web,'assets','css');const bundles=new Map();let pages=0,linksRemoved=0;
  const rebase=(css,fromDir)=>css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g,(m,q,u)=>{
    if(/^(data:|https?:|\/\/|#|\/)/i.test(u))return m;
    const abs=path.resolve(fromDir,u.split(/[?#]/)[0]);const suffix=u.slice(u.split(/[?#]/)[0].length);
    return `url(${q}${path.relative(outDir,abs).split(path.sep).join('/')}${suffix}${q})`;});
  for(const f of walk(web).filter(f=>f.endsWith('.html'))){
    if(f.startsWith(path.join(web,'assets')+path.sep))continue;
    let s=fs.readFileSync(f,'utf8');const headEnd=s.search(/<\/head>/i);if(headEnd<0)continue;
    const head=s.slice(0,headEnd);const tokens=[];const re=/<style\b[\s\S]*?<\/style>|<link\b[^>]*>/gi;let m;
    while((m=re.exec(head))){const t=m[0];
      if(/^<style/i.test(t)){tokens.push({type:'style'});continue;}
      if((attr(t,'rel')||'').toLowerCase()!=='stylesheet'){continue;}
      const href=attr(t,'href');const media=(attr(t,'media')||'all').toLowerCase();
      const local=href&&!/^(https?:)?\/\//i.test(href)&&media==='all';
      tokens.push({type:local?'css':'style',tag:t,index:m.index,href});}
    const runs=[];let cur=[];for(const t of tokens){if(t.type==='css')cur.push(t);else{if(cur.length)runs.push(cur);cur=[];}}if(cur.length)runs.push(cur);
    const pageDir=path.dirname(f);let edits=[];
    for(const run of runs.filter(r=>r.length>=2)){
      const files=run.map(t=>{const p=t.href.split(/[?#]/)[0];return p.startsWith('/')?path.join(web,p):path.resolve(pageDir,p);});
      if(!files.every(p=>fs.existsSync(p)))continue;
      const css=files.map(p=>`/* ${path.relative(web,p)} */\n`+rebase(fs.readFileSync(p,'utf8'),path.dirname(p))).join('\n');
      const hash=crypto.createHash('sha256').update(css).digest('hex').slice(0,10);
      const name=`bundle-${hash}.css`;bundles.set(name,{css,files:files.map(p=>path.relative(web,p))});
      const rel=run[0].href.startsWith('/')?'/assets/css/'+name:path.relative(pageDir,path.join(outDir,name)).split(path.sep).join('/');
      edits.push({at:run[0].index,len:run[0].tag.length,rep:`<link rel="stylesheet" href="${rel}">`});
      for(const t of run.slice(1))edits.push({at:t.index,len:t.tag.length,rep:''});
      linksRemoved+=run.length-1;}
    if(!edits.length)continue;
    edits.sort((a,b)=>b.at-a.at);for(const e of edits)s=s.slice(0,e.at)+e.rep+s.slice(e.at+e.len);
    fs.writeFileSync(f,s);pages++;}
  if(bundles.size){fs.mkdirSync(outDir,{recursive:true});for(const[n,b]of bundles)fs.writeFileSync(path.join(outDir,n),b.css);}
  return {pages,linksRemoved,bundles:[...bundles].map(([n,b])=>({name:n,files:b.files,bytes:Buffer.byteLength(b.css)}))};
};
