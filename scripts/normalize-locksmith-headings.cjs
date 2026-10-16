require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..');
function normalize(){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'page-import-manifest.json'),'utf8')),audit=require('../source-seo-audit.json');
 const articles=new Set(audit.pages.filter(p=>p.schemas.some(s=>s['@type']==='BlogPosting')).map(p=>p.path));
 const replacements=[];let count=0;
 const plural=text=>{if(/[?:]/.test(text)||/\b(?:a|an|the)\s+(?:(?:master|professional|commercial|residential|emergency|trusted|reliable|standard)\s+)*locksmith\b/i.test(text))return text;return text.replace(/\bLocksmith\b(?!['’]|\s+(?:Services?|Solutions?|Hardware|Systems?|Enquiries?|Situations?|Industry|Work)\b)/g,'Locksmiths');};
 for(const page of manifest.pages){if(articles.has(page.url))continue;const file=path.join(root,'public',page.file),original=fs.readFileSync(file,'utf8'),$=load(original);let changed=false;
 const oldH1=$('h1').first().text().trim();
 $('h1,.editorial-content h2,.editorial-content h3,.editorial-content h4').each((i,e)=>{
  const old=$(e).text().trim();if(!old)return;let text=plural(old);
  if(page.url==='/locksmith-services'&&e.tagName==='h1')text='Locksmiths';
  if(/locksmith/.test(page.url)||$(e).find('a[href*="locksmith"]').length){const map={Residential:'Residential Locksmiths',Commercial:'Commercial Locksmiths',Automotive:'Automotive Locksmiths'};text=map[old]||text;}
  if(old===text)return;changed=true;count++;const link=$(e).children('a').first();if(link.length&&$(e).children().length===1)link.text(text);else $(e).text(text);
  $('.page-toc a').filter((i,a)=>$(a).text().trim()===old).text(text);
 });
 const newH1=$('h1').first().text().trim();
 if(newH1!==oldH1){page.title=newH1;replacements.push({file:page.file,old:oldH1,title:newH1});$('.breadcrumbs').each((i,e)=>{const html=$(e).html();$(e).html(html.replace(oldH1,newH1));});}
 if(changed){const oldTitle=$('head>title').text(),newTitle=plural(oldTitle);$('head>title').text(newTitle);for(const attr of ['og:title','twitter:title'])$(`meta[property="${attr}"],meta[name="${attr}"]`).attr('content',newTitle);
 $('script[data-seo-schema]').each((i,e)=>{const schema=JSON.parse($(e).text());function update(o){if(!o||typeof o!=='object')return;for(const [key,v]of Object.entries(o)){if(typeof v==='string'&&['name','headline'].includes(key)){if(v===oldH1)o[key]=newH1;else if(v===oldTitle)o[key]=newTitle;}else if(typeof v==='object')update(v);}}update(schema);$(e).text(JSON.stringify(schema).replaceAll('<','\\u003c'));});
 fs.writeFileSync(file,$.html().split('\n').map(s=>s.trimEnd()).join('\n').trimEnd()+'\n');}
 }
 if(fs.existsSync(path.join(root,'public/all-pages/index.html'))){const directoryFile=path.join(root,'public/all-pages/index.html'),$=load(fs.readFileSync(directoryFile,'utf8'));for(const r of replacements){$('a[data-page-title]').filter((i,e)=>$(e).attr('href')==='../'+r.file).each((i,e)=>{$(e).attr('data-page-title',r.title.toLowerCase()).html(r.title+' <span>↗</span>');});}fs.writeFileSync(directoryFile,$.html());}
 fs.writeFileSync(path.join(root,'page-import-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 return {headingsUpdated:count,pagesRetitled:replacements.length};
}
module.exports=normalize;if(require.main===module)console.log(JSON.stringify(normalize()));
