const { esc } = require('./renderers');
const { slugToAsset } = require('./paths');

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
    ? `\n    <meta name="twitter:card" content="summary_large_image">`
    : '';
  const ldJson = page.ldJson
    ? `\n    <script type="application/ld+json">\n    ${page.ldJson}\n    </script>`
    : '';

  return `<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Braah+One&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
    <link rel="stylesheet" href="${slugToAsset(pageSlug, '/assets/css/styles.css')}">${ldJson}
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
  registryPage
}) {
  const bodyClass = template === 'home' ? ' class="home-page"' : '';
  const dataPage = JSON.stringify({
    slug: pageSlug,
    locale,
    slugFr: registryPage.slugFr || registryPage.slug,
    slugEn: registryPage.slugEn || (registryPage.slug === '/' ? '/en/' : `/en${registryPage.slug}`)
  }).replace(/"/g, '&quot;');

  const skipLink = nav.skipLink || 'Skip to main content';
  const assetBase = slugToAsset(pageSlug, '/assets/js/site-data.js');
  const mainJs = slugToAsset(pageSlug, '/assets/js/main.js');

  return `<!DOCTYPE html>
<html lang="${locale}">

${renderHead(page, locale, pageSlug, siteUrl, registryPage)}

<body${bodyClass} data-page="${dataPage}"><a class="skip-link" href="#main-content">${esc(skipLink)}</a>
    <div id="site-header"></div>
    <main id="main-content">
        ${mainHtml}
    </main>
    <div id="site-footer"></div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>
    <script src="${assetBase}" defer></script>
    <script src="${mainJs}" defer></script>
</body>

</html>
`;
}

module.exports = { renderLayout };
