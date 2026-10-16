// Privacy policy, terms of use and the branded root 404 page (Oct 2026), plus Privacy/Terms links in every footer.
// Content uses only facts already on the site. Drafted for SPL/legal review: NOT legal advice (see the review notes in the
// Oct 2026 report; nothing about review status is shown on the pages). Idempotent; runs last in optimize-seo.
require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public'),config=require('../seo.config.json'),base=config.siteUrl;
const walk=(d,a=[])=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f,a);else if(e.name.endsWith('.html'))a.push(f);}return a;};
const slug=s=>'section-'+s.toLowerCase().replace(/&amp;/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const CONTACT=`<p><strong>SPL Security Solutions</strong><br>SPL Security Solutions Pty Ltd, ABN 39 088 382 745<br>101 Ashmore Rd, Bundall QLD 4217<br>Phone (07) 55 888 111<br>Email info@spl.com.au</p><p><strong>SPL Ballina Security</strong><br>Unit 2/269 River Street, Ballina NSW 2478<br>Phone (02) 6686 7675<br>Email ballina@spl.com.au</p>`;
const PAGES={
 'privacy-policy':{title:'Privacy Policy | SPL Security Solutions',h1:'Privacy Policy',
  description:'How SPL Security Solutions collects, uses and protects personal information from website enquiries, under the Australian Privacy Principles.',
  summary:'We collect the details you send through our enquiry form to reply to you. Enquiries go to our team by email, and we don’t sell or rent your personal information.',
  sections:[
   ['About this policy','<p>SPL Security Solutions (“SPL”, “we”, “us”) respects your privacy. This policy explains how we handle personal information collected through this website, SPL is bound by the Privacy Act 1988 (Cth) and handles personal information in accordance with the Australian Privacy Principles (APPs).</p>'],
   ['What we collect','<p>When you send an enquiry through our website form, we collect your name, phone number, email address, the service you’re interested in and your message. We also record the date and time of the enquiry and the IP address it was sent from, to help prevent spam and misuse.</p><p>If you call or email us, we collect the details you choose to give us.</p>'],
   ['How we use your information','<p>We use your information to reply to your enquiry, prepare quotes, provide the products and services you ask for, and keep records of our dealings with you. We don’t sell or rent your personal information.</p>'],
   ['How enquiries are sent and stored','<p>Enquiries from our website form are sent by email to the SPL Security Solutions team and kept in our email system. To limit repeated automated submissions, our website briefly keeps a coded (hashed) form of the IP address used to send an enquiry, not the address itself.</p>'],
   ['Cookies and analytics','<p>We use Google Analytics to understand how visitors use this website, for example which pages are visited and the type of device and browser used. Google Analytics uses cookies, and the information it collects is processed by Google, which may store and process it outside Australia, including in the United States.</p><p>You can block or delete cookies in your browser settings, or opt out of Google Analytics with the <a href="https://tools.google.com/dlpage/gaoptout">Google Analytics opt-out browser add-on</a>. For more on how Google handles data, see <a href="https://policies.google.com/privacy">Google’s privacy policy</a>.</p><p>Our location pages show embedded Google Maps, which are provided by Google and may also use cookies.</p>'],
   ['Who we share information with','<p>We only share personal information with service providers who help us run our business and this website (such as our email and website hosting providers), or where we are required or authorised by law.</p>'],
   ['Keeping your information secure','<p>We take reasonable steps to protect personal information from misuse, loss and unauthorised access, and to delete or de-identify it when we no longer need it.</p>'],
   ['Access, correction and complaints','<p>You can ask to access or correct the personal information we hold about you, or make a privacy complaint, by contacting us using the details below. We’ll respond within a reasonable time. If you’re not satisfied with our response, you can contact the Office of the Australian Information Commissioner at <a href="https://www.oaic.gov.au/">oaic.gov.au</a>.</p>'],
   ['Contact us',CONTACT],
   ['Changes to this policy','<p>We may update this policy from time to time. This version was last updated in October 2026.</p>']]},
 'terms-of-use':{title:'Terms of Use | SPL Security Solutions',h1:'Terms of Use',
  description:'Terms for using the SPL Security Solutions website, including website information, enquiries, emergencies, links and intellectual property.',
  summary:'This website gives general information about SPL’s products and services. Any work we do is covered by the quote and terms we give you at the time.',
  sections:[
   ['Using this website','<p>This website is operated by SPL Security Solutions. By using it, you agree to these terms. If you don’t agree, please don’t use the website.</p>'],
   ['Information on this website','<p>The information on this website, including security tips and articles, is general information only. It isn’t advice for your particular property or situation. We aim to keep it accurate and up to date, but products, prices and availability can change, so please contact us to confirm details before relying on them.</p>'],
   ['Quotes and services','<p>Any products or services we supply are covered by the quote and terms we give you at the time. Nothing on this website is an offer that can be accepted online.</p>'],
   ['Emergencies','<p>Our enquiry form isn’t monitored around the clock. For urgent locksmith or security help, call us 24/7 on (07) 55 888 111, or (02) 6686 7675 for our Ballina showroom. In a life-threatening emergency, call 000.</p>'],
   ['Enquiry forms','<p>Please give accurate details when you contact us and don’t use our forms to send spam or harmful content. We handle the information you send in line with our <a href="../privacy-policy/index.html">Privacy Policy</a>.</p>'],
   ['Intellectual property','<p>The content on this website, including text, photos, logos and design, belongs to SPL Security Solutions or is used with permission. Please don’t copy or reuse it without our written permission. Product names and brands belong to their owners.</p>'],
   ['Links to other websites','<p>This website links to other websites, such as suppliers and social media. We don’t control those websites and aren’t responsible for their content or privacy practices.</p>'],
   ['Liability','<p>To the extent permitted by law, we aren’t liable for any loss arising from your use of this website or reliance on its general information. Nothing in these terms excludes rights you have under the Australian Consumer Law.</p>'],
   ['Governing law','<p>These terms are governed by the laws of Queensland, Australia. You and SPL submit to the non-exclusive jurisdiction of the courts of Queensland.</p>'],
   ['Contact us',CONTACT],
   ['Changes to these terms','<p>We may update these terms from time to time. This version was last updated in October 2026.</p>']]}};
const tpl=()=>load(fs.readFileSync(path.join(out,'holiday-security-tips/index.html'),'utf8'));
function buildPage(key,p){const $=tpl(),url=base+key+'/';
 $('head>title').text(p.title);
 for(const s of ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]'])$(s).attr('content',p.description);
 for(const s of ['meta[property="og:title"]','meta[name="twitter:title"]'])$(s).attr('content',p.title);
 for(const s of ['meta[property="og:image"]','meta[name="twitter:image"]'])$(s).attr('content',base+'assets/og/default.png');
 for(const s of ['meta[property="og:image:alt"]','meta[name="twitter:image:alt"]'])$(s).attr('content','SPL Security Solutions');
 $('link[rel="canonical"]').attr('href',url);$('meta[property="og:url"]').attr('content',url);
 const graph=[{'@type':'WebSite','@id':base+'#website',url:base,name:config.siteName,inLanguage:'en-AU'},
  {'@type':'WebPage','@id':url+'#webpage',url,name:p.title,description:p.description,inLanguage:'en-AU',isPartOf:{'@id':base+'#website'},about:{'@id':config.businessUrl+'#business'},dateModified:'2026-10-16'},
  {'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:base},{'@type':'ListItem',position:2,name:p.h1,item:url}]}];
 $('script[data-seo-schema]').text(JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c'));
 $('.page-hero .breadcrumbs').html(`<a href="../index.html">Home</a> / ${p.h1}`);$('.page-hero h1').text(p.h1);
 const art=$('article.editorial-content');
 art.find('.page-toc>div').html(p.sections.map(([h])=>`<a href="#${slug(h)}">${h}</a>`).join(''));
 art.find('.answer-summary p').last().text(p.summary);art.find('.service-facts').remove();
 art.find('.editorial-block,figure,section.related-links').remove();
 art.append(p.sections.map(([h,b])=>`<div class="editorial-block"><h2 id="${slug(h)}">${h}</h2>${b}</div>\n`).join(''));
 let html=$.html();
 html=html.replace(/<a href="(https?:\/\/[^"]+)">([^<]*)<\/a>/g,(m,h,t)=>/firewight|spl\.com\.au/.test(h)?m:`<a href="${h}" target="_blank" rel="noopener noreferrer">${t}<span class="sr-only"> (opens in a new tab)</span></a>`);
 fs.mkdirSync(path.join(out,key),{recursive:true});fs.writeFileSync(path.join(out,key,'index.html'),html);
 const mf=path.join(root,'page-import-manifest.json'),m=JSON.parse(fs.readFileSync(mf,'utf8'));
 if(!m.pages.some(e=>e.url==='/'+key)){m.pages.push({url:'/'+key,title:p.h1,file:key+'/index.html',blocks:p.sections.length,addedAt:'2026-10-16'});fs.writeFileSync(mf,JSON.stringify(m,null,2)+'\n');}
 const smf=path.join(out,'sitemap.xml');let sm=fs.readFileSync(smf,'utf8');
 if(!sm.includes(`<loc>${url}</loc>`)){sm=sm.replace('</urlset>',`<url><loc>${url}</loc></url>\n</urlset>`);fs.writeFileSync(smf,sm);
  const rf=path.join(root,'seo-build-report.json');if(fs.existsSync(rf)){const r=JSON.parse(fs.readFileSync(rf,'utf8'));r.sitemapUrls=(sm.match(/<loc>/g)||[]).length;fs.writeFileSync(rf,JSON.stringify(r,null,2));}}}
// Root 404: GitHub Pages serves /404.html for any missing path at any depth, so every link is root-absolute.
function build404(){const $=tpl(),bp=new URL(base).pathname;
 $('head>title').text('Page not found | SPL Security Solutions');$('meta[name="description"]').attr('content','The page you were looking for could not be found.');
 $('meta[name="robots"]').attr('content','noindex, follow');$('link[rel="canonical"]').remove();$('script[data-seo-schema]').remove();
 $('meta[property^="og:"],meta[name^="twitter:"]').remove();
 $('.page-hero .breadcrumbs').html('<a href="../index.html">Home</a> / Page not found');$('.page-hero h1').text('Sorry, we can’t find that page');
 const links=[['locksmith-services','Locksmiths'],['emergency-locksmith','24/7 Emergency Locksmiths'],['security-systems','Security Systems'],['cctv-system','Security Cameras &amp; CCTV'],['alarm-system','Alarm Systems'],['access-control-systems','Access Control'],['door-hardware','Door Hardware'],['retail-security','Retail &amp; Trade'],['locations','Locations'],['ballina','SPL Ballina Security'],['contact','Contact us']];
 $('main').html(`<section class="page-hero"><div class="page-hero-inner"><p class="breadcrumbs"><a href="../index.html">Home</a> / Page not found</p><p class="kicker">ERROR 404</p><h1>Sorry, we can’t find that page</h1></div></section><div class="editorial-layout editorial-layout-unified"><article class="editorial-content"><section class="answer-summary" aria-label="What to do next"><p class="kicker">WHAT TO DO NEXT</p><p>The page may have moved or no longer exists. Try one of the pages below, or call us on <a href="tel:+61755888111">(07) 55 888 111</a>. We’re available 24/7 for emergencies.</p></section><section class="related-links"><h2 id="section-popular-pages">Popular pages</h2><a href="../index.html">Home <span aria-hidden="true">↗</span></a>${links.map(([k,t])=>`<a href="../${k}/index.html">${t} <span aria-hidden="true">↗</span></a>`).join('')}</section></article></div>`);
 let html=$.html();
 html=html.replace(/(href|src)="\.\.\/([^"]*)"/g,(m,a,p)=>`${a}="${bp}${p.replace(/index\.html$/,'')}"`).replace(/(href|src)="\.\.\/?"/g,`$1="${bp}"`);
 fs.writeFileSync(path.join(out,'404.html'),html);}
function footers(){let n=0;
 for(const f of walk(out)){let h=fs.readFileSync(f,'utf8');const b=h;if(/http-equiv="refresh"/.test(h))continue;const is404=path.relative(out,f)==='404.html';
  const up=path.relative(path.dirname(f),out).replaceAll('\\','/'),pre=up?up+'/':'./';
  const add=`<a href="${pre}privacy-policy/index.html">Privacy policy</a> · <a href="${pre}terms-of-use/index.html">Terms of use</a>`;
  if(!is404&&!h.includes('privacy-policy/index.html">Privacy policy</a>')){
   if(/<p class="footer-links">/.test(h))h=h.replace(/(<p class="footer-links">[\s\S]*?)(<\/p>)/,`$1 · ${add}$2`);
   else h=h.replace(/(<footer[\s\S]*?<span>\(07\) 55 888 111<\/span>)/,`$1\n      <p class="footer-links">${add}</p>`);}
  h=h.replace(/(<p class="footer-links">[\s\S]*?<\/p>)/,m=>m.replace(/\s*·\s*<a href="[^"]*ballina\/(index\.html)?">Ballina showroom<\/a>/g,'').replace(/^(<p class="footer-links">)<a href="[^"]*ballina\/(index\.html)?">Ballina showroom<\/a>\s*·\s*/,'$1'));
  h=h.replace(/(<p class="footer-links">[\s\S]*?<\/p>)/,m=>m.replace(/<a href="#ballina-map">Ballina showroom &amp; map<\/a>\s*·\s*/g,'').replace(/\s*·\s*<a href="[^"]*locations\/index\.html#gold-coast">Gold Coast showroom<\/a>/g,''));
  if(!h.includes('footer-abn'))h=h.replace(/(<p class="footer-links">[\s\S]*?<\/p>)/,`$1\n      <p class="footer-links footer-abn">SPL Security Solutions Pty Ltd · ABN 39 088 382 745</p>`);
  if(h!==b){fs.writeFileSync(f,h);n++;}}
 return n;}
module.exports=function run(){for(const [k,p] of Object.entries(PAGES))buildPage(k,p);build404();return {legalPages:Object.keys(PAGES).length,footersUpdated:footers()};};
if(require.main===module)console.log(module.exports());
