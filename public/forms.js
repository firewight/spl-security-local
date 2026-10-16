/* Shared SPL form handler for forms marked data-spl-form. Posts JSON to SPL_FORM_CONFIG.endpoint and, on success,
   goes to SPL_FORM_CONFIG.thankYouUrl. Without JS the form POSTs to its action (the server 303-redirects to /thank-you/).
   Spam protection without third-party services: a honeypot field ("website") and a time trap (elapsed_ms, checked
   server-side). Field errors returned by the server are shown next to the field and announced. */
(function(){
  var cfg=window.SPL_FORM_CONFIG||{},shown=Date.now();
  var msg={sending:'Sending your enquiry…',fields:'Please check the highlighted fields.',limit:'Too many enquiries from this connection. Please try again later or call (07) 55 888 111.',
    fail:'Sorry, your enquiry could not be sent. Please call (07) 55 888 111 or email info@spl.com.au.'};
  function clear(form){form.querySelectorAll('[aria-invalid]').forEach(function(f){f.removeAttribute('aria-invalid');f.removeAttribute('aria-describedby');});
    form.querySelectorAll('.form-error').forEach(function(e){e.remove();});}
  function mark(form,name,text){var f=form.elements[name];if(!f||!f.id&&!form.id)return;var id=(form.id||'form')+'-'+name+'-error';
    var e=document.createElement('span');e.className='form-error';e.id=id;e.textContent=text;f.insertAdjacentElement('afterend',e);
    f.setAttribute('aria-invalid','true');f.setAttribute('aria-describedby',id);return f;}
  document.querySelectorAll('form[data-spl-form]').forEach(function(form){
    form.addEventListener('submit',function(e){
      if(!window.fetch||!window.FormData)return;
      e.preventDefault();clear(form);
      if(!form.reportValidity())return;
      var status=form.querySelector('.form-status'),btn=form.querySelector('[type="submit"]');
      var data=Object.fromEntries(new FormData(form));data.elapsed_ms=String(Date.now()-shown);
      if(data.website){location.href=cfg.thankYouUrl;return;} // honeypot: behave as if sent
      btn.disabled=true;status.className='form-status';status.textContent=msg.sending;
      fetch(cfg.endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)})
        .then(function(r){return r.json().catch(function(){return {};}).then(function(j){return {status:r.status,ok:r.ok&&j.ok!==false,body:j};});})
        .then(function(res){
          if(res.ok){status.className='form-status success';status.textContent='Thanks, your enquiry has been sent.';if(cfg.thankYouUrl)location.href=cfg.thankYouUrl;return;}
          status.className='form-status error';
          if(res.status===422&&res.body.fields){var first;Object.keys(res.body.fields).forEach(function(k){var f=mark(form,k,res.body.fields[k]);first=first||f;});status.textContent=msg.fields;if(first)first.focus();}
          else status.textContent=res.status===429?msg.limit:msg.fail;
        })
        .catch(function(){status.className='form-status error';status.textContent=msg.fail;})
        .then(function(){btn.disabled=false;});
    });
  });
})();
