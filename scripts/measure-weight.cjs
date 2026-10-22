const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve('public');
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]).replace(/^\/spl-security-local/,'');let p=path.join(root,u);if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');if(!fs.existsSync(p)){r.writeHead(404);return r.end();}r.end(fs.readFileSync(p));}).listen(8765,async()=>{
 const b=await chromium.launch();for(const vp of [{width:1366,height:900},{width:390,height:844}]){const pg=await b.newPage({viewport:vp});let tot=0,by={};const list=[];
 pg.on('response',async res=>{try{const buf=await res.body();tot+=buf.length;const t=res.request().resourceType();by[t]=(by[t]||0)+buf.length;list.push([buf.length,res.url()]);}catch{}});
 await pg.goto('http://localhost:8765/spl-security-local/'+(process.argv[2]||''),{waitUntil:'networkidle'});await pg.waitForTimeout(800);
 console.log(vp.width,'total KB',(tot/1024).toFixed(0),JSON.stringify(Object.fromEntries(Object.entries(by).map(([k,v])=>[k,Math.round(v/1024)]))),'requests',list.length);
 if(process.argv[3])list.sort((a,b)=>b[0]-a[0]).slice(0,15).forEach(x=>console.log(Math.round(x[0]/1024),x[1]));await pg.close();}
 await b.close();srv.close();});
