#!/usr/bin/env node
// Adds the East Coast Safes logo after the SPL logo in every page header (idempotent).
// SPL logo keeps linking to the SPL home page; ECS logo links to https://eastcoastsafeco.com.au/.
const fs=require('fs'),path=require('path');
const pub=path.resolve(__dirname,'../public');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(e.name==='node_modules'?[]:walk(path.join(d,e.name))):[path.join(d,e.name)]);
const RE=/(<header class="site-header[^"]*">\s*)(<a class="brand"[^>]*>\s*<img[^>]*?src="([^"]*?)assets\/spl-logo-white\.webp[^"]*"[^>]*>\s*<\/a>)/;
let changed=0,skipped=0,nomatch=[];
for(const f of walk(pub).filter(f=>f.endsWith('.html'))){
  let s=fs.readFileSync(f,'utf8');
  if(!s.includes('<header class="site-header'))continue;
  if(s.includes('class="brand-lockup"')){skipped++;continue;}
  const m=s.match(RE); if(!m){nomatch.push(path.relative(pub,f));continue;}
  const pre=m[3];
  const partner=`<span class="brand-divider" aria-hidden="true"></span><a class="brand-partner" href="https://eastcoastsafeco.com.au/" title="East Coast Safes – a division of SPL"><img src="${pre}assets/ecs-logo-white-h.svg" alt="East Coast Safes" width="859" height="131" decoding="async"></a>`;
  s=s.replace(RE,(_,h,a)=>`${h}<div class="brand-lockup">${a}${partner}</div>`);
  const css=`<link rel="stylesheet" href="${pre}brand-lockup.css?v=20261029">`;
  s=s.replace(/(<link rel="stylesheet" href="[^"]*(?:pages|styles)\.css[^"]*">)(?![\s\S]*<link rel="stylesheet" href="[^"]*(?:pages|styles)\.css)/, `$1${css}`);
  if(!s.includes('brand-lockup.css'))s=s.replace('</head>',css+'</head>');
  fs.writeFileSync(f,s);changed++;
}
console.log({changed,skipped,nomatch});
