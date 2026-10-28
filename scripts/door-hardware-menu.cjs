// Ensure /architectural-door-hardware/ has the standard "Explore product ranges" menu. Idempotent.
// /door-hardware/ is retired (301 -> architectural); this script no longer writes that page.
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
module.exports=function(){const file=path.join(__dirname,'..','public','architectural-door-hardware','index.html');
 if(!fs.existsSync(file))return 0;const $=load(fs.readFileSync(file,'utf8'));
 if($('.service-menu').length)return 0;
 const links=[['../door-handles/index.html','Door Levers / Handles'],['../door-closers/index.html','Door Closers & Seals'],['../fire-door-hardware/index.html','Fire Door Hardware'],['../locksmiths/lock-hardware/index.html','Lock Hardware']];
 const menu=$('<section class="service-menu" aria-label="Explore services"><p class="service-menu-label">Explore product ranges</p><nav class="service-menu-links" aria-label="Service options"></nav></section>');
 for(const[h,t]of links)menu.find('nav').append($('<a></a>').attr('href',h).text(t).append('<span aria-hidden="true">&#8599;</span>'));
 const first=$('#section-commercial-door-hardware').closest('.editorial-block');
 if(first.length)first.before(menu);else $('article.editorial-content').prepend(menu);
 fs.writeFileSync(file,$.html());return 1;};
if(require.main===module)console.log('door-hardware-menu',module.exports());
