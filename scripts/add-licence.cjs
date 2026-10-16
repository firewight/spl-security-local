// QLD Security Licence 3247282 (number supplied by SPL; listed on SPL's previous site). Class not verified, so no class wording.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public');
const CREDS=[{"@type":"EducationalOccupationalCredential","credentialCategory":"licence","name":"QLD Security Licence 3247282","identifier":"3247282"},{"@type":"EducationalOccupationalCredential","credentialCategory":"licence","name":"NSW Security Licence 000102071","identifier":"000102071"}];
const MEMBERS=[{"@type":"ProgramMembership","programName":"Master Locksmiths Association of Australasia","membershipNumber":"6386"},{"@type":"ProgramMembership","programName":"Australian Security Industry Association Ltd (ASIAL)","membershipNumber":"C908"}];
const LOCK=['locksmith-services','residential-locksmith','commercial-locksmith','emergency-locksmith','auto-locksmith','restricted-keys'],SEC=['security-systems','cctv-system','alarm-system','alarm-monitoring','access-control-systems','intercom'];
const FOOT='<p class="footer-links footer-abn">SPL Security Solutions Pty Ltd · ABN&nbsp;39&nbsp;088&nbsp;382&nbsp;745 · QLD&nbsp;Security&nbsp;Licence&nbsp;3247282 · NSW&nbsp;Security&nbsp;Licence&nbsp;000102071</p>';
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):e.name.endsWith('.html')?[path.join(d,e.name)]:[])}
module.exports=function(){let n=0;
 for(const f of walk(out)){let h=fs.readFileSync(f,'utf8');const b=h;if(/http-equiv="refresh"/.test(h))continue;
  // Homepage trust badge
  h=h.replace(/<strong>QLD licensed<\/strong>(<small>[^<]*<\/small>)+/,'<strong>QLD licensed</strong><small>QLD Security Licence 3247282</small>');
  const rel=path.relative(out,path.dirname(f)).replaceAll('\\','/');
  const fact=LOCK.includes(rel)?'Master Locksmiths Association of Australasia member 6386':SEC.includes(rel)?'ASIAL member C908':'';
  if(fact&&!h.includes(fact))h=h.replace(/(<div class="service-facts">[\s\S]*?)(<\/div>)/,`$1<span>${fact}</span>$2`);
  // Official MLAA Professional Guarantee badge (as used on SPL's previous site), unmodified, beside the MLAA line.
  if(LOCK.includes(rel)&&!h.includes('mlaa-professional-guarantee.png'))h=h.replace('<span>Master Locksmiths Association of Australasia member 6386</span>','<span style="display:inline-flex;align-items:center;gap:8px"><img src="../assets/mlaa-professional-guarantee.png" alt="Master Locksmiths Professional Guarantee badge" width="48" height="37" loading="lazy" decoding="async" style="width:48px;height:auto;flex:none">Master Locksmiths Association of Australasia member 6386</span>');
  // Footer legal line
  h=h.replace(/<p class="footer-links footer-abn">[^<]*<\/p>/,FOOT);
  // Schema: business entities
  h=h.replace(/<script type="application\/ld\+json"([^>]*)>([\s\S]*?)<\/script>/g,(m,a,j)=>{let d;try{d=JSON.parse(j)}catch{return m}let ch=false;
   const visit=o=>{if(Array.isArray(o))return o.forEach(visit);if(!o||typeof o!=='object')return;const t=[].concat(o['@type']||[]);
    if(t.some(x=>['Locksmith','LocalBusiness','Organization'].includes(x))&&/#business$|#gold-coast$/i.test(o['@id']||'')&&!/ballina/i.test(o['@id']||'')&&o.name){const before=JSON.stringify([o.hasCredential,o.memberOf]);const c=[].concat(o.hasCredential||[]).filter(x=>!CREDS.some(y=>y.identifier===x.identifier));o.hasCredential=[...c,...CREDS];const mo=[].concat(o.memberOf||[]).filter(x=>!MEMBERS.some(y=>y.membershipNumber===x.membershipNumber));o.memberOf=[...mo,...MEMBERS];if(JSON.stringify([o.hasCredential,o.memberOf])!==before)ch=true;}
    Object.values(o).forEach(visit)};visit(d);return ch?`<script type="application/ld+json"${a}>${JSON.stringify(d)}</script>`:m;});
  if(h!==b){fs.writeFileSync(f,h);n++;if(path.relative(out,f)==='index.html'){const mf=path.join(root,'page-import-manifest.json'),mm=JSON.parse(fs.readFileSync(mf,'utf8'));mm.homepageMainSha256=crypto.createHash('sha256').update(h.match(/<main[\s\S]*?<\/main>/)[0]).digest('hex');fs.writeFileSync(mf,JSON.stringify(mm,null,2)+'\n');}}}
 // /locksmith-services/: move MLAA badge + line into the hero (above the fold), not repeated below.
 {const f=path.join(out,'locksmith-services','index.html');let h=fs.readFileSync(f,'utf8');const b=h;
  h=h.replace(/<span style="display:inline-flex;align-items:center;gap:8px"><img src="\.\.\/assets\/mlaa-professional-guarantee\.png"[^>]*>Master Locksmiths Association of Australasia member 6386<\/span>/,'').replace('<span>Master Locksmiths Association of Australasia member 6386</span>','');
  if(!h.includes('class="hero-credential"'))h=h.replace(/(<h1>Locksmiths<\/h1>)/,'$1<p class="hero-credential" style="display:inline-flex;align-items:center;gap:10px;margin:14px 0 0;padding:6px 14px 6px 6px;border-radius:8px;background:rgba(255,255,255,.92);color:#1a1a1a;font-size:13px;font-weight:600;line-height:1.35"><img src="../assets/mlaa-professional-guarantee.png" alt="Master Locksmiths Professional Guarantee badge" width="48" height="37" decoding="async" style="width:48px;height:auto;flex:none">Master Locksmiths Association of Australasia member 6386</p>');
  if(h!==b){fs.writeFileSync(f,h);n++;}}
 return n;};
if(require.main===module)console.log('add-licence',module.exports());
