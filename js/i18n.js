// =========================================================
//  Omar · French / English
//  - L(value) picks the right language from { fr, en }
//  - Any HTML element with data-i18n="key" gets its text from OMAR.ui[key]
//    (data-i18n-aria → aria-label, data-i18n-alt → alt)
//  - Buttons with data-lang="fr" / "en" switch the language
//  - The choice is remembered for the next visit
// =========================================================
(function () {
  const D = window.OMAR;
  const KEY = 'omar-lang';
  let lang = null;
  try { lang = localStorage.getItem(KEY); } catch (e) { /* private mode: fine */ }
  if (lang !== 'fr' && lang !== 'en') {
    lang = (navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en';
  }

  const isPair = (v) => v && typeof v === 'object' && !Array.isArray(v) && ('fr' in v || 'en' in v);
  const L = (v) => (isPair(v) ? (v[lang] != null ? v[lang] : v.fr) : v);

  function apply() {
    document.documentElement.lang = lang;
    document.title = L(D.ui.docTitle);
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', L(D.ui.docDesc));
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = L(D.ui[el.dataset.i18n]); });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', L(D.ui[el.dataset.i18nAria])); });
    document.querySelectorAll('[data-i18n-alt]').forEach((el) => { el.setAttribute('alt', L(D.ui[el.dataset.i18nAlt])); });
    document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  }

  function set(next) {
    if (next === lang || (next !== 'fr' && next !== 'en')) return;
    lang = next;
    try { localStorage.setItem(KEY, lang); } catch (e) { /* fine */ }
    apply();
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lang]');
    if (b) { e.stopPropagation(); set(b.dataset.lang); }
  });

  window.I18N = {
    get lang() { return lang; },
    L,
    ui: (key) => L(D.ui[key]),
    set
  };
  apply();
})();
