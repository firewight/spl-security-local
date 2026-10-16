const fs=require('fs'),path=require('path'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public'),config=require('../seo.config.json');
function enforce(){let changed=0,links=0;function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory()){walk(file);continue;}if(!file.endsWith('.html'))continue;const original=fs.readFileSync(file,'utf8'),$=load(original);let dirty=false;
 $('a[href]').each((i,e)=>{const a=$(e),h=a.attr('href');if(/^(?:tel:|mailto:|#)/.test(h))return;let target;try{target=new URL(h,new URL(path.relative(out,file).replaceAll('\\','/'),config.siteUrl));}catch{return;}if(!target.href.startsWith(config.siteUrl))return;const route='/'+target.pathname.slice(new URL(config.siteUrl).pathname.length).replace(/\/index\.html$|\/$/g,'');if(!config.excludedPaths.includes(route))return;
 if(route==='/all-pages'){if(a.closest('#main-nav,footer').length)a.remove();else a.attr('href',path.relative(path.dirname(file),path.join(out,'service-area/index.html')).replaceAll('\\','/')).text('Our service regions');}
 else if(a.closest('.related-links,.nav-dropdown,.page-directory').length)a.remove();else a.replaceWith(a.text());dirty=true;links++;});
 if(dirty){fs.writeFileSync(file,$.html());changed++;}
 }}walk(out);console.log(JSON.stringify({regionalScopePagesUpdated:changed,retiredLinksRemoved:links}));}
module.exports=enforce;if(require.main===module)enforce();
