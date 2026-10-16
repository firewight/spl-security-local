// Ballina landing page (/ballina/): the old ballinalocksmiths.com.au domain 301s here at launch.
// Built from the intercom page template (header, footer, contact section). Facts only from the Ballina showroom
// details already on /locations/. Also links it from /locations/, the footer and Ballina mentions, adds it to the
// sitemap/manifest, points the #ballina LocalBusiness url at it and records the launch 301s. Idempotent.
require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path'),{load}=require('cheerio');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public'),config=require('../seo.config.json'),base=config.siteUrl,prod=config.businessUrl.replace(/\/$/,'');
const url=base+'ballina/',title='SPL Security Ballina | Locksmith & Security, Northern NSW',
 description='SPL Security Ballina: locksmiths, door hardware, safes and security systems from our River Street showroom, serving Northern NSW. Call (02) 6686 7675.';
const services=[
 ['locksmith-services','Locksmiths','Residential, commercial and restricted key locksmith services.'],
 ['emergency-locksmith','24/7 Emergency Locksmiths','Lockouts, break-ins and urgent lock repairs, day or night.'],
 ['auto-locksmith','24/7 Auto Locksmiths','Car lockouts, jammed ignitions, car and transponder keys.'],
 ['door-hardware','Door Hardware','Door and lock hardware over the counter at the showroom.'],
 ['safe','Safes','Safes for homes and businesses, supplied and installed.'],
 ['alarm-system','Alarm Systems','Alarm installation, maintenance and monitoring.'],
 ['cctv-system','Security Cameras &amp; CCTV','Camera systems for homes and businesses.'],
 ['access-control-systems','Access Control','Keyless entry and electronic access for your premises.'],
 ['intercom','Intercom Systems','Voice and video intercoms for homes and buildings.']];
module.exports=function run(){
 const loc=fs.readFileSync(path.join(out,'locations/index.html'),'utf8');
 const card=loc.match(/<article class="showroom-card"><h3 id="ballina">[\s\S]*?<\/article>/)[0]
  .replace(/<h3 id="ballina">[^<]*<\/h3>/,'<h2 id="ballina">Visit our Ballina showroom</h2>')
  .replace(/<p class="showroom-links">[\s\S]*?<\/p>/,m=>m.replace(/<a href="\.\.\/ballina\/index.html">[\s\S]*?<\/a>/,''));
 const $=load(fs.readFileSync(path.join(out,'intercom/index.html'),'utf8'));
 $('head>title').text(title);
 const set=(s,v)=>$(s).attr('content',v);
 set('meta[name="description"]',description);$('link[rel="canonical"]').attr('href',url);
 set('meta[property="og:title"]',title);set('meta[name="twitter:title"]',title);set('meta[property="og:description"]',description);set('meta[name="twitter:description"]',description);set('meta[property="og:url"]',url);
 const ballina={'@type':'Locksmith','@id':prod+'/#ballina','name':'SPL Security Solutions Ballina','url':url,'telephone':'+61 2 6686 7675','email':'ballina@spl.com.au','address':{'@type':'PostalAddress','streetAddress':'Unit 2/269 River Street','addressLocality':'Ballina','addressRegion':'NSW','postalCode':'2478','addressCountry':'AU'},'areaServed':'Northern NSW','openingHoursSpecification':[{'@type':'OpeningHoursSpecification','dayOfWeek':['Monday','Tuesday','Wednesday','Thursday','Friday'],'opens':'08:00','closes':'17:00'}],'parentOrganization':{'@id':prod+'/#business'}};
 const graph=[{'@type':'WebSite','@id':base+'#website',url:base,name:config.siteName,inLanguage:'en-AU'},{'@type':'WebPage','@id':url+'#webpage',url,name:title,description,inLanguage:'en-AU',isPartOf:{'@id':base+'#website'},about:{'@id':prod+'/#ballina'},breadcrumb:{'@id':url+'#breadcrumb'}},{'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:base},{'@type':'ListItem',position:2,name:'Locations',item:base+'locations/'},{'@type':'ListItem',position:3,name:'Ballina',item:url}]},ballina];
 $('script[data-seo-schema]').text(JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c'));
 $('.page-hero .breadcrumbs').html('<a href="../index.html">Home</a> / <a href="../locations/index.html">Locations</a> / Ballina');
 $('.page-hero .kicker').text('LOCKSMITH & SECURITY · NORTHERN NSW');$('.page-hero h1').text('SPL Security Ballina');
 const grid=services.map(([p,h,l])=>`<a class="ballina-service" href="../${p}/index.html"><strong>${h}</strong><span>${l}</span></a>`).join('');
 $('.editorial-content').html(`<section class="answer-summary" aria-label="Welcome"><p class="kicker">WELCOME</p><p>Welcome to SPL Security Ballina (formerly SPL Ballina Locksmiths). Our Ballina showroom services Northern NSW and is part of SPL Security Solutions, so locksmiths, door hardware, safes and electronic security all come from one team. Call (02) 6686 7675 or <a href="../contact/index.html#contact-enquiry">send an enquiry</a>.</p></section>
<div class="showroom-grid showroom-grid-single">${card}</div>
<div class="editorial-block"><h2 id="section-about-spl-ballina">About SPL Ballina</h2><p>Based in Ballina, we provide property and automotive locksmith services for residential and commercial clients across the Northern Rivers region, including Byron Bay and Lismore. Locked out or lost your keys? Our mobile locksmiths can come to you, and we repair and rekey existing car and property locks.</p><p>Our team also installs security systems for homes and offices, including alarms, intercoms, CCTV, access control and master key systems, and supplies products such as deadlocks, safes, transponder keys, remote access and architectural hardware. NSW Security Licence Number: 000102071.</p></div>
<div class="editorial-block"><h2 id="section-airbnb-smart-locks">Smart locks for Airbnb and holiday rentals</h2><p>With a smart locking system you can host guests wherever you are. Access codes are sent to guests remotely, and you can monitor arrivals and departures and manage multiple properties and doors at once. Talk to our Ballina team about a smart lock for your holiday property, or read more about <a href="../access-control-systems/index.html">access control and keyless entry</a>.</p></div>
<div class="editorial-block"><h2 id="section-services">Our services</h2><div class="ballina-services">${grid}</div></div>
<div class="editorial-block"><h2 id="section-get-in-touch">Get in touch</h2><p>For the Ballina showroom, call (02) 6686 7675 or email ballina@spl.com.au (see the showroom details above). For a 24/7 emergency in the Ballina area, call (02) 6686 7675. You can also <a href="../contact/index.html#contact-enquiry">send us an enquiry online</a>.</p></div>
<section class="related-links"><h2 id="section-explore-more">Explore more</h2><a href="../locations/index.html">Locations <span aria-hidden="true">↗</span></a><a href="../about/index.html">About SPL Security Solutions <span aria-hidden="true">↗</span></a></section>`);
 $('head').append('<style data-ballina="">.ballina-services{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px}.ballina-service{display:grid;gap:4px;padding:16px 18px;border:1px solid rgba(0,0,0,.12);border-radius:12px;text-decoration:none;color:inherit;background:#fff}.ballina-service strong{font-family:Manrope,sans-serif;font-size:17px}.ballina-service span{font-size:15px;color:#444}.ballina-service:hover,.ballina-service:focus-visible{border-color:#F7C600;box-shadow:0 0 0 2px #F7C600}</style>');
 const file=path.join(out,'ballina/index.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,$.html());
 // manifest, sitemap, report
 const mf=path.join(root,'page-import-manifest.json'),m=JSON.parse(fs.readFileSync(mf,'utf8'));
 if(!m.pages.some(p=>p.url==='/ballina')){m.pages.push({url:'/ballina',title:'SPL Security Ballina',file:'ballina/index.html',blocks:4,addedAt:'2026-10-16'});fs.writeFileSync(mf,JSON.stringify(m,null,2)+'\n');}
 const sf=path.join(out,'sitemap.xml');let sm=fs.readFileSync(sf,'utf8');const l=`<url><loc>${url}</loc></url>`;if(!sm.includes(l)){sm=sm.replace('</urlset>',l+'\n</urlset>');fs.writeFileSync(sf,sm);}
 const rf=path.join(root,'seo-build-report.json'),rep=JSON.parse(fs.readFileSync(rf,'utf8'));rep.sitemapUrls=(sm.match(/<loc>/g)||[]).length;fs.writeFileSync(rf,JSON.stringify(rep,null,2));
 // links: /locations/ Ballina card, footer, #ballina url in schema elsewhere
 const walk=(d,a=[])=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f,a);else if(e.name.endsWith('.html'))a.push(f);}return a;};
 for(const f of walk(out)){let h=fs.readFileSync(f,'utf8');const b=h;const rel=path.relative(path.dirname(f),path.join(out,'ballina/index.html')).replaceAll('\\','/');
  h=h.split(`"@id":"${prod}/#ballina","name":"SPL Security Solutions Ballina","url":"${base}locations/"`).join(`"@id":"${prod}/#ballina","name":"SPL Security Solutions Ballina","url":"${url}"`);
  if(h.includes('<p class="footer-links">')&&!/footer-links">[^\n]*ballina\/index.html/.test(h))h=h.replace(/(<p class="footer-links">[\s\S]*?)(<\/p>)/,`$1 · <a href="${rel}">Ballina showroom</a>$2`);
  if(f.endsWith('locations/index.html')&&!h.includes('href="../ballina/index.html"'))h=h.replace(/(<h3 id="ballina">[\s\S]*?<p class="showroom-links">)/,`$1<a href="../ballina/index.html">SPL Security Ballina page</a> · `);
  if(h!==b)fs.writeFileSync(f,h);}
 // Ballina showroom cards: the 24/7 emergency line is the Ballina landline (Gold Coast cards keep (07) 55 888 111).
 for(const f of walk(out)){const h=fs.readFileSync(f,'utf8');const n=h.replace(/<article class="showroom-card">(?:(?!<\/article>)[\s\S])*?Ballina NSW 2478(?:(?!<\/article>)[\s\S])*?<\/article>/g,c=>c.replace('<dt>24/7 emergency</dt><dd><a href="tel:+61755888111">(07) 55 888 111</a></dd>','<dt>24/7 emergency</dt><dd><a href="tel:+61266867675">(02) 6686 7675</a></dd>'));if(n!==h)fs.writeFileSync(f,n);}
 // launch 301s for the old Ballina domain (no old Ballina paths are recorded in the repo; catch-all to /ballina/)
 const cf=path.join(root,'backlink-migration.csv');const lines=fs.readFileSync(cf,'utf8').trimEnd().split('\n');const csv=s=>'"'+String(s).replaceAll('"','""')+'"';
 const old={'':'ballina','transponder-key/':'auto-locksmith','flip-keys/':'auto-locksmith','replacement-keys/':'auto-locksmith','automotive/':'auto-locksmith','mobile-locksmiths/':'auto-locksmith',
  'the-history-of-spl-security-solutions/':'about','meat-the-team/':'our-team','recent-projects/':'major-projects','projects/':'major-projects','project_category/commercial/':'major-projects','project_category/residential/':'major-projects',
  'cookie-notice/':'ballina','privacy-policy/':'ballina','term-of-use/':'ballina','about-spl-balline-locksmiths/':'ballina','about/':'ballina','contact/':'ballina','byron-bay/':'ballina','lismore/':'ballina','airbnb-solutions/':'ballina',
  'cctv1/':'cctv-system','cctv/':'cctv-system','resources/':'articles','about/careers/':'careers','alarm-systems/':'alarm-system','intercom-systems/':'intercom','access-control/':'access-control-systems','maintenance/':'alarm-monitoring',
  'master-key-systems/':'commercial-locksmith','lock-hardware/':'locksmiths/lock-hardware','safes/':'safe','commercial/':'commercial-locksmith','residential/':'residential-locksmith','electronic-security/':'security-systems','locking-solutions/':'locksmith-services','*':'ballina'};
 const rows=[];for(const [p,to]of Object.entries(old)){rows.push(['https://ballinalocksmiths.com.au/'+p,to]);if(p==='')rows.push(['https://www.ballinalocksmiths.com.au/',to]);}
 for(const [from,to] of rows){const row=[from,prod+'/'+to,base+to+'/',`301 redirect to /${to} at launch (old Ballina Locksmiths site${from.endsWith('*')?'; catch-all for any other path, www and non-www':''})`].map(csv).join(',');const i=lines.findIndex(x=>x.startsWith(csv(from)+','));if(i>=0)lines[i]=row;else lines.push(row);}
 fs.writeFileSync(cf,lines.join('\n')+'\n');
};
if(require.main===module){module.exports();console.log('ballina page built');}
