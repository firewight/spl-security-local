/* Homepage hero rotator: crossfade every 5s, pause on hover/focus, dots, no autoplay with reduced motion. */
(function(){
  var root=document.querySelector('.hero-slider');if(!root)return;
  if(window.matchMedia&&matchMedia('(max-width: 760px)').matches)return; // mobile: the card sits behind the hero text, so show the static slide 1 only
  var slides=[].slice.call(root.querySelectorAll('.hero-slide')),dots=[].slice.call(root.querySelectorAll('.hero-dot'));
  var i=0,timer=null,paused=false,reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(n){
    i=(n+slides.length)%slides.length;
    slides.forEach(function(s,k){var on=k===i;s.classList.toggle('is-active',on);if(on)s.removeAttribute('aria-hidden');else s.setAttribute('aria-hidden','true');
      if(on){var img=s.querySelector('img[loading="lazy"]');if(img)img.loading='eager';}});
    dots.forEach(function(d,k){if(k===i)d.setAttribute('aria-current','true');else d.removeAttribute('aria-current');});
    var next=slides[(i+1)%slides.length].querySelector('img[loading="lazy"]');if(next)next.loading='eager';
  }
  function start(){if(reduce||timer)return;timer=setInterval(function(){if(!paused&&!document.hidden)show(i+1);},5000);}
  dots.forEach(function(d,k){d.addEventListener('click',function(){show(k);});});
  root.addEventListener('mouseenter',function(){paused=true;});root.addEventListener('mouseleave',function(){paused=false;});
  root.addEventListener('focusin',function(){paused=true;});root.addEventListener('focusout',function(){paused=false;});
  root.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){show(i+1);dots[i].focus();}else if(e.key==='ArrowLeft'){show(i-1);dots[i].focus();}});
  window.addEventListener('load',function(){var n=slides[1]&&slides[1].querySelector('img[loading="lazy"]');if(n)n.loading='eager';});
  start();
})();
