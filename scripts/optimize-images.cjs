// Speed: responsive WebP variants for heavy homepage images (Oct 2026). Idempotent: skips variants that already exist.
// cro-fixes.cjs only points HTML at a variant when the file exists.
const fs=require('fs'),path=require('path'),sharp=require('sharp');
const a=path.join(__dirname,'..','public','assets');
const jobs=[['imported/spl-black-lever-handle-fingerprint-reader-showroom.jpg','imported/spl-black-lever-handle-fingerprint-reader-showroom-900.webp',900],
 ['home-locksmiths.webp','home-locksmiths-800.webp',800],['home-security.webp','home-security-800.webp',800],['home-retail-trade.webp','home-retail-trade-800.webp',800]];
module.exports=async function(){for(const [src,dst,w] of jobs){const o=path.join(a,dst);if(fs.existsSync(o)||!fs.existsSync(path.join(a,src)))continue;await sharp(path.join(a,src)).resize({width:w,withoutEnlargement:true}).webp({quality:78}).toFile(o);}};
if(require.main===module)module.exports().catch(e=>{console.error(e);process.exit(1);});
