/* SPL GA4 conversion events (loaded deferred on the HostPapa launch build; gtag itself is set up in <head>).
   No personal information is sent: no names, emails, phone numbers or messages.
   Events: phone_call_click, email_click, ecs_click, cta_click, scroll_depth (25/50/75/90),
   generate_lead (contact form / Customer Portal, on API success only).
   Not duplicated here because GA4 enhanced measurement already sends them: form_start (form_id contact-draft /
   portal-quote-form), outbound clicks ("click" with outbound=true), page_view, scroll (90%). */
(function(){
  function gtagSafe(){if(typeof window.gtag==='function')window.gtag.apply(null,arguments);}
  function where(el){
    if(el.closest('.mobile-cta'))return 'sticky_bar';
    if(el.closest('header,.site-header,.service-bar'))return 'header';
    if(el.closest('footer'))return 'footer';
    return 'body';}
  function text(el){var img=el.querySelector('img[alt]');return ((el.innerText||el.textContent||'').trim()||el.getAttribute('aria-label')||(img&&img.alt)||el.title||'').replace(/\s+/g,' ').trim().slice(0,100);}
  function linkParams(a){return {link_url:a.href.split('?')[0],link_text:text(a),page_location:location.href,location:where(a)};}
  // Primary buttons / CTA links (tel: and mailto: CTAs are counted as phone_call_click / email_click instead).
  var CTA='.mobile-cta a,.contact-option,.cro-contact-link,.cro-ls-cta a,a.cro-ls-cta,.hero-team-cta,.ballina-promo,.ballina-service,'+
    '.arch-service,.service-art,.portal-success-actions a,a.button,a.btn,a[class*="-cta"],a[href*="customer-portal"],a[href*="#contact-enquiry"]';
  function section(el){
    var s=el.closest('section[id],[id^="section-"],main [id],header,footer,.mobile-cta');
    if(!s)return where(el);
    if(s.matches('.mobile-cta'))return 'sticky_bar';
    return (s.id||s.tagName.toLowerCase()).slice(0,60);}
  function pathOf(a){try{var u=new URL(a.href,location.href);return (u.host===location.host?'':u.host)+u.pathname+u.hash;}catch(e){return '';}}
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;
    var h=a.getAttribute('href')||'';
    if(/^tel:/i.test(h))gtagSafe('event','phone_call_click',linkParams(a));      // SPL's own numbers only
    else if(/^mailto:/i.test(h))gtagSafe('event','email_click',linkParams(a));   // SPL's own addresses only
    else{
      if(/(^|\/\/)(www\.)?eastcoastsafeco\.com\.au/i.test(a.href))gtagSafe('event','ecs_click',linkParams(a));
      if(a.matches(CTA))gtagSafe('event','cta_click',{link_text:text(a).slice(0,60),link_url:pathOf(a),page_section:section(a),page_location:location.href});
    }
  },true);
  // Scroll depth: 25/50/75/90 % of the page, each sent once per page view.
  var marks=[25,50,75,90],sent={},ticking=false;
  function depth(){ticking=false;
    var d=document.documentElement,max=Math.max(d.scrollHeight,document.body?document.body.scrollHeight:0)-window.innerHeight;
    var pct=max<=0?100:(window.scrollY||d.scrollTop)/max*100;
    for(var i=0;i<marks.length;i++){var m=marks[i];if(pct>=m&&!sent[m]){sent[m]=1;gtagSafe('event','scroll_depth',{percent:m,page_location:location.href});}}
    if(sent[90])window.removeEventListener('scroll',onScroll);}
  function onScroll(){if(!ticking){ticking=true;(window.requestAnimationFrame||setTimeout)(depth);}}
  window.addEventListener('scroll',onScroll,{passive:true});
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
