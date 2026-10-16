// Final content pass: remove visible old-domain text, fix safe typos, drop empty sections. Idempotent.
const fs=require('fs'),path=require('path');
const P=p=>path.join(__dirname,'..','public',p);
const fixes={
 'blog/4-services-you-can-expect-from-your-local-locksmith/index.html':[
  ['‘\n<span>Click here</span> ’ or submit an inquiry through our contact page\n<span>www.splsecurity.com.au/contact/</span> , alternately call us,','Submit an enquiry through our <a href="../../contact/index.html">contact page</a>, or call us'],
  ['inside out outside','inside or outside']],
 'blog/top-5-security-tips-for-your-home-or-business/index.html':[
  ['Or contact them at\n<span>www.splsecurity.com.au/contact/</span>.','Or contact them through the <a href="../../contact/index.html">contact page</a>.']],
 'blog/5-questions-to-consider-when-buying-a-gun-safe/index.html':[
  ['visit the website\n<a href="../../index.html">www.splsecurity.com.au</a>,','visit the <a href="../../index.html">SPL Security website</a>,'],
  ['high quality guns safes','high quality gun safes']],
 'blog/surveillance-cameras-are-helping/index.html':[
  ['visit our website at\n<a href="../../index.html">https://splsecurity.com.au</a>.','visit our <a href="../../index.html">website</a>.']],
 'locksmiths/lock-hardware/index.html':[['<section class="service-menu-description"></section>','']],
};
let n=0;for(const[f,rs]of Object.entries(fixes)){let s=fs.readFileSync(P(f),'utf8'),o=s;for(const[a,b]of rs)s=s.split(a).join(b);if(s!==o){fs.writeFileSync(P(f),s);n++}}
module.exports=()=>n;if(require.main===module)console.log('content-pass',n);
