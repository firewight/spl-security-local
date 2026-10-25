// Queensland Secure Communities Partnership Program grants explainer for customers.
// Built from the intercom page template (same pattern as add-landing-pages.cjs).
// Facts from Business Queensland official pages only — SPL supplies quotes/install help;
// applications go via Qld Government / SmartyGrants. Idempotent.
require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public'),config=require('../seo.config.json'),base=config.siteUrl;
const manifestFile=path.join(root,'page-import-manifest.json'),manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const slugId=s=>'section-'+s.toLowerCase().replace(/&amp;|&/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

const OFFICIAL={
 hub:'https://www.business.qld.gov.au/running-business/support-services/financial/grants/secure-communities',
 small:'https://www.business.qld.gov.au/running-business/support-services/financial/grants/secure-communities/small-business',
 shared:'https://www.business.qld.gov.au/running-business/support-services/financial/grants/secure-communities/shared-security',
 media:'https://statements.qld.gov.au/statements/106285'
};

const page={
 slug:'qld-security-grants',
 crumb:'Queensland security grants',
 h1:'Queensland security grants for small businesses',
 title:'Queensland Security Grants for Small Businesses | SPL Security',
 description:'Queensland Secure Communities Partnership Program: small business security grants $1,500–$20,000 and shared grants $20,000–$200,000. How SPL can help with supplier quotes for eligible security work.',
 summary:'Queensland’s Secure Communities Partnership Program offers co-funded security grants for eligible small and family businesses — including tradie utes, vans and other mobile assets — plus larger shared projects for precincts. SPL can supply quotes and install eligible security work; you apply through the Queensland Government, not through us.',
 image:{src:'assets/imported/spl-commercial-cctv-system.jpg',alt:'Commercial CCTV security camera system',w:1000,h:667},
 sections:[
  ['What’s available',`<p>The Queensland Government’s <a href="${OFFICIAL.hub}">Secure Communities Partnership Program</a> currently has two grant streams for preventative security improvements:</p><ul><li><strong>Small business security grants</strong> — $1,500 to $20,000 (excluding GST) for an individual eligible small or family business (or a property owner/lessor where works benefit eligible small-business tenants).</li><li><strong>Shared security grants</strong> — $20,000 to $200,000 (excluding GST) for larger, coordinated projects that benefit at least two eligible Queensland small and family businesses (for example shopping strips, industrial estates or precincts).</li></ul><p>Both streams require a <strong>50% co-contribution</strong> from the applicant. Program rules, eligibility and closing dates are set by the Queensland Government and can change — always check <a href="${OFFICIAL.hub}">Business Queensland</a> before you apply.</p>`],
  ['Small business security grants',`<p>On the official <a href="${OFFICIAL.small}">small business security grants</a> page, you can apply for between <strong>$1,500 and $20,000 (excluding GST)</strong>, depending on project type. Eligible spend categories include:</p><ul><li>alarm systems</li><li>access control and entry management</li><li>surveillance and detection</li><li>lighting and environmental security improvements</li><li>physical security items</li><li>mobile business security</li></ul><p>You must contribute 50% of eligible project costs, so total eligible project costs must be between <strong>$3,000 and $40,000 (excluding GST)</strong>:</p><ul><li><strong>Mobile assets</strong> (vehicle, trailer, cart): minimum project $3,000 → minimum grant $1,500</li><li><strong>Fixed premises or combined</strong> fixed and mobile projects: minimum project $5,000 → minimum grant $2,500</li></ul><p>Applications are open and close at <strong>5pm, 23 April 2027</strong> (unless funding is exhausted beforehand), according to Business Queensland.</p>`],
  ['Mobile businesses, tradie utes and vans',`<p>This round explicitly supports mobile small businesses. The Queensland Government media statement highlights funding to protect <strong>tradie utes, vans and other mobile vehicles</strong>, tools and business equipment — alongside fixed-premise upgrades.</p><p>On the official small-business grant page, projects involving mobile business assets (vehicle, trailer or cart) have a lower minimum project cost ($3,000 ex GST) and a minimum grant of $1,500. Fixed or combined projects start higher ($5,000 / $2,500).</p><p>What counts as eligible “mobile business security” is defined in the program guidelines on Business Queensland — use those documents and the eligibility checker before you apply. SPL can help with supplier quotes for security products and installation that may suit your vehicle or premises; we do not decide grant eligibility.</p>`],
  ['Shared security grants',`<p>The separate <a href="${OFFICIAL.shared}">shared security grants</a> stream funds larger coordinated projects that provide a direct security benefit to <strong>at least two</strong> eligible Queensland small and family businesses. Grant amounts are <strong>$20,000 to $200,000 (excluding GST)</strong>, with a 50% co-contribution (total eligible costs $40,000–$400,000 ex GST).</p><p>Typical settings include neighbourhood shopping strips, industrial estates and local business precincts. This stream is <strong>competitive</strong>: funding is limited and not all eligible applications will be funded. Applications close at <strong>5pm, 29 January 2027</strong>.</p>`],
  ['Who can apply',`<p>Eligibility is set by the Queensland Government. At a high level, small and family business applicants for the small-business stream must typically:</p><ul><li>have 19 employees or fewer (headcount)</li><li>have turnover in the last financial year (2025–26) of $10 million or less</li><li>hold an active ABN, be GST registered, and have a Queensland headquarters on the ABR</li><li>have traded for at least one year and actively provide goods or services to customers</li></ul><p>A property owner, lessor or other authorised entity path also exists where improvements directly benefit eligible small-business tenants. Shared grants have additional precinct and occupancy rules.</p><p><strong>Always confirm against the official program guidelines and use Business Queensland’s eligibility checker</strong> before preparing an application. SPL cannot confirm whether you are eligible or whether an application will succeed.</p>`],
  ['How SPL can help',`<p>Applications are made through the <strong>Queensland Government via SmartyGrants</strong> — not through SPL. We do not administer the grant, assess applications or guarantee funding.</p><p>Where the guidelines ask for supplier quotes, SPL can quote and install security work that may fall within the eligible categories, including:</p><ul><li><a href="../alarm-system/index.html">alarm systems</a></li><li><a href="../cctv-system/index.html">surveillance / CCTV</a></li><li><a href="../access-control-systems/index.html">access control</a> and <a href="../intercom/index.html">intercoms</a></li><li>lighting-related security and physical security items such as locks and related hardware where relevant to your project</li></ul><p>Call <a href="tel:+61755888111">(07) 55 888 111</a> or <a href="../contact/index.html#contact-enquiry">send an enquiry</a> if you need a quote for eligible security work to support your application.</p>`],
  ['Next steps and official apply links',`<ol><li>Read the program overview on <a href="${OFFICIAL.hub}">Business Queensland – Secure Communities</a>.</li><li>Open the stream that matches your project: <a href="${OFFICIAL.small}">small business security grants</a> or <a href="${OFFICIAL.shared}">shared security grants</a>.</li><li>Use the official eligibility checker and program guidelines (and FAQs) on those pages.</li><li>Obtain supplier quotes as required by the guidelines — SPL can provide quotes for security supply and installation.</li><li>Register for SmartyGrants (if needed) and submit your application on the Queensland Government site before the closing date for your stream.</li></ol><p>Media background: <a href="${OFFICIAL.media}">Queensland Government ministerial statement (23 October 2026)</a>.</p><p><strong>Important:</strong> Program rules, amounts, eligibility and closing dates can change, and funding may be exhausted before the published close. The shared stream is competitive. Always rely on Business Queensland for the current rules — this page is a customer guide only and is not advice from SPL or the Queensland Government.</p><p><a href="${OFFICIAL.small}"><strong>Apply for small business security grants on Business Queensland</strong></a> · <a href="${OFFICIAL.shared}"><strong>Apply for shared security grants</strong></a></p>`]
 ],
 related:[
  ['../alarm-system/index.html','Alarm Systems'],
  ['../cctv-system/index.html','Security Cameras &amp; CCTV'],
  ['../access-control-systems/index.html','Access Control'],
  ['../contact/index.html#contact-enquiry','Request a quote'],
  ['../holiday-security-tips/index.html','Holiday Security Tips']
 ]
};

const template=fs.readFileSync(path.join(out,'intercom/index.html'),'utf8');
const $=load(template),url=base+page.slug+'/',p=page;
$('head>title').text(p.title);
const setMeta=(sel,v)=>$(sel).attr('content',v);
setMeta('meta[name="description"]',p.description);
$('link[rel="canonical"]').attr('href',url);
setMeta('meta[property="og:title"]',p.title);setMeta('meta[name="twitter:title"]',p.title);
setMeta('meta[property="og:description"]',p.description);setMeta('meta[name="twitter:description"]',p.description);
setMeta('meta[property="og:url"]',url);
const ogImg=base+'assets/og/'+p.slug+'.png';
setMeta('meta[property="og:image"]',ogImg);setMeta('meta[name="twitter:image"]',ogImg);
setMeta('meta[property="og:image:alt"]',p.h1);setMeta('meta[name="twitter:image:alt"]',p.h1);
const graph=[
 {'@type':'WebSite','@id':base+'#website',url:base,name:config.siteName,inLanguage:'en-AU'},
 {'@type':'WebPage','@id':url+'#webpage',url,name:p.title,description:p.description,inLanguage:'en-AU',isPartOf:{'@id':base+'#website'},about:{'@id':config.businessUrl+'#business'}},
 {'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:[
  {'@type':'ListItem',position:1,name:'Home',item:base},
  {'@type':'ListItem',position:2,name:p.h1,item:url}
 ]}
];
$('script[data-seo-schema]').text(JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c'));
$('.page-hero .breadcrumbs').html(`<a href="../index.html">Home</a> / ${esc(p.crumb)}`);
$('.page-hero h1').text(p.h1);
const toc=p.sections.map(([h])=>`<a href="#${slugId(h)}">${esc(h)}</a>`).join('')+`<a href="#section-explore-more">Explore more</a>`;
const body=p.sections.map(([h,html],i)=>`<div class="editorial-block"><h2 id="${slugId(h)}">${esc(h)}</h2>\n${html}</div>`+(i===0?`\n<figure class="editorial-image editorial-media"><img loading="lazy" src="../${p.image.src}" alt="${esc(p.image.alt)}" width="${p.image.w}" height="${p.image.h}" decoding="async"></figure>`:'')).join('\n');
$('.editorial-content').html(`<details class="page-toc" data-seo-generated=""><summary>On this page</summary><div>${toc}</div></details><section class="answer-summary" data-seo-generated="" aria-label="At a glance"><p class="kicker">AT A GLANCE</p><p>${esc(p.summary)}</p></section><div class="service-facts"><span>Servicing Gold Coast, Brisbane &amp; Northern NSW</span><span>FREE QUOTES AVAILABLE</span><span>24/7 EMERGENCY ASSISTANCE</span></div>\n${body}\n<section class="related-links"><h2 id="section-explore-more">Explore more</h2>${p.related.map(([h,l])=>`<a href="${h}">${l} <span aria-hidden="true">↗</span></a>`).join('')}</section>`);
const file=path.join(out,p.slug,'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});
fs.writeFileSync(file,$.html());
if(!manifest.pages.some(e=>e.url==='/'+p.slug))manifest.pages.push({url:'/'+p.slug,title:p.h1,file:p.slug+'/index.html',blocks:p.sections.length+2,addedAt:'2026-10-26'});
fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n');

// Sitemap
const smFile=path.join(out,'sitemap.xml');let sm=fs.readFileSync(smFile,'utf8');
const loc=`<url><loc>${base}${p.slug}/</loc></url>`;
if(!sm.includes(loc)){sm=sm.replace('</urlset>',loc+'\n</urlset>');fs.writeFileSync(smFile,sm);}
const repFile=path.join(root,'seo-build-report.json'),rep=JSON.parse(fs.readFileSync(repFile,'utf8'));rep.sitemapUrls=(sm.match(/<loc>/g)||[]).length;fs.writeFileSync(repFile,JSON.stringify(rep,null,2));

// Site-wide: add footer link only inside p.footer-links that already has Holiday security tips (idempotent).
function walk(d,acc=[]){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f,acc);else if(e.name.endsWith('.html'))acc.push(f);}return acc;}
let footerN=0;
for(const f of walk(out)){
 let html=fs.readFileSync(f,'utf8');
 if(/Qld security grants/i.test(html)&&html.includes('footer-links')){
  // already linked somewhere in footer-links — skip unless Holiday tips footer lacks it
 }
 const rel=path.relative(path.dirname(f),path.join(out,p.slug,'index.html')).replaceAll('\\','/');
 const next=html.replace(/<p class="footer-links">([\s\S]*?)<\/p>/g,(full,inner)=>{
  if(/footer-abn/.test(full))return full;
  if(/Qld security grants/i.test(inner))return full;
  if(!/Holiday security tips/i.test(inner))return full;
  const updated=inner.replace(/(Holiday security tips<\/a>)/,`$1 · <a href="${rel}">Qld security grants</a>`);
  return `<p class="footer-links">${updated}</p>`;
 });
 if(next!==html){fs.writeFileSync(f,next);footerN++;}
}

// Helpful Articles: feature the grants page (idempotent).
{const f=path.join(out,'articles/index.html');
 if(fs.existsSync(f)){
  const $=load(fs.readFileSync(f,'utf8'));
  if(!/http-equiv="refresh"/i.test($.html())&&!$('main a[href="../qld-security-grants/index.html"]').length){
   $('.service-facts').first().after(`\n<div class="editorial-block"><h3 id="section-qld-security-grants"> <a href="../qld-security-grants/index.html">Queensland security grants for small businesses</a></h3><p>Customer guide to Queensland’s Secure Communities small business and shared security grants, and how SPL can help with supplier quotes.</p></div>\n`);
   $('.page-toc div').prepend('<a href="#section-qld-security-grants">Queensland security grants for small businesses</a>');
   fs.writeFileSync(f,$.html());
  }
}}

console.log('qld-security-grants page written; footer links updated on',footerN,'pages');
