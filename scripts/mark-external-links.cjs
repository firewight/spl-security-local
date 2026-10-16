const fs=require('fs'),path=require('path'),{markExternalLinks}=require('./lib/external-links.cjs');
const out=path.resolve(__dirname,'../public');let pages=0,links=0;
(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(f.endsWith('.html')){const s=fs.readFileSync(f,'utf8');const r=markExternalLinks(s);if(r.count){fs.writeFileSync(f,r.html);pages++;links+=r.count;}}}})(out);
console.log(JSON.stringify({pages,links}));
