// CRO fixes: 24/7-first hours, hero proof line, "How it works" strip, Google reviews high on landing pages (Brisbane menu link intentionally stays #gold-coast: serviced from Gold Coast office). Idempotent.
const fs=require('fs'),path=require('path');
const pub=path.join(__dirname,'..','public');
const LANDING=['emergency-locksmith','locksmith-services','residential-locksmith','commercial-locksmith','auto-locksmith','locations'];
const PROOF='<p class="hero-proof" data-cro="">Securing the Gold Coast since 1990</p>';
const HOW='<section class="how-it-works" data-cro="" aria-labelledby="how-it-works-title"><h2 id="how-it-works-title">How it works</h2><ol><li><span>1</span>Call or send the form</li><li><span>2</span>We confirm details and give you a free quote</li><li><span>3</span>A licensed technician gets the job done</li></ol></section>';
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
fs.writeFileSync(path.join(pub,'cro.css'),css+'\n.hero-proof{margin:12px 0 0;font-size:15px;letter-spacing:.04em;color:#c9a227;font-weight:600}\n.how-it-works{background:var(--yellow,#f7c600);color:#111;padding:28px max(6vw,24px)}.how-it-works h2{max-width:1200px;margin:0 auto 14px;font-size:22px}.how-it-works ol{list-style:none;margin:0 auto;padding:0;max-width:1200px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.how-it-works li{display:flex;gap:12px;align-items:center;font-weight:600}.how-it-works li span{flex:none;width:34px;height:34px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center}@media(max-width:760px){.how-it-works ol{grid-template-columns:1fr}}\n.contact-section dt.hours-emergency,.contact-section dd.hours-emergency,dt.hours-emergency{font-weight:700}\n');
module.exports=function(){
  for(const f of walk(pub)){
    let h=fs.readFileSync(f,'utf8'),o=h;
    h=h.replace(/<(p|section)[^>]*data-cro=""[^>]*>[\s\S]*?<\/\1>/g,'').replace(/<section class="trust-(strip|quotes)"[^>]*data-cro-copy=""[\s\S]*?<\/section>/g,'').replace(/<link[^>]*data-cro=""[^>]*>/g,'');
    h=hours(h);
    const rel=path.relative(pub,f).replace(/\\/g,'/'),dir=rel.split('/')[0],up='../'.repeat(rel.split('/').length-1)||'./';
    if(rel==='index.html'){h=h.replace(/(<section class="hero[^>]*>[\s\S]*?<\/h1>)/,`$1${PROOF}`).replace(/(<section class="trust-quotes"[\s\S]*?<\/section>)/,`$1${HOW}`);}
    else if(LANDING.includes(dir)&&rel===dir+'/index.html'&&strip){
      h=h.replace(/(<section class="page-hero"[\s\S]*?<\/h1>)/,`$1${PROOF}`)
       .replace(/(<section class="page-hero"[\s\S]*?<\/section>)/,`$1${strip.replace('class="trust-strip"','class="trust-strip" data-cro-copy=""')}${quotes.replace('class="trust-quotes"','class="trust-quotes" data-cro-copy=""')}${HOW}`)
       .replace(/<\/head>/,`<link rel="stylesheet" href="${up}cro.css?v=20261022" data-cro="">\n</head>`);}
    if(rel==='index.html')h=h.replace(/<\/head>/,`<link rel="stylesheet" href="./cro.css?v=20261022" data-cro="">\n</head>`);
    if(h!==o){fs.writeFileSync(f,h);if(rel==='index.html'){const mf=path.join(pub,'..','page-import-manifest.json'),mm=JSON.parse(fs.readFileSync(mf,'utf8'));mm.homepageMainSha256=require('crypto').createHash('sha256').update(h.match(/<main[\s\S]*?<\/main>/)[0]).digest('hex');fs.writeFileSync(mf,JSON.stringify(mm,null,2));}}
  }
};
if(require.main===module)module.exports();
