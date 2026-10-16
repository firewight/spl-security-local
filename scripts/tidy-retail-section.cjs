// Retail & Trade section tidy (Oct 2026): consistent headings, descriptive alt text, clean outbound links and
// labels, and a trade counter / showroom CTA using facts already on the site (/locations/). Idempotent.
require('./lib/external-links.cjs').install();
const fs=require('fs'),path=require('path');
const out=path.join(path.resolve(__dirname,'..'),'public');
const alts={'c8465dafac2e89a158d6.jpeg':'Hand opening a safe that has an electronic keypad','75a27eaa3f0df45a8e83.jpg':'Showroom shelves displaying a range of safes',
 '8b6bbd2e820efb561403.jpg':'Lever handle on a white door with keys in the lock','e1859e874b7f3e4af070.jpg':'Showroom display wall of door levers and pull handles',
 '5995d96c3e1bc092db06.jpg':'Overhead door closer fitted to a door','8b578f7d72e9d859c775.jpg':'Red fire exit door beside a fire hose reel cabinet',
 'b2aa0e503fb635857798.jpg':'Fire exit door with a push bar beside a fire hose reel cabinet','cc84fdf1330150b5cdab.jpg':'Gold lever handle and lock cylinder on a white door',
 '8e4ca936fae100e81511.jpg':'Eagle Safes electronic safe on a showroom shelf','7cf598523ab2db346729.jpg':'Close-up of a digital safe keypad lock',
 '7062508a04b8f9287dd2.jpg':'Hand using a key to open a keypad safe'};
const edits={
 'retail-security':[['<h1>Trade &amp; Retail</h1>','<h1>Retail &amp; Trade</h1>'],['/ Trade &amp; Retail</p>','/ Retail &amp; Trade</p>'],['"name":"Trade & Retail"','"name":"Retail & Trade"'],['>Handle / Levers<','>Lever Door Handles<'],['\ufeff',''],['<h2 id="section-retail-trade">Retail &amp; Trade</h2>','<h2 id="section-retail-trade">Building &amp; Renovation Projects</h2>'],['<a href="#section-retail-trade">Retail &amp; Trade</a>','<a href="#section-retail-trade">Building &amp; Renovation Projects</a>']],
 'door-handles':[[/href="https:\/\/www\.lockweb\.com\.au\/au\/en\/products\/door-handles-levers-and-knobs\?[^"]*"/,'href="https://www.lockweb.com.au/au/en/products/door-handles-levers-and-knobs"'],[/(lockweb\.com\.au[^>]*>)\s*View\s*(<|$)/,'$1View Lockweb door handles$2']],
 'door-closers':[['>supported Brands<','>Supported Brands<'],['>DORMAKABA<','>Dormakaba<'],['>LOCKWOOD - CONCEALED<','>Lockwood – Concealed<'],['>LOCKWOOD - OVERHEAD<','>Lockwood – Overhead<'],['>LOCKWOOD - DOOR STAYS<','>Lockwood – Door Stays<'],['>LOCKWOOD - FLOOR CLOSERS<','>Lockwood – Floor Closers<'],['>Lockwood - Screen Door<','>Lockwood – Screen Door<'],['>AllegionAustralia<','>Allegion Australia<'],['>CarbineRadius<','>Carbine Radius<'],['>zanda<','>Zanda<'],['>kilargo<','>Kilargo<'],['>lorient<','>Lorient<'],['>raven<','>Raven<'],[/(dormakaba\.com[^>]*>)\s*View\s*(<|$)/,'$1View dormakaba door closers$2']],
 'safe':[['>SHOP ONLINE<','>Shop Online<']],
 'fire-door-hardware':[],'locksmiths/lock-hardware':[]};
module.exports=function run(){const changed=[];
 for(const [key,list]of Object.entries(edits)){const f=path.join(out,key,'index.html');let h=fs.readFileSync(f,'utf8');const b=h;
  for(const [a,c]of list)h=typeof a==='string'?h.split(a).join(c):h.replace(a,c);
  h=h.replace(/<img\b[^>]*>/g,t=>{const src=(t.match(/\bsrc="([^"]*)"/)||[])[1]||'',fn=src.split('/').pop();return alts[fn]?t.replace(/\balt="[^"]*"/,`alt="${alts[fn]}"`):t;});
  if(!h.includes('id="section-visit-our-trade-counter"')){const up='../'.repeat(key.split('/').length);
   const cta=`<div class="editorial-block"><h2 id="section-visit-our-trade-counter">Visit our trade counter</h2><p>Retail and trade customers can visit our trade counter at 101 Ashmore Rd, Bundall (Gold Coast), Monday–Friday, 7:00 am–4:30 pm, or our <a href="${up}ballina/index.html">Ballina showroom</a> at Unit 2/269 River Street, Ballina, Monday–Friday, 8:00 am–5:00 pm. Call (07) 55 888 111 or <a href="${up}contact/index.html#contact-enquiry">send us an enquiry</a>.</p></div>\n<div class="editorial-action"><a href="${up}locations/index.html">Visit our showrooms</a></div>\n`;
   h=h.replace('<section class="related-links">',cta+'<section class="related-links">');
   h=h.replace(/(<details class="page-toc"[^>]*><summary>On this page<\/summary><div>[\s\S]*?)(<a href="#section-explore-more">)/,'$1<a href="#section-visit-our-trade-counter">Visit our trade counter</a>$2');}
  if(h!==b){fs.writeFileSync(f,h);changed.push(key);}}
 // Link labels to the overview match the menu ('Retail & Trade').
 const walk=(d,a=[])=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f,a);else if(e.name.endsWith('.html'))a.push(f);}return a;};
 for(const f of walk(out)){const h=fs.readFileSync(f,'utf8'),n=h.replace(/(<a href="[^"]*retail-security\/index\.html">)Trade &amp; Retail/g,'$1Retail &amp; Trade');if(n!==h){fs.writeFileSync(f,n);changed.push(path.relative(out,f));}}
 return changed;};
if(require.main===module)console.log(JSON.stringify(module.exports()));
