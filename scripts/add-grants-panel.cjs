// Adds a short "Qld security grants" call-out panel to commercial-facing pages,
// linking to /qld-security-grants/. Facts are taken from that page only
// (Secure Communities Partnership Program, small business grants $1,500–$20,000 ex GST,
// 50% co-contribution, closes 5pm 23 April 2027). Approved by Nathan, 2 Nov 2026.
// Idempotent: replaces an existing panel (marker data-grants-callout). String insert (no re-serialisation).
// Placement: before the inline FAQ; else before the "Service Areas" block; else before "Explore more".
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..','public');
const PAGES=['cctv-system','alarm-system','access-control-systems','intercom','alarm-monitoring','master-key-systems','security-systems'];
const panel=`<aside class="grants-callout" id="grants-callout" data-grants-callout="" aria-labelledby="grants-callout-title" style="border-left:3px solid #f7c600;background:#ecece4;padding:22px 25px;margin:44px 0 36px">`+
`<p class="kicker" style="color:#705900;font-size:12px;margin:0 0 10px">QLD SECURITY GRANTS</p>`+
`<h2 id="grants-callout-title" style="font-size:clamp(24px,2.4vw,32px);line-height:1.2;letter-spacing:-.035em;margin:0 0 12px">Queensland businesses may be eligible for a security grant</h2>`+
`<p style="font-size:16px;line-height:1.75;margin:0 0 18px;color:#414141">The Queensland Government’s Secure Communities Partnership Program offers small business security grants of $1,500 to $20,000 (excluding GST) for upgrades such as alarm systems, CCTV and access control, with a 50% co-contribution. Applications close at 5pm, 23 April 2027, unless funding runs out sooner.</p>`+
`<div class="editorial-action" style="margin:0"><a class="grants-cta" href="../qld-security-grants/index.html">Check grant eligibility</a></div>`+
`</aside>\n`;
const RE=/<aside class="grants-callout"[^>]*data-grants-callout[\s\S]*?<\/aside>\n?/;
const ANCHORS=['<section class="cro-faq cro-faq-inline"','<div class="editorial-block"> <h3 id="section-service-areas">','<section class="related-links">'];
module.exports=function addGrantsPanel(){
  const done=[];
  for(const p of PAGES){
    const f=path.join(root,p,'index.html');if(!fs.existsSync(f))continue;
    let t=fs.readFileSync(f,'utf8').replace(RE,'');
    const a=ANCHORS.find(x=>t.includes(x));if(!a){console.warn('grants panel: no anchor in',p);continue;}
    const i=t.indexOf(a);t=t.slice(0,i)+panel+t.slice(i);
    fs.writeFileSync(f,t);done.push(p+' (before '+a.match(/class="([^"]+)"|id="([^"]+)"/).slice(1).find(Boolean)+')');
  }
  return done;
};
if(require.main===module)console.log(module.exports());
