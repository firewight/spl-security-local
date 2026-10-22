#!/usr/bin/env node
// Build a HostPapa (cPanel/Apache) deploy package from public/ for spl.com.au.
// Usage: node scripts/build-hostpapa.cjs [--index] [--www] [--out DIR]
//   default: staging build, noindex kept (meta + X-Robots-Tag header), canonical host https://spl.com.au
//   --index : LAUNCH switch: remove noindex from normal pages and the X-Robots-Tag header
//   --www   : use https://www.spl.com.au as canonical host instead of the apex
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
 if(s!==o){fs.writeFileSync(f,s);rewritten++;}}
// robots.txt for the host root
fs.writeFileSync(path.join(web,'robots.txt'),INDEX?`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}sitemap.xml\n`:`# Staging: hidden from search engines until launch\nUser-agent: *\nDisallow: /\n`);
// Contact API
const api=path.join(web,'api');fs.mkdirSync(api,{recursive:true});
execSync(`cp -a "${root}/hosting/api/contact.php" "${root}/hosting/api/composer.json" "${root}/hosting/api/composer.lock" "${root}/hosting/api/vendor" "${root}/hosting/api/config.example.php" "${api}/"`);
fs.writeFileSync(path.join(api,'config.php'),fs.readFileSync(path.join(root,'hosting/hostpapa/config.hostpapa.php'),'utf8'));
fs.writeFileSync(path.join(api,'.htaccess'),`Options -Indexes\n<FilesMatch "^(config|config\\.example)\\.php$|^composer\\.(json|lock)$">\n  Require all denied\n</FilesMatch>\nRedirectMatch 404 ^/api/vendor/\n`);
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
 lines.push(`RewriteRule ^${esc(from.slice(1))}/?$ ${tgt} [R=301,L,NC]`);}
const blines=[];let bcatch=null;for(const[from,to0]of[...ballina].sort()){if(from==='/*'){bcatch=resolve(to0);continue;}const to=resolve(to0);const tgt=to==='/'?'/':to+'/';if(!fs.existsSync(path.join(web,to,'index.html'))&&to!=='/')missing.push('ballina '+from+' -> '+to);
 blines.push(`RewriteCond %{HTTP_HOST} ^(www\\.)?ballinalocksmiths\\.com\\.au$ [NC]\nRewriteRule ^${from==='/'?'':esc(from.slice(1))+'/?'}$ https://${HOST}${tgt} [R=301,L,NC]`);}
if(bcatch)blines.push(`# catch-all for any other old Ballina Locksmiths URL\nRewriteCond %{HTTP_HOST} ^(www\\.)?ballinalocksmiths\\.com\\.au$ [NC]\nRewriteRule ^ https://${HOST}${bcatch}/ [R=301,L]`);
const tpl=fs.readFileSync(path.join(root,'hosting/hostpapa/htaccess.template'),'utf8');
const ht=tpl.replace(/{{HOST}}/g,HOST).replace(/{{HOST_ESC}}/g,esc(HOST)).replace('{{OTHER_HOST_ESC}}',esc(WWW?'spl.com.au':'www.spl.com.au'))
 .replace('{{REDIRECTS}}',lines.join('\n')).replace('{{BALLINA}}',blines.join('\n')).replace('{{STAGING}}',INDEX?'# (launch build: no X-Robots-Tag noindex header)':'<IfModule mod_headers.c>\n  Header always set X-Robots-Tag "noindex, follow"\n</IfModule>');
fs.writeFileSync(path.join(web,'.htaccess'),ht);
const leftovers=execSync(`grep -rl "firewight\\|spl-security-local" "${web}" --include=*.html --include=*.xml --include=*.js --include=*.txt --include=*.json || true`).toString().trim();
const report={host:HOST,siteUrl:SITE,mode:INDEX?'launch (indexable)':'staging (noindex)',filesRewritten:rewritten,pagesMadeIndexable:indexed,redirects:lines.length,ballinaDomainRedirects:blines.length,redirectTargetsMissing:missing,demoLeftovers:leftovers?leftovers.split('\n'):[]};
fs.writeFileSync(path.join(outRoot,'build-report.json'),JSON.stringify(report,null,2));console.log(report);
