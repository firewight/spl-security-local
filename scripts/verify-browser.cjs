const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
const localServer=process.env.VERIFY_URL?null:require('child_process').spawn(process.execPath,[path.resolve(__dirname,'../server.js')],{env:{...process.env,PORT:'18187'},windowsHide:true,stdio:'ignore'});
process.on('exit',()=>localServer?.kill());
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.VERIFY_URL||'http://127.0.0.1:18187/';
const dir=path.resolve(__dirname,'../verification');fs.mkdirSync(dir,{recursive:true});
for(const route of ['','about/index.html','cctv-system/index.html','commercial-locksmith/index.html','articles/index.html','contact/index.html','products/cadell-52.html','all-pages/index.html']){
const r=await page.goto(base+route,{waitUntil:'domcontentloaded'});if(r.status()!==200)throw Error(route+' HTTP '+r.status());
await page.locator('h1').first().waitFor({state:'visible',timeout:20000}).catch(async e=>{console.log((await page.content()).slice(0,1000));throw e;});
if(fs.existsSync(path.resolve(__dirname,'../seo-build-report.json'))){const config=require('../seo.config.json');if(config.indexing==='preview'&&!(await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'))throw Error('Preview indexing directive missing '+route);if(await page.locator('script[data-seo-schema]').count()!==1)throw Error('Structured data missing '+route);}
const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);if(overflow)throw Error('Desktop overflow '+route);
await page.screenshot({path:path.join(dir,(route.split('/')[0]||'home')+'-desktop.png'),fullPage:false});
}
await page.locator('#page-search').fill('locksmith');const visible=await page.locator('[data-page-title]:visible').count();if(!visible)throw Error('Directory search empty');
await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#main-nav summary').filter({hasText:/^Locksmiths$/}).click();await page.getByRole('link',{name:'Commercial',exact:true}).click();await page.waitForURL('**/commercial-locksmith/index.html');
await page.goto(base,{waitUntil:'domcontentloaded'});
if(await page.locator('.service-feature').count()){
 const expected=['Locksmiths','Security Systems','Door Hardware','Retail/Trade'];
 if(JSON.stringify(await page.locator('.service-feature h2').allTextContents())!==JSON.stringify(expected))throw Error('Homepage service categories incorrect');
 if(/Cadell 52|Timeless Safes|Ajax StarterKit/.test(await page.locator('main').innerText()))throw Error('Old product promotion remains');
 for(const id of ['locksmiths','security','hardware','retail-trade']){const section=page.locator('#'+id);await section.scrollIntoViewIfNeeded();await section.locator('img').evaluate(img=>img.decode());await section.screenshot({path:path.join(dir,'service-'+id+'-desktop.png')});const link=section.locator('.links a').first(),target=await link.getAttribute('href');await link.click();await page.waitForURL(new URL(target,base).href);await page.goto(base,{waitUntil:'domcontentloaded'});}
}
await page.setViewportSize({width:390,height:844});
for(const route of ['','about/index.html','commercial-locksmith/index.html','products/cadell-52.html','all-pages/index.html']){
await page.goto(base+route,{waitUntil:'domcontentloaded'});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))throw Error('Mobile overflow '+route);
await page.screenshot({path:path.join(dir,(route.split('/')[0]||'home')+'-mobile.png'),fullPage:false});
if(!route&&await page.locator('.service-feature').count()){for(const id of ['locksmiths','security','hardware','retail-trade']){const section=page.locator('#'+id);await section.scrollIntoViewIfNeeded();await section.locator('img').evaluate(img=>img.decode());await section.screenshot({path:path.join(dir,'service-'+id+'-mobile.png')});}await page.evaluate(()=>scrollTo(0,0));}
await page.getByRole('button',{name:'Menu',exact:true}).click();await page.getByText('Security Systems',{exact:true}).first().click();await page.getByRole('link',{name:'Access Control',exact:true}).waitFor({state:'visible'});
await page.keyboard.press('Escape');
}
for(const width of [1440,390]){
await page.setViewportSize({width,height:1000});await page.goto(base+'cctv-system/index.html',{waitUntil:'domcontentloaded'});
if(await page.locator('.editorial-media').count()){
if(await page.locator('.editorial-block').filter({hasText:/^City skyline$/}).count())throw Error('Imported placeholder caption remains');
const images=page.locator('.editorial-media');for(let i=0;i<await images.count();i++){const size=await images.nth(i).boundingBox();if(Math.abs(size.width/size.height-16/9)>.02)throw Error('Inconsistent CCTV frame ratio');if(i<2){await images.nth(i).scrollIntoViewIfNeeded();await images.nth(i).locator('img').evaluate(el=>el.decode());await images.nth(i).screenshot({path:path.join(dir,'cctv-image-'+i+'-'+width+'.png')});}}
}
await page.setViewportSize({width,height:1000});await page.goto(base,{waitUntil:'domcontentloaded'});
for(const [id,label]of [['OurValues','Our Values'],['OurStory','Our Story']]){if(width===390)await page.getByRole('button',{name:'Menu',exact:true}).click();await page.locator('#main-nav summary').filter({hasText:/^About$/}).click();await page.locator('#main-nav a').filter({hasText:new RegExp('^'+label+'$')}).click();await page.waitForURL('**#'+id);await page.waitForFunction(id=>{const y=document.getElementById(id)?.getBoundingClientRect().top;return y>=70&&y<200;},id);}
await page.goto(base+'contact/index.html',{waitUntil:'domcontentloaded'});if(!await page.locator('.business-hours + .contact-draft').count())throw Error('Contact form order incorrect');
await page.locator('.contact-socials').scrollIntoViewIfNeeded();for(const img of await page.locator('.contact-socials img').all()){await img.evaluate(el=>el.decode());const size=await img.boundingBox();if(size.width>40||size.height>40)throw Error('Oversized contact social icon');}
await page.screenshot({path:path.join(dir,'contact-layout-'+width+'.png'),fullPage:false});
}
if(errors.length)throw Error(JSON.stringify(errors));
console.log('Passed desktop/mobile layouts, nested navigation, page directory search, no page errors.');await browser.close();
})().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
