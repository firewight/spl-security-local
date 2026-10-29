#!/usr/bin/env node
// Build a HostPapa (cPanel/Apache) deploy package from public/ for spl.com.au.
// Usage: node scripts/build-hostpapa.cjs [--index] [--www] [--out DIR]
//   default: staging build, noindex kept (meta + X-Robots-Tag header), canonical host https://spl.com.au
//   --index : LAUNCH switch: remove noindex from normal pages and the X-Robots-Tag header
//   --www   : use https://www.spl.com.au as canonical host instead of the apex
// IndexNow key file (seo.config.json indexNowKey) is copied from public/; pings are NOT sent here —
// after an --index publish + DNS, run: node scripts/indexnow-submit.cjs --yes --confirm-indexed
const fs=require('fs'),path=require('path'),{execSync}=require('child_process');
const root=path.resolve(__dirname,'..'),src=path.join(root,'public'),args=process.argv.slice(2);
const INDEX=args.includes('--index'),WWW=args.includes('--www');
const outRoot=args.includes('--out')?path.resolve(args[args.indexOf('--out')+1]):'/workspace/deploy/build-hostpapa';
const HOST=WWW?'www.spl.com.au':'spl.com.au',SITE=`https://${HOST}/`;
const config=require('../seo.config.json'),DEMO=config.siteUrl,DEMO_PATH=new URL(DEMO).pathname,OLD_BIZ=config.businessUrl;
const web=path.join(outRoot,'public_html');
fs.rmSync(outRoot,{recursive:true,force:true});fs.mkdirSync(web,{recursive:true});
execSync(`cp -a "${src}/." "${web}/"`);
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const TEXT=/\.(html|xml|txt|js|json|webmanifest|css)$/;
const isStub=h=>/http-equiv="refresh"/.test(h);
let rewritten=0,indexed=0;
for(const f of walk(web).filter(f=>TEXT.test(f))){let s=fs.readFileSync(f,'utf8');const o=s;
 s=s.split(DEMO).join(SITE).split(DEMO.replace(/\/$/,'')).join(SITE.replace(/\/$/,''));
 s=s.split('"'+DEMO_PATH).join('"/').split("'"+DEMO_PATH).join("'/").split('('+DEMO_PATH).join('(/');
 // Schema identities: old-domain #fragment IDs -> launch domain (sameAs/profile links to the old domain are left as is).
 s=s.split(OLD_BIZ+'#').join(SITE+'#');
 if(INDEX&&f.endsWith('.html')&&!isStub(s)&&!/(^|\/)(404\.html|thank-you\/index\.html)$/.test(path.relative(web,f))){const b=s;s=s.replace(/<meta name="robots" content="noindex, ?follow"/g,'<meta name="robots" content="index, follow"');if(s!==b)indexed++;}
 // <meta charset> first in <head> (must be in the first 1024 bytes; matches what is live on HostPapa).
 if(f.endsWith('.html'))s=s.replace(/<head>([\s\S]*?)<meta charset="utf-8"\/?>/i,(m,pre)=>pre.includes('<meta charset')?m:`<head><meta charset="utf-8">${pre}`);
 if(s!==o){fs.writeFileSync(f,s);rewritten++;}}
// robots.txt for the host root
fs.writeFileSync(path.join(web,'robots.txt'),INDEX?`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}sitemap.xml\n`:`# Staging: hidden from search engines until launch\nUser-agent: *\nDisallow: /\n`);
// Contact API
const api=path.join(web,'api');fs.mkdirSync(api,{recursive:true});
execSync(`cp -a "${root}/hosting/api/contact.php" "${root}/hosting/api/portal-quote.php" "${root}/hosting/api/composer.json" "${root}/hosting/api/composer.lock" "${root}/hosting/api/vendor" "${root}/hosting/api/config.example.php" "${api}/"`);
fs.writeFileSync(path.join(api,'config.php'),fs.readFileSync(path.join(root,'hosting/hostpapa/config.hostpapa.php'),'utf8'));
fs.copyFileSync(path.join(root,'hosting/api/.htaccess'),path.join(api,'.htaccess')); // vendor/.htaccess comes with cp -a vendor
// .htaccess with redirects
const redirects=new Map();const norm=p=>'/'+p.replace(/^https?:\/\/[^/]+/,'').replace(/^\/+|\/+$/g,'');
for(const[k,v]of Object.entries(config.regionalRedirects||{}))redirects.set(norm(k),norm(v));
const csv=fs.readFileSync(path.join(root,'backlink-migration.csv'),'utf8').trim().split('\n').slice(1).map(l=>l.match(/"([^"]*)"/g).map(x=>x.slice(1,-1)));
const ballina=new Map();
for(const[orig,pref,,action]of csv){const h=new URL(orig).hostname.replace(/^www\./,''),a=norm(orig),b=norm(pref);
 if(h==='ballinalocksmiths.com.au'){ballina.set(a,b);continue;}
 if(/^301/.test(action)&&a!==b)redirects.set(a,b);}
const resolve=t=>{const seen=new Set();while(redirects.has(t)&&!seen.has(t)){seen.add(t);t=redirects.get(t);}return t;};
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const lines=[],missing=[];
for(const[from,to0]of[...redirects].sort()){const to=resolve(to0);const tgt=to==='/'?'/':to+'/';
 if(!fs.existsSync(path.join(web,to,'index.html'))&&to!=='/')missing.push(from+' -> '+to);
 // Absolute https://HOST target: one-hop to final page even after OntheNet path-preserve or www/http.
 lines.push(`RewriteRule ^${esc(from.slice(1))}/?$ https://${HOST}${tgt} [R=301,L,NC]`);}
const blines=[];let bcatch=null;for(const[from,to0]of[...ballina].sort()){if(from==='/*'){bcatch=resolve(to0);continue;}const to=resolve(to0);const tgt=to==='/'?'/':to+'/';if(!fs.existsSync(path.join(web,to,'index.html'))&&to!=='/')missing.push('ballina '+from+' -> '+to);
 blines.push(`RewriteCond %{HTTP_HOST} ^(www\\.)?ballinalocksmiths\\.com\\.au$ [NC]\nRewriteRule ^${from==='/'?'':esc(from.slice(1))+'/?'}$ https://${HOST}${tgt} [R=301,L,NC]`);}
if(bcatch)blines.push(`# catch-all for any other old Ballina Locksmiths URL\nRewriteCond %{HTTP_HOST} ^(www\\.)?ballinalocksmiths\\.com\\.au$ [NC]\nRewriteRule ^ https://${HOST}${bcatch}/ [R=301,L]`);
const tpl=fs.readFileSync(path.join(root,'hosting/hostpapa/htaccess.template'),'utf8');
const ht=tpl.replace(/{{HOST}}/g,HOST).replace(/{{HOST_ESC}}/g,esc(HOST)).replace('{{OTHER_HOST_ESC}}',esc(WWW?'spl.com.au':'www.spl.com.au'))
 .replace('{{REDIRECTS}}',lines.join('\n')).replace('{{BALLINA}}',blines.join('\n')).replace('{{STAGING}}',INDEX?'# (launch build: no X-Robots-Tag noindex header)':'<IfModule mod_headers.c>\n  Header always set X-Robots-Tag "noindex, follow"\n</IfModule>');
fs.writeFileSync(path.join(web,'.htaccess'),ht);
// Strip meta-refresh stub pages from the HostPapa package. HostPapa's nginx
// layer often serves those static index.html files as soft 200s before Apache
// .htaccess can issue the real 301 — which breaks GSC Change of Address samples.
const strippedStubs=[];
{
  const isRefreshStub=h=>/http-equiv=["']refresh["']/i.test(h);
  const stubDirs=new Set();
  for(const[from]of redirects){
    const dir=path.join(web,...from.split('/').filter(Boolean));
    const idx=path.join(dir,'index.html');
    if(fs.existsSync(idx)&&isRefreshStub(fs.readFileSync(idx,'utf8'))){
      fs.unlinkSync(idx);stubDirs.add(dir);
      strippedStubs.push(from);
    }
  }
  for(const dir of[...stubDirs].sort((a,b)=>b.length-a.length)){
    try{if(fs.existsSync(dir)&&fs.readdirSync(dir).length===0)fs.rmdirSync(dir);}catch{}
  }
  strippedStubs.sort();
}
// GA4 (launch builds only): gtag right after charset/viewport, plus deferred conversion events (public/analytics.js).
const GA4=INDEX&&config.ga4MeasurementId;let ga4Pages=0;
if(GA4){const id=config.ga4MeasurementId;if(!/^G-[A-Z0-9]{6,}$/.test(id))throw new Error('bad ga4MeasurementId');
  // gtag.js (~75 KB, ~200 ms main thread on a slow phone) is loaded after the page: on the first interaction, or ~2.5 s
  // after load when the browser is idle. Until then gtag() calls queue in dataLayer and are sent in order once it loads.
  // window.splLoadGtag() lets analytics.js load it straight away (e.g. a pending lead on the thank-you page).
  const snip=`<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`+
    `(function(){var done=0;function load(){if(done)return;done=1;var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${id}';document.head.appendChild(s);}`+
    `window.splLoadGtag=load;['pointerdown','keydown','touchstart','scroll','mousemove'].forEach(function(e){addEventListener(e,load,{once:true,passive:true});});`+
    `addEventListener('load',function(){setTimeout(function(){(window.requestIdleCallback||setTimeout)(load,{timeout:2000});},2500);});})();</script>`+
    `<script defer src="/analytics.js?v=20261029c"></script>`;
  for(const f of walk(web).filter(f=>f.endsWith('.html'))){const rel=path.relative(web,f);
    if(rel.startsWith('assets'+path.sep)||/^google[0-9a-f]+\.html$/.test(rel))continue;
    let s=fs.readFileSync(f,'utf8');if(s.includes("googletagmanager.com/gtag/js")&&s.includes('splLoadGtag')||/http-equiv=["']refresh["']/i.test(s))continue;
    const vp=s.match(/<meta[^>]*name="viewport"[^>]*>/i),cs=s.match(/<meta charset="utf-8"\/?>/i);const at=vp||cs;if(!at)continue;
    const i=s.indexOf(at[0])+at[0].length;s=s.slice(0,i)+snip+s.slice(i);fs.writeFileSync(f,s);ga4Pages++;}}
// Merge each page's consecutive local stylesheets into one content-hashed bundle (assets/css/), same order => same cascade.
const cssBundles=require('./lib/bundle-css.cjs')(web);
// Leave media that no deployed file references out of the package (sources stay in public/).
const prunedAssets=require('./lib/prune-unused-assets.cjs')(web);
const leftovers=execSync(`grep -rl "firewight\\|spl-security-local" "${web}" --include=*.html --include=*.xml --include=*.js --include=*.txt --include=*.json || true`).toString().trim();
const indexNowKey=config.indexNowKey||null,indexNowKeyFile=config.indexNowKeyFile||(indexNowKey?indexNowKey+'.txt':null);
const indexNowPresent=!!(indexNowKeyFile&&fs.existsSync(path.join(web,indexNowKeyFile)));
const report={host:HOST,siteUrl:SITE,mode:INDEX?'launch (indexable)':'staging (noindex)',filesRewritten:rewritten,pagesMadeIndexable:indexed,redirects:lines.length,ballinaDomainRedirects:blines.length,redirectTargetsMissing:missing,strippedRedirectStubs:strippedStubs,ga4:{id:GA4||null,pages:ga4Pages},unusedAssetsOmitted:prunedAssets,cssBundles:{pages:cssBundles.pages,linksRemoved:cssBundles.linksRemoved,bundles:cssBundles.bundles.map(b=>b.name+' ('+b.files.join(' + ')+')')},demoLeftovers:leftovers?leftovers.split('\n'):[],indexNowKeyFile:indexNowKeyFile,indexNowKeyPresent:indexNowPresent,indexNowSubmitReady:INDEX&&indexNowPresent,indexNowNote:INDEX?'After publish + DNS: node scripts/indexnow-submit.cjs --build '+outRoot+' --yes --confirm-indexed':'Key file ships with staging; do NOT ping IndexNow until --index launch is live'};
fs.writeFileSync(path.join(outRoot,'build-report.json'),JSON.stringify(report,null,2));console.log(report);
