// Adds the Home Automation service page and the Holiday Security Tips page, built from the
// existing intercom page template (header, footer, contact section), then links them from
// navigation, the Security Systems overview, Helpful Articles and the footer. Idempotent.
require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public'),config=require('../seo.config.json'),base=config.siteUrl;
const manifestFile=path.join(root,'page-import-manifest.json'),manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const slugId=s=>'section-'+s.toLowerCase().replace(/&amp;|&/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

const pages=[
{slug:'home-automation',draft:true,// parked in drafts/home-automation/ until SPL approves; not built or linked
crumb:'Home Automation',h1:'Home Automation',
 title:'Home Automation on the Gold Coast | SPL Security Solutions',
 description:'Smart home automation built on your security system: app control of alarms, lighting, gates and appliances. Talk to SPL Security Solutions on (07) 55 888 111.',
 summary:'We can extend a modern security system into home automation, so lighting, gates, appliances and security modes are managed from the same app as your alarm and cameras.',
 serviceType:'Electronic security',
 image:{src:'assets/imported/34a1ca427c077c1d3ef2.jpg',alt:'Ajax security and automation devices',w:900,h:900},
 sections:[
  ['Security and automation in one system',`<p>Many modern alarm platforms do more than detect intruders. The <a href="../alarm-system/index.html">Ajax security systems</a> we supply combine intrusion protection, video surveillance, fire detection and water leak prevention with automation of lighting and appliances, all managed in one app.</p><p>That means the system protecting your property can also take care of everyday tasks, without a separate smart home hub to learn.</p>`],
  ['What you can automate',`<ul><li>Lighting scenes and schedules, including lights that switch on when the alarm is triggered</li><li>Remote control of gates and selected home appliances</li><li>Automatic changes of security mode, for example arming when the last person leaves</li><li>Viewing compatible security cameras alongside alarm events in the same app</li></ul><p>Which devices and scenarios suit your property depends on the system you have and how you use the building. We can talk you through the options.</p>`],
  ['Wireless and easy to add later',`<p>Wireless devices can be installed after renovations because they don't need additional wiring, and a starter system can be expanded over time with extra sensors, sirens, automation and compatible video devices. See the <a href="../products/ajax-starterkit.html">Ajax StarterKit</a> for an example of where a system can start.</p>`],
  ['Part of a complete security plan',`<p>Automation works best alongside the fundamentals: good locks, a properly designed <a href="../alarm-system/index.html">alarm system</a>, <a href="../cctv-system/index.html">CCTV</a> and, where needed, <a href="../intercom/index.html">intercoms</a> or <a href="../access-control-systems/index.html">access control</a>. Call us on (07) 55 888 111 or <a href="../contact/index.html#contact-enquiry">send an enquiry</a> to discuss what would work for your home or business.</p>`]],
 related:[['../alarm-system/index.html','Alarm Systems'],['../cctv-system/index.html','Security Cameras &amp; CCTV'],['../security-systems/index.html','Security Systems Overview']]},
{slug:'holiday-security-tips',crumb:'Holiday Security Tips',h1:'Holiday Security Tips for Homes and Businesses',
 title:'Holiday Security Tips for Homes & Businesses | SPL Security Solutions',
 description:'Going away or closing for the holidays? Practical security tips for homes and businesses on the Gold Coast and Northern NSW from SPL Security Solutions.',
 summary:'Before you go away or close up for the holidays, check your locks, test your alarm and cameras, make the property look occupied and know who to call if something goes wrong.',
 image:{src:'assets/imported/6eef8082bb259a186901.jpg',alt:'Key being turned in a door lock',w:1000,h:667},
 sections:[
  ['Before you leave home',`<ul><li>Walk around and check every door, window, sliding door and garage door actually locks. Fix sticking or worn locks before you go.</li><li>Lock side gates, sheds and garages, and put away ladders and tools that could help someone get in.</li><li>Don't leave a spare key under the mat or in a pot plant. Leave it with someone you trust instead.</li><li>Move valuables, documents and spare car keys out of sight, ideally into a <a href="../safe/index.html">safe</a>.</li><li>Unplug non-essential appliances and turn off water to washing machines if you're away for long.</li></ul>`],
  ['Make the property look lived in',`<ul><li>Use timers or smart lighting so lights come on in the evening.</li><li>Ask a neighbour to collect mail and parcels, put bins out and back, and park in the driveway now and then.</li><li>Pause deliveries, or have them sent somewhere else while you're away.</li><li>Keep the lawn and garden tidy before you leave.</li><li>Avoid posting travel plans or holiday photos on social media until you're home.</li></ul>`],
  ['Check your alarm and cameras',`<ul><li>Test your <a href="../alarm-system/index.html">alarm system</a> and replace backup and sensor batteries if they're due.</li><li>Make sure your contact details and any monitoring arrangements are up to date. Find out about <a href="../alarm-monitoring/index.html#AlarmMonitoringandPatrolService">alarm monitoring</a> if no one will be nearby to respond.</li><li>Confirm your <a href="../cctv-system/index.html">CCTV cameras</a> are online, recording and viewable from your phone, and that lenses are clean.</li><li>If you use smart lighting or automation, set lighting scenes and check notifications reach you while you're away.</li></ul>`],
  ['Closing your business for the holidays',`<ul><li>Review who has keys, cards or codes, and remove access for staff or contractors who no longer need it. <a href="../access-control-systems/index.html">Access control</a> lets you change permissions without rekeying.</li><li>Check that restricted or master key records are current and that no keys are unaccounted for.</li><li>Set alarm schedules and holiday hours, and update the after-hours contact list.</li><li>Remove cash and valuables from registers and display areas, and lock them away.</li><li>Check doors, closers and roller doors close and latch properly, including fire and rear exits.</li><li>Make sure intercoms, cameras and alarm communications are working before the last person leaves.</li></ul>`],
  ['When you get back',`<ul><li>Check doors, windows and fences for signs of tampering.</li><li>Review alarm and camera events for anything unusual.</li><li>If you've lost keys or think someone may have a copy, have the <a href="../residential-locksmith/index.html">locks rekeyed or changed</a>.</li></ul>`],
  ['Need a hand before you go?',`<p>If something needs fixing before you leave, from a lock that won't latch to an alarm or camera that needs servicing, call SPL on (07) 55 888 111 or <a href="../contact/index.html#contact-enquiry">send us an enquiry</a>. For a lockout or break-in while you're away, our <a href="../emergency-locksmith/index.html">24/7 emergency</a> line is the same number.</p>`]],
 related:[['../articles/index.html','Helpful Articles'],['../alarm-system/index.html','Alarm Systems'],['../locksmith-services/index.html','Locksmith Services']]}
];

const template=fs.readFileSync(path.join(out,'intercom/index.html'),'utf8');
for(const p of pages.filter(p=>!p.draft)){
 const $=load(template),url=base+p.slug+'/',img=base+p.image.src;
 $('head>title').text(p.title);
 const setMeta=(sel,v)=>$(sel).attr('content',v);
 setMeta('meta[name="description"]',p.description);
 $('link[rel="canonical"]').attr('href',url);
 setMeta('meta[property="og:title"]',p.title);setMeta('meta[name="twitter:title"]',p.title);
 setMeta('meta[property="og:description"]',p.description);setMeta('meta[name="twitter:description"]',p.description);
 setMeta('meta[property="og:url"]',url);
 setMeta('meta[property="og:image:alt"]',p.h1);setMeta('meta[name="twitter:image:alt"]',p.h1);
 const graph=[{'@type':'WebSite','@id':base+'#website',url:base,name:config.siteName,inLanguage:'en-AU'},{'@type':'WebPage','@id':url+'#webpage',url,name:p.title,description:p.description,inLanguage:'en-AU',isPartOf:{'@id':base+'#website'},about:{'@id':config.businessUrl+'#business'}},{'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:base},{'@type':'ListItem',position:2,name:p.h1,item:url}]}];
 if(p.serviceType)graph.push({'@type':'Service','@id':url+'#service',name:p.h1,serviceType:p.serviceType,provider:{'@id':config.businessUrl+'#business'},areaServed:['Gold Coast','Brisbane','Northern NSW'],url});
 $('script[data-seo-schema]').text(JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c'));
 $('.page-hero .breadcrumbs').html(`<a href="../index.html">Home</a> / ${esc(p.crumb)}`);
 $('.page-hero h1').text(p.h1);
 const toc=p.sections.map(([h])=>`<a href="#${slugId(h)}">${esc(h)}</a>`).join('')+`<a href="#section-explore-more">Explore more</a>`;
 const body=p.sections.map(([h,html],i)=>`<div class="editorial-block"><h2 id="${slugId(h)}">${esc(h)}</h2>\n${html}</div>`+(i===0?`\n<figure class="editorial-image editorial-media"><img loading="lazy" src="../${p.image.src}" alt="${esc(p.image.alt)}" width="${p.image.w}" height="${p.image.h}" decoding="async"></figure>`:'')).join('\n');
 $('.editorial-content').html(`<details class="page-toc" data-seo-generated=""><summary>On this page</summary><div>${toc}</div></details><section class="answer-summary" data-seo-generated="" aria-label="At a glance"><p class="kicker">AT A GLANCE</p><p>${esc(p.summary)}</p></section><div class="service-facts"><span>Servicing Gold Coast, Brisbane &amp; Northern NSW</span><span>FREE QUOTES AVAILABLE</span><span>24/7 EMERGENCY ASSISTANCE</span></div>\n${body}\n<section class="related-links"><h2 id="section-explore-more">Explore more</h2>${p.related.map(([h,l])=>`<a href="${h}">${l} <span aria-hidden="true">↗</span></a>`).join('')}</section>`);
 const file=path.join(out,p.slug,'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,$.html());
 if(!manifest.pages.some(e=>e.url==='/'+p.slug))manifest.pages.push({url:'/'+p.slug,title:p.h1,file:p.slug+'/index.html',blocks:p.sections.length+2,addedAt:'2026-10-16'});
}
fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n');

// Sitemap
const smFile=path.join(out,'sitemap.xml');let sm=fs.readFileSync(smFile,'utf8');
for(const p of pages.filter(p=>!p.draft)){const loc=`<url><loc>${base}${p.slug}/</loc></url>`;if(!sm.includes(loc))sm=sm.replace('</urlset>',loc+'\n</urlset>');}
fs.writeFileSync(smFile,sm);
const repFile=path.join(root,'seo-build-report.json'),rep=JSON.parse(fs.readFileSync(repFile,'utf8'));rep.sitemapUrls=(sm.match(/<loc>/g)||[]).length;fs.writeFileSync(repFile,JSON.stringify(rep,null,2));

// Site-wide links: nav (Security Systems dropdown) and footer.
function walk(d,acc=[]){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f,acc);else if(e.name.endsWith('.html'))acc.push(f);}return acc;}
for(const file of walk(out)){
 let html=fs.readFileSync(file,'utf8');const before=html;
 const rel=t=>path.relative(path.dirname(file),path.join(out,t)).replaceAll('\\','/');
 // Footer: holiday tips link under the address.
 if(html.includes('class="expanded-footer"')&&!html.includes('class="footer-links"')){
  html=html.replace(/(<footer class="expanded-footer">[\s\S]*?<p>101 Ashmore Rd, Bundall QLD 4217<\/p>)/,`$1<p class="footer-links"><a href="${rel('holiday-security-tips/index.html')}">Holiday security tips</a> · <a href="${rel('articles/index.html')}">Helpful articles</a></p>`);
 }
 if(html!==before)fs.writeFileSync(file,html);
}

// Helpful Articles: feature the holiday tips first.
{const f=path.join(out,'articles/index.html');const $=load(fs.readFileSync(f,'utf8'));
 if(!$('main a[href="../holiday-security-tips/index.html"]').length){
  $('.service-facts').first().after(`\n<div class="editorial-block"><h3 id="section-holiday-security-tips"> <a href="../holiday-security-tips/index.html">Holiday Security Tips for Homes and Businesses</a></h3><p>A practical checklist for securing your home or business before you go away or close for the holidays.</p></div>\n`);
  $('.page-toc div').prepend('<a href="#section-holiday-security-tips">Holiday Security Tips for Homes and Businesses</a>');
  fs.writeFileSync(f,$.html());}}
console.log('done');
