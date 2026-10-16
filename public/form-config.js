/* SPL website forms: single config. PENDING BACKEND: no form service is connected yet.
   When the in-house endpoint exists, set `endpoint` here, then run `node scripts/apply-forms.cjs`
   (it rewrites the no-JS fallback form actions from this value). */
window.SPL_FORM_CONFIG = {
  endpoint: '/api/contact',
  thankYouUrl: '/spl-security-local/thank-you/'
};
