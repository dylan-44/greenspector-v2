const { esc } = require('./renderers');
const { slugToRelative, slugToAsset } = require('./paths');

const SOCIAL_LINKS = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/greenspector/',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.64h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.88 0-2.17 1.46-2.17 2.97V21H9z"/></svg>'
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@greenspector7979',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M23.5 6.2a3 3 0 0 0-2.11-2.12C19.52 3.6 12 3.6 12 3.6s-7.52 0-9.39.48A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.11 2.12c1.87.48 9.39.48 9.39.48s7.52 0 9.39-.48a3 3 0 0 0 2.11-2.12A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>'
  }
];

function buildNavGroups(pages, i18n) {
  const sectionLabels = Object.fromEntries(
    (i18n.sections || []).map((section) => [section.key, section.label])
  );
  const groups = (i18n.sections || []).map((section) => section.key);

  return groups
    .map((section) => ({
      section,
      label: sectionLabels[section] || section,
      items: pages.filter((item) => item.section === section)
    }))
    .filter((group) => group.items.length);
}

function renderDropdown(group, pageSlug, currentSlug) {
  const itemLink = (item) => {
    const href = slugToRelative(pageSlug, item.slug);
    const current = item.slug === currentSlug ? ' aria-current="page"' : '';
    return `<li><a class="dropdown-item" href="${href}"${current}>${esc(item.name)}</a></li>`;
  };

  if (group.items.length === 1 && group.items[0].name === group.label) {
    const item = group.items[0];
    const href = slugToRelative(pageSlug, item.slug);
    const current = item.slug === currentSlug ? ' aria-current="page"' : '';
    return `<li class="nav-item"><a class="nav-link" href="${href}"${current}>${esc(group.label)}</a></li>`;
  }

  return `<li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">${esc(group.label)}</a><ul class="dropdown-menu">${group.items.map(itemLink).join('')}</ul></li>`;
}

function langFlag(pageSlug, code) {
  return `<img class="lang-switcher__flag" src="${slugToAsset(pageSlug, `/assets/img/flags/${code}.svg`)}" alt="" width="27" height="18" loading="eager" decoding="async">`;
}

function renderHeader({ pageSlug, locale, currentSlug, slugFr, slugEn, i18n, pages, routes }) {
  const homeSlug = locale === 'en' ? '/en/' : '/';
  const contactSlug = pages.find((item) => item.slug.endsWith('/contact/'))?.slug || (locale === 'en' ? '/en/contact/' : '/contact/');
  const grouped = buildNavGroups(pages, i18n);
  const saasUrl = i18n.saasUrl || routes.saasUrl || 'https://saas.greenspector.com/';
  const signUpUrl = i18n.signUpUrl || routes.signUpUrl || 'https://saas.greenspector.com/signup';
  const authButtons = `<li class="nav-item"><a class="nav-link nav-auth-login" href="${esc(saasUrl)}">${esc(i18n.login || 'Connexion')}</a></li><li class="nav-item"><a class="nav-link nav-auth-signup" href="${esc(signUpUrl)}">${esc(i18n.signUp || 'Inscription')}</a></li>`;
  const langSwitcher = `<li class="nav-item lang-switcher" aria-label="${esc(i18n.langSwitcher?.label || 'Language')}"><a class="nav-link lang-switcher__link${locale === 'fr' ? ' is-active' : ''}" href="${slugToRelative(pageSlug, slugFr || '/')}" hreflang="fr" lang="fr" aria-label="Français" title="Français">${langFlag(pageSlug, 'fr')}</a><a class="nav-link lang-switcher__link${locale === 'en' ? ' is-active' : ''}" href="${slugToRelative(pageSlug, slugEn || '/en/')}" hreflang="en" lang="en" aria-label="English" title="English">${langFlag(pageSlug, 'gb')}</a></li>`;
  const contactCurrent = contactSlug === currentSlug ? ' aria-current="page"' : '';

  return `<header class="site-header"><nav class="navbar navbar-expand-xl" aria-label="${esc(i18n.navAria || 'Navigation')}"><div class="container"><a class="navbar-brand" href="${slugToRelative(pageSlug, homeSlug)}" aria-label="${esc(i18n.brandAria || 'Greenspector')}"><img class="navbar-logo" src="${slugToAsset(pageSlug, '/assets/img/Logo_greenspector_header.svg')}" alt="Greenspector" width="240" height="36" loading="eager" decoding="async"></a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavigation" aria-controls="mainNavigation" aria-expanded="false" aria-label="${esc(i18n.menuOpen || 'Open menu')}"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="mainNavigation"><ul class="navbar-nav ms-auto align-items-xl-center gap-xl-2">${grouped.map((group) => renderDropdown(group, pageSlug, currentSlug)).join('')}<li class="nav-item"><a class="nav-link" href="${slugToRelative(pageSlug, contactSlug)}"${contactCurrent}>${esc(i18n.contact || 'Contact')}</a></li>${authButtons}${langSwitcher}</ul></div></div></nav></header>`;
}

function renderFooter({ pageSlug, locale, i18n, pages }) {
  const homeSlug = locale === 'en' ? '/en/' : '/';
  const contactSlug = pages.find((item) => item.slug.endsWith('/contact/'))?.slug || (locale === 'en' ? '/en/contact/' : '/contact/');
  const legalSlug = locale === 'en' ? '/en/legal-notices/' : '/mentions-legales/';
  const sectionLabels = Object.fromEntries(
    (i18n.sections || []).map((section) => [section.key, section.label])
  );
  const groups = (i18n.sections || []).map((section) => section.key);
  const footerNav = groups
    .map((section) => {
      const firstPage = pages.find((item) => item.section === section);
      if (!firstPage) {
        return '';
      }
      return `<li><a href="${slugToRelative(pageSlug, firstPage.slug)}">${esc(sectionLabels[section] || section)}</a></li>`;
    })
    .join('');

  return `<footer class="site-footer"><div class="container footer-grid"><div class="footer-brand"><a class="footer-logo-link" href="${slugToRelative(pageSlug, homeSlug)}" aria-label="${esc(i18n.brandAria || 'Greenspector')}"><img class="footer-logo" src="${slugToAsset(pageSlug, '/assets/img/Logo_greenspector_header_white.svg')}" alt="Greenspector" width="240" height="36" loading="lazy" decoding="async"></a><p class="footer-tagline">${esc(i18n.footerTagline || '')}</p></div><nav class="footer-nav" aria-label="${esc(i18n.footerMenu || 'Menu')}"><p class="footer-title">${esc(i18n.footerMenu || 'Menu')}</p><ul class="footer-nav-list">${footerNav}<li><a href="${slugToRelative(pageSlug, contactSlug)}">${esc(i18n.contact || 'Contact')}</a></li><li><a href="${slugToRelative(pageSlug, legalSlug)}">${esc(i18n.footerLegal || 'Mentions légales')}</a></li></ul></nav><div class="footer-social"><p class="footer-title">${esc(i18n.footerFollow || 'Follow us')}</p><ul class="social-links">${SOCIAL_LINKS.map((item) => `<li><a href="${item.href}" target="_blank" rel="noopener noreferrer" aria-label="${item.name}">${item.icon}</a></li>`).join('')}</ul></div></div></footer>`;
}

module.exports = {
  renderHeader,
  renderFooter
};
