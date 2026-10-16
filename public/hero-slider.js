/* Homepage hero rotator: left-to-right slide every 4s (instant switch every 6s with reduced motion), pause while hovering the dots/controls or
   on keyboard focus, dot buttons, and a pause/play button (WCAG 2.2.2). */
(function(){
  var root=document.querySelector('.hero-slider');if(!root)return;
  if(window.matchMedia&&matchMedia('(max-width: 760px)').matches)return; // mobile: static slide 1 only
  var slides=[].slice.call(root.querySelectorAll('.hero-slide')),dots=[].slice.call(root.querySelectorAll('.hero-dot'));
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var i=0,hover=false,kbFocus=false,stopped=false,last=Date.now(),interval=reduce?6000:4000;
  var bar=root.querySelector('.hero-dots');
  var btn=document.createElement('button');btn.type='button';btn.className='hero-toggle';
  function label(){btn.setAttribute('aria-label',stopped?'Play slideshow':'Pause slideshow');btn.setAttribute('aria-pressed',stopped?'true':'false');btn.textContent=stopped?'\u25B6':'\u275A\u275A';}
  label();if(bar)bar.appendChild(btn);
  function show(n){
    var prev=i;i=(n+slides.length)%slides.length;last=Date.now();
    slides.forEach(function(s){s.classList.remove('is-leaving','is-entering');});
    if(!reduce&&prev!==i){void root.offsetWidth;slides[prev].classList.add('is-leaving');slides[i].classList.add('is-entering');}
    slides.forEach(function(s,k){var on=k===i;s.classList.toggle('is-active',on);if(on)s.removeAttribute('aria-hidden');else s.setAttribute('aria-hidden','true');
      if(on){var img=s.querySelector('img[loading="lazy"]');if(img)img.loading='eager';}});
    dots.forEach(function(d,k){if(k===i)d.setAttribute('aria-current','true');else d.removeAttribute('aria-current');});
    var next=slides[(i+1)%slides.length].querySelector('img[loading="lazy"]');if(next)next.loading='eager';
  }
  slides.forEach(function(s){s.addEventListener('animationend',function(){s.classList.remove('is-leaving','is-entering');});});
  setInterval(function(){if(stopped||hover||kbFocus||document.hidden){last=Date.now();return;}if(Date.now()-last>=interval)show(i+1);},250);
  dots.forEach(function(d,k){d.addEventListener('click',function(){show(k);kbFocus=false;});});
  btn.addEventListener('click',function(){stopped=!stopped;label();last=Date.now();});
  // pause only while the pointer is over the dots/controls: the visual covers half the hero, so a resting cursor there must not stop rotation
  var hz=bar||root;hz.addEventListener('mouseenter',function(){hover=true;});hz.addEventListener('mouseleave',function(){hover=false;kbFocus=false;last=Date.now();});
  root.addEventListener('focusin',function(e){var t=e.target;try{kbFocus=t.matches(':focus-visible');}catch(_){kbFocus=false;}});
  root.addEventListener('focusout',function(e){if(!root.contains(e.relatedTarget))kbFocus=false;});
  root.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){show(i+1);dots[i].focus();}else if(e.key==='ArrowLeft'){show(i-1);dots[i].focus();}});
  window.addEventListener('load',function(){var n=slides[1]&&slides[1].querySelector('img[loading="lazy"]');if(n)n.loading='eager';});
})();
