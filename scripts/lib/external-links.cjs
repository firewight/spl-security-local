// Marks off-site links: target=_blank, rel noopener noreferrer (merged), and a screen-reader "(opens in a new tab)" hint.
const SITE='https://firewight.github.io/spl-security-local';
const NOTE=' (opens in a new tab)';
const isExternal=h=>/^https?:\/\//i.test(h)&&!h.startsWith(SITE);
function markTag(attrs,inner){
 const href=(attrs.match(/\bhref="([^"]*)"/)||[])[1];
 if(!href||!isExternal(href))return null;
 let a=attrs;
 if(/\btarget="/.test(a))a=a.replace(/\btarget="[^"]*"/,'target="_blank"');else a+=' target="_blank"';
 const rel=(a.match(/\brel="([^"]*)"/)||[])[1];
 const set=new Set((rel||'').split(/\s+/).filter(Boolean));set.add('noopener');set.add('noreferrer');
 const relStr=`rel="${[...set].join(' ')}"`;
 a=rel!==undefined?a.replace(/\brel="[^"]*"/,relStr):a+' '+relStr;
 const al=a.match(/\baria-label="([^"]*)"/);
 if(al){if(!al[1].includes('opens in a new tab'))a=a.replace(/\baria-label="[^"]*"/,`aria-label="${al[1]}${NOTE}"`);}
 else if(!inner.includes('class="sr-only"'))inner=inner+`<span class="sr-only">${NOTE}</span>`;
 return `<a${a}>${inner}</a>`;
}
function markExternalLinks(html){let n=0;const out=html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/g,(m,attrs,inner)=>{const r=markTag(attrs,inner);if(r===null||r===m)return m;n++;return r;});return {html:out,count:n};}
module.exports={markExternalLinks,isExternal,NOTE};
// Generators call install() once so every HTML file they write keeps the external-link treatment.
let installed=false;
module.exports.install=function(){if(installed)return;installed=true;const fs=require('fs');const orig=fs.writeFileSync;fs.writeFileSync=function(file,data,...rest){if(typeof file==='string'&&file.endsWith('.html')&&typeof data==='string')data=markExternalLinks(data).html;return orig.call(this,file,data,...rest);};};
