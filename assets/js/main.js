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
            <img src="${esc(image)}" alt="" width="200" height="80" loading="lazy" decoding="async">
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

document.querySelectorAll('#pricingTestimonialsCarousel, #homeTestimonialsCarousel').forEach((testimonialsCarousel) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    testimonialsCarousel.removeAttribute('data-bs-ride');
    testimonialsCarousel.setAttribute('data-bs-interval', 'false');
  }
});
