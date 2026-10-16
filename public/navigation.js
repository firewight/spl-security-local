(() => {
 const nav=document.querySelector('#main-nav'), toggle=document.querySelector('.menu-toggle');
 // Homepage app.js already owns its toggle. Subpages use only this file.
 if(!document.querySelector('#enquiry-dialog')&&!document.querySelector('script[src*="app.js"]'))toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
 // Dropdown headings are links (navigate); the chevron button beside each opens its submenu.
 // Desktop: hover or keyboard focus opens. Touch/mobile: the chevron toggles (aria-expanded).
 const groups=[...document.querySelectorAll('#main-nav .nav-group')];
 const desktopHover=matchMedia('(min-width:981px) and (hover:hover) and (pointer:fine)'),desktop=matchMedia('(min-width:981px)');
 const parts=g=>({btn:g.querySelector('.nav-expand'),panel:g.querySelector('.nav-dropdown'),link:g.querySelector('.nav-top-link')});
 const setOpen=(g,v)=>{const {btn,panel}=parts(g);if(!panel)return;panel.hidden=!v;btn?.setAttribute('aria-expanded',String(v));g.classList.toggle('open',v);if(v)groups.forEach(o=>{if(o!==g)setOpen(o,false);});};
 const isOpen=g=>g.classList.contains('open');
 groups.forEach(g=>{
  const {btn}=parts(g);
  btn?.addEventListener('click',e=>{e.preventDefault();if(g.dataset.hoverOpened){delete g.dataset.hoverOpened;setOpen(g,true);}else setOpen(g,!isOpen(g));});
  g.addEventListener('pointerenter',e=>{if(desktopHover.matches&&e.pointerType==='mouse'&&!isOpen(g)){setOpen(g,true);g.dataset.hoverOpened='1';}});
  g.addEventListener('pointerleave',e=>{delete g.dataset.hoverOpened;if(desktopHover.matches&&e.pointerType==='mouse'&&!g.contains(document.activeElement))setOpen(g,false);});
  g.addEventListener('focusin',e=>{if(desktop.matches&&e.target.matches(':focus-visible'))setOpen(g,true);});
  g.addEventListener('focusout',e=>{if(!g.contains(e.relatedTarget)&&desktop.matches)setOpen(g,false);});
 });
 document.addEventListener('click',event=>{if(!event.target.closest('.nav-group'))groups.forEach(g=>setOpen(g,false));});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){const group=groups.find(isOpen);if(group){setOpen(group,false);parts(group).link?.focus();}else if(nav?.classList.contains('open')){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.focus();}}});
 nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');}));
 const search=document.querySelector('#page-search'),cards=[...document.querySelectorAll('[data-page-title]')];
 search?.addEventListener('input',()=>{const words=search.value.toLowerCase().trim().split(/\s+/);let count=0;cards.forEach(card=>{card.hidden=!words.every(word=>card.dataset.pageTitle.includes(word));if(!card.hidden)count++;});document.querySelector('#search-count').textContent=`${count} ${count===1?'page':'pages'}`;});
 /* #contact-draft is handled by forms.js (FormSubmit) */
})();
