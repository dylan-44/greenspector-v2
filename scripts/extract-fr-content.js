#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const {
  ROOT,
  outputPathForPage,
  slugToLocaleSlug
} = require('./lib/paths');

const registry = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'content/registry.json'), 'utf8')
);

function htmlFilePath(pagePath) {
  const parts = pagePath.split('/');
  const fileName = parts.pop();
  if (fileName === 'index' && parts.length === 0) {
    return path.join(ROOT, 'index.html');
  }
  if (fileName === 'index') {
    return path.join(ROOT, ...parts, 'index.html');
  }
  return path.join(ROOT, pagePath, 'index.html');
}

function normalizeAssetPath(src, pageDepth) {
  if (!src || src.startsWith('http') || src.startsWith('data:')) {
    return src;
  }
  const prefix = '../'.repeat(pageDepth);
  if (src.startsWith(prefix)) {
    return `/${src.slice(prefix.length)}`;
  }
  if (src.startsWith('/')) {
    return src;
  }
  return src;
}

function normalizeHref(href, fromSlug) {
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) {
    return href;
  }
  const depth = fromSlug.replace(/^\/|\/$/g, '').split('/').filter(Boolean).length;
  let normalized = href;
  while (normalized.startsWith('../')) {
    normalized = normalized.slice(3);
  }
  if (normalized.startsWith('./')) {
    normalized = normalized.slice(2);
  }
  if (!normalized.endsWith('/') && !normalized.includes('.')) {
    normalized = `${normalized}/`;
  }
  return `/${normalized}`;
}

function parseHero($, pageSlug) {
  const hero = $('main .hero').first();
  if (!hero.length) {
    return null;
  }

  const actions = [];
  hero.find('.hero-actions a').each((_, el) => {
    const $el = $(el);
    actions.push({
      label: $el.text().trim(),
      href: normalizeHref($el.attr('href'), pageSlug),
      primary: $el.hasClass('btn-gs-primary'),
      external: $el.attr('target') === '_blank'
    });
  });

  return {
    label: hero.find('.section-label').first().text().trim() || undefined,
    title: hero.find('h1').first().html()?.trim() || '',
    subtitle: hero.find('.hero-subtitle').first().html()?.trim() || undefined,
    actions: actions.length ? actions : undefined,
    slugNote: hero.find('.slug-note').first().text().trim() || undefined
  };
}

function parseMeta($) {
  return {
    title: $('title').first().text().trim(),
    description: $('meta[name="description"]').attr('content')?.trim() || '',
    keywords: $('meta[name="keywords"]').attr('content')?.trim(),
    ogTitle: $('meta[property="og:title"]').attr('content')?.trim(),
    ogDescription: $('meta[property="og:description"]').attr('content')?.trim(),
    ogImage: $('meta[property="og:image"]').attr('content')?.trim()
  };
}

function parseLdJson($) {
  const script = $('script[type="application/ld+json"]').first();
  return script.length ? script.html()?.trim() : undefined;
}

function iconFromClass(className) {
  const parts = (className || '').split(/\s+/);
  const icon = parts.find(
    (part) => part.startsWith('fa-') && !['fa-solid', 'fa-regular', 'fa-brands'].includes(part)
  );
  return icon ? icon.replace('fa-', '') : 'check';
}

function parseCaseStudy($, pageSlug) {
  const article = $('article.case-study-page').first();
  if (!article.length) {
    return null;
  }

  const logos = [];
  article.find('.case-study-logos img').each((_, el) => {
    logos.push({ src: $(el).attr('src'), alt: $(el).attr('alt') || '' });
  });

  const introSection = article.find('.studio-intro').first();
  const introParagraphs = [];
  introSection.find('.studio-copy > p:not(.eyebrow)').each((_, el) => {
    introParagraphs.push($(el).html()?.trim() || '');
  });
  const introList = [];
  introSection.find('.studio-copy ul li').each((_, el) => {
    introList.push($(el).html()?.trim() || '');
  });
  const introImg = introSection.find('.studio-figure img').first();

  const resultsSection = article.find('.case-study-results').closest('.studio-section');
  const resultItems = [];
  article.find('.case-study-results li').each((_, el) => {
    resultItems.push($(el).html()?.trim() || '');
  });

  const keys = [];
  article.find('.case-study-key').each((_, el) => {
    const $el = $(el);
    keys.push({
      icon: iconFromClass($el.find('i').attr('class')),
      title: $el.find('h3').html()?.trim() || '',
      text: $el.find('p').html()?.trim() || ''
    });
  });

  let testimonial;
  const quoteSection = article.find('.case-study-quote').first();
  if (quoteSection.length) {
    const quotes = [];
    quoteSection.find('> p').each((_, el) => {
      quotes.push($(el).html()?.trim() || '');
    });
    testimonial = {
      eyebrow: quoteSection.closest('.studio-section').find('.eyebrow').first().text().trim(),
      title: quoteSection.closest('.studio-section').find('h2').first().html()?.trim() || '',
      quotes,
      author: quoteSection.find('cite').first().text().trim(),
      role: quoteSection.find('footer span').first().html()?.trim(),
      photo: quoteSection.find('footer img').attr('src')
    };
  }

  let testimonials;
  const multiQuotes = article.find('.about-testimonials-grid .about-testimonial');
  if (multiQuotes.length) {
    const section = multiQuotes.closest('.studio-section');
    testimonials = {
      eyebrow: section.find('.eyebrow').first().text().trim(),
      title: section.find('h2').first().html()?.trim() || '',
      items: []
    };
    multiQuotes.each((_, el) => {
      const $el = $(el);
      testimonials.items.push({
        quote: $el.find('p').first().html()?.trim() || '',
        author: $el.find('cite').first().text().trim(),
        role: $el.find('footer span').first().html()?.trim()
      });
    });
  }

  const media = [];
  article.find('.case-study-media').each((_, el) => {
    const $el = $(el);
    media.push({
      src: $el.find('img').attr('src'),
      alt: $el.find('img').attr('alt') || '',
      caption: $el.find('figcaption').text().trim() || undefined
    });
  });

  const ctaSection = article.find('.studio-highlight').last();
  let cta;
  if (ctaSection.length) {
    const btn = ctaSection.find('.btn').first();
    cta = {
      eyebrow: ctaSection.find('.eyebrow').first().text().trim(),
      title: ctaSection.find('h2').first().html()?.trim() || '',
      text: ctaSection.find('.studio-copy > p').not(':has(.btn)').first().html()?.trim() || '',
      buttonLabel: btn.text().trim(),
      buttonHref: normalizeHref(btn.attr('href'), pageSlug)
    };
  }

  const resultsTitleSection = resultsSection.length
    ? resultsSection
    : article.find('[aria-labelledby="resultats-title"]').first();

  return {
    logos,
    intro: {
      eyebrow: introSection.find('.eyebrow').first().text().trim(),
      title: introSection.find('h2').first().html()?.trim() || '',
      paragraphs: introParagraphs,
      list: introList.length ? introList : undefined,
      image: introImg.length
        ? { src: introImg.attr('src'), alt: introImg.attr('alt') || '' }
        : undefined
    },
    results: {
      eyebrow: resultsTitleSection.find('.eyebrow').first().text().trim(),
      title: resultsTitleSection.find('h2').first().html()?.trim() || '',
      intro: resultsTitleSection.find('h3').length
        ? undefined
        : resultsTitleSection.find('> p').first().html()?.trim(),
      subtitle: resultsTitleSection.find('h3').first().html()?.trim(),
      items: resultItems
    },
    successKeys: {
      eyebrow: article.find('[aria-labelledby="cles-succes-title"] .eyebrow').first().text().trim(),
      title: article.find('#cles-succes-title').html()?.trim() || '',
      items: keys
    },
    testimonial,
    testimonials,
    media: media.length ? media : undefined,
    mediaEyebrow: article.find('[aria-labelledby="visuels-title"] .eyebrow').first().text().trim(),
    mediaTitle: article.find('#visuels-title').html()?.trim(),
    cta
  };
}

function extractBodyHtml($, template, pageSlug) {
  const main = $('main#main-content');
  if (template === 'home') {
    return main.html()?.trim() || '';
  }

  const clone = cheerio.load(main.html() || '', null, false);
  clone('.hero').first().remove();

  let html = clone.root().html()?.trim() || '';

  if (template === 'html') {
    const shell = clone('.content-shell .container').first();
    if (shell.length) {
      html = shell.html()?.trim() || html;
    }
  }

  if (template === 'default') {
    const empty = clone('.empty-content').length;
    if (empty) {
      return undefined;
    }
    const panel = clone('.content-panel').first();
    if (panel.length) {
      html = panel.html()?.trim() || html;
    }
  }

  return html || undefined;
}

function parseContentMeta($) {
  const items = [];
  $('.content-meta span').each((_, el) => {
    items.push($(el).text().trim());
  });
  return items.length ? items : undefined;
}

function parseNavEntry(page, meta, gsPages) {
  const entry = gsPages.find((p) => p.slug === page.slug);
  if (entry) {
    return {
      section: entry.section,
      name: entry.name,
      primary: entry.primary,
      secondary: entry.secondary
    };
  }
  return {
    section: 'Home',
    name: meta.title.split('|')[0].trim(),
    primary: meta.title,
    secondary: meta.description
  };
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function loadGsPages() {
  const navPath = path.join(ROOT, 'content/nav-pages.json');
  if (fs.existsSync(navPath)) {
    return JSON.parse(fs.readFileSync(navPath, 'utf8'));
  }
  const siteDataSrc = fs.readFileSync(path.join(ROOT, 'assets/js/site-data.js'), 'utf8');
  const match = siteDataSrc.match(/window\.GS_PAGES\s*=\s*(\[[\s\S]*?\]);/);
  return match ? JSON.parse(match[1]) : [];
}

function main() {
  const gsPages = loadGsPages();
  let count = 0;

  for (const page of registry.pages) {
    const htmlPath = htmlFilePath(page.path);
    if (!fs.existsSync(htmlPath)) {
      console.warn(`Skip missing: ${htmlPath}`);
      continue;
    }

    const html = fs.readFileSync(htmlPath, 'utf8');
    const $ = cheerio.load(html);
    const meta = parseMeta($);
    const hero = parseHero($, page.slug);
    const nav = parseNavEntry(page, meta, gsPages);

    const output = {
      id: page.id,
      slug: page.slug,
      template: page.template,
      meta,
      nav,
      hero: hero || { title: meta.title }
    };

    if (page.template === 'case-study') {
      Object.assign(output, parseCaseStudy($, page.slug));
    } else if (page.template === 'case-studies-index') {
      output.gridLabel = 'Études de cas clients Greenspector';
    } else {
      const bodyHtml = extractBodyHtml($, page.template, page.slug);
      if (bodyHtml) {
        output.bodyHtml = bodyHtml;
      }
      const contentMeta = parseContentMeta($);
      if (contentMeta) {
        output.contentMeta = contentMeta;
      }
    }

    const ldJson = parseLdJson($);
    if (ldJson) {
      output.ldJson = ldJson;
    }

    const jsonPath = path.join(
      ROOT,
      'content/fr/pages',
      `${page.path.replace(/\/index$/, '')}.json`.replace(/^index\.json$/, 'index.json')
    );
    const normalizedJsonPath = page.path === 'index'
      ? path.join(ROOT, 'content/fr/pages/index.json')
      : path.join(ROOT, 'content/fr/pages', `${page.path}.json`);

    ensureDir(normalizedJsonPath);
    fs.writeFileSync(normalizedJsonPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
    count += 1;
    console.log(`Extracted: ${normalizedJsonPath}`);
  }

  console.log(`Done. ${count} pages extracted.`);
}

main();
