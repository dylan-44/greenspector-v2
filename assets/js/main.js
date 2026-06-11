const qs = (s, r = document) => r.querySelector(s);

const esc = (v) =>
  String(v).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);

const pageState = JSON.parse(document.body.dataset.page || '{"slug":"/"}');
const pages = window.GS_PAGES || [];
const currentSlug = pageState.slug || '/';
const depth = currentSlug.split('/').filter(Boolean).length;
const base = depth === 0 ? './' : '../'.repeat(depth);

const toRelative = (slug) => {
  if (!slug || slug === '/') {
    return base;
  }

  return `${base}${slug.replace(/^\//, '')}`;
};

const toAsset = (assetPath) => `${base}${assetPath.replace(/^\//, '')}`;

const groups = [
  'Greenspector Studio',
  'Conseil',
  'Tarifs',
  'Ressources',
  'À propos'
];

const grouped = groups
  .map((section) => ({
    section,
    items: pages.filter((item) => item.section === section)
  }))
  .filter((group) => group.items.length);

const footerNav = groups
  .map((section) => {
    const firstPage = pages.find((item) => item.section === section);

    if (!firstPage) {
      return '';
    }

    return `<li><a href="${toRelative(firstPage.slug)}">${esc(section)}</a></li>`;
  })
  .join('');

const socialLinks = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/greenspector/',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.64h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.88 0-2.17 1.46-2.17 2.97V21H9z"/></svg>'
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@greenspector',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M23.5 6.2a3 3 0 0 0-2.11-2.12C19.52 3.6 12 3.6 12 3.6s-7.52 0-9.39.48A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.11 2.12c1.87.48 9.39.48 9.39.48s7.52 0 9.39-.48a3 3 0 0 0 2.11-2.12A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>'
  },
  {
    name: 'X',
    href: 'https://x.com/greenspector',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18.9 2H22l-6.77 7.74L23 22h-6.1l-4.77-6.24L6.67 22H3.54l7.24-8.28L1 2h6.25l4.31 5.69L18.9 2zm-1.07 18h1.69L6.33 3.9H4.5L17.83 20z"/></svg>'
  }
];

const dropdown = (group) =>
  group.items.length === 1
    ? `<li class="nav-item"><a class="nav-link" href="${toRelative(group.items[0].slug)}">${esc(group.section)}</a></li>`
    : `<li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">${esc(group.section)}</a><ul class="dropdown-menu">${group.items
        .map(
          (item) =>
            `<li><a class="dropdown-item" href="${toRelative(item.slug)}">${esc(item.name)}</a></li>`
        )
        .join('')}</ul></li>`;

qs('#site-header').innerHTML = `<header class="site-header"><nav class="navbar navbar-expand-xl" aria-label="Navigation principale"><div class="container"><a class="navbar-brand" href="${toRelative('/')}" aria-label="Greenspector - Accueil"><img class="navbar-logo" src="${toAsset('/assets/img/Greenspector_logo_web_1200x320.png')}" alt="Greenspector"></a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavigation" aria-controls="mainNavigation" aria-expanded="false" aria-label="Ouvrir le menu"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="mainNavigation"><ul class="navbar-nav ms-auto align-items-xl-center gap-xl-2">${grouped.map(dropdown).join('')}<li class="nav-item"><a class="nav-link" href="${toRelative('/contact/')}">Contact</a></li></ul></div></div></nav></header>`;

qs('#site-footer').innerHTML = `<footer class="site-footer"><div class="container footer-grid"><div class="footer-brand"><a class="footer-logo-link" href="${toRelative('/')}" aria-label="Greenspector - Accueil"><img class="footer-logo" src="${toAsset('/assets/img/Logo_greenspector_header_white.svg')}" alt="Greenspector"></a><p class="footer-tagline">Mesure, écoconception logicielle et réduction d'impact numérique.</p></div><nav class="footer-nav" aria-label="Menu footer"><p class="footer-title">Menu</p><ul class="footer-nav-list">${footerNav}<li><a href="${toRelative('/contact/')}">Contact</a></li></ul></nav><div class="footer-social"><p class="footer-title">Suivez-nous</p><ul class="social-links">${socialLinks.map((item) => `<li><a href="${item.href}" target="_blank" rel="noopener noreferrer" aria-label="${item.name}">${item.icon}</a></li>`).join('')}</ul></div></div></footer>`;

document.querySelectorAll('.navbar a[href]').forEach((link) => {
  const item = pages.find((p) => toRelative(p.slug) === link.getAttribute('href'));

  if (item && item.slug === currentSlug) {
    link.setAttribute('aria-current', 'page');
  }
});
