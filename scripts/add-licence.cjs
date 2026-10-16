// QLD Security Licence 3247282 (number supplied by SPL; listed on SPL's previous site). Class not verified, so no class wording.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public');
const CRED={"@type":"EducationalOccupationalCredential","credentialCategory":"licence","name":"QLD Security Licence 3247282","identifier":"3247282"};
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):e.name.endsWith('.html')?[path.join(d,e.name)]:[])}
module.exports=function(){let n=0;
 for(const f of walk(out)){let h=fs.readFileSync(f,'utf8');const b=h;if(/http-equiv="refresh"/.test(h))continue;
  // Homepage trust badge
  h=h.replace('<strong>QLD licensed</strong><small>Master Builders QLD licence 23411</small>','<strong>QLD licensed</strong><small>QLD Security Licence 3247282</small><small>Master Builders QLD licence 23411</small>');
  // Footer legal line
  h=h.replace(/<p class="footer-links footer-abn">SPL Security Solutions Pty Ltd · ABN 39 088 382 745(?: · QLD Security Licence 3247282)?<\/p>/,'<p class="footer-links footer-abn">SPL Security Solutions Pty Ltd · ABN&nbsp;39&nbsp;088&nbsp;382&nbsp;745 · QLD&nbsp;Security&nbsp;Licence&nbsp;3247282</p>');
  // Schema: business entities
  h=h.replace(/<script type="application\/ld\+json"([^>]*)>([\s\S]*?)<\/script>/g,(m,a,j)=>{let d;try{d=JSON.parse(j)}catch{return m}let ch=false;
   const visit=o=>{if(Array.isArray(o))return o.forEach(visit);if(!o||typeof o!=='object')return;const t=[].concat(o['@type']||[]);
    if(t.some(x=>['Locksmith','LocalBusiness','Organization'].includes(x))&&/#business$|#gold-coast$/i.test(o['@id']||'')&&!/ballina/i.test(o['@id']||'')&&o.name){const c=[].concat(o.hasCredential||[]);if(!c.some(x=>x.identifier==='3247282')){o.hasCredential=[...c,CRED];ch=true;}}
    Object.values(o).forEach(visit)};visit(d);return ch?`<script type="application/ld+json"${a}>${JSON.stringify(d)}</script>`:m;});
  if(h!==b){fs.writeFileSync(f,h);n++;if(path.relative(out,f)==='index.html'){const mf=path.join(root,'page-import-manifest.json'),mm=JSON.parse(fs.readFileSync(mf,'utf8'));mm.homepageMainSha256=crypto.createHash('sha256').update(h.match(/<main[\s\S]*?<\/main>/)[0]).digest('hex');fs.writeFileSync(mf,JSON.stringify(mm,null,2)+'\n');}}}
 return n;};
if(require.main===module)console.log('add-licence',module.exports());
