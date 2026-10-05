const path = require('path');
const { pathEnToOutputPath } = require('./slug-map');
const { replaceFontAwesomeInHtml } = require('./icons');
const { renderPicture } = require('./images');

const ROOT = path.resolve(__dirname, '../..');

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
  if (toSlug.startsWith('http') || toSlug.startsWith('mailto:') || toSlug.startsWith('#')) {
    return toSlug;
  }
  return `${slugToBase(fromSlug)}${toSlug.replace(/^\//, '')}`;
}

function slugToAsset(fromSlug, assetPath) {
  const normalized = assetPath.replace(/^\//, '');
  return `${slugToBase(fromSlug)}${normalized}`;
}

function outputPathForPage(pagePath, locale, pathEn) {
  const parts = pagePath.split('/');
  const fileName = parts.pop();
  const dir = parts.join('/');

  if (locale === 'en') {
    return pathEnToOutputPath(pathEn || pagePath);
  }

  if (fileName === 'index' && !dir) {
    return path.join(ROOT, 'index.html');
  }
  if (fileName === 'index') {
    return path.join(ROOT, dir, 'index.html');
  }
  return path.join(ROOT, pagePath, 'index.html');
}

function normalizeHrefTarget(target) {
  if (!target || target.startsWith('http') || target.startsWith('mailto:') || target.startsWith('#')) {
    return target;
  }
  let slug = target.replace(/^(\.\.\/|\.\/)+/, '');
  if (!slug.startsWith('/')) {
    slug = `/${slug}`;
  }
  if (!slug.endsWith('/') && !slug.includes('.')) {
    slug = `${slug}/`;
  }
  return slug;
}

function readAttr(attrs, name) {
  const match = attrs.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'));
  return match ? match[1] : '';
}

function enhanceImagesInHtml(html, pageSlug) {
  if (!html) {
    return '';
  }

  let out = replaceFontAwesomeInHtml(html);

  out = out.replace(/<img\b([^>]*?)>/gi, (match, attrs) => {
    const src = readAttr(attrs, 'src');
    if (!src || src.endsWith('.svg')) {
      if (!/loading=/i.test(attrs)) {
        const loading = /fetchpriority="high"/i.test(attrs) ? 'eager' : 'lazy';
        const decoding = /decoding=/i.test(attrs) ? '' : ' decoding="async"';
        return `<img${attrs}${/loading=/i.test(attrs) ? '' : ` loading="${loading}"`}${decoding}>`;
      }
      return match;
    }

    const alt = readAttr(attrs, 'alt');
    const width = Number(readAttr(attrs, 'width')) || undefined;
    const height = Number(readAttr(attrs, 'height')) || undefined;
    const priority = /fetchpriority="high"/i.test(attrs);
    const loading = priority ? 'eager' : readAttr(attrs, 'loading') || 'lazy';
    const sizes = priority
      ? '100vw'
      : readAttr(attrs, 'sizes') || '(max-width: 767px) 100vw, (max-width: 1199px) 80vw, 960px';

    return renderPicture(src, {
      alt,
      width,
      height,
      loading,
      priority,
      sizes,
      pageSlug
    });
  });

  return out;
}

function rewriteBodyHtml(html, pageSlug, locale, slugLookup, resolveLocaleSlug) {
  if (!html) {
    return '';
  }

  const resolve = (target) => {
    const normalized = normalizeHrefTarget(target);
    if (!normalized || normalized.startsWith('http') || normalized.startsWith('mailto:') || normalized.startsWith('#')) {
      return normalized;
    }
    if (/\.[a-z0-9]+$/i.test(normalized)) {
      return slugToRelative(pageSlug, normalized);
    }
    const localeSlug = resolveLocaleSlug(normalized, locale, slugLookup);
    return slugToRelative(pageSlug, localeSlug);
  };

  let out = html;

  out = out.replace(/\shref="(\/[^"]*)"/g, (_, target) => ` href="${resolve(target)}"`);
  out = out.replace(/\shref="\.\/([^"]*)"/g, (_, rel) => ` href="${resolve(`/${rel}`)}"`);
  out = out.replace(/\shref="(?:\.\.\/)+([^"]*)"/g, (_, rel) => {
    if (rel.startsWith('assets/')) {
      return ` href="${slugToAsset(pageSlug, `/${rel}`)}"`;
    }
    return ` href="${resolve(`/${rel}`)}"`;
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

  return enhanceImagesInHtml(out, pageSlug);
}

module.exports = {
  ROOT,
  slugDepth,
  slugToBase,
  slugToRelative,
  slugToAsset,
  outputPathForPage,
  rewriteBodyHtml
};
