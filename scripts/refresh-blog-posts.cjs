// Light refresh of the 2017-2020 blog posts (Oct 2026): fixes broken/self links, points links at the current
// service pages, removes RSS "The post ... appeared first on" remnants, fixes an apostrophe typo, and marks each
// changed post "Last updated October 2026" (visible byline + schema dateModified). Original publish dates untouched.
// No facts, prices or claims are changed; items needing SPL input are listed in the Oct 2026 report. Idempotent.
require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path');
const out=path.join(path.resolve(__dirname,'..'),'public');
const UPDATED='2026-10-16T00:00:00',LABEL='October 2026';
const rss=/<div class="editorial-block">\s*<p>The post <a [^>]*>[^<]*<\/a>\s*appeared first on <a [^>]*>[\s\S]*?<\/a>\.<\/p>\s*<\/div>\n?/;
const edits={
 '3-reasons-to-install-a-cctv-security-camera-at-your-home-or-business':[[rss,'']],
 '5-questions-to-consider-when-buying-a-gun-safe':[[rss,'']],
 'why-you-need-a-home-security-system-asap':[
  ['<a href="../../blog/why-you-need-a-home-security-system-asap/index.html">What To Consider When Purchasing a Safe</a>','<a href="../../blog/what-to-consider-when-purchasing-a-safe/index.html">What To Consider When Purchasing a Safe</a>'],
  [/<a href="\.\.\/\.\.\/blog\/why-you-need-a-home-security-system-asap\/index\.html">Why You Need A Home Security System ASAP <span aria-hidden="true">↗<\/span><\/a>/,'']],
 'reasons-your-car-key-isnt-working':[['<a href="../../locksmith-services/index.html">emergency locksmith</a>','<a href="../../emergency-locksmith/index.html">emergency locksmith</a>']],
 'reasons-people-need-an-emergency-locksmith':[['<a href="../../locksmith-services/index.html">Emergency locksmith</a>','<a href="../../emergency-locksmith/index.html">Emergency locksmith</a>']],
 'how-technology-is-changing-for-locksmiths':[['Changing for Locksmith’s','Changing for Locksmiths']],
};

// Oct 2026 decisions on the flagged items (SPL-approved): no expired offer, no 2020 prices, no fixed van count,
// a sourced burglary statistic, current domain, author recredited, single byline.
const ABS='https://www.abs.gov.au/statistics/people/crime-and-justice/recorded-crime-victims/2025';
const costD='Having a home security system is integral in protecting your family and belongings, but they’re not cheap. Costs generally range from $300 to $4000 depending…';
Object.assign(edits,{
 'gift-yourself-peace-of-mind-this-christmas':[
  ['Be Quick… Call SPL now (07) 55 888 111 Right up until Christmas we can come out to give your place a free security audit. First in, best dressed. No…','Secure your home or business before the Christmas holidays. Call SPL Security Solutions on (07) 55 888 111 for advice.'],
  ['<p>Be Quick… Call SPL now (07) 55 888 111 Right up until Christmas we can come out to give your place a free security audit.</p></section>','<p>Secure your home or business before the Christmas holidays. Call SPL on (07) 55 888 111 for advice.</p></section>'],
  [/<p>Be Quick… Call SPL now\n<span>\(07\) 55 888 111<\/span> Right up until Christmas[\s\S]*?(<p>Christmas isn’t even here yet[^<]*<\/p>)[\s\S]*?areas restricted to those listed in our service area<\/p>/,'$1<p>Call SPL now\n<span>(07) 55 888 111</span> for advice on any invitation your property offers to burglars, before the holidays.</p>']],
 'how-much-does-a-home-security-system-cost':[
  [costD,'Having a home security system is integral in protecting your family and belongings. Learn what affects the cost, and call SPL for a quote.'],
  [' Costs generally range from $300 to $4000 depending on the size of your home, and the complexity of the system. On average, installing a hardwired system in a 130 square-metre home costs between $1,800 and $2,900.',' Costs depend on the size of your home and the complexity of the system.'],
  ['Activation and installation typically range from $700 to $1,900, while monitoring averages $15 to $60 on a monthly plan.','Activation and installation costs vary, and monitoring is usually charged as a monthly plan.'],
  ['A low-end camera (without installation costs) averages around $250, and an additional $30 per month in surveillance costs. In comparison, a high-end CCTV camera can cost upwards of $1,200, without installation or monthly surveillance costs.','High-end cameras cost more than entry-level models, before installation and any monthly surveillance costs.'],
  ['Sensors can cost between $15 to $60 each, depending on if they are hardwired or wireless.','Sensor costs vary depending on whether they are hardwired or wireless.'],
  [' Generally, alarms range from $30 to $50 per alarm, not including installation costs.',''],
  ['Costs range from $600 to $1,400, with installation varying depending on the door size, type, and material.','Costs, including installation, vary depending on the door size, type, and material.'],
  ['Call SPL Security Systems Gold Coast for more information and a quote','Call SPL Security Solutions on (07) 55 888 111 for more information and a quote']],
 'inside-the-mind-of-a-burglar':[
  ['Is your home secure enough this Christmas? In Australia, there is one burglary every 3 minutes! Startling statistics, and yet during the holiday season…','Is your home secure enough this Christmas? Queensland police recorded 40,088 burglary victims in 2025 (ABS). See what burglars look for when casing a home.'],
  ['<p>In Australia, there is one burglary every 3 minutes!</p></section>','<p>Queensland police recorded 40,088 victims of burglary in 2025, almost two-thirds of them at homes (ABS).</p></section>'],
  ['<p>In Australia, there is one burglary every 3 minutes! Startling statistics, and yet during the holiday season, these numbers seem to skyrocket.<br><br></p>',`<p>Queensland police recorded 40,088 victims of burglary (unlawful entry with intent) in 2025, and almost two-thirds (64%) of those break-ins were at residential dwellings, according to the <a href="${ABS}">Australian Bureau of Statistics, Recorded Crime – Victims, 2025</a>.<br><br></p>`]],
 '3-reasons-to-install-a-cctv-security-camera-at-your-home-or-business':[...edits['3-reasons-to-install-a-cctv-security-camera-at-your-home-or-business'],['visit the website www.splsecurity.com.au ,','visit the website spl.com.au,']],
 '4-services-you-can-expect-from-your-local-locksmith':[
  ['SPL Security has 8 mobile locksmith vans ready to assist you in your time of need, 24/7. Their fully equipped vans','SPL Security has a fleet of fully equipped mobile locksmith vans ready to assist you in your time of need, 24/7.'],
  ['SPL Security has 8 mobile locksmith vans','SPL Security has a fleet of mobile locksmith vans'],
  ['SPL Security has 8 mobile locksmith</a>','SPL Security has a fleet of mobile locksmith</a>']],
 '5-questions-to-consider-when-buying-a-gun-safe':edits['5-questions-to-consider-when-buying-a-gun-safe'],
 'top-5-security-tips-for-your-home-or-business':[],
});

// Oct 2026 follow-up: Christmas post uses the sourced ABS figure; locksmith cost post drops its old price figures.
edits['gift-yourself-peace-of-mind-this-christmas'].push(['<p>Christmas isn’t even here yet and already Aussie properties are being hit at the rate of 20 burglaries an hour!</p>',`<p>Queensland police recorded 40,088 victims of burglary (unlawful entry with intent) in 2025, according to the <a href="${ABS}">Australian Bureau of Statistics, Recorded Crime – Victims, 2025</a>.</p>`]);
edits['how-much-does-a-locksmith-cost']=[
 ['Table of Contents When we think of locksmiths, we think of two types of services: firstly, getting a key cut and secondly, emergency services to get into our…','What does a locksmith cost? Prices vary with the job, the lock and the time of day. Learn the factors, then call SPL on (07) 55 888 111 for a quote.'],
 ['<p>When we think of locksmiths, we think of two types of services: firstly, getting a key cut and secondly, emergency services to get into our car or house.</p></section>','<p>Locksmith costs vary with the job, the type of lock and whether it’s after hours. Call SPL on (07) 55 888 111 for a quote.</p></section>'],
 [/<div class="editorial-block"><table>[\s\S]*?<\/table><\/div>\n<div class="editorial-block"><p>Please note average costs[\s\S]*?\$330 and above can be charged after midnight calls<\/li><\/ul>\n/,'<div class="editorial-block"><p>Like any trade service, such as a plumber or an electrician, a qualified locksmith will charge a call-out fee plus labour and materials, so costs vary from job to job. The main factors are:</p> <ul><li>The type of job, such as rekeying, repairing or changing a lock, or cutting keys</li><li>The type of lock or key involved</li><li>Labour time and any materials needed</li><li>Whether the call-out is after hours or an emergency, which costs more</li></ul>\n<p>For an accurate price, call SPL on (07) 55 888 111 for a quote.</p>\n']];
// Every post: author recredited, and the duplicate imported byline line ("Author • Month D, YYYY") removed.
const postFix=h=>{if(!h.includes('class="article-byline"'))return h;
 return h.split('"name":"AUSHost"').join('"name":"SPL Security Solutions"').split('data-seo-generated="">AUSHost ·').join('data-seo-generated="">SPL Security Solutions ·')
  .replace(/<div class="editorial-block">[^<]*• [A-Z][a-z]+ \d{1,2}, \d{4}<\/div>\n?/,'');};
// Labels that point at a renamed post, on any page.
const siteWide=[['Changing for Locksmith’s','Changing for Locksmiths']];
const walk=(d,a=[])=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f,a);else if(e.name.endsWith('.html'))a.push(f);}return a;};
module.exports=function run(){const changed=[];
 for(const f of walk(out)){let h=fs.readFileSync(f,'utf8');const b=h;for(const [a,c]of siteWide)h=h.split(a).join(c);h=postFix(h);if(h!==b)fs.writeFileSync(f,h);}
 for(const [slug,list]of Object.entries(edits)){const f=path.join(out,'blog',slug,'index.html');let h=fs.readFileSync(f,'utf8');const b=h;
  for(const [a,c]of list)h=typeof a==='string'?h.split(a).join(c):h.replace(a,c);
  if(h!==b||!h.includes('Last updated <time')){
   h=h.replace(/(<p class="article-byline"[^>]*>[\s\S]*?<\/time>)(<\/p>)/,(m,x,y)=>m.includes('Last updated')?m:`${x} · Last updated <time datetime="${UPDATED.slice(0,10)}">${LABEL}</time>${y}`);
   h=h.replace(/"dateModified":"[^"]*"/,`"dateModified":"${UPDATED}"`);}
  if(h!==b){fs.writeFileSync(f,h);changed.push(slug);}}
 return changed;};
if(require.main===module)console.log(JSON.stringify(module.exports()));
