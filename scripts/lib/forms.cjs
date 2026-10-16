// Reads public/form-config.js (single source) for the form endpoint; builds neutral hidden fields.
const fs=require('fs'),path=require('path');
const cfgSrc=fs.readFileSync(path.resolve(__dirname,'../../public/form-config.js'),'utf8');
const pick=k=>(cfgSrc.match(new RegExp(k+":\\s*'([^']+)'"))||[])[1];
const endpoint=pick('endpoint');
const hidden=subject=>`<input type="hidden" name="form_name" value="${subject}"><input type="text" name="website" class="form-honey" tabindex="-1" autocomplete="off" aria-hidden="true">`;
module.exports={endpoint,action:endpoint,hidden};
