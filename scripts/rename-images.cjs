// Rename hashed imported images to descriptive kebab-case names (bytes untouched) and rewrite all references. Idempotent.
// Mapping is persisted in scripts/image-names.json so names stay stable across rebuilds.
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public'),dir=path.join(out,'assets/imported'),mapFile=path.join(__dirname,'image-names.json');
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(e.name==='assets'&&d===out?[]:walk(path.join(d,e.name))):[path.join(d,e.name)])}
const slug=s=>s.toLowerCase().replace(/\s+[—–-]\s+spl security solutions.*$/i,'').replace(/&amp;/g,'and').replace(/&/g,'and').replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').split('-').filter(w=>!['a','an','the','is','are','of','with','on','in','to','and','its','it','that','this','being','from','next','for','at','by'].includes(w)).slice(0,6).join('-')||'unused-photo';
module.exports=function(){
 const map=fs.existsSync(mapFile)?JSON.parse(fs.readFileSync(mapFile,'utf8')):{};
 const files=walk(out).filter(f=>/\.(html|css|js|json|xml|webmanifest)$/.test(f));
 const hashed=fs.readdirSync(dir).filter(n=>/^[0-9a-f]{20}\.\w+$/.test(n));
 if(hashed.some(n=>!map[n])){const alts={};
  for(const f of files.filter(f=>f.endsWith('.html'))){const $=load(fs.readFileSync(f,'utf8'));$('img').each((i,e)=>{const m=($(e).attr('src')||'').match(/assets\/imported\/([0-9a-f]{20}\.\w+)/);if(m&&!alts[m[1]]&&$(e).attr('alt'))alts[m[1]]=$(e).attr('alt')})}
  const used=new Set(Object.values(map));
  for(const n of hashed){if(map[n])continue;const ext=path.extname(n).replace('.jpeg','.jpg');let b='spl-'+slug(alts[n]||'unused photo').replace(/^spl-/,''),c=b+ext,i=2;while(used.has(c)||fs.existsSync(path.join(dir,c)))c=`${b}-${i++}${ext}`;used.add(c);map[n]=c;}
  fs.writeFileSync(mapFile,JSON.stringify(map,null,1));}
 let moved=0,refs=0;
 for(const n of hashed){const t=path.join(dir,map[n]);if(fs.existsSync(t))fs.unlinkSync(path.join(dir,n));else fs.renameSync(path.join(dir,n),t);moved++;}
 const re=/assets\/imported\/([0-9a-f]{20}\.\w+)/g;
 for(const f of [...files,path.join(root,'editorial-media-report.json')]){if(!fs.existsSync(f))continue;const s=fs.readFileSync(f,'utf8');const o=s.replace(re,(m,n)=>map[n]?(refs++,'assets/imported/'+map[n]):m);if(o!==s){fs.writeFileSync(f,o);if(f===path.join(out,'index.html')){const mf=path.join(root,'page-import-manifest.json'),m=JSON.parse(fs.readFileSync(mf,'utf8'));m.homepageMainSha256=require('crypto').createHash('sha256').update(o.match(/<main[\s\S]*?<\/main>/)[0]).digest('hex');fs.writeFileSync(mf,JSON.stringify(m,null,2)+'\n');}}}
 return {moved,refs};};
if(require.main===module)console.log('rename-images',module.exports());
