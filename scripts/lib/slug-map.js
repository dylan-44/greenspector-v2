const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

function loadSlugMap() {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/slug-map.json'), 'utf8'));
  const frToEn = {};
  const enToFr = {};

  for (const [id, entry] of Object.entries(raw)) {
    frToEn[id] = entry;
  }

  return { byId: raw, frToEn };
}

function buildSlugLookup(registryPages) {
  const frToEnSlug = {};
  const enToFrSlug = {};

  for (const page of registryPages) {
    const slugFr = normalizeSlug(page.slugFr || page.slug);
    const slugEn = normalizeSlug(page.slugEn || (slugFr === '/' ? '/en/' : `/en${slugFr}`));

    frToEnSlug[slugFr] = slugEn;
    enToFrSlug[slugEn] = slugFr;
  }

  return { frToEnSlug, enToFrSlug };
}

function normalizeSlug(slug, trailingSlash = true) {
  if (!slug || slug === '/') {
    return '/';
  }
  let out = slug.startsWith('/') ? slug : `/${slug}`;
  if (trailingSlash && !out.endsWith('/')) {
    out = `${out}/`;
  }
  if (!trailingSlash && out.endsWith('/') && out.length > 1) {
    out = out.slice(0, -1);
  }
  return out;
}

function resolveLocaleSlug(rawSlug, locale, lookup) {
  if (!rawSlug || rawSlug.startsWith('http') || rawSlug.startsWith('mailto:') || rawSlug.startsWith('#')) {
    return rawSlug;
  }

  const normalized = normalizeSlug(rawSlug);

  if (locale === 'en') {
    if (normalized.startsWith('/en/') || normalized === '/en/') {
      return normalized;
    }
    return lookup.frToEnSlug[normalized] || `/en${normalized === '/' ? '/' : normalized}`;
  }

  if (normalized.startsWith('/en/')) {
    return lookup.enToFrSlug[normalized] || normalized.replace(/^\/en/, '') || '/';
  }

  return normalized;
}

function pathEnToOutputPath(pathEn) {
  if (pathEn === 'index') {
    return path.join(ROOT, 'en', 'index.html');
  }
  if (pathEn.endsWith('/index')) {
    const dir = pathEn.replace(/\/index$/, '');
    return path.join(ROOT, 'en', dir, 'index.html');
  }
  return path.join(ROOT, 'en', pathEn, 'index.html');
}

module.exports = {
  loadSlugMap,
  buildSlugLookup,
  normalizeSlug,
  resolveLocaleSlug,
  pathEnToOutputPath,
  ROOT
};
