const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
const localServer=process.env.VERIFY_URL?null:require('child_process').spawn(process.execPath,[path.resolve(__dirname,'../server.js')],{env:{...process.env,PORT:'18187'},windowsHide:true,stdio:'ignore'});
process.on('exit',()=>localServer?.kill());
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.VERIFY_URL||'http://127.0.0.1:18187/';
const dir=path.resolve(__dirname,'../verification');fs.mkdirSync(dir,{recursive:true});
for(const route of ['','about/index.html','commercial-locksmith/index.html','brochures/index.html','articles/index.html','contact/index.html','products/cadell-52.html','all-pages/index.html']){
const r=await page.goto(base+route,{waitUntil:'domcontentloaded'});if(r.status()!==200)throw Error(route+' HTTP '+r.status());
await page.locator('h1').first().waitFor({state:'visible',timeout:20000}).catch(async e=>{console.log((await page.content()).slice(0,1000));throw e;});
const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);if(overflow)throw Error('Desktop overflow '+route);
await page.screenshot({path:path.join(dir,(route.split('/')[0]||'home')+'-desktop.png'),fullPage:false});
}
await page.locator('#page-search').fill('locksmith');const visible=await page.locator('[data-page-title]:visible').count();if(!visible)throw Error('Directory search empty');
await page.goto(base,{waitUntil:'domcontentloaded'});await page.getByText('Locksmiths',{exact:true}).click();await page.getByRole('link',{name:'Commercial',exact:true}).click();await page.waitForURL('**/commercial-locksmith/index.html');
await page.setViewportSize({width:390,height:844});
for(const route of ['','about/index.html','commercial-locksmith/index.html','products/cadell-52.html','all-pages/index.html']){
await page.goto(base+route,{waitUntil:'domcontentloaded'});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))throw Error('Mobile overflow '+route);
await page.screenshot({path:path.join(dir,(route.split('/')[0]||'home')+'-mobile.png'),fullPage:false});
await page.getByRole('button',{name:'Menu',exact:true}).click();await page.getByText('Security Systems',{exact:true}).first().click();await page.getByRole('link',{name:'Access Control',exact:true}).waitFor({state:'visible'});
await page.keyboard.press('Escape');
}
if(errors.length)throw Error(JSON.stringify(errors));
console.log('Passed desktop/mobile layouts, nested navigation, page directory search, no page errors.');await browser.close();
})().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
