// About page: Our Values photo is the clean SPL van shot (old SPL/Ballina media, Gold Coast livery). Idempotent.
const fs=require('fs'),path=require('path');
const f=path.join(path.resolve(__dirname,'..'),'public/about/index.html');
module.exports=function run(){const h=fs.readFileSync(f,'utf8');
 const n=h.replace(/<img loading="lazy" src="\.\.\/assets\/imported\/63c599caf440f2d0c832\.jpg"[^>]*>/,'<img loading="lazy" src="../assets/spl-van-24-hour.jpg" alt="White SPL van with 24 hour emergency service signage" width="1165" height="776" decoding="async">');
 if(n!==h)fs.writeFileSync(f,n);return n!==h;};
if(require.main===module)console.log(module.exports());
