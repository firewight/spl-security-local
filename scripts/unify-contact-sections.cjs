const fs=require('fs'),path=require('path'),crypto=require('crypto'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public');
const template=fs.readFileSync(path.join(__dirname,'templates/contact-section.html'),'utf8');
let count=0,removed=0;
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,ent.name);if(ent.isDirectory()){walk(file);continue;}if(!file.endsWith('.html'))continue;
const $=load(fs.readFileSync(file,'utf8'));if(!$('main').length)continue;
const prefix=path.relative(path.dirname(file),out).replaceAll('\\','/')||'.';
$('.contact-options,.page-hero-actions,.page-cta,.expert-card,section.cta').remove();
// Remove stand-alone prompts, but preserve editorial copy and specialist links.
$('.editorial-action').each((i,e)=>{if($(e).find('a').toArray().some(a=>/^(tel:|mailto:)|(?:^|\/)contact(?:\/|#|$)/i.test($(a).attr('href')||''))){$(e).remove();removed++;}});
$('.callout').each((i,e)=>{if($(e).find('a[href^="mailto:"],a[href*="contact/"]').length)$(e).remove();});
$('a[href]').each((i,e)=>{const a=$(e),href=a.attr('href')||'';
if(a.closest('#main-nav').length&&/(?:^|\/)contact\//.test(href)){a.attr('href','#contact-options');return;}
if(/^(tel:|mailto:)/i.test(href)){
if(a.closest('.hero-actions,.links').length){a.remove();removed++;}else{a.replaceWith($('<span>').html(a.html()));}return;}
if(/(?:^|\/)contact\//.test(href)&&!a.closest('nav').length){if(a.closest('.links,.contextual-links,.hero-actions').length){a.remove();removed++;}else a.replaceWith($('<span>').html(a.html()));}
});
$('.links,.hero-actions').each((i,e)=>{if(!$(e).children().length)$(e).remove();});
$('.editorial-layout').addClass('editorial-layout-unified');
$('.contact-draft').attr('id','contact-enquiry');
const contact=path.relative(out,file).replaceAll('\\','/')==='contact/index.html';
$('main').append(template.replaceAll('{{CONTACT_URL}}',contact?'#contact-enquiry':prefix+'/contact/index.html#contact-enquiry'));
$('link[data-contact-section]').remove();$('head').append(`<link rel="stylesheet" href="${prefix}/contact-section.css?v=20261016" data-contact-section>`);
fs.writeFileSync(file,$.html().trimEnd()+'\n');count++;
}}walk(out);
// The homepage content is intentionally revised by this change.
const manifestPath=path.join(root,'page-import-manifest.json'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
manifest.homepageMainSha256=crypto.createHash('sha256').update(fs.readFileSync(path.join(out,'index.html'),'utf8').match(/<main[\s\S]*?<\/main>/)[0]).digest('hex');
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({pagesUpdated:count,duplicatePromptsRemoved:removed}));
