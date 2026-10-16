// Replaces footer social rows and the contact official-profiles row with the shared icon row.
const fs=require('fs'),path=require('path'),{footerRow,contactRow}=require('./lib/profile-icons.cjs');
const out=path.resolve(__dirname,'../public');let n=0;
(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(f.endsWith('.html')){let s=fs.readFileSync(f,'utf8');const o=s;
 s=s.replace(/<nav class="footer-socials[^"]*"[^>]*>[\s\S]*?<\/nav>/g,footerRow());
 s=s.replace(/<div class="official-profiles[^"]*"[^>]*>[\s\S]*?<\/div>/g,contactRow());
 if(s!==o){fs.writeFileSync(f,s);n++;}}}})(out);console.log(JSON.stringify({pagesUpdated:n}));
