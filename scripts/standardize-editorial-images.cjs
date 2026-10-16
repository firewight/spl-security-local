require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path'),crypto=require('crypto'),sharp=require('sharp'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public');
async function run({auditOnly=false}={}){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'page-import-manifest.json'),'utf8'));
 const assets=new Map(),pages=[];
 for(const page of manifest.pages){const file=path.join(out,page.file),html=fs.readFileSync(file,'utf8'),$=load(html);const images=$('.editorial-image img').map((i,e)=>({src:$(e).attr('src'),alt:$(e).attr('alt')})).get();pages.push({...page,file,html,images});for(const img of images){if(!img.src||/^https?:|^data:/.test(img.src))continue;const target=path.resolve(path.dirname(file),img.src.split('?')[0]);if(!assets.has(target))assets.set(target,null);}}
 for(const file of assets.keys()){try{const image=sharp(file),meta=await image.metadata(),pixels=await image.resize(32,32,{fit:'fill'}).flatten({background:'#ffffff'}).toColourspace('srgb').raw().toBuffer();assets.set(file,{pixels,width:meta.width,height:meta.height,hasAlpha:meta.hasAlpha,hash:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')});}catch{assets.set(file,null);}}
 const similar=(a,b)=>{if(!a||!b)return false;if(a.hash===b.hash)return true;if(Math.abs(a.width/a.height-b.width/b.height)>.08)return false;let sum=0;for(let i=0;i<a.pixels.length;i++)sum+=Math.abs(a.pixels[i]-b.pixels[i]);return sum/a.pixels.length<5;};
 const report={pagesAudited:pages.length,uniqueAssets:assets.size,imagesBefore:0,imagesAfter:0,duplicatesRemoved:0,placeholderLabelsRemoved:0,pagesChanged:0,examples:[]};
 for(const page of pages){const $=load(page.html),seen=[],removed=[];let changed=false;
 $('.editorial-image').each((i,figure)=>{const img=$(figure).find('img').first(),src=img.attr('src')||'',file=path.resolve(path.dirname(page.file),src.split('?')[0]),signature=assets.get(file);report.imagesBefore++;
 const duplicate=seen.find(previous=>previous.src===src||similar(previous.signature,signature));
 if(duplicate){removed.push({src,duplicateOf:duplicate.src});$(figure).remove();report.duplicatesRemoved++;changed=true;return;}
 seen.push({src,signature});report.imagesAfter++;
 if(!auditOnly){$(figure).addClass('editorial-media');if(/logo|diagram|chart|floor.?plan|integriti|gallagher/i.test(img.attr('alt')||'')||(signature&&(signature.hasAlpha||signature.width/signature.height>2.8)))$(figure).addClass('editorial-media-contain');img.attr('decoding','async').attr('loading','lazy');if(signature)img.attr('width',signature.width).attr('height',signature.height);}
 });
 $('.editorial-block').each((i,e)=>{if(/^(?:City skyline|Birthday Sparks|Fashion Magazine|Blurred Lines)$/i.test($(e).text().trim())){const ids=$(e).find('[id]').map((i,n)=>$(n).attr('id')).get();for(const id of ids)$('.page-toc a[href="#'+id+'"]').remove();$(e).remove();report.placeholderLabelsRemoved++;changed=true;}});
 if(removed.length)report.examples.push({url:page.url,duplicates:removed});
 if(changed)report.pagesChanged++;
 if(!auditOnly){$('head link[href*="editorial-media.css"]').remove();const href=path.relative(path.dirname(page.file),path.join(out,'editorial-media.css')).replaceAll('\\','/');$('head').append(`<link rel="stylesheet" href="${href}?v=20261016-areas" data-editorial-media>`);fs.writeFileSync(page.file,$.html().split('\n').map(s=>s.trimEnd()).join('\n').trimEnd()+'\n');}
 }
 if(!auditOnly)require('./fix-social-icons.cjs')();
 if(!auditOnly)fs.writeFileSync(path.join(root,'editorial-media-report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({...report,examples:report.examples.filter(e=>e.url==='/cctv-system').concat(report.examples.slice(0,3))},null,2));return report;
}
module.exports=run;if(require.main===module)run({auditOnly:process.argv.includes('--audit')}).catch(e=>{console.error(e);process.exit(1)});
