// Wires site forms to the endpoint in public/form-config.js (placeholder /api/contact, pending backend). Idempotent: re-run after changing public/form-config.js.
const fs=require('fs'),path=require('path'),{action,hidden}=require('./lib/forms.cjs');
const out=path.resolve(__dirname,'../public');
const forms=[{file:'index.html',id:'enquiry-form',subject:'Website enquiry: Homepage callback form',src:'./'},{file:'contact/index.html',id:'contact-draft',subject:'Website enquiry: Contact page',src:'../'}];
for(const f of forms){const file=path.join(out,f.file);let s=fs.readFileSync(file,'utf8');
 s=s.replace(new RegExp(`<form id="${f.id}"[^>]*>`),`<form id="${f.id}" action="${action}" method="POST" data-spl-form>`);
 s=s.replace(new RegExp(`(<form id="${f.id}"[^>]*>)(?:<input type="hidden" name="form_name"[\\s\\S]*?class="form-honey"[^>]*>)?`),`$1${hidden(f.subject)}`);
 // email required (used as reply-to)
 s=s.replace(new RegExp(`(<form id="${f.id}"[\\s\\S]*?<input name="email" type="email")(?! required)`),'$1 required=""');
 if(!s.includes('form-config.js'))s=s.replace(/(<script src="[^"]*navigation\.js[^"]*"><\/script>)/,`<script src="${f.src}form-config.js?v=1"></script><script src="${f.src}forms.js?v=1"></script>$1`);
 fs.writeFileSync(file,s);}
console.log(JSON.stringify({action,forms:forms.length}));
