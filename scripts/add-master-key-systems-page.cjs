// /master-key-systems/ "Master Key Systems for Business" service page (approved by Nathan, 1 Nov 2026).
// Built from the public/restricted-keys/ page template (same head assets, header, footer, contact CTA, mobile call bar);
// main content lives in scripts/templates/master-key-systems-main.html. Also, idempotently:
//  - Locksmiths menu: "Master Key Systems" after "Restricted Key Systems" on every page
//  - /locksmith-services/: links the "Master key systems" service and adds it to Explore more
//  - /restricted-keys/: real master key copy in the "Master Key Systems" section (replaces misplaced alarm text) + Explore more links
//  - sitemap.xml + page-import-manifest.json entries
// No dependencies (fs/regex only). Run after the nav scripts in optimize-seo.cjs.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public'),config=require('../seo.config.json');
const base=config.siteUrl,BIZ=config.businessUrl,SLUG='master-key-systems',URL_=base+SLUG+'/';
const TITLE='Master Key Systems for Business | SPL Security Solutions';
const DESC='Master key systems for strata, offices, schools and commercial buildings across the Gold Coast, Brisbane and Northern NSW. Free quotes. Call SPL on (07) 55 888 111.';
const H1='Master Key Systems for Business';
const FAQ=[
['What is a master key system?',"A master key system is a planned hierarchy of keys and locks. Each person's key opens only the doors they need, while managers or building staff hold higher-level keys that open more areas. It means tiered access across different areas, fewer keys in circulation and controlled access for staff, managers and contractors."],
['Who is a master key system suited to?','Any building where different people need different levels of access: strata and body corporate complexes, offices and multi-tenant buildings, schools and other institutions, retail centres and commercial or industrial premises.'],
['Can our master keys be protected from copying?',"Yes. A restricted master key system uses patent-protected or registered keys that are only available to approved agents, so they can't be copied at a hardware store or key cutting kiosk. We will not cut a duplicate key without a letter or order signed by one of the signatories for your system."],
['Who can order extra keys for our system?','Only the signatories listed for the system. When the system is set up, you complete a registration form naming the people authorised to order keys or work, such as owners, managers, caretakers or the body corporate. Signatories can be changed by submitting a new Signatory Registration Form.'],
['What should we do if a master key is lost?',"Call us on (07) 55 888 111 (24/7), or (02) 6686 7675 in Northern NSW. We'll talk you through the options, which can include rekeying the affected locks so the lost key no longer works."],
['Can you take over or extend our existing system?','Yes. We service, repair and maintain locks and locking systems, including those installed by other companies. A restricted system can be transferred between locksmiths if the receiving locksmith has, or can get, the key profile the system is on; systems on an exclusive profile may need to be arranged through the manufacturer.'],
['How much does a master key system cost?','Every building is different, so we quote each system. Quotes are free and we give you a fixed price before we come out, so you know the cost upfront. We also offer commercial accounts for businesses.'],
['Do you cover Northern NSW?','Yes. The Gold Coast and Brisbane are serviced from our Bundall office, and Northern NSW is serviced from our Ballina showroom. Call SPL Ballina Locksmiths on (02) 6686 7675.'],
];
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const htmlEsc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const walk=(d,acc=[])=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f,acc);else if(e.name.endsWith('.html'))acc.push(f);}return acc;};
const edit=(rel,fn)=>{const f=path.join(out,rel);const s=fs.readFileSync(f,'utf8');const n=fn(s);if(n!==s){fs.writeFileSync(f,n);return 1;}return 0;};
module.exports=function(){
 const stats={};
 // 1) /restricted-keys/: master key copy instead of the misplaced alarm-monitoring paragraph; Explore more links.
 const MK_COPY='<div class="editorial-block"><p>A master key system gives each person a key that opens only the areas they need, while managers hold higher-level keys that open more. It means tiered access across different areas, fewer keys in circulation and controlled access for staff, managers and contractors, which suits strata complexes, offices, schools and commercial buildings. Put the system on a restricted key profile and only your nominated signatories can order more keys.</p><p>See <a href="../master-key-systems/index.html">master key systems for business</a>.</p></div>';
 const RK_RELATED='<section class="related-links"><h2 id="section-explore-more">Explore more</h2><a href="../master-key-systems/index.html">Master Key Systems <span aria-hidden="true">↗</span></a><a href="../locksmith-services/index.html">Locksmithing Services <span aria-hidden="true">↗</span></a><a href="../access-control-systems/index.html">Access Control Systems <span aria-hidden="true">↗</span></a><a href="../emergency-locksmith/index.html">Emergency Locksmiths <span aria-hidden="true">↗</span></a></section>';
 stats.restrictedKeys=edit('restricted-keys/index.html',s=>s
  .replace(/(<h2 id="section-master-key-systems">Master Key Systems<\/h2>\n<\/div>\n)<div class="editorial-block"><p>In addition to our security system installation and maintenance, we offer 24\/7 alarm monitoring[\s\S]*?<\/div>/,(m,h)=>h+MK_COPY)
  .replace('<section class="related-links"><h2>Explore more</h2></section>',RK_RELATED)
  .replace('<a href="#section-high-security-restricted-master-key-systems">High-Security Restricted Master Key Systems</a><a href="#section-frequently-asked-questions">Frequently asked questions</a></div>','<a href="#section-high-security-restricted-master-key-systems">High-Security Restricted Master Key Systems</a><a href="#section-frequently-asked-questions">Frequently asked questions</a><a href="#section-explore-more">Explore more</a></div>'));
 // 2) The page itself, from the restricted-keys template.
 const tpl=fs.readFileSync(path.join(out,'restricted-keys/index.html'),'utf8');
 const main=fs.readFileSync(path.join(__dirname,'templates/master-key-systems-main.html'),'utf8').replace(/^<!--[\s\S]*?-->\n/,'');
 for(const[q]of FAQ)if(!main.includes('<summary>'+htmlEsc(q)+'</summary>'))throw new Error('FAQ not in page: '+q);
 const cta=tpl.match(/<section class="contact-options"[\s\S]*?<\/section>/)[0].replace('<strong>Get a free locksmith quote</strong>','<strong>Get a free quote for my business</strong>');
 const graph=[
  {'@type':'WebSite','@id':base+'#website',url:base,name:config.siteName,inLanguage:'en-AU'},
  {'@type':'WebPage','@id':URL_+'#webpage',url:URL_,name:TITLE,description:DESC,inLanguage:'en-AU',isPartOf:{'@id':base+'#website'},about:{'@id':BIZ+'#business'}},
  {'@type':'BreadcrumbList','@id':URL_+'#breadcrumb',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:base},{'@type':'ListItem',position:2,name:'Locksmith Services',item:base+'locksmith-services/'},{'@type':'ListItem',position:3,name:H1,item:URL_}]},
  {'@type':'Service','@id':URL_+'#service',name:H1,serviceType:'Master key systems',description:'Design, installation and maintenance of master key and restricted master key systems for strata, offices, schools and commercial buildings.',provider:[{'@id':BIZ+'#business'},{'@id':BIZ+'#ballina'}],areaServed:[{'@type':'City',name:'Gold Coast'},{'@type':'City',name:'Brisbane'},{'@type':'AdministrativeArea',name:'Northern NSW'}],audience:{'@type':'BusinessAudience',audienceType:'Strata and body corporate, offices, schools and commercial buildings'},url:URL_},
  {'@type':'FAQPage','@id':URL_+'#faq',mainEntity:FAQ.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}];
 let [head,body]=tpl.split('</head>');
 const set=(re,val)=>{const n=head.replace(re,(m,p)=>p+esc(val));if(n===head&&!head.match(re))throw new Error('head field missing '+re);head=n;};
 head=head.replace(/<title>[^<]*<\/title>/,`<title>${htmlEsc(TITLE)}</title>`);
 set(/(<meta name="description" content=")[^"]*/,DESC);set(/(<meta property="og:description" content=")[^"]*/,DESC);set(/(<meta name="twitter:description" content=")[^"]*/,DESC);
 set(/(<meta property="og:title" content=")[^"]*/,TITLE);set(/(<meta name="twitter:title" content=")[^"]*/,TITLE);
 set(/(<link rel="canonical" href=")[^"]*/,URL_);set(/(<meta property="og:url" content=")[^"]*/,URL_);
 set(/(<meta property="og:image" content=")[^"]*/,base+'assets/og/commercial-locksmiths.png');set(/(<meta name="twitter:image" content=")[^"]*/,base+'assets/og/commercial-locksmiths.png');
 set(/(<meta property="og:image:alt" content=")[^"]*/,TITLE);set(/(<meta name="twitter:image:alt" content=")[^"]*/,TITLE);
 head=head.replace(/(<script type="application\/ld\+json"[^>]*>)[\s\S]*?(<\/script>)/,(m,a,b)=>a+JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')+b);
 body=body.replace(/<main id="top">[\s\S]*?<\/main>/,()=>'<main id="top">'+main+cta+'\n</main>');
 const page=head+'</head>'+body;
 const pf=path.join(out,SLUG,'index.html');fs.mkdirSync(path.dirname(pf),{recursive:true});
 stats.page=(!fs.existsSync(pf)||fs.readFileSync(pf,'utf8')!==page)?(fs.writeFileSync(pf,page),1):0;
 // 3) Locksmiths menu on every page (after Restricted Key Systems; same relative prefix).
 let nav=0;
 for(const f of walk(out)){const s=fs.readFileSync(f,'utf8');
  const n=s.replace(/(<div class="nav-dropdown" id="nav-sub-locksmiths"[^>]*>[\s\S]*?<a href="([^"]*?)restricted-keys\/(index\.html)?">Restricted Key Systems<\/a>)(?!<a href="[^"]*master-key-systems)/,(m,a,pre,idx)=>a+`<a href="${pre}${SLUG}/${idx||''}">Master Key Systems</a>`);
  if(n!==s){fs.writeFileSync(f,n);nav++;}}
 stats.nav=nav;
 // 4) /locksmith-services/: link the service list item and add to Explore more.
 stats.locksmithServices=edit('locksmith-services/index.html',s=>s
  .replace('<li>Master key systems &amp; keyed alike services</li>','<li><a href="../master-key-systems/index.html">Master key systems</a> &amp; keyed alike services</li>')
  .replace(/(<a href="\.\.\/restricted-keys\/index\.html">Restricted Key Systems <span aria-hidden="true">↗<\/span><\/a>)(?!<a href="\.\.\/master-key-systems)/,'$1<a href="../master-key-systems/index.html">Master Key Systems <span aria-hidden="true">↗</span></a>'));
 // 5) Sitemap + manifest.
 const smf=path.join(out,'sitemap.xml');let sm=fs.readFileSync(smf,'utf8');const loc=`<url><loc>${URL_}</loc></url>`;
 if(!sm.includes(loc)){const rk=`<url><loc>${base}restricted-keys/</loc></url>`;sm=sm.includes(rk)?sm.replace(rk,rk+'\n'+loc):sm.replace('</urlset>',loc+'\n</urlset>');fs.writeFileSync(smf,sm);stats.sitemap=1;}
 const mf=path.join(root,'page-import-manifest.json'),manifest=JSON.parse(fs.readFileSync(mf,'utf8'));
 if(!manifest.pages.some(e=>e.url==='/'+SLUG)){manifest.pages.push({url:'/'+SLUG,title:H1,file:SLUG+'/index.html',blocks:9,addedAt:'2026-11-01'});fs.writeFileSync(mf,JSON.stringify(manifest,null,2)+'\n');stats.manifest=1;}
 const rf=path.join(root,'seo-build-report.json');if(fs.existsSync(rf)){const r=JSON.parse(fs.readFileSync(rf,'utf8'));const c=(sm.match(/<loc>/g)||[]).length;if(r.sitemapUrls!==c){r.sitemapUrls=c;fs.writeFileSync(rf,JSON.stringify(r,null,2));}}
 return stats;
};
if(require.main===module)console.log('master-key-systems',module.exports());
