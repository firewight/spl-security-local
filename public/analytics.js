/* SPL GA4 conversion events (loaded deferred on the HostPapa launch build; gtag itself is set up in <head>).
   No personal information is sent: no names, emails, phone numbers or messages.
   Events: phone_call_click, email_click, ecs_click, generate_lead (contact form / Customer Portal, on API success only). */
(function(){
  function gtagSafe(){if(typeof window.gtag==='function')window.gtag.apply(null,arguments);}
  function where(el){
    if(el.closest('.mobile-cta'))return 'sticky_bar';
    if(el.closest('header,.site-header,.service-bar'))return 'header';
    if(el.closest('footer'))return 'footer';
    return 'body';}
  function text(el){var img=el.querySelector('img[alt]');return ((el.textContent||'').trim()||el.getAttribute('aria-label')||(img&&img.alt)||el.title||'').replace(/\s+/g,' ').trim().slice(0,100);}
  function linkParams(a){return {link_url:a.href.split('?')[0],link_text:text(a),page_location:location.href,location:where(a)};}
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;
    var h=a.getAttribute('href')||'';
    if(/^tel:/i.test(h))gtagSafe('event','phone_call_click',linkParams(a));      // SPL's own numbers only
    else if(/^mailto:/i.test(h))gtagSafe('event','email_click',linkParams(a));   // SPL's own addresses only
    else if(/(^|\/\/)(www\.)?eastcoastsafeco\.com\.au/i.test(a.href))gtagSafe('event','ecs_click',linkParams(a));
  },true);
  /* Called by forms.js / portal-quote.js only after the API confirms the enquiry was sent.
     GA4 batches hits for a few seconds, so when a redirect follows (done given) the event is handed to the
     next page (the thank-you page) through sessionStorage and sent there; this never counts a direct
     thank-you visit or a honeypot submission. Without sessionStorage it is sent now with a short callback. */
  var KEY='splPendingLead';
  function leadParams(params){var p={form:params.form||'contact',page_location:params.page_location||location.href};
    if(params.request_type)p.request_type=String(params.request_type).slice(0,60);return p;}
  window.splTrackLead=function(params,done){
    var p=leadParams(params);
    if(done){
      try{sessionStorage.setItem(KEY,JSON.stringify(p));done();return;}catch(e){}
      var called=false,finish=function(){if(!called){called=true;done();}};
      if(typeof window.gtag==='function'){p.event_callback=finish;p.event_timeout=1000;window.gtag('event','generate_lead',p);setTimeout(finish,1200);}
      else finish();
      return;}
    gtagSafe('event','generate_lead',p);
  };
  try{var pending=sessionStorage.getItem(KEY);
    if(pending){sessionStorage.removeItem(KEY);var lp=JSON.parse(pending);if(lp&&lp.form)gtagSafe('event','generate_lead',leadParams(lp));}
  }catch(e){}
})();
