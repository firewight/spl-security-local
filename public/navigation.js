(() => {
 const nav=document.querySelector('#main-nav'), toggle=document.querySelector('.menu-toggle');
 // Homepage app.js already owns its toggle. Subpages use only this file.
 if(!document.querySelector('#enquiry-dialog'))toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
 const groups=[...document.querySelectorAll('.nav-group')];
 groups.forEach(group=>group.addEventListener('toggle',()=>{if(group.open)groups.forEach(other=>{if(other!==group)other.open=false;});}));
 document.addEventListener('click',event=>{if(!event.target.closest('.nav-group'))groups.forEach(g=>g.open=false);});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){const group=groups.find(g=>g.open);if(group){group.open=false;group.querySelector('summary').focus();}else if(nav?.classList.contains('open')){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.focus();}}});
 nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');}));
 const search=document.querySelector('#page-search'),cards=[...document.querySelectorAll('[data-page-title]')];
 search?.addEventListener('input',()=>{const words=search.value.toLowerCase().trim().split(/\s+/);let count=0;cards.forEach(card=>{card.hidden=!words.every(word=>card.dataset.pageTitle.includes(word));if(!card.hidden)count++;});document.querySelector('#search-count').textContent=`${count} ${count===1?'page':'pages'}`;});
 document.querySelector('#contact-draft')?.addEventListener('submit',event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));const body=`Name: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nService: ${data.service}\n\n${data.message}`;location.href=`mailto:info@spl.com.au?subject=${encodeURIComponent('Website enquiry — '+data.service)}&body=${encodeURIComponent(body)}`;event.currentTarget.querySelector('.form-status').textContent='Your email app has been requested. Review and send the draft there, or call SPL if it does not open.';});
})();
