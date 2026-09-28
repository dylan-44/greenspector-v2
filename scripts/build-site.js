#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { ROOT, outputPathForPage } = require('./lib/paths');
const { loadSlugMap, buildSlugLookup, resolveLocaleSlug } = require('./lib/slug-map');
const { renderPageBody, blogIndexSlug } = require('./lib/renderers');
const { renderLayout } = require('./lib/layout');

function absoluteUrlFromPaths(siteUrl, slug) {
  const base = siteUrl.replace(/\/$/, '');
  if (!slug || slug === '/') {
    return `${base}/`;
  }
  return `${base}${slug.startsWith('/') ? slug : `/${slug}`}`;
}

const registry = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'content/registry.json'), 'utf8')
);
const { byId: slugMapById } = loadSlugMap();

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function pageJsonPath(locale, pagePath) {
  const rel = pagePath === 'index' ? 'index.json' : `${pagePath}.json`;
  return path.join(ROOT, 'content', locale, 'pages', rel);
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function enrichRegistryPages(pages) {
  return pages.map((page) => {
    const mapped = slugMapById[page.id] || {};
    return {
      ...page,
      slugFr: page.slug,
      pathEn: mapped.pathEn || page.path,
      slugEn: mapped.slugEn || (page.slug === '/' ? '/en/' : `/en${page.slug}`)
    };
  });
}

function buildNavData(pagesByLocale) {
  const lines = [
    'window.GS_I18N = ' + JSON.stringify(pagesByLocale.i18n, null, 2) + ';',
    '',
    'window.GS_ROUTES = ' + JSON.stringify(pagesByLocale.routes, null, 2) + ';',
    ''
  ];

  for (const locale of registry.locales) {
    const varName = locale === 'fr' ? 'GS_PAGES' : `GS_PAGES_${locale.toUpperCase()}`;
    lines.push(`window.${varName} = ${JSON.stringify(pagesByLocale.pages[locale], null, 2)};`);
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}

function buildCaseStudiesData(pagesByLocale) {
  const lines = [];

  for (const locale of registry.locales) {
    const varName = locale === 'fr' ? 'GS_CASE_STUDIES' : `GS_CASE_STUDIES_${locale.toUpperCase()}`;
    lines.push(`window.${varName} = ${JSON.stringify(pagesByLocale.caseStudies[locale], null, 2)};`);
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}

function pageLocales(page) {
  return Array.isArray(page.locales) && page.locales.length ? page.locales : registry.locales;
}

function buildSitemap(pages, extraUrls = []) {
  const urls = [];
  const seen = new Set();
  for (const loc of extraUrls) {
    if (loc && !seen.has(loc)) {
      seen.add(loc);
      urls.push(loc);
    }
  }
  for (const page of pages) {
    const locales = pageLocales(page);
    if (locales.includes('fr')) {
      const url = absoluteUrlFromPaths(registry.siteUrl, page.slugFr);
      if (!seen.has(url)) {
        seen.add(url);
        urls.push(url);
      }
    }
    if (locales.includes('en')) {
      const url = absoluteUrlFromPaths(registry.siteUrl, page.slugEn);
      if (!seen.has(url)) {
        seen.add(url);
        urls.push(url);
      }
    }
  }

  const body = urls
    .map(
      (loc) => `  <url>
    <loc>${loc}</loc>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function cleanEnOutput() {
  const enDir = path.join(ROOT, 'en');
  if (fs.existsSync(enDir)) {
    fs.rmSync(enDir, { recursive: true, force: true });
  }
}

function isPublished(page) {
  return page.status !== 'draft';
}

const BLOG_PAGE_SIZE = 8;

function removeDraftOutputs(registryPages) {
  for (const regPage of registryPages) {
    if (isPublished(regPage)) {
      continue;
    }

    for (const locale of pageLocales(regPage)) {
      const outPath =
        locale === 'en'
          ? outputPathForPage(regPage.path, locale, regPage.pathEn)
          : outputPathForPage(regPage.path, locale);

      if (fs.existsSync(outPath)) {
        fs.unlinkSync(outPath);
      }
    }
  }
}

function main() {
  const registryPages = enrichRegistryPages(registry.pages);
  const slugLookup = buildSlugLookup(registryPages);
  const navByLocale = {};
  const caseStudiesByLocale = {};
  const blogByLocale = {};
  const pagesNavByLocale = { fr: [], en: [] };
  const routes = {
    fr: { caseStudiesIndex: '/ressources/etudes-de-cas/', blogIndex: '/ressources/blog/' },
    en: {
      caseStudiesIndex: slugMapById['case-studies-index']?.slugEn || '/en/resources/case-studies/',
      blogIndex: slugMapById['blog-index']?.slugEn || '/en/resources/blog/'
    }
  };

  for (const locale of registry.locales) {
    navByLocale[locale] = loadJson(path.join(ROOT, 'content', locale, 'navigation.json'));
    const raw = loadJson(path.join(ROOT, 'content', locale, 'case-studies.json'));
    caseStudiesByLocale[locale] = Array.isArray(raw) ? raw : raw.items;
    const blogPath = path.join(ROOT, 'content', locale, 'blog.json');
    const blogRaw = fs.existsSync(blogPath) ? loadJson(blogPath) : [];
    blogByLocale[locale] = Array.isArray(blogRaw) ? blogRaw : blogRaw.items || [];
    routes[locale].saasUrl = navByLocale[locale].saasUrl || 'https://saas.greenspector.com/';
    routes[locale].signUpUrl = navByLocale[locale].signUpUrl || 'https://saas.greenspector.com/signup';
  }

  const navTemplate = loadJson(path.join(ROOT, 'content/nav-pages.json'));

  for (const locale of registry.locales) {
    for (const entry of navTemplate) {
      const regPage = registryPages.find((page) => page.slug === entry.slug);
      if (regPage && !isPublished(regPage)) {
        continue;
      }

      const jsonPath = regPage ? pageJsonPath(locale, regPage.path) : null;
      const page = jsonPath && fs.existsSync(jsonPath) ? loadJson(jsonPath) : null;
      const externalHref = locale === 'fr' ? entry.hrefFr : entry.hrefEn;
      const slug = externalHref || (locale === 'fr' ? entry.slug : regPage?.slugEn || entry.slug);

      pagesNavByLocale[locale].push({
        section: entry.section,
        name: page?.nav?.name || entry.name,
        slug,
        slugFr: entry.hrefFr || entry.slug,
        slugEn: entry.hrefEn || regPage?.slugEn || entry.slug,
        primary: page?.nav?.primary || entry.primary,
        secondary: page?.nav?.secondary || entry.secondary,
        generated: false
      });
    }
  }

  cleanEnOutput();
  const blogPageDir = path.join(ROOT, 'ressources/blog/page');
  if (fs.existsSync(blogPageDir)) {
    fs.rmSync(blogPageDir, { recursive: true, force: true });
  }

  let built = 0;
  const extraSitemapUrls = [];

  for (const regPage of registryPages) {
    if (!isPublished(regPage)) {
      continue;
    }

    for (const locale of pageLocales(regPage)) {
      const jsonPath = pageJsonPath(locale, regPage.path);
      if (!fs.existsSync(jsonPath)) {
        console.warn(`Missing ${locale} content: ${jsonPath}`);
        continue;
      }

      const page = loadJson(jsonPath);
      const pageSlug = locale === 'fr' ? regPage.slugFr : regPage.slugEn;
      const nav = navByLocale[locale];
      const blogItems = blogByLocale[locale] || [];
      const ctx = {
        pageSlug,
        locale,
        slugLookup,
        resolveLocaleSlug,
        blogItems,
        blogPage: 1,
        blogPageSize: BLOG_PAGE_SIZE
      };
      const mainHtml = renderPageBody(page, regPage.template, ctx, nav);
      const html = renderLayout({
        page,
        locale,
        pageSlug,
        template: regPage.template,
        mainHtml,
        nav,
        siteUrl: registry.siteUrl,
        registryPage: regPage,
        pagesNav: pagesNavByLocale[locale],
        routes,
        needsCaseStudies: regPage.template === 'case-studies-index',
        needsBlogSearch: regPage.template === 'blog-index'
      });

      const outPath =
        locale === 'en'
          ? outputPathForPage(regPage.path, locale, regPage.pathEn)
          : outputPathForPage(regPage.path, locale);
      ensureDir(outPath);
      fs.writeFileSync(outPath, html, 'utf8');
      built += 1;

      if (regPage.template === 'blog-index') {
        const totalPages = Math.max(1, Math.ceil(blogItems.length / BLOG_PAGE_SIZE));
        const frTotal = Math.max(1, Math.ceil((blogByLocale.fr || []).length / BLOG_PAGE_SIZE));
        const enTotal = Math.max(1, Math.ceil((blogByLocale.en || []).length / BLOG_PAGE_SIZE));

        for (let pageNum = 2; pageNum <= totalPages; pageNum += 1) {
          const pagedSlug = blogIndexSlug(locale, pageNum);
          const pagedPage = {
            ...page,
            meta: {
              ...page.meta,
              title: `Blog — page ${pageNum} | Greenspector`
            }
          };
          const pagedCtx = {
            ...ctx,
            pageSlug: pagedSlug,
            blogPage: pageNum
          };
          const pagedHtml = renderLayout({
            page: pagedPage,
            locale,
            pageSlug: pagedSlug,
            template: regPage.template,
            mainHtml: renderPageBody(pagedPage, regPage.template, pagedCtx, nav),
            nav,
            siteUrl: registry.siteUrl,
            registryPage: {
              ...regPage,
              slugFr: blogIndexSlug('fr', Math.min(pageNum, frTotal)),
              slugEn: blogIndexSlug('en', Math.min(pageNum, enTotal))
            },
            pagesNav: pagesNavByLocale[locale],
            routes,
            needsCaseStudies: false,
            needsBlogSearch: true
          });
          const pagedOut =
            locale === 'en'
              ? outputPathForPage(`resources/blog/page/${pageNum}`, 'en', `resources/blog/page/${pageNum}`)
              : outputPathForPage(`ressources/blog/page/${pageNum}`, 'fr');
          ensureDir(pagedOut);
          fs.writeFileSync(pagedOut, pagedHtml, 'utf8');
          extraSitemapUrls.push(`${registry.siteUrl.replace(/\/$/, '')}${pagedSlug}`);
          built += 1;
        }
      }
    }
  }

  const siteDataPayload = {
    i18n: navByLocale,
    routes,
    pages: pagesNavByLocale,
    caseStudies: caseStudiesByLocale
  };

  fs.writeFileSync(path.join(ROOT, 'assets/js/nav-data.js'), buildNavData(siteDataPayload), 'utf8');
  for (const locale of registry.locales) {
    const searchIndex = (blogByLocale[locale] || []).map((item) => ({
      title: item.title || '',
      description: item.description || '',
      href: item.href || '',
      image: item.image || ''
    }));
    fs.writeFileSync(
      path.join(ROOT, `assets/js/blog-search-${locale}.json`),
      JSON.stringify(searchIndex)
    );
  }
  fs.writeFileSync(
    path.join(ROOT, 'assets/js/case-studies-data.js'),
    buildCaseStudiesData(siteDataPayload),
    'utf8'
  );

  // Legacy alias kept for any external references during transition.
  fs.writeFileSync(
    path.join(ROOT, 'assets/js/site-data.js'),
    `${buildNavData(siteDataPayload)}${buildCaseStudiesData(siteDataPayload)}`,
    'utf8'
  );

  removeDraftOutputs(registryPages);

  fs.writeFileSync(
    path.join(ROOT, 'sitemap.xml'),
    buildSitemap(registryPages.filter(isPublished), extraSitemapUrls),
    'utf8'
  );

  console.log(`Built ${built} HTML files, nav-data.js and case-studies-data.js`);
}

main();
