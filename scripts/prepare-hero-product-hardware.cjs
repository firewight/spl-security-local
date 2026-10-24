// Rebuild public/assets/hero-product-hardware.{png,webp} from assets/source/mortice-lock-hero.jpg
// Cut out near-white background, scale to 900px tall (matches other hero-product slides). Idempotent.
const fs=require('fs'),path=require('path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..');
const src=path.join(root,'assets/source/mortice-lock-hero.jpg');
const outPng=path.join(root,'public/assets/hero-product-hardware.png');
const outWebp=path.join(root,'public/assets/hero-product-hardware.webp');
(async()=>{
  const {data,info}=await sharp(src).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  for(let i=0;i<data.length;i+=4){
    const r=data[i],g=data[i+1],b=data[i+2];
    const dist=Math.hypot(255-r,255-g,255-b);
    const a=Math.max(0,Math.min(255,Math.round((dist-8)/(40-8)*255)));
    data[i+3]=a; if(a===0){data[i]=data[i+1]=data[i+2]=0;}
  }
  let img=sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).trim();
  const meta=await img.metadata();
  const th=900; const nw=Math.max(1,Math.round(meta.width*(th/meta.height)));
  const tw=Math.max(nw,860);
  const left=Math.floor((tw-nw)/2);
  img=img.resize(nw,th,{fit:'fill'}).extend({top:0,bottom:0,left,right:tw-nw-left,background:{r:0,g:0,b:0,alpha:0}});
  await img.png().toFile(outPng);
  await sharp(outPng).webp({quality:90}).toFile(outWebp);
  const m=await sharp(outPng).metadata();
  console.log('hero-product-hardware',m.width+'x'+m.height);
  const index=path.join(root,'public/index.html');
  if(fs.existsSync(index)){
    let h=fs.readFileSync(index,'utf8');
    h=h.replace(/srcset="\.\/assets\/hero-product-hardware\.webp(?:\?v=\d+)?"><img src="\.\/assets\/hero-product-hardware\.png(?:\?v=\d+)?" alt="[^"]*" width="\d+" height="\d+"/,
      `srcset="./assets/hero-product-hardware.webp?v=2"><img src="./assets/hero-product-hardware.png?v=2" alt="Mortice lock set with keys" width="${m.width}" height="${m.height}"`);
    fs.writeFileSync(index,h);
  }
})().catch(e=>{console.error(e);process.exit(1);});
