// About page: Our Values photo is the clean SPL van shot (old SPL/Ballina media, Gold Coast livery). Idempotent.
const fs=require('fs'),path=require('path');
const f=path.join(path.resolve(__dirname,'..'),'public/about/index.html');
module.exports=function run(){const h=fs.readFileSync(f,'utf8');
 let n=h.replace(/<img loading="lazy" src="\.\.\/assets\/imported\/63c599caf440f2d0c832\.jpg"[^>]*>/,'<img loading="lazy" src="../assets/spl-van-24-hour.jpg" alt="White SPL van with 24 hour emergency service signage" width="1165" height="776" decoding="async">');
 // Our Values: the six value headings (no descriptions on the original site) as a numbered card grid.
 const vals=['Commitment to excellence','Customer-centric approach','Superior service delivery','Quality products','Continuous evolution &amp; expansion','Skilled &amp; experienced team'];
 const grid=`<ul class="values-grid" aria-label="Our values">${vals.map((v,i)=>`<li class="values-card"><span class="values-num" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><h3>${v}</h3></li>`).join('')}</ul>\n`;
 n=n.replace(/(?:<div class="editorial-block"><p><strong>(?:Commitment To Excellence|Customer-Centric Approach|Superior Service Delivery|Quality Products|Continuous Evolution &amp; Expansion|Skilled &amp; Experienced Team)<\/strong><\/p><\/div>\n?){6}/,grid);
 n=n.replace(/editorial-media\.css\?v=[^"]*/,'editorial-media.css?v=20261016-areas');
 if(n!==h)fs.writeFileSync(f,n);return n!==h;};
if(require.main===module)console.log(module.exports());
