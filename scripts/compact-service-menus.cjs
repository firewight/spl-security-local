require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..');
const routes=['locksmith-services','locksmiths','security-systems','retail-security','locksmiths/lock-hardware','locations/locksmith-northern-nsw'];
for(const route of routes){
 const file=path.join(root,'public',route,'index.html'),$=load(fs.readFileSync(file,'utf8'));
 if($('.service-menu').length)continue;
 const headings=$('.editorial-block h2,.editorial-block h3').filter((i,e)=>$(e).children('a').length===1&&$(e).text().trim()===$(e).children('a').text().trim());
 if(!headings.length)continue;
 const menu=$('<section class="service-menu" aria-label="Explore services"><p class="service-menu-label">Explore services</p><nav class="service-menu-links" aria-label="Service options"></nav><details class="service-menu-details"><summary>Service details</summary><div class="service-menu-descriptions"></div></details></section>');
 headings.first().closest('.editorial-block').before(menu);
 headings.each((i,e)=>{
  const heading=$(e),block=heading.closest('.editorial-block'),link=heading.children('a').first().clone();
  // Correct an imported self-link on the locksmith overview pages.
  if(link.text().trim()==='Commercial Locksmiths')link.attr('href',path.relative(path.dirname(file),path.join(root,'public/commercial-locksmith/index.html')).replaceAll('\\','/'));
  const item=$('<a></a>').attr('href',link.attr('href')).text(link.text().replace(/\s+/g,' ').trim());
  item.append('<span aria-hidden="true">&#8599;</span>');menu.find('.service-menu-links').append(item);
  const following=[];let next=block.next();
  while(next.is('.editorial-block')&&!next.find('h2,h3,h4,img,table,iframe').length){following.push(next);next=next.next();}
  const description=$('<section class="service-menu-description"></section>');
  heading.children('a').replaceWith(heading.children('a').contents());
  description.append(block);for(const node of following)description.append(node);
  menu.find('.service-menu-descriptions').append(description);
 });
 $('link[href*="pages.css"]').attr('href',(i,v)=>v.replace(/\?.*$/,'')+'?v=20261016-van');
 fs.writeFileSync(file,$.html());console.log(route+': '+headings.length+' services');
}
