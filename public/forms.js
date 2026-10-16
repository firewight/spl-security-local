/* Shared SPL form handler for forms marked data-spl-form. Posts JSON to SPL_FORM_CONFIG.endpoint
   (placeholder until the in-house backend exists). Without JS the form POSTs to its action. */
(function(){
  var cfg=window.SPL_FORM_CONFIG||{};
  document.querySelectorAll('form[data-spl-form]').forEach(function(form){
    form.addEventListener('submit',function(e){
      if(!window.fetch||!window.FormData)return;
      e.preventDefault();
      if(!form.reportValidity())return;
      var status=form.querySelector('.form-status'),btn=form.querySelector('[type="submit"]');
      var data=Object.fromEntries(new FormData(form));
      if(data.website)return; // honeypot
      btn.disabled=true;status.className='form-status';status.textContent='Sending your enquiry…';
      fetch(cfg.endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)})
        .then(function(r){if(!r.ok)throw new Error('Send failed');})
        .then(function(){form.reset();status.className='form-status success';status.textContent='Thanks, your enquiry has been sent. Our team will be in touch soon. For urgent help call (07) 55 888 111.';})
        .catch(function(){status.className='form-status error';status.textContent='Sorry, online enquiries are not available right now. Please call (07) 55 888 111 or email info@spl.com.au.';})
        .then(function(){btn.disabled=false;});
    });
  });
})();
