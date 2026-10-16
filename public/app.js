document.querySelector('.menu-toggle').addEventListener('click', e => { const nav = document.querySelector('nav'); nav.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', nav.classList.contains('open')); });
document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => document.querySelector('nav').classList.remove('open')));
