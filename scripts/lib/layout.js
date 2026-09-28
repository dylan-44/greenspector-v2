const { esc } = require('./renderers');
const { slugToAsset } = require('./paths');
const { renderHeader, renderFooter } = require('./nav');

function absoluteUrl(siteUrl, slug) {
  const base = siteUrl.replace(/\/$/, '');
  if (!slug || slug === '/') {
    return `${base}/`;
  }
  return `${base}${slug.startsWith('/') ? slug : `/${slug}`}`;
}

function renderHead(page, locale, pageSlug, siteUrl, registryPage) {
  const meta = page.meta || {};
  const canonical = absoluteUrl(siteUrl, pageSlug);
  const slugFr = registryPage.slugFr || registryPage.slug;
  const slugEn = registryPage.slugEn || (slugFr === '/' ? '/en/' : `/en${slugFr}`);
  const hrefFr = absoluteUrl(siteUrl, slugFr);
  const hrefEn = absoluteUrl(siteUrl, slugEn);

  const keywords = meta.keywords
    ? `\n    <meta name="keywords" content="${esc(meta.keywords)}">`
    : '';
  const ogImage = meta.ogImage
    ? `\n    <meta property="og:image" content="${esc(meta.ogImage)}">`
    : '';
  const twitter = meta.ogImage
    ? `\n    <meta name="twitter:card" content="summary_large_image">\n    <meta name="twitter:image" content="${esc(meta.ogImage)}">`
    : '';
  const ldJson = page.ldJson
    ? `\n    <script type="application/ld+json">\n    ${page.ldJson}\n    </script>`
    : '';

  const faviconIco = slugToAsset(pageSlug, '/assets/img/favicon/favicon.ico');
  const favicon32 = slugToAsset(pageSlug, '/assets/img/favicon/favicon-32x32.png');
  const favicon16 = slugToAsset(pageSlug, '/assets/img/favicon/favicon-16x16.png');
  const favicon180 = slugToAsset(pageSlug, '/assets/img/favicon/apple-touch-icon.png');
  const favicon192 = slugToAsset(pageSlug, '/assets/img/favicon/android-chrome-192x192.png');
  const saasUrl = meta.redirectUrl || (registryPage.id === 'connexion' ? 'https://saas.greenspector.com/' : '');
  const saasRedirect = saasUrl
    ? `\n    <meta http-equiv="refresh" content="0;url=${esc(saasUrl)}">`
    : '';

  const stylesHref = slugToAsset(pageSlug, '/assets/css/styles.min.css');
  const bootstrapCss = slugToAsset(pageSlug, '/assets/vendor/bootstrap/bootstrap.min.css');

  return `<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">${saasRedirect}
    <link rel="icon" href="${faviconIco}" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="${favicon32}">
    <link rel="icon" type="image/png" sizes="16x16" href="${favicon16}">
    <link rel="apple-touch-icon" sizes="180x180" href="${favicon180}">
    <link rel="icon" type="image/png" sizes="192x192" href="${favicon192}">
    <title>${meta.title || ''}</title>
    <meta name="description" content="${esc(meta.description || '')}">${keywords}
    <link rel="canonical" href="${esc(canonical)}">
    <link rel="alternate" hreflang="fr" href="${esc(hrefFr)}">
    <link rel="alternate" hreflang="en" href="${esc(hrefEn)}">
    <link rel="alternate" hreflang="x-default" href="${esc(hrefFr)}">
    <meta property="og:title" content="${esc(meta.ogTitle || meta.title || '')}">
    <meta property="og:description" content="${esc(meta.ogDescription || meta.description || '')}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${esc(canonical)}">
    <meta property="og:site_name" content="Greenspector">${ogImage}${twitter}
    <link href="${bootstrapCss}" rel="stylesheet">
    <link rel="stylesheet" href="${stylesHref}">${ldJson}
</head>`;
}

function renderLayout({
  page,
  locale,
  pageSlug,
  template,
  mainHtml,
  nav,
  siteUrl,
  registryPage,
  pagesNav,
  routes,
  needsCaseStudies = false,
  needsBlogSearch = false
}) {
  const bodyClass = template === 'home' ? ' class="home-page"' : '';
  const dataPage = JSON.stringify({
    slug: pageSlug,
    locale,
    slugFr: registryPage.slugFr || registryPage.slug,
    slugEn: registryPage.slugEn || (registryPage.slug === '/' ? '/en/' : `/en${registryPage.slug}`)
  }).replace(/"/g, '&quot;');

  const skipLink = nav.skipLink || 'Skip to main content';
  const navDataJs = slugToAsset(pageSlug, '/assets/js/nav-data.js');
  const caseStudiesJs = slugToAsset(pageSlug, '/assets/js/case-studies-data.js');
  const blogSearchJs = slugToAsset(pageSlug, '/assets/js/blog-search.js');
  const mainJs = slugToAsset(pageSlug, '/assets/js/main.js');
  const bootstrapJs = slugToAsset(pageSlug, '/assets/vendor/bootstrap/bootstrap.bundle.min.js');

  const headerHtml = renderHeader({
    pageSlug,
    locale,
    currentSlug: pageSlug,
    slugFr: registryPage.slugFr || registryPage.slug,
    slugEn: registryPage.slugEn || (registryPage.slug === '/' ? '/en/' : `/en${registryPage.slug}`),
    i18n: nav,
    pages: pagesNav,
    routes: routes[locale] || {}
  });

  const footerHtml = renderFooter({
    pageSlug,
    locale,
    i18n: nav,
    pages: pagesNav
  });

  const caseStudiesScript = needsCaseStudies
    ? `\n    <script src="${caseStudiesJs}" defer></script>`
    : '';
  const blogSearchScript = needsBlogSearch
    ? `\n    <script src="${blogSearchJs}" defer></script>`
    : '';

  return `<!DOCTYPE html>
<html lang="${locale}">

${renderHead(page, locale, pageSlug, siteUrl, registryPage)}

<body${bodyClass} data-page="${dataPage}"${needsCaseStudies ? ' data-needs-case-studies="true"' : ''}><a class="skip-link" href="#main-content">${esc(skipLink)}</a>
    <div id="site-header">${headerHtml}</div>
    <main id="main-content">
        ${mainHtml}
    </main>
    <div id="site-footer">${footerHtml}</div>
    <script src="${bootstrapJs}" defer></script>
    <script src="${navDataJs}" defer></script>${caseStudiesScript}${blogSearchScript}
    <script src="${mainJs}" defer></script>
</body>

</html>
`;
}

module.exports = { renderLayout };
