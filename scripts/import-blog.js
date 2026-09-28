#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const WP_ORIGIN = 'https://blog.greenspector.com';
const USER_AGENT = 'GreenspectorBlogImport/1.0 (+https://greenspector.com/)';
const IMG_ROOT = path.join(ROOT, 'assets/img/external/blog.greenspector.com');
const BLOG_INDEX_FR = '/ressources/blog/';
const BLOG_INDEX_EN = '/en/resources/blog/';

const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre'
];

const ALLOWED_TAGS = new Set([
  'p',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'figure',
  'figcaption',
  'blockquote',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'pre',
  'code',
  'strong',
  'em',
  'b',
  'i',
  'br',
  'hr',
  'iframe'
]);

const VOID_TAGS = new Set(['img', 'br', 'hr']);

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”')
    .replace(/&ldquo;/g, '“')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…');
}

function stripTags(html) {
  return decodeHtml(String(html || '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function request(url, { binary = false, redirects = 0, accept } = {}) {
  return new Promise((resolve, reject) => {
    if (redirects > 6) {
      reject(new Error(`Too many redirects: ${url}`));
      return;
    }

    const client = url.startsWith('http://') ? http : https;
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: accept || (binary ? '*/*' : 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8')
        },
        timeout: 30000
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = new URL(res.headers.location, url).href;
          res.resume();
          request(next, { binary, redirects: redirects + 1, accept }).then(resolve, reject);
          return;
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }

        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(binary ? buffer : buffer.toString('utf8'));
        });
      }
    );
    req.on('timeout', () => {
      req.destroy(new Error(`Timeout ${url}`));
    });
    req.on('error', reject);
  });
}

async function requestJson(url) {
  const body = await request(url, { accept: 'application/json' });
  const trimmed = String(body).trim();
  if (trimmed.startsWith('<')) {
    throw new Error(`Expected JSON from ${url}, received HTML`);
  }
  return JSON.parse(trimmed);
}

async function mapPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await fn(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

function localeFromLink(link) {
  try {
    const pathname = new URL(link).pathname;
    return pathname === '/en/' || pathname.startsWith('/en/') ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
}

function slugFromLink(link) {
  const pathname = new URL(link).pathname.replace(/\/+$/, '');
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'en') {
    return parts.slice(1).join('/');
  }
  return parts.join('/');
}

function isVideoSrc(src) {
  try {
    const host = new URL(src, WP_ORIGIN).hostname.replace(/^www\./, '');
    return (
      host === 'youtube.com' ||
      host === 'youtu.be' ||
      host === 'youtube-nocookie.com' ||
      host === 'vimeo.com' ||
      host === 'player.vimeo.com'
    );
  } catch {
    return false;
  }
}

function readAttr(attrs, name) {
  const quoted = attrs.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  if (!quoted) {
    return '';
  }
  return quoted[2] || quoted[3] || quoted[4] || '';
}

function sanitizeAttrs(tag, attrs, rewriteHref, rewriteSrc) {
  if (tag === 'a') {
    const href = rewriteHref(readAttr(attrs, 'href'));
    if (!href) {
      return '';
    }
    const extra = [];
    const target = readAttr(attrs, 'target');
    const rel = readAttr(attrs, 'rel');
    if (target === '_blank') {
      extra.push('target="_blank"', 'rel="noopener noreferrer"');
    } else if (rel) {
      extra.push(`rel="${rel.replace(/"/g, '')}"`);
    }
    return ` href="${href.replace(/"/g, '&quot;')}"${extra.length ? ` ${extra.join(' ')}` : ''}`;
  }

  if (tag === 'img') {
    const src = rewriteSrc(cleanMediaUrl(readAttr(attrs, 'src') || readAttr(attrs, 'data-src')));
    if (!src) {
      return null;
    }
    const alt = decodeHtml(readAttr(attrs, 'alt')).replace(/"/g, '&quot;');
    const width = readAttr(attrs, 'width');
    const height = readAttr(attrs, 'height');
    const size = `${width && /^\d+$/.test(width) ? ` width="${width}"` : ''}${
      height && /^\d+$/.test(height) ? ` height="${height}"` : ''
    }`;
    return ` src="${src.replace(/"/g, '&quot;')}" alt="${alt}" loading="lazy" decoding="async"${size}`;
  }

  if (tag === 'iframe') {
    const src = cleanMediaUrl(readAttr(attrs, 'src') || readAttr(attrs, 'data-src'));
    if (!src || !isVideoSrc(src)) {
      return null;
    }
    return ` src="${src.replace(/"/g, '&quot;')}" title="Video" allowfullscreen loading="lazy"`;
  }

  if (tag === 'th' || tag === 'td') {
    const bits = [];
    const colspan = readAttr(attrs, 'colspan');
    const rowspan = readAttr(attrs, 'rowspan');
    if (colspan) bits.push(`colspan="${colspan.replace(/"/g, '')}"`);
    if (rowspan) bits.push(`rowspan="${rowspan.replace(/"/g, '')}"`);
    return bits.length ? ` ${bits.join(' ')}` : '';
  }

  return '';
}

function sanitizeHtml(html, rewriteHref, rewriteSrc) {
  let out = String(html || '');
  out = out.replace(/<!--[\s\S]*?-->/g, '');
  out = out.replace(/<style[\s\S]*?<\/style>/gi, '');
  out = out.replace(/<script[\s\S]*?<\/script>/gi, '');
  out = out.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  out = out.replace(/<link\b[^>]*>/gi, '');
  out = out.replace(/<h1(\b[^>]*)>/gi, '<h2$1>');
  out = out.replace(/<\/h1>/gi, '</h2>');

  out = out.replace(/<\/?([a-zA-Z0-9:-]+)([^>]*)\/?>/g, (match, rawName, rawAttrs) => {
    const tag = rawName.toLowerCase();
    const isClose = match.startsWith('</');
    if (!ALLOWED_TAGS.has(tag)) {
      return '';
    }
    if (isClose) {
      return VOID_TAGS.has(tag) ? '' : `</${tag}>`;
    }
    const attrs = sanitizeAttrs(tag, rawAttrs || '', rewriteHref, rewriteSrc);
    if (attrs === null) {
      return '';
    }
    if (VOID_TAGS.has(tag) || /\/>$/.test(match)) {
      if (tag === 'img' || tag === 'iframe') {
        return `<${tag}${attrs}>`;
      }
      return `<${tag}${attrs}>`;
    }
    return `<${tag}${attrs}>`;
  });

  out = out
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
    .replace(/<li>(?:\s|&nbsp;)*<\/li>/gi, '')
    .replace(/<figure>\s*<\/figure>/gi, '')
    .replace(/(<br\s*\/?>\s*){3,}/gi, '<br>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return out;
}

function formatDate(iso, locale) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  if (locale === 'en') {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  }
  return `${date.getUTCDate()} ${MONTHS_FR[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function extractTranslationUrls(html, targetLocale) {
  const cls = targetLocale === 'en' ? 'lang-item-en' : 'lang-item-fr';
  const matches = [];
  const blockRe = new RegExp(`${cls}[\\s\\S]{0,500}?href\\s*=\\s*("([^"]+)"|'([^']+)'|([^\\s>]+))`, 'gi');
  let block;
  while ((block = blockRe.exec(html))) {
    matches.push((block[2] || block[3] || block[4] || '').trim());
  }
  return [...new Set(matches.filter(Boolean))];
}

function extractTranslationUrl(html, targetLocale) {
  return extractTranslationUrls(html, targetLocale)[0] || '';
}

function pickTranslationSlug(html, targetLocale, knownSlugs) {
  for (const url of extractTranslationUrls(html, targetLocale)) {
    const slug = slugFromLink(url);
    if (slug && knownSlugs.has(slug)) {
      return slug;
    }
  }
  return '';
}

function cleanMediaUrl(value) {
  let src = decodeHtml(String(value || '')).trim();
  src = src.replace(/^["']+|["']+$/g, '');
  src = src.replace(/\\+/g, '');
  src = src.replace(/^https?:\/\/https?:\/\//i, 'https://');
  src = src.replace(/^(https?:)\/{2,}/i, '$1//');
  return src;
}

function isUsableTranslation(url, postsByLink) {
  if (!url) {
    return false;
  }
  let parsed;
  try {
    parsed = new URL(url, WP_ORIGIN);
  } catch {
    return false;
  }
  const pathname = parsed.pathname.replace(/\/+$/, '') || '/';
  if (
    pathname === '/' ||
    pathname === '/en' ||
    pathname === '/blog-fr' ||
    pathname === '/en/blog-en' ||
    pathname === '/fr'
  ) {
    return false;
  }
  const normalized = `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}/`;
  return Boolean(postsByLink[normalized]);
}

function localImagePath(remoteUrl) {
  const parsed = new URL(remoteUrl);
  let pathname = decodeURIComponent(parsed.pathname);
  pathname = pathname.replace(/^\/+/, '');
  if (parsed.hostname.includes('wp.com') && pathname.startsWith('blog.greenspector.com/')) {
    pathname = pathname.slice('blog.greenspector.com/'.length);
  }
  pathname = pathname.replace(/^wp-content\/uploads\//, '');
  const safe = pathname.replace(/[^a-zA-Z0-9._/-]/g, '_');
  return {
    abs: path.join(IMG_ROOT, safe),
    href: `/assets/img/external/blog.greenspector.com/${safe}`
  };
}

async function downloadImage(remoteUrl, cache) {
  if (!remoteUrl || cache.has(remoteUrl)) {
    return cache.get(remoteUrl) || '';
  }

  let absolute;
  try {
    absolute = new URL(remoteUrl, WP_ORIGIN).href.split('?')[0];
  } catch {
    return '';
  }

  if (!/^https?:\/\//i.test(absolute)) {
    return '';
  }

  const { abs, href } = localImagePath(absolute);
  if (fs.existsSync(abs) && fs.statSync(abs).size > 0) {
    cache.set(remoteUrl, href);
    cache.set(absolute, href);
    return href;
  }

  try {
    const buffer = await request(absolute, { binary: true });
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, buffer);
    cache.set(remoteUrl, href);
    cache.set(absolute, href);
    return href;
  } catch (err) {
    console.warn(`Image failed: ${absolute} (${err.message})`);
    cache.set(remoteUrl, '');
    return '';
  }
}

function rewriteHrefFactory(postsByLink) {
  return function rewriteHref(href) {
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return href;
    }

    let parsed;
    try {
      parsed = new URL(href, WP_ORIGIN);
    } catch {
      return href;
    }

    const host = parsed.hostname.replace(/^www\./, '');
    if (host !== 'blog.greenspector.com' && host !== 'greenspector.com') {
      return parsed.href;
    }

    const normalized = `${WP_ORIGIN}${parsed.pathname.replace(/\/+$/, '')}/`.replace(
      'https://greenspector.com',
      WP_ORIGIN
    );
    const post = postsByLink[`${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}/`];
    if (post) {
      return post.locale === 'en' ? `${BLOG_INDEX_EN}${post.slug}/` : `${BLOG_INDEX_FR}${post.slug}/`;
    }

    if (host === 'blog.greenspector.com') {
      const slug = slugFromLink(parsed.href);
      if (!slug) {
        return parsed.pathname.startsWith('/en') ? BLOG_INDEX_EN : BLOG_INDEX_FR;
      }
      return parsed.pathname.startsWith('/en/') ? `${BLOG_INDEX_EN}${slug}/` : `${BLOG_INDEX_FR}${slug}/`;
    }

    return parsed.pathname || href;
  };
}

async function fetchAllPosts() {
  const posts = [];
  const fields = 'id,link,slug,date,title,excerpt,featured_media,categories';
  for (let page = 1; page <= 10; page += 1) {
    const url = `${WP_ORIGIN}/wp-json/wp/v2/posts?per_page=100&page=${page}&_fields=${fields}`;
    const batch = await requestJson(url);
    if (!Array.isArray(batch) || !batch.length) {
      break;
    }
    posts.push(...batch);
    if (batch.length < 100) {
      break;
    }
  }
  return posts;
}

function extractBalancedDiv(html, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < html.length; i += 1) {
    if (html.startsWith('<div', i) || html.startsWith('<DIV', i)) {
      depth += 1;
      const tagEnd = html.indexOf('>', i);
      i = tagEnd === -1 ? i : tagEnd;
    } else if (html.startsWith('</div>', i) || html.startsWith('</DIV>', i)) {
      depth -= 1;
      if (depth === 0) {
        return html.slice(openIndex, i + 6);
      }
      i += 5;
    }
  }
  return '';
}

function extractPostContent(html) {
  const match = html.match(/<div[^>]*elementor-widget-theme-post-content[^>]*>/i);
  if (match) {
    const widget = extractBalancedDiv(html, html.indexOf(match[0]));
    const inner = widget.match(/<div[^>]*elementor-widget-container[^>]*>([\s\S]*)<\/div>\s*$/i);
    return inner ? inner[1] : widget;
  }
  return html;
}

async function hydratePost(post) {
  const url = `${WP_ORIGIN}/wp-json/wp/v2/posts/${post.id}?_fields=content,yoast_head_json`;
  const body = await request(url, { accept: 'application/json' });
  const trimmed = String(body).trim();

  if (trimmed.startsWith('{')) {
    const detail = JSON.parse(trimmed);
    post.content = detail.content || { rendered: '' };
    post.yoast_head_json = detail.yoast_head_json || {};
    return post;
  }

  post.publicHtml = trimmed;
  post.content = { rendered: extractPostContent(trimmed) };
  try {
    const yoast = await requestJson(`${WP_ORIGIN}/wp-json/wp/v2/posts/${post.id}?_fields=yoast_head_json`);
    post.yoast_head_json = yoast.yoast_head_json || {};
  } catch {
    post.yoast_head_json = {};
  }
  return post;
}

async function fetchCategories() {
  const items = await requestJson(`${WP_ORIGIN}/wp-json/wp/v2/categories?per_page=100&_fields=id,name`);
  const map = {};
  for (const item of items) {
    map[item.id] = decodeHtml(item.name);
  }
  return map;
}

function bestMediaCandidate(media) {
  const candidates = [];
  const push = (url, width, height) => {
    const clean = String(url || '').split('?')[0];
    const w = Number(width) || 0;
    const h = Number(height) || 0;
    if (!clean || w < 1 || h < 1) {
      return;
    }
    candidates.push({
      url: clean,
      width: w,
      height: h,
      score: Math.min(w, h) * 1000000 + w * h
    });
  };

  const details = media?.media_details || {};
  push(media?.source_url, details.width, details.height);
  for (const size of Object.values(details.sizes || {})) {
    push(size.source_url, size.width, size.height);
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || null;
}

async function fetchMediaUrl(id, cache) {
  if (!id) {
    return '';
  }
  if (cache.has(id)) {
    return cache.get(id);
  }
  try {
    const media = await requestJson(`${WP_ORIGIN}/wp-json/wp/v2/media/${id}?_fields=source_url,media_details`);
    const best = bestMediaCandidate(media);
    const url = best?.url || media.source_url || '';
    cache.set(id, url);
    return url;
  } catch {
    cache.set(id, '');
    return '';
  }
}

function replaceImageHref(value, fromHref, toHref) {
  if (typeof value === 'string') {
    return value.split(fromHref).join(toHref);
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceImageHref(item, fromHref, toHref));
  }
  if (value && typeof value === 'object') {
    const next = {};
    for (const [key, item] of Object.entries(value)) {
      next[key] = replaceImageHref(item, fromHref, toHref);
    }
    return next;
  }
  return value;
}

async function upgradeFeaturedImages() {
  const sharp = require('sharp');
  const posts = [];
  for (let page = 1; page <= 10; page += 1) {
    const batch = await requestJson(
      `${WP_ORIGIN}/wp-json/wp/v2/posts?per_page=100&page=${page}&_fields=slug,featured_media`
    );
    if (!Array.isArray(batch) || !batch.length) {
      break;
    }
    posts.push(...batch);
    if (batch.length < 100) {
      break;
    }
  }

  const mediaIds = [...new Set(posts.map((post) => post.featured_media).filter(Boolean))];
  const mediaById = new Map();
  for (let offset = 0; offset < mediaIds.length; offset += 50) {
    const chunk = mediaIds.slice(offset, offset + 50);
    const items = await requestJson(
      `${WP_ORIGIN}/wp-json/wp/v2/media?include=${chunk.join(',')}&per_page=50&_fields=id,source_url,media_details`
    );
    for (const item of items) {
      mediaById.set(item.id, item);
    }
  }

  const contentFiles = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) {
      return;
    }
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.json')) {
        contentFiles.push(full);
      }
    }
  };
  walk(path.join(ROOT, 'content/fr/pages/ressources/blog'));
  walk(path.join(ROOT, 'content/en/pages/ressources/blog'));
  contentFiles.push(path.join(ROOT, 'content/fr/blog.json'), path.join(ROOT, 'content/en/blog.json'));

  const cardImages = new Map();
  for (const file of ['content/fr/blog.json', 'content/en/blog.json']) {
    for (const card of loadJson(path.join(ROOT, file))) {
      if (card.slug && card.image) {
        cardImages.set(String(card.slug).replace(/\/$/, ''), card.image);
      }
    }
  }

  let upgraded = 0;
  let skipped = 0;
  const replaced = new Set();

  for (const post of posts) {
    const currentHref = cardImages.get(post.slug);
    const media = mediaById.get(post.featured_media);
    const best = bestMediaCandidate(media);
    if (!currentHref || !best) {
      skipped += 1;
      continue;
    }

    const currentAbs = path.join(ROOT, currentHref.replace(/^\//, ''));
    if (!fs.existsSync(currentAbs)) {
      skipped += 1;
      continue;
    }

    const local = await sharp(currentAbs).metadata();
    const localScore = Math.min(local.width || 0, local.height || 0);
    const bestScore = Math.min(best.width, best.height);
    if (bestScore < localScore * 1.25) {
      skipped += 1;
      continue;
    }

    const nextHref = await downloadImage(best.url, new Map());
    if (!nextHref || nextHref === currentHref || replaced.has(currentHref)) {
      skipped += 1;
      continue;
    }

    for (const file of contentFiles) {
      const data = loadJson(file);
      const next = replaceImageHref(data, currentHref, nextHref);
      if (JSON.stringify(next) !== JSON.stringify(data)) {
        writeJson(file, next);
      }
    }
    replaced.add(currentHref);
    upgraded += 1;
    console.log(`${local.width}x${local.height} -> ${best.width}x${best.height} ${post.slug}`);
  }

  console.log(`Upgraded ${upgraded} featured images, unchanged ${skipped}`);
}

function collectContentImageHrefs() {
  const hrefs = new Set();
  const files = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) {
      return;
    }
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.json')) {
        files.push(full);
      }
    }
  };
  walk(path.join(ROOT, 'content/fr/pages/ressources/blog'));
  walk(path.join(ROOT, 'content/en/pages/ressources/blog'));
  files.push(path.join(ROOT, 'content/fr/blog.json'), path.join(ROOT, 'content/en/blog.json'));

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    for (const match of raw.matchAll(/\/assets\/img\/external\/blog\.greenspector\.com\/[^"\\]+\.(?:jpe?g|png|webp|gif)/gi)) {
      hrefs.add(match[0]);
    }
  }
  return { hrefs: [...hrefs], files };
}

async function upgradeDerivativeImages() {
  const sharp = require('sharp');
  const { hrefs, files } = collectContentImageHrefs();
  const sized = hrefs.filter((href) => /-\d+x\d+\.(?:jpe?g|png|webp|gif)$/i.test(href));
  const upgrades = (
    await mapPool(sized, 4, async (href) => {
      const remote = `${WP_ORIGIN}/wp-content/uploads/${href.split('/blog.greenspector.com/')[1]}`;
      const originalRemote = remote.replace(/-\d+x\d+(?=\.(?:jpe?g|png|webp|gif)$)/i, '');
      if (originalRemote === remote) {
        return null;
      }

      const currentAbs = path.join(ROOT, href.replace(/^\//, ''));
      if (!fs.existsSync(currentAbs)) {
        return null;
      }

      const nextHrefGuess = localImagePath(originalRemote).href;
      const alreadyOnDisk = fs.existsSync(path.join(ROOT, nextHrefGuess.replace(/^\//, '')));
      const nextHref = await downloadImage(originalRemote, new Map());
      if (!nextHref || nextHref === href) {
        return null;
      }

      const nextAbs = path.join(ROOT, nextHref.replace(/^\//, ''));
      let currentMeta;
      let nextMeta;
      try {
        currentMeta = await sharp(currentAbs).metadata();
        nextMeta = await sharp(nextAbs).metadata();
      } catch {
        if (!alreadyOnDisk) {
          fs.rmSync(nextAbs, { force: true });
        }
        return null;
      }

      const currentMin = Math.min(currentMeta.width || 0, currentMeta.height || 0);
      const nextMin = Math.min(nextMeta.width || 0, nextMeta.height || 0);
      if (nextMin < currentMin * 1.15) {
        if (!alreadyOnDisk) {
          try {
            fs.rmSync(nextAbs, { force: true });
          } catch {
            /* file may still be open */
          }
        }
        return null;
      }

      return {
        href,
        nextHref,
        label: `${currentMeta.width}x${currentMeta.height} -> ${nextMeta.width}x${nextMeta.height} ${path.basename(nextHref)}`
      };
    })
  ).filter(Boolean);

  for (const upgrade of upgrades) {
    for (const file of files) {
      const raw = fs.readFileSync(file, 'utf8');
      if (!raw.includes(upgrade.href)) {
        continue;
      }
      writeJson(file, replaceImageHref(JSON.parse(raw), upgrade.href, upgrade.nextHref));
    }
    console.log(upgrade.label);
  }

  console.log(`Upgraded ${upgrades.length} article images, originals missing or not larger: ${sized.length - upgrades.length}`);
}

function buildPageJson(post, locale, bodyHtml, imageHref, categoryName) {
  const title = decodeHtml(post.title?.rendered || '');
  const description =
    stripTags(post.yoast_head_json?.description || '') || stripTags(post.excerpt?.rendered || '');
  const dateLabel = formatDate(post.date, locale);
  const pills = [dateLabel, categoryName].filter(Boolean);
  const metaPills = pills.map((item) => `<span>${item.replace(/</g, '&lt;')}</span>`).join('');

  return {
    id: post.pageId,
    slug: locale === 'en' ? `${BLOG_INDEX_EN}${post.slug}/` : `${BLOG_INDEX_FR}${post.slug}/`,
    template: 'html',
    meta: {
      title: stripTags(post.yoast_head_json?.title || '') || `${title} | Greenspector`,
      description: description || title,
      keywords: categoryName || 'Greenspector blog',
      ogTitle: title,
      ogDescription: description || title,
      ...(imageHref ? { ogImage: imageHref } : {})
    },
    hero: {
      label: 'Blog',
      title
    },
    bodyHtml: `<div class="content-panel blog-article">
  ${metaPills ? `<div class="content-meta">${metaPills}</div>` : ''}
  <div class="blog-article__body">
    ${bodyHtml}
  </div>
</div>`
  };
}

function upsertRegistry(registry, entries) {
  const kept = registry.pages.filter((page) => !String(page.id).startsWith('blog-') || page.id === 'blog-index');
  const index = kept.findIndex((page) => page.id === 'blog-index');
  const head = index === -1 ? kept : kept.slice(0, index + 1);
  const tail = index === -1 ? [] : kept.slice(index + 1);
  registry.pages = [...head, ...entries, ...tail];
  return registry;
}

function upsertSlugMap(slugMap, entries) {
  for (const key of Object.keys(slugMap)) {
    if (key.startsWith('blog-') && key !== 'blog-index') {
      delete slugMap[key];
    }
  }
  Object.assign(slugMap, entries);
  return slugMap;
}

async function repairPairs() {
  const slugs = loadJson(path.join(ROOT, 'content/blog-slugs.json'));
  const registry = loadJson(path.join(ROOT, 'content/registry.json'));
  const slugMap = loadJson(path.join(ROOT, 'content/slug-map.json'));
  const blogEn = loadJson(path.join(ROOT, 'content/en/blog.json'));
  const enSet = new Set(slugs.en);
  const unpaired = slugs.fr.filter((slug) => slugMap[`blog-${slug}`]?.pathEn === 'resources/blog/_untranslated');
  console.log(`Repairing ${unpaired.length} unpaired FR articles`);

  const found = [];
  await mapPool(unpaired, 6, async (frSlug) => {
    try {
      const html = await request(`${WP_ORIGIN}/${frSlug}/`);
      const enSlug = pickTranslationSlug(html, 'en', enSet);
      if (enSlug) {
        found.push({ frSlug, enSlug });
        console.log(`  paired ${frSlug} -> ${enSlug}`);
      }
    } catch (err) {
      console.warn(`Repair pairing failed for ${frSlug}: ${err.message}`);
    }
  });

  console.log(`Repair found ${found.length} additional pairs`);

  const usedEn = new Set();
  for (const { frSlug, enSlug } of found) {
    if (usedEn.has(enSlug)) {
      continue;
    }
    usedEn.add(enSlug);
    const frId = `blog-${frSlug}`;
    const enId = `blog-${enSlug}`;
    const enPathOld = path.join(ROOT, 'content/en/pages/ressources/blog', `${enSlug}.json`);
    const enPathNew = path.join(ROOT, 'content/en/pages/ressources/blog', `${frSlug}.json`);
    if (fs.existsSync(enPathOld) && enPathOld !== enPathNew) {
      fs.mkdirSync(path.dirname(enPathNew), { recursive: true });
      fs.renameSync(enPathOld, enPathNew);
    }

    const frPage = registry.pages.find((page) => page.id === frId);
    if (frPage) {
      delete frPage.locales;
      frPage.slug = `${BLOG_INDEX_FR}${frSlug}/`;
    }
    registry.pages = registry.pages.filter((page) => page.id !== enId);
    slugMap[frId] = {
      pathEn: `resources/blog/${enSlug}`,
      slugEn: `${BLOG_INDEX_EN}${enSlug}/`
    };
    delete slugMap[enId];

    const card = blogEn.find((item) => item.slug === `${enSlug}/` || item.href === `${BLOG_INDEX_EN}${enSlug}/`);
    if (card) {
      card.href = `${BLOG_INDEX_EN}${enSlug}/`;
    }
  }

  writeJson(path.join(ROOT, 'content/registry.json'), registry);
  writeJson(path.join(ROOT, 'content/slug-map.json'), slugMap);
  writeJson(path.join(ROOT, 'content/en/blog.json'), blogEn);
  writeJson(path.join(ROOT, 'content/blog-slugs.json'), {
    ...slugs,
    generatedAt: new Date().toISOString(),
    counts: {
      ...slugs.counts,
      pairs: (slugs.counts.pairs || 0) + found.length,
      frOnly: Math.max(0, (slugs.counts.frOnly || 0) - found.length),
      enOnly: Math.max(0, (slugs.counts.enOnly || 0) - found.length),
      repaired: found.length
    }
  });
  require('./generate-blog-redirects').retargetImportedBlogRedirects();
  console.log('Pair repair complete');
}

async function main() {
  if (process.argv.includes('--upgrade-images')) {
    await upgradeFeaturedImages();
    await upgradeDerivativeImages();
    return;
  }
  if (process.argv.includes('--repair-pairs')) {
    await repairPairs();
    return;
  }

  console.log('Fetching WordPress posts…');
  const [rawPosts, categories] = await Promise.all([fetchAllPosts(), fetchCategories()]);
  console.log(`Fetched ${rawPosts.length} post summaries, ${Object.keys(categories).length} categories`);
  console.log('Hydrating post content…');
  await mapPool(rawPosts, 6, hydratePost);
  console.log('Content hydrated');

  const posts = rawPosts.map((post) => {
    const locale = localeFromLink(post.link);
    const slug = slugFromLink(post.link);
    return {
      ...post,
      locale,
      slug,
      normalizedLink: `${new URL(post.link).origin}${new URL(post.link).pathname.replace(/\/+$/, '')}/`
    };
  });

  const postsByLink = Object.fromEntries(posts.map((post) => [post.normalizedLink, post]));

  console.log('Resolving Polylang pairs…');
  const pairingSources = posts.filter((post) => post.locale === 'fr');
  await mapPool(pairingSources, 6, async (post) => {
    try {
      const html = await request(post.link);
      post.publicHtml = html;
      const translation = extractTranslationUrl(html, 'en');
      if (isUsableTranslation(translation, postsByLink)) {
        const normalized = `${new URL(translation, WP_ORIGIN).origin}${new URL(translation, WP_ORIGIN).pathname.replace(
          /\/+$/,
          ''
        )}/`;
        post.translation = postsByLink[normalized];
      }
    } catch (err) {
      console.warn(`Pairing failed for ${post.link}: ${err.message}`);
    }
  });

  const unpairedEn = posts.filter((post) => post.locale === 'en' && !posts.some((fr) => fr.translation === post));
  await mapPool(unpairedEn, 6, async (post) => {
    try {
      const html = await request(post.link);
      post.publicHtml = html;
      const translation = extractTranslationUrl(html, 'fr');
      if (isUsableTranslation(translation, postsByLink)) {
        const normalized = `${new URL(translation, WP_ORIGIN).origin}${new URL(translation, WP_ORIGIN).pathname.replace(
          /\/+$/,
          ''
        )}/`;
        post.translation = postsByLink[normalized];
      }
    } catch (err) {
      console.warn(`Pairing failed for ${post.link}: ${err.message}`);
    }
  });

  for (const post of posts) {
    if (post.translation && !post.translation.translation) {
      post.translation.translation = post;
    }
  }

  const paired = [];
  const seen = new Set();
  const frOnly = [];
  const enOnly = [];

  for (const post of posts) {
    if (seen.has(post.id)) {
      continue;
    }
    if (post.translation && post.locale === 'fr') {
      paired.push({ fr: post, en: post.translation });
      seen.add(post.id);
      seen.add(post.translation.id);
    } else if (post.translation && post.locale === 'en') {
      paired.push({ fr: post.translation, en: post });
      seen.add(post.id);
      seen.add(post.translation.id);
    }
  }

  for (const post of posts) {
    if (seen.has(post.id)) {
      continue;
    }
    if (post.locale === 'fr') {
      frOnly.push(post);
    } else {
      enOnly.push(post);
    }
    seen.add(post.id);
  }

  console.log(`Pairs: ${paired.length}, FR-only: ${frOnly.length}, EN-only: ${enOnly.length}`);

  const imageCache = new Map();
  const mediaCache = new Map();
  const rewriteHref = rewriteHrefFactory(postsByLink);

  async function preparePost(post) {
    const remoteImages = [];
    const yoastImage = post.yoast_head_json?.og_image?.[0]?.url;
    const featuredRemote = (await fetchMediaUrl(post.featured_media, mediaCache)) || yoastImage || '';
    if (featuredRemote) {
      remoteImages.push(featuredRemote);
    }

    const collected = [];
    String(post.content?.rendered || '').replace(/<img\b[^>]*?(?:src|data-src)\s*=\s*("([^"]+)"|'([^']+)'|([^\s>]+))/gi, (match, _a, a, b, c) => {
      collected.push(a || b || c);
      return match;
    });
    remoteImages.push(...collected);

    const srcMap = new Map();
    for (const remote of remoteImages) {
      const local = await downloadImage(remote, imageCache);
      if (local) {
        srcMap.set(remote, local);
        try {
          srcMap.set(new URL(remote, WP_ORIGIN).href, local);
        } catch {
          /* ignore */
        }
      }
    }

    const rewriteSrc = (src) => {
      if (!src) {
        return '';
      }
      if (srcMap.get(src)) {
        return srcMap.get(src);
      }
      try {
        const abs = new URL(src, WP_ORIGIN).href.split('?')[0];
        if (srcMap.get(abs)) {
          return srcMap.get(abs);
        }
        if (abs.includes('blog.greenspector.com') || abs.includes('wp.com')) {
          return srcMap.get(abs) || abs;
        }
      } catch {
        return src;
      }
      return src;
    };

    const bodyHtml = sanitizeHtml(post.content?.rendered || '', rewriteHref, rewriteSrc);
    const imageHref = featuredRemote ? srcMap.get(featuredRemote) || srcMap.get(new URL(featuredRemote, WP_ORIGIN).href) : '';
    const categoryName = (post.categories || []).map((id) => categories[id]).find(Boolean) || '';
    return { bodyHtml, imageHref, categoryName };
  }

  const registryEntries = [];
  const slugMapEntries = {};
  const cardsFr = [];
  const cardsEn = [];
  const slugs = { fr: [], en: [] };

  async function writePair(fr, en) {
    const pageId = `blog-${fr.slug}`;
    fr.pageId = pageId;
    if (en) {
      en.pageId = pageId;
    }

    const preparedFr = await preparePost(fr);
    writeJson(path.join(ROOT, 'content/fr/pages/ressources/blog', `${fr.slug}.json`), buildPageJson(fr, 'fr', preparedFr.bodyHtml, preparedFr.imageHref, preparedFr.categoryName));

    slugs.fr.push(fr.slug);
    cardsFr.push({
      slug: `${fr.slug}/`,
      href: `${BLOG_INDEX_FR}${fr.slug}/`,
      title: decodeHtml(fr.title?.rendered || ''),
      description: stripTags(fr.yoast_head_json?.description || fr.excerpt?.rendered || ''),
      image: preparedFr.imageHref || '',
      date: fr.date
    });

    if (en) {
      const preparedEn = await preparePost(en);
      writeJson(path.join(ROOT, 'content/en/pages/ressources/blog', `${fr.slug}.json`), buildPageJson(en, 'en', preparedEn.bodyHtml, preparedEn.imageHref, preparedEn.categoryName));
      slugs.en.push(en.slug);
      cardsEn.push({
        slug: `${en.slug}/`,
        href: `${BLOG_INDEX_EN}${en.slug}/`,
        title: decodeHtml(en.title?.rendered || ''),
        description: stripTags(en.yoast_head_json?.description || en.excerpt?.rendered || ''),
        image: preparedEn.imageHref || '',
        date: en.date
      });
      registryEntries.push({
        id: pageId,
        path: `ressources/blog/${fr.slug}`,
        slug: `${BLOG_INDEX_FR}${fr.slug}/`,
        template: 'html',
        status: 'published'
      });
      slugMapEntries[pageId] = {
        pathEn: `resources/blog/${en.slug}`,
        slugEn: `${BLOG_INDEX_EN}${en.slug}/`
      };
    } else {
      registryEntries.push({
        id: pageId,
        path: `ressources/blog/${fr.slug}`,
        slug: `${BLOG_INDEX_FR}${fr.slug}/`,
        template: 'html',
        status: 'published',
        locales: ['fr']
      });
      slugMapEntries[pageId] = {
        pathEn: 'resources/blog/_untranslated',
        slugEn: BLOG_INDEX_EN
      };
    }
  }

  console.log('Importing paired articles…');
  for (const [index, pair] of paired.entries()) {
    console.log(`  pair ${index + 1}/${paired.length}: ${pair.fr.slug}`);
    await writePair(pair.fr, pair.en);
  }

  console.log('Importing FR-only articles…');
  for (const [index, post] of frOnly.entries()) {
    console.log(`  fr-only ${index + 1}/${frOnly.length}: ${post.slug}`);
    await writePair(post, null);
  }

  console.log('Importing EN-only articles…');
  for (const [index, post] of enOnly.entries()) {
    const pageId = `blog-${post.slug}`;
    post.pageId = pageId;
    console.log(`  en-only ${index + 1}/${enOnly.length}: ${post.slug}`);
    const prepared = await preparePost(post);
    writeJson(path.join(ROOT, 'content/en/pages/ressources/blog', `${post.slug}.json`), buildPageJson(post, 'en', prepared.bodyHtml, prepared.imageHref, prepared.categoryName));
    slugs.en.push(post.slug);
    cardsEn.push({
      slug: `${post.slug}/`,
      href: `${BLOG_INDEX_EN}${post.slug}/`,
      title: decodeHtml(post.title?.rendered || ''),
      description: stripTags(post.yoast_head_json?.description || post.excerpt?.rendered || ''),
      image: prepared.imageHref || '',
      date: post.date
    });
    registryEntries.push({
      id: pageId,
      path: `ressources/blog/${post.slug}`,
      slug: BLOG_INDEX_FR,
      template: 'html',
      status: 'published',
      locales: ['en']
    });
    slugMapEntries[pageId] = {
      pathEn: `resources/blog/${post.slug}`,
      slugEn: `${BLOG_INDEX_EN}${post.slug}/`
    };
  }

  const byDateDesc = (a, b) => String(b.date).localeCompare(String(a.date));
  writeJson(path.join(ROOT, 'content/fr/blog.json'), cardsFr.sort(byDateDesc).map(({ date, ...rest }) => rest));
  writeJson(path.join(ROOT, 'content/en/blog.json'), cardsEn.sort(byDateDesc).map(({ date, ...rest }) => rest));
  writeJson(path.join(ROOT, 'content/blog-slugs.json'), {
    generatedAt: new Date().toISOString(),
    fr: slugs.fr.sort(),
    en: slugs.en.sort(),
    counts: { fr: slugs.fr.length, en: slugs.en.length, pairs: paired.length, frOnly: frOnly.length, enOnly: enOnly.length }
  });

  const registry = loadJson(path.join(ROOT, 'content/registry.json'));
  writeJson(path.join(ROOT, 'content/registry.json'), upsertRegistry(registry, registryEntries));

  const slugMap = loadJson(path.join(ROOT, 'content/slug-map.json'));
  writeJson(path.join(ROOT, 'content/slug-map.json'), upsertSlugMap(slugMap, slugMapEntries));

  console.log(`Wrote ${registryEntries.length} registry entries (${slugs.fr.length} FR, ${slugs.en.length} EN)`);
  require('./generate-blog-redirects').retargetImportedBlogRedirects();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
