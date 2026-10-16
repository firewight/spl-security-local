require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public'),config=require('../seo.config.json');
function clean(){
 const m=JSON.parse(fs.readFileSync(path.join(root,'page-import-manifest.json'),'utf8')),files=['index.html',...m.pages.map(p=>p.file),...['cadell-52','timeless-safes','ajax-starterkit'].map(p=>'products/'+p+'.html')];
 const docs=new Map(files.map(f=>[path.join(out,f),{html:fs.readFileSync(path.join(out,f),'utf8'),$:load(fs.readFileSync(path.join(out,f),'utf8')),changed:false}]));
 const stats={pagesReviewed:files.length,pagesUpdated:0,relatedLabelsStandardized:0,repeatedLinksRemoved:0,repeatedRegionalGroupsRemoved:0,directoryDuplicatesRemoved:0,placeholderLabelsRemoved:0,duplicateHeadingsRemoved:0,sectionLinksRepaired:0,staticFormResponsesRemoved:0};
 const norm=s=>String(s).replace(/\s+/g,' ').trim(),slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
 const primaryRegions=new Map([['locations/locksmith-gold-coast/index.html','Gold Coast'],['locksmiths/brisbane/index.html','Brisbane'],['locations/locksmith-northern-nsw/index.html','Northern NSW']]);
 function lookup(from,href){try{const base=new URL(path.relative(out,from).replaceAll('\\','/'),config.siteUrl),u=new URL(href,base),site=new URL(config.siteUrl);if(u.origin!==site.origin||!u.pathname.startsWith(site.pathname))return null;let relative=decodeURIComponent(u.pathname.slice(site.pathname.length));if(!relative||relative.endsWith('/'))relative+='index.html';else if(!path.extname(relative))relative+='/index.html';const file=path.join(out,relative);return docs.has(file)?{file,doc:docs.get(file),hash:u.hash}:null;}catch{return null;}}
 // Remove builder UI remnants and redundant echoes of the hero heading; preserve editorial prose and questions.
 for(const [file,doc]of docs){const $=doc.$,hero=norm($('h1').first().text());
 $('.editorial-block').each((i,e)=>{if(/^(?:Thank you for contacting SPL Security Solutions\.?|We will be in touch soon\.?)$/i.test(norm($(e).text()))){$(e).remove();doc.changed=true;stats.staticFormResponsesRemoved++;}});
 $('.editorial-content h2,.editorial-content h3,.editorial-content h4').each((i,e)=>{const text=norm($(e).text()),placeholder=/^(Read More|Read Less|Button|Time Icon|City skyline)$/i.test(text),duplicate=text.toLowerCase()===hero.toLowerCase();if(!placeholder&&!duplicate)return;const id=$(e).attr('id');if(id)$('.page-toc a').filter((i,a)=>$(a).attr('href')==='#'+id).remove();const block=$(e).closest('.editorial-block');if(block.length&&norm(block.text())===text)block.remove();else $(e).remove();doc.changed=true;if(placeholder)stats.placeholderLabelsRemoved++;else stats.duplicateHeadingsRemoved++;});
 function removeUi(node){for(const child of [...(node.children||[])]){if(child.type==='text'&&/^(Read More|Read Less|Button|Time Icon)$/i.test(norm(child.data))){$(child).remove();doc.changed=true;stats.placeholderLabelsRemoved++;}else if(child.type==='tag')removeUi(child);}}
 $('.editorial-content').each((i,e)=>removeUi(e));
 }
 for(const [file,doc]of docs){const $=doc.$;
 if($('.region-list').length&&$('.related-links .related-regions').length){$('.related-links .related-regions').remove();doc.changed=true;stats.repeatedRegionalGroupsRemoved++;}
 $('a[href*="#"]').each((i,e)=>{const href=$(e).attr('href'),target=lookup(file,href);if(!target?.hash)return;const id=decodeURIComponent(target.hash.slice(1)),target$=target.doc.$;if(target$('[id]').toArray().some(n=>target$(n).attr('id')===id))return;
 let replacement=href;if(id==='applicationform'&&target.file===path.join(out,'careers/index.html')){replacement=path.relative(path.dirname(file),path.join(out,'contact/index.html')).replaceAll('\\','/');$(e).text('Enquire about careers');}else{const heading=target$('h2,h3').filter((i,h)=>slug(target$(h).text()).includes(slug(id))).first();if(heading.length&&heading.attr('id'))replacement=href.split('#')[0]+'#'+heading.attr('id');else if(id==='dm')replacement=href.split('#')[0];else return;}
 $(e).attr('href',replacement);doc.changed=true;stats.sectionLinksRepaired++;
 });
 const seen=new Set();$('.related-links a').each((i,e)=>{const href=$(e).attr('href'),target=lookup(file,href);if(!target)return;const canonical=target.doc.$('link[rel="canonical"]').attr('href'),preferred=canonical?lookup(file,canonical)||target:target;const key=preferred.file+target.hash;if(seen.has(key)){$(e).remove();doc.changed=true;stats.repeatedLinksRemoved++;return;}seen.add(key);
 const relative=path.relative(out,preferred.file).replaceAll('\\','/');let label=primaryRegions.get(relative)||(relative==='index.html'?'Home':norm(preferred.doc.$('h1').first().text()));
 if(target.hash){const node=preferred.doc.$('[id]').filter((i,n)=>preferred.doc.$(n).attr('id')===target.hash.slice(1)).first();if(node.length)label=norm(node.text());}
 if(!label)return;const old=norm($(e).clone().find('span').remove().end().text());if(old!==label){$(e).text(label).append(' <span aria-hidden="true">↗</span>');doc.changed=true;stats.relatedLabelsStandardized++;}
 });
 $('.related-links .related-regions').filter((i,e)=>!$(e).find('a').length).remove();
 if($('.page-directory').length){const unique=new Set();$('.page-directory a[data-page-title]').each((i,e)=>{const target=lookup(file,$(e).attr('href'));if(!target)return;const canonical=target.doc.$('link[rel="canonical"]').attr('href')||target.file;if(unique.has(canonical)){$(e).remove();doc.changed=true;stats.directoryDuplicatesRemoved++;return;}unique.add(canonical);const preferred=lookup(file,canonical)||target;const title=norm(preferred.doc.$('h1').text());if(title&&$(e).attr('data-page-title')!==title.toLowerCase()){$(e).attr('data-page-title',title.toLowerCase()).text(title).append(' <span>↗</span>');doc.changed=true;}});const cards=$('.page-directory a[data-page-title]').toArray().sort((a,b)=>$(a).text().localeCompare($(b).text(),'en-AU'));$('.page-directory').append(cards);$('#search-count').text(cards.length+' pages');}
 if(doc.changed){fs.writeFileSync(file,$.html().split('\n').map(s=>s.trimEnd()).join('\n').trimEnd()+'\n');stats.pagesUpdated++;}
 }
 console.log(JSON.stringify(stats,null,2));return stats;
}
module.exports=clean;if(require.main===module){const stats=clean();fs.mkdirSync(path.join(root,'verification'),{recursive:true});fs.writeFileSync(path.join(root,'verification/consistency-cleanup.json'),JSON.stringify(stats,null,2)+'\n');}
