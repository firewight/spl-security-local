(() => {
 const nav=document.querySelector('#main-nav'), toggle=document.querySelector('.menu-toggle');
 // Homepage app.js already owns its toggle. Subpages use only this file.
 if(!document.querySelector('#enquiry-dialog'))toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
 const groups=[...document.querySelectorAll('.nav-group')];
 const desktopHover=matchMedia('(min-width:981px) and (hover:hover) and (pointer:fine)');
 groups.forEach(group=>{
  group.addEventListener('pointerenter',event=>{
   if(!desktopHover.matches||event.pointerType!=='mouse')return;
   groups.forEach(other=>{other.open=other===group;});
  });
  group.addEventListener('pointerleave',event=>{
   if(desktopHover.matches&&event.pointerType==='mouse'&&!group.contains(document.activeElement))group.open=false;
  });
 });
 groups.forEach(group=>group.addEventListener('toggle',()=>{if(group.open)groups.forEach(other=>{if(other!==group)other.open=false;});}));
 document.addEventListener('click',event=>{if(!event.target.closest('.nav-group'))groups.forEach(g=>g.open=false);});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){const group=groups.find(g=>g.open);if(group){group.open=false;group.querySelector('summary').focus();}else if(nav?.classList.contains('open')){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.focus();}}});
 nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');}));
 const search=document.querySelector('#page-search'),cards=[...document.querySelectorAll('[data-page-title]')];
 search?.addEventListener('input',()=>{const words=search.value.toLowerCase().trim().split(/\s+/);let count=0;cards.forEach(card=>{card.hidden=!words.every(word=>card.dataset.pageTitle.includes(word));if(!card.hidden)count++;});document.querySelector('#search-count').textContent=`${count} ${count===1?'page':'pages'}`;});
 /* #contact-draft is handled by forms.js (FormSubmit) */
})();
