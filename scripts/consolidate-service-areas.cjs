require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public');
const regions=[{name:'Gold Coast',file:'locations/locksmith-gold-coast/index.html'},{name:'Brisbane',file:'locksmiths/brisbane/index.html'},{name:'Northern NSW',file:'locations/locksmith-northern-nsw/index.html'}];
function consolidate(){const manifest=JSON.parse(fs.readFileSync(path.join(root,'page-import-manifest.json'),'utf8')),files=['index.html',...manifest.pages.map(p=>p.file),...['cadell-52','timeless-safes','ajax-starterkit'].map(p=>'products/'+p+'.html')];const result={pagesWithListsConsolidated:[],menusUpdated:0};
 for(const relative of files){const file=path.join(out,relative),html=fs.readFileSync(file,'utf8'),$=load(html);let changed=false,lists=false;
 const link=region=>path.relative(path.dirname(file),path.join(out,region.file)).replaceAll('\\','/');
 const list=()=>`<ul class="region-list">${regions.map(r=>`<li><a href="${link(r)}">${r.name}</a></li>`).join('')}</ul>`;
 const group=$('#main-nav .nav-group').filter((i,e)=>$(e).children('summary').text().trim()==='Service Area');
 if(group.length&&group.find('.nav-dropdown a').length>4){group.find('.nav-dropdown').html(regions.map(r=>`<a href="${link(r)}">${r.name}</a>`).join(''));changed=true;result.menusUpdated++;}
 const blocks=$('.editorial-content>.editorial-block').filter((i,e)=>$(e).find('ul,ol').length&&$(e).find('h2,h3,h4,h5').toArray().some(h=>regions.some(r=>$(h).text().trim()===r.name)));
 if(blocks.length){blocks.first().before(`<div class="editorial-block consolidated-service-areas">${list()}</div>`);const ids=blocks.find('[id]').map((i,e)=>$(e).attr('id')).get();for(const id of ids)$('.page-toc a').filter((i,e)=>$(e).attr('href')==='#'+id).remove();blocks.remove();changed=lists=true;}
 if(relative==='service-area/index.html'&&!$('.consolidated-service-areas').length){const children=$('.editorial-content').children().toArray();const first=children.findIndex(e=>$(e).is('.editorial-block')&&$(e).find('h2,h3,h4').first().text().trim()==='Gold Coast');const last=children.findIndex(e=>$(e).hasClass('related-links'));if(first>=0&&last>first){const discarded=children.slice(first,last);const ids=$(discarded).find('[id]').map((i,e)=>$(e).attr('id')).get();for(const id of ids)$('.page-toc a').filter((i,e)=>$(e).attr('href')==='#'+id).remove();$(children[first]).before(`<div class="editorial-block consolidated-service-areas">${list()}</div>`);$(discarded).remove();changed=lists=true;}}
 // Avoid recreating the same town directory a second time in auto-imported related links.
 const local=/\/(?:locations\/|locksmiths\/(?:24-7-mobile-|24\/7-mobile-locksmith-|paradise|brisbane)|security-cameras-|safes\/|locksmith-tweed|security-systems\/(?:brisbane|intercoms|cctv-systems|security-cameras))/;
 const related=$('.related-links>a').filter((i,e)=>local.test('/'+($(e).attr('href')||'').replace(/^(?:\.\.\/)+/,'')));
 if(related.length){related.remove();if(!$('.region-list').length&&!$('.related-links .related-regions').length)$('.related-links').append(`<div class="related-regions">${regions.map(r=>`<a href="${link(r)}">${r.name} <span>↗</span></a>`).join('')}</div>`);changed=lists=true;}
 if(lists)result.pagesWithListsConsolidated.push('/'+relative.replace(/\/index\.html$/,''));
 if(changed)fs.writeFileSync(file,$.html().split('\n').map(s=>s.trimEnd()).join('\n').trimEnd()+'\n');
 }
console.log(JSON.stringify(result,null,2));return result;
}
module.exports=consolidate;if(require.main===module)consolidate();
