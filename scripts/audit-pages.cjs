const fs=require('fs'),path=require('path'),crypto=require('crypto'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'), manifest=require('../page-import-manifest.json');
let broken=[],missing=[];const summaries=[];
const home=fs.readFileSync(path.join(root,'public/index.html'),'utf8').match(/<main[\s\S]*?<\/main>/)[0];
if(crypto.createHash('sha256').update(home).digest('hex')!==manifest.homepageMainSha256)throw Error('Homepage main content changed');
for(const p of manifest.pages){
 const file=path.join(root,'public',p.file),$=load(fs.readFileSync(file,'utf8'));
 $('a[href],link[href],script[src],img[src]').each((i,e)=>{const h=$(e).attr('href')||$(e).attr('src');if(!h||/^(https?:|mailto:|tel:|data:|#)/.test(h))return;const target=path.resolve(path.dirname(file),h.split(/[?#]/)[0]);if(!fs.existsSync(target))broken.push({page:p.url,link:h});});
 const snapshot=path.join(root,'.source-cache',crypto.createHash('sha256').update(p.url).digest('hex')+'.html');const source=load(fs.readFileSync(snapshot,'utf8'));
 const content=source('.dmContent').first();content.find('script,style,nav,form,.dmFooter,.dmHeader').remove();
 const rendered=$('.editorial-content').text().replace(/\s+/g,' ').trim();
 const paragraphs=[];content.find('p,h2,h3,li').each((i,e)=>{if(source(e).parents('form,nav').length)return;const text=source(e).text().replace(/\s+/g,' ').trim();if(text.length>65&&!rendered.includes(text))paragraphs.push(text);});
 if(paragraphs.length)missing.push({page:p.url,paragraphs:[...new Set(paragraphs)]});
 if(['/about','/contact','/brochures','/articles','/major-projects','/our-team'].includes(p.url))summaries.push({page:p.url,blocks:p.blocks,images:$('.editorial-image img').length,text:rendered.slice(0,240)});
}
console.log(JSON.stringify({pages:manifest.pages.length,brokenLinks:broken,missingContentPages:missing.length,missingSample:missing.slice(0,2),summaries},null,2));
fs.mkdirSync(path.join(root,'verification'),{recursive:true});fs.writeFileSync(path.join(root,'verification/content-audit.json'),JSON.stringify({broken,missing,summaries},null,2));
if(broken.length||missing.length)process.exitCode=1;
