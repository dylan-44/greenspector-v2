const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

function slugToLocaleSlug(slug, locale) {
  if (locale === 'fr') {
    return slug;
  }
  if (slug === '/') {
    return '/en/';
  }
  return `/en${slug}`;
}

function slugDepth(slug) {
  return slug.replace(/^\/|\/$/g, '').split('/').filter(Boolean).length;
}

function slugToBase(slug) {
  const depth = slugDepth(slug);
  return depth === 0 ? './' : '../'.repeat(depth);
}

function slugToRelative(fromSlug, toSlug) {
  if (!toSlug || toSlug === '/') {
    return slugToBase(fromSlug);
  }
  return `${slugToBase(fromSlug)}${toSlug.replace(/^\//, '')}`;
}

function slugToAsset(fromSlug, assetPath) {
  const normalized = assetPath.replace(/^\//, '');
  return `${slugToBase(fromSlug)}${normalized}`;
}

function logicalSlug(localeSlug, locale) {
  if (locale === 'fr') {
    return localeSlug;
  }
  if (localeSlug === '/en/' || localeSlug === '/en') {
    return '/';
  }
  return localeSlug.replace(/^\/en/, '') || '/';
}

function outputPathForPage(pagePath, locale) {
  const parts = pagePath.split('/');
  const fileName = parts.pop();
  const dir = parts.join('/');

  if (locale === 'en') {
    if (fileName === 'index' && !dir) {
      return path.join(ROOT, 'en', 'index.html');
    }
    if (fileName === 'index') {
      return path.join(ROOT, 'en', dir, 'index.html');
    }
    return path.join(ROOT, 'en', pagePath, 'index.html');
  }

  if (fileName === 'index' && !dir) {
    return path.join(ROOT, 'index.html');
  }
  if (fileName === 'index') {
    return path.join(ROOT, dir, 'index.html');
  }
  return path.join(ROOT, pagePath, 'index.html');
}

function rewriteBodyHtml(html, pageSlug) {
  if (!html) {
    return '';
  }

  let out = html;

  out = out.replace(/\shref="(\/[^"]*)"/g, (_, target) => {
    const slug = target.endsWith('/') || target.includes('.') ? target : `${target}/`;
    return ` href="${slugToRelative(pageSlug, slug)}"`;
  });

  out = out.replace(/\shref="\.\/([^"]*)"/g, (_, rel) => {
    const slug = `/${rel.endsWith('/') || rel.includes('.') ? rel : `${rel}/`}`;
    return ` href="${slugToRelative(pageSlug, slug)}"`;
  });

  out = out.replace(/\shref="(?:\.\.\/)+([^"]*)"/g, (_, rel) => {
    if (rel.startsWith('assets/')) {
      return ` href="${slugToAsset(pageSlug, `/${rel}`)}"`;
    }
    const slug = `/${rel.endsWith('/') || rel.includes('.') ? rel : `${rel}/`}`;
    return ` href="${slugToRelative(pageSlug, slug)}"`;
  });

  out = out.replace(/\ssrc="(\/assets\/[^"]*)"/g, (_, asset) => {
    return ` src="${slugToAsset(pageSlug, asset)}"`;
  });

  out = out.replace(/\ssrc="(?:\.\.\/)+assets\/([^"]*)"/g, (_, rel) => {
    return ` src="${slugToAsset(pageSlug, `/assets/${rel}`)}"`;
  });

  out = out.replace(/\ssrc="\.\/assets\/([^"]*)"/g, (_, rel) => {
    return ` src="${slugToAsset(pageSlug, `/assets/${rel}`)}"`;
  });

  return out;
}

module.exports = {
  ROOT,
  slugToLocaleSlug,
  slugDepth,
  slugToBase,
  slugToRelative,
  slugToAsset,
  logicalSlug,
  outputPathForPage,
  rewriteBodyHtml
};
