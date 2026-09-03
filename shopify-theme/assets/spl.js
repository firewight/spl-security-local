document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.querySelector('#enquiry-dialog');
  const service = document.querySelector('select[name="contact[service]"]');
  document.querySelectorAll('[data-open-form]').forEach(button => button.addEventListener('click', () => {
    if (service && button.dataset.service) service.value = button.dataset.service;
    if (dialog) dialog.showModal();
  }));
  document.querySelector('.close')?.addEventListener('click', () => dialog?.close());
  document.querySelector('.menu-toggle')?.addEventListener('click', e => {
    const nav = document.querySelector('nav');
    nav?.classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', String(nav?.classList.contains('open')));
  });
  document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => document.querySelector('nav')?.classList.remove('open')));
});
