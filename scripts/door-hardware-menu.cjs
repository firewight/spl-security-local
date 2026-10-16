// Replace per-section inline buttons on /door-hardware/ with the standard "Explore services" menu. Idempotent.
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
module.exports=function(){const file=path.join(__dirname,'..','public','door-hardware','index.html');const $=load(fs.readFileSync(file,'utf8'));
 if($('.service-menu').length&&!$('.editorial-action').length)return 0;
 $('.editorial-action').remove();
 if(!$('.service-menu').length){
  const links=[['../door-handles/index.html','Door Levers'],['../door-closers/index.html','Door Closers & Seals'],['../fire-door-hardware/index.html','Fire Door Hardware'],['../architectural-door-hardware/index.html','Architectural Door Hardware']];
  const menu=$('<section class="service-menu" aria-label="Explore services"><p class="service-menu-label">Explore services</p><nav class="service-menu-links" aria-label="Service options"></nav></section>');
  for(const[h,t]of links)menu.find('nav').append($('<a></a>').attr('href',h).text(t).append('<span aria-hidden="true">&#8599;</span>'));
  $('#section-door-handle-levers').closest('.editorial-block').before(menu);}
 fs.writeFileSync(file,$.html());return 1;};
if(require.main===module)console.log('door-hardware-menu',module.exports());
