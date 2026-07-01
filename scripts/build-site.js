#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const {
  ROOT,
  outputPathForPage,
  slugToLocaleSlug,
  logicalSlug
} = require('./lib/paths');
const { renderPageBody } = require('./lib/renderers');
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
  return pages.map((page) => ({
    ...page,
    slugFr: page.slug,
    slugEn: slugToLocaleSlug(page.slug, 'en')
  }));
}

function buildSiteData(pagesByLocale) {
  const lines = ['window.GS_I18N = ' + JSON.stringify(pagesByLocale.i18n, null, 2) + ';', ''];

  for (const locale of registry.locales) {
    const varName = locale === 'fr' ? 'GS_PAGES' : `GS_PAGES_${locale.toUpperCase()}`;
    lines.push(`window.${varName} = ${JSON.stringify(pagesByLocale.pages[locale], null, 2)};`);
  }

  lines.push('');
  for (const locale of registry.locales) {
    const varName = locale === 'fr' ? 'GS_CASE_STUDIES' : `GS_CASE_STUDIES_${locale.toUpperCase()}`;
    lines.push(`window.${varName} = ${JSON.stringify(pagesByLocale.caseStudies[locale], null, 2)};`);
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}

function buildSitemap(pages) {
  const urls = [];
  for (const page of pages) {
    urls.push(absoluteUrlFromPaths(registry.siteUrl, page.slugFr));
    urls.push(absoluteUrlFromPaths(registry.siteUrl, page.slugEn));
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

function main() {
  const registryPages = enrichRegistryPages(registry.pages);
  const navByLocale = {};
  const caseStudiesByLocale = {};
  const pagesNavByLocale = { fr: [], en: [] };

  for (const locale of registry.locales) {
    navByLocale[locale] = loadJson(path.join(ROOT, 'content', locale, 'navigation.json'));
    const raw = loadJson(path.join(ROOT, 'content', locale, 'case-studies.json'));
    caseStudiesByLocale[locale] = Array.isArray(raw) ? raw : raw.items;
  }

  const navTemplate = loadJson(path.join(ROOT, 'content/nav-pages.json'));

  let built = 0;

  for (const regPage of registryPages) {
    for (const locale of registry.locales) {
      const jsonPath = pageJsonPath(locale, regPage.path);
      if (!fs.existsSync(jsonPath)) {
        console.warn(`Missing ${locale} content: ${jsonPath}`);
        continue;
      }

      const page = loadJson(jsonPath);
      const pageSlug = slugToLocaleSlug(regPage.slug, locale);
      const nav = navByLocale[locale];
      const mainHtml = renderPageBody(page, regPage.template, pageSlug, nav);
      const html = renderLayout({
        page,
        locale,
        pageSlug,
        template: regPage.template,
        mainHtml,
        nav,
        siteUrl: registry.siteUrl,
        registryPage: regPage
      });

      const outPath = outputPathForPage(regPage.path, locale);
      ensureDir(outPath);
      fs.writeFileSync(outPath, html, 'utf8');
      built += 1;
    }
  }

  for (const locale of registry.locales) {
    for (const entry of navTemplate) {
      const regPage = registryPages.find((page) => page.slug === entry.slug);
      const jsonPath = regPage ? pageJsonPath(locale, regPage.path) : null;
      const page = jsonPath && fs.existsSync(jsonPath) ? loadJson(jsonPath) : null;

      pagesNavByLocale[locale].push({
        section: entry.section,
        name: page?.nav?.name || entry.name,
        slug: slugToLocaleSlug(entry.slug, locale),
        slugFr: entry.slug,
        slugEn: slugToLocaleSlug(entry.slug, 'en'),
        primary: page?.nav?.primary || entry.primary,
        secondary: page?.nav?.secondary || entry.secondary,
        generated: false
      });
    }
  }

  const siteData = buildSiteData({
    i18n: navByLocale,
    pages: pagesNavByLocale,
    caseStudies: caseStudiesByLocale
  });
  fs.writeFileSync(path.join(ROOT, 'assets/js/site-data.js'), siteData, 'utf8');

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap(registryPages), 'utf8');

  console.log(`Built ${built} HTML files and site-data.js`);
}

main();
