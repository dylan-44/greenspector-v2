const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const IMG_ROOT = path.join(ROOT, 'assets/img');
const RASTER_EXT = new Set(['.png', '.jpg', '.jpeg']);
const WIDTHS = [640, 960, 1280];

function listRasterImages(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listRasterImages(fullPath, files);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (RASTER_EXT.has(ext)) {
      files.push(fullPath);
    }
  }
  return files;
}

function variantPath(sourcePath, width) {
  const parsed = path.parse(sourcePath);
  return path.join(parsed.dir, `${parsed.name}-${width}w.webp`);
}

function webpPath(sourcePath) {
  const parsed = path.parse(sourcePath);
  return path.join(parsed.dir, `${parsed.name}.webp`);
}

function hasVariant(sourcePath, width) {
  return fs.existsSync(variantPath(sourcePath, width));
}

function getImageMeta(sourcePath) {
  const manifestPath = `${sourcePath}.meta.json`;
  if (fs.existsSync(manifestPath)) {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  }
  return null;
}

function normalizeAssetPath(src) {
  if (!src || src.startsWith('http')) {
    return src;
  }
  const cleaned = src.replace(/^(\.\/|\.\.\/)+/, '').replace(/^\//, '');
  return cleaned.startsWith('assets/') ? `/${cleaned}` : `/${cleaned}`;
}

function renderPicture(src, options = {}) {
  const {
    alt = '',
    width,
    height,
    loading = 'lazy',
    priority = false,
    sizes = '(max-width: 767px) 100vw, (max-width: 1199px) 80vw, 960px',
    pageSlug = '/'
  } = options;

  const { slugToAsset } = require('./paths');
  const esc = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const assetPath = normalizeAssetPath(src);
  const resolvedSrc = src.startsWith('http') ? src : slugToAsset(pageSlug, assetPath);
  const absolutePath = src.startsWith('http')
    ? null
    : path.join(ROOT, assetPath.replace(/^\//, '').replace(/\//g, path.sep));

  const attrs = [];
  if (width) attrs.push(`width="${width}"`);
  if (height) attrs.push(`height="${height}"`);
  if (priority) {
    attrs.push('fetchpriority="high"');
    attrs.push('decoding="async"');
  } else {
    attrs.push(`loading="${loading}"`);
    attrs.push('decoding="async"');
  }

  if (!absolutePath || !fs.existsSync(absolutePath)) {
    return `<img src="${esc(resolvedSrc)}" alt="${esc(alt)}" ${attrs.join(' ')}>`;
  }

  const ext = path.extname(absolutePath).toLowerCase();
  if (!RASTER_EXT.has(ext)) {
    return `<img src="${esc(resolvedSrc)}" alt="${esc(alt)}" ${attrs.join(' ')}>`;
  }

  const meta = getImageMeta(absolutePath);
  const relBase = resolvedSrc.replace(/\.[^.]+$/, '');
  const webpDefault = `${relBase}.webp`;
  const defaultWebpExists = fs.existsSync(webpPath(absolutePath));

  const srcsetParts = WIDTHS.filter((w) => hasVariant(absolutePath, w)).map((w) => {
    const variantRel = `${relBase}-${w}w.webp`;
    return `${esc(variantRel)} ${w}w`;
  });

  if (!srcsetParts.length && defaultWebpExists) {
    return `<picture>
  <source srcset="${esc(webpDefault)}" type="image/webp">
  <img src="${esc(resolvedSrc)}" alt="${esc(alt)}" ${attrs.join(' ')}>
</picture>`;
  }

  if (!srcsetParts.length) {
    return `<img src="${esc(resolvedSrc)}" alt="${esc(alt)}" ${attrs.join(' ')}>`;
  }

  const imgWidth = meta?.width || width;
  const imgHeight = meta?.height || height;
  const imgAttrs = [];
  if (imgWidth) imgAttrs.push(`width="${imgWidth}"`);
  if (imgHeight) imgAttrs.push(`height="${imgHeight}"`);
  if (priority) {
    imgAttrs.push('fetchpriority="high"');
    imgAttrs.push('decoding="async"');
  } else {
    imgAttrs.push(`loading="${loading}"`);
    imgAttrs.push('decoding="async"');
  }

  return `<picture>
  <source srcset="${srcsetParts.join(', ')}" sizes="${esc(sizes)}" type="image/webp">
  <img src="${esc(resolvedSrc)}" alt="${esc(alt)}" ${imgAttrs.join(' ')}>
</picture>`;
}

module.exports = {
  IMG_ROOT,
  RASTER_EXT,
  WIDTHS,
  listRasterImages,
  variantPath,
  webpPath,
  renderPicture
};
