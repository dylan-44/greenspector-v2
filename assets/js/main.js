const qs = (s, r = document) => r.querySelector(s);

const esc = (v) =>
  String(v).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);

const pageState = JSON.parse(document.body.dataset.page || '{"slug":"/","locale":"fr"}');
const locale = pageState.locale || (pageState.slug.startsWith('/en/') || pageState.slug === '/en/' ? 'en' : 'fr');
const i18n = window.GS_I18N?.[locale] || window.GS_I18N?.fr || {};
const routes = window.GS_ROUTES?.[locale] || window.GS_ROUTES?.fr || {};
const pages =
  locale === 'en' ? window.GS_PAGES_EN || window.GS_PAGES || [] : window.GS_PAGES || [];
const contactSlug = pages.find((item) => item.slug.endsWith('/contact/'))?.slug || (locale === 'en' ? '/en/contact/' : '/contact/');
const homeSlug = locale === 'en' ? '/en/' : '/';
const currentSlug = pageState.slug || '/';
const pathSegments = currentSlug.split('/').filter(Boolean);
const depth = pathSegments.length;
const base = depth === 0 ? './' : '../'.repeat(depth);

const toRelative = (slug) => {
  if (!slug || slug === '/') {
    return base;
  }

  return `${base}${slug.replace(/^\//, '')}`;
};

const toAsset = (assetPath) => `${base}${assetPath.replace(/^\//, '')}`;

const sectionLabels = Object.fromEntries(
  (i18n.sections || []).map((section) => [section.key, section.label])
);

const groups = (i18n.sections || []).map((section) => section.key);

const grouped = groups
  .map((section) => ({
    section,
    label: sectionLabels[section] || section,
    items: pages.filter((item) => item.section === section)
  }))
  .filter((group) => group.items.length);

const footerNav = groups
  .map((section) => {
    const firstPage = pages.find((item) => item.section === section);

    if (!firstPage) {
      return '';
    }

    return `<li><a href="${toRelative(firstPage.slug)}">${esc(sectionLabels[section] || section)}</a></li>`;
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
    ? `<li class="nav-item"><a class="nav-link" href="${toRelative(group.items[0].slug)}">${esc(group.label)}</a></li>`
    : `<li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">${esc(group.label)}</a><ul class="dropdown-menu">${group.items
        .map(
          (item) =>
            `<li><a class="dropdown-item" href="${toRelative(item.slug)}">${esc(item.name)}</a></li>`
        )
        .join('')}</ul></li>`;

const langFlag = (code) =>
  `<img class="lang-switcher__flag" src="${toAsset(`/assets/img/flags/${code}.svg`)}" alt="" width="27" height="18" loading="lazy" decoding="async">`;

const langSwitcher = `<li class="nav-item lang-switcher" aria-label="${esc(i18n.langSwitcher?.label || 'Language')}"><a class="nav-link lang-switcher__link${locale === 'fr' ? ' is-active' : ''}" href="${toRelative(pageState.slugFr || '/')}" hreflang="fr" lang="fr" aria-label="Français" title="Français">${langFlag('fr')}</a><a class="nav-link lang-switcher__link${locale === 'en' ? ' is-active' : ''}" href="${toRelative(pageState.slugEn || '/en/')}" hreflang="en" lang="en" aria-label="English" title="English">${langFlag('gb')}</a></li>`;

qs('#site-header').innerHTML = `<header class="site-header"><nav class="navbar navbar-expand-xl" aria-label="${esc(i18n.navAria || 'Navigation')}"><div class="container"><a class="navbar-brand" href="${toRelative(homeSlug)}" aria-label="${esc(i18n.brandAria || 'Greenspector')}"><img class="navbar-logo" src="${toAsset('/assets/img/Greenspector_logo_web_1200x320.png')}" alt="Greenspector"></a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavigation" aria-controls="mainNavigation" aria-expanded="false" aria-label="${esc(i18n.menuOpen || 'Open menu')}"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="mainNavigation"><ul class="navbar-nav ms-auto align-items-xl-center gap-xl-2">${grouped.map(dropdown).join('')}<li class="nav-item"><a class="nav-link" href="${toRelative(contactSlug)}">${esc(i18n.contact || 'Contact')}</a></li>${langSwitcher}</ul></div></div></nav></header>`;

qs('#site-footer').innerHTML = `<footer class="site-footer"><div class="container footer-grid"><div class="footer-brand"><a class="footer-logo-link" href="${toRelative(homeSlug)}" aria-label="${esc(i18n.brandAria || 'Greenspector')}"><img class="footer-logo" src="${toAsset('/assets/img/Logo_greenspector_header_white.svg')}" alt="Greenspector"></a><p class="footer-tagline">${esc(i18n.footerTagline || '')}</p></div><nav class="footer-nav" aria-label="${esc(i18n.footerMenu || 'Menu')}"><p class="footer-title">${esc(i18n.footerMenu || 'Menu')}</p><ul class="footer-nav-list">${footerNav}<li><a href="${toRelative(contactSlug)}">${esc(i18n.contact || 'Contact')}</a></li></ul></nav><div class="footer-social"><p class="footer-title">${esc(i18n.footerFollow || 'Follow us')}</p><ul class="social-links">${socialLinks.map((item) => `<li><a href="${item.href}" target="_blank" rel="noopener noreferrer" aria-label="${item.name}">${item.icon}</a></li>`).join('')}</ul></div></div></footer>`;

document.querySelectorAll('.navbar a[href]').forEach((link) => {
  const item = pages.find((p) => toRelative(p.slug) === link.getAttribute('href'));

  if (item && item.slug === currentSlug) {
    link.setAttribute('aria-current', 'page');
  }
});

const caseStudiesGrid = qs('#case-studies-grid');
const caseStudies =
  locale === 'en'
    ? window.GS_CASE_STUDIES_EN || window.GS_CASE_STUDIES || []
    : window.GS_CASE_STUDIES || [];

if (caseStudiesGrid && caseStudies.length) {
  const cardLabels = i18n.caseStudyCard || {};
  caseStudiesGrid.innerHTML = caseStudies
    .map((item) => {
      const href = toRelative(`${routes.caseStudiesIndex || '/ressources/etudes-de-cas/'}${item.slug}`);
      const image = item.image.startsWith('http') ? item.image : toAsset(item.image);

      return `<article class="case-study-card">
        <a class="case-study-card__link" href="${esc(href)}">
          <figure class="case-study-card__media">
            <img src="${esc(image)}" alt="${esc(item.title)}" width="640" height="360" loading="lazy" decoding="async">
          </figure>
          <div class="case-study-card__body">
            <p class="eyebrow">${esc(cardLabels.eyebrow || 'Case study')}</p>
            <h2 class="case-study-card__title">${esc(item.title)}</h2>
            <p class="case-study-card__desc">${esc(item.description)}</p>
            <span class="case-study-card__cta">${esc(cardLabels.cta || 'Read case study')}</span>
          </div>
        </a>
      </article>`;
    })
    .join('');
}

const testimonialsCarousel = qs('#pricingTestimonialsCarousel');
if (testimonialsCarousel && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  testimonialsCarousel.removeAttribute('data-bs-ride');
  testimonialsCarousel.setAttribute('data-bs-interval', 'false');
}
