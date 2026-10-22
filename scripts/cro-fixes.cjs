// CRO fixes: 24/7-first hours, hero proof line, "How it works" strip, Google reviews high on landing pages (Brisbane menu link intentionally stays #gold-coast: serviced from Gold Coast office). Idempotent.
const fs=require('fs'),path=require('path'),X=require('./lib/cro-extras.cjs');
const pub=path.join(__dirname,'..','public');
const LANDING=['emergency-locksmith','locksmith-services','residential-locksmith','commercial-locksmith','auto-locksmith','locations','security-systems','access-control-systems','alarm-system','cctv-system','intercom','alarm-monitoring'];
const PROOF='<p class="hero-proof" data-cro="">Securing the Gold Coast since 1990</p>';
const HOW='<section class="how-it-works" data-cro="" aria-labelledby="how-it-works-title"><h2 id="how-it-works-title">How it works</h2><ol><li><span>1</span><span class="how-text"><a href="tel:+61755888111">Call</a> or <a href="__UP__contact/#contact-enquiry">Contact us</a> <strong class="how-free">anytime</strong></span></li><li><span>2</span><span class="how-text">Chat with us and get a <strong class="how-free">free</strong> quote</span></li><li><span>3</span><span class="how-text">Our licensed staff get the job done <strong class="how-free">fast</strong></span></li></ol></section>';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):e.name.endsWith('.html')?[path.join(d,e.name)]:[]);
function hours(h){return h.replace(/<dl>((?:(?!<\/dl>)[\s\S])*?)<\/dl>/g,(m,b)=>{
  if(!/showroom|Trade counter/i.test(b)||!/24\/7 emergency/.test(b))return m;
  const tel=(b.match(/<dt>24\/7 emergency[^<]*<\/dt><dd>(<a href="tel:[^"]+">[^<]+<\/a>)<\/dd>/)||[])[1];
  if(!tel)return m;
  b=b.replace(/<dt>24\/7 emergency[^<]*<\/dt><dd>[\s\S]*?<\/dd>/,'')
   .replace(/<dt>Retail showroom<\/dt>/,'<dt>Retail showroom hours</dt>').replace(/<dt>Trade counter<\/dt>/,'<dt>Trade counter hours</dt>')
   .replace(/<dt>Saturday &amp; Sunday<\/dt>/,`<dt>${/Trade counter/.test(b)?'Counter &amp; showroom':'Showroom'} — Saturday &amp; Sunday</dt>`);
  return `<dl><dt class="hours-emergency">24/7 emergency locksmith or electronic security tech</dt><dd class="hours-emergency">Mon–Sun, open 24 hours · ${tel}</dd>${b}</dl>`;});}
const home=fs.readFileSync(path.join(pub,'index.html'),'utf8');
const strip=(home.match(/<section class="trust-strip"[\s\S]*?<\/section>/)||[])[0],quotes=(home.match(/<section class="trust-quotes"[\s\S]*?<\/section>/)||[])[0];
const css=fs.readFileSync(path.join(pub,'home-services.css'),'utf8').split('\n').filter(l=>/^\.trust-(strip|quote)/.test(l)&&!/padding-top:18px/.test(l)).join('\n');
fs.writeFileSync(path.join(pub,'cro.css'),css+'\n.hero-proof{margin:12px 0 0;font-size:15px;letter-spacing:.04em;color:#c9a227;font-weight:600}\n.how-it-works{background:var(--yellow,#f7c600);color:#111;padding:28px max(6vw,24px)}.how-it-works a{color:inherit;text-decoration:underline;text-underline-offset:3px}.how-it-works .how-free{background:#111;color:var(--yellow,#f7c600);padding:1px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:.04em}.how-it-works h2{max-width:1200px;margin:0 auto 14px;font-size:22px}.how-it-works ol{list-style:none;margin:0 auto;padding:0;max-width:1200px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.how-it-works li{display:flex;gap:12px;align-items:center;font-weight:600}.how-it-works li>span:first-child{flex:none;width:34px;height:34px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center}@media(max-width:760px){.how-it-works ol{grid-template-columns:1fr}}\n.contact-section dt.hours-emergency,.contact-section dd.hours-emergency,dt.hours-emergency{font-weight:700}\n'+X.CSS);
module.exports=function(){
  X.writeIcons();
  for(const f of walk(pub)){
    let h=fs.readFileSync(f,'utf8'),o=h;
    h=h.replace(/Master Locksmiths Association of Australasia/g,'Master Locksmiths Association of Australia'); // agreed name (Oct 2026): text, attributes and JSON-LD
    if(/http-equiv="refresh"/i.test(h))continue;
    h=h.replace(/<(p|section|nav|div|script)[^>]*data-cro=""[^>]*>[\s\S]*?<\/\1>\n?/g,'').replace(/<section class="trust-(strip|quotes)"[^>]*data-cro-copy=""[\s\S]*?<\/section>/g,'').replace(/<link[^>]*data-cro=""[^>]*>\n?/g,'');
    h=hours(h);
    const rel=path.relative(pub,f).replace(/\\/g,'/'),dir=rel.split('/')[0],up='../'.repeat(rel.split('/').length-1)||'./';
    if(rel==='index.html'){h=h.replace(/(<section class="hero[^>]*>[\s\S]*?<\/h1>)/,`$1${PROOF}`).replace(/(<section class="trust-quotes"[\s\S]*?<\/section>)/,`$1${HOW.replace('__UP__',up)}`);}
    else if(LANDING.includes(dir)&&rel===dir+'/index.html'&&strip){
      h=h.replace(/(<section class="page-hero"[\s\S]*?<\/h1>)/,`$1${PROOF}`)
       .replace(/(<section class="page-hero"[\s\S]*?<\/section>)/,`$1${strip.replace('class="trust-strip"','class="trust-strip" data-cro-copy=""')}${quotes.replace('class="trust-quotes"','class="trust-quotes" data-cro-copy=""')}${HOW.replace('__UP__',up)}`)
       ;}
    h=h.replace(/<\/head>/,`<link rel="stylesheet" href="${up}cro.css?v=20261022b" data-cro="">\n</head>`);
    const k=X.kind(rel);h=X.form(h,rel);h=X.buttons(h,k);h=X.projects(h,rel,up);h=X.faq(h,rel,up);h=X.footerPay(h,up);h=X.offsite(h);h=X.claims(h);h=X.images(h);h=X.sticky(h,rel,up);h=X.phones(h);
    if(h!==o){fs.writeFileSync(f,h);if(rel==='index.html'){const mf=path.join(pub,'..','page-import-manifest.json'),mm=JSON.parse(fs.readFileSync(mf,'utf8'));mm.homepageMainSha256=require('crypto').createHash('sha256').update(h.match(/<main[\s\S]*?<\/main>/)[0]).digest('hex');fs.writeFileSync(mf,JSON.stringify(mm,null,2));}}
  }
};
if(require.main===module)module.exports();
