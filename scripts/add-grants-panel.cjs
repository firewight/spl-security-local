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
// ---- HOMEPAGE BANNER (GRANTS-BANNER-HOME) -------------------------------------------
// Slim one-line strip directly under the homepage hero (approved by Nathan, 2 Nov 2026).
// REMOVE after 5pm 23 April 2027 (small business grants close) or earlier if funding is exhausted:
// set SHOW_HOME_BANNER=false and rebuild (the strip is stripped from public/index.html by marker).
const SHOW_HOME_BANNER=true;
const banner=`<section class="grants-banner" id="grants-banner-home" data-grants-banner="" aria-label="Queensland security grants" style="background:#161616;color:#eee;border-top:1px solid #222;padding:12px max(6vw,24px);text-align:center;position:relative;z-index:2">`+
`<style>.grants-banner p{margin:0;font-size:15px;line-height:1.5}.grants-banner a{color:#f7c600;font-weight:700;text-decoration:none;white-space:nowrap;margin-left:10px}.grants-banner a:hover,.grants-banner a:focus-visible{text-decoration:underline;text-underline-offset:3px}@media(max-width:560px){.grants-banner p{font-size:13.5px;line-height:1.45}.grants-banner a{margin-left:6px}}@media(max-width:374px){.grants-banner p{font-size:12.5px}.grants-banner{padding-left:16px!important;padding-right:16px!important}}</style>`+
`<p>Queensland businesses may be eligible for a security grant of up to $20,000 (ex GST). <a class="grants-cta" href="./qld-security-grants/index.html">Check eligibility <span aria-hidden="true">›</span></a></p>`+
`</section>\n`;
const BANNER_RE=/<section class="grants-banner" id="grants-banner-home"[\s\S]*?<\/section>\n?/;
const BANNER_ANCHOR='<section class="trust-strip" aria-label="Ratings and licences">';
function homeBanner(){
  const f=path.join(root,'index.html');let t=fs.readFileSync(f,'utf8').replace(BANNER_RE,'');
  if(SHOW_HOME_BANNER){const i=t.indexOf(BANNER_ANCHOR);if(i<0){console.warn('grants banner: anchor missing');return 'home banner: anchor missing';}t=t.slice(0,i)+banner+t.slice(i);}
  fs.writeFileSync(f,t);return SHOW_HOME_BANNER?'home banner (before trust-strip)':'home banner removed';
}
// ---- END HOMEPAGE BANNER --------------------------------------------------------------
module.exports=function addGrantsPanel(){
  const done=[homeBanner()];
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
