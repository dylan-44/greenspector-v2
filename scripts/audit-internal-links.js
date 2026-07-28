#!/usr/bin/env node
/**
 * Recense les liens internes greenspector.com dans les articles WP
 * et vérifie la couverture par .htaccess (marketing + blog).
 *
 * Usage: node scripts/audit-internal-links.js
 * Sortie: content/redirects/link-audit-report.json + résumé console
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const SITEMAP_PATH = path.join(ROOT, 'content/post-sitemap.xml');
const PAGE_SITEMAP_URL = 'https://greenspector.com/page-sitemap.xml';
const WP_API = 'https://greenspector.com/wp-json/wp/v2/posts';
const REPORT_PATH = path.join(ROOT, 'content/redirects/link-audit-report.json');

const BLOG_HOST = 'blog.greenspector.com';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'greenspector-v2-link-audit' } }, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`${url} → HTTP ${res.statusCode}`));
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'greenspector-v2-link-audit' } }, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`${url} → HTTP ${res.statusCode}`));
            return;
          }
          resolve(data);
        });
      })
      .on('error', reject);
  });
}

function parseSitemapLocs(xml) {
  return [...xml.matchAll(/<loc>(https:\/\/greenspector\.com\/[^<]+)<\/loc>/g)].map((m) => m[1]);
}

function normalizeInternalUrl(href) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) {
    return null;
  }

  let url = href.trim();
  if (url.startsWith('//')) {
    url = `https:${url}`;
  }

  try {
    if (url.startsWith('/')) {
      url = `https://greenspector.com${url}`;
    }
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host !== 'greenspector.com') {
      return null;
    }
    let p = u.pathname;
    if (!p.endsWith('/') && !p.includes('.')) {
      p = `${p}/`;
    }
    return p;
  } catch {
    return null;
  }
}

function extractHrefs(html) {
  const hrefs = new Set();
  const re = /\shref\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    hrefs.add(m[1]);
  }
  return [...hrefs];
}

function loadRegistryStaticPaths() {
  const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/registry.json'), 'utf8'));
  const paths = new Set();
  const slugMap = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/slug-map.json'), 'utf8'));

  for (const page of registry.pages) {
    if (page.status === 'draft') continue;
    const slug = page.slug.replace(/^\//, '').replace(/\/$/, '');
    if (slug) paths.add(`/${slug}/`);
    const mapped = slugMap[page.id];
    if (mapped?.slugEn) paths.add(mapped.slugEn);
  }
  return paths;
}

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/';
  let p = pathname;
  if (!p.startsWith('/')) p = `/${p}`;
  if (!p.endsWith('/')) p = `${p}/`;
  return p;
}

function stripLegacyPrefixes(pathname) {
  let p = pathname.replace(/\/$/, '');
  if (p === '/fr') p = '/';
  if (p.startsWith('/fr/')) p = p.slice(3) || '/';
  p = p.replace(/^\/en\/articles\/\d{4}-\d{2}-\d{2}-/, '/en/');
  p = p.replace(/^\/fr\/articles\/\d{4}-\d{2}-\d{2}-/, '/');
  p = p.replace(/^\/articles\/\d{4}-\d{2}-\d{2}-/, '/');
  return normalizePath(p);
}

function loadHtaccessExactPaths() {
  const htaccessPath = path.join(ROOT, '.htaccess');
  if (!fs.existsSync(htaccessPath)) return new Set();
  const paths = new Set();
  const ht = fs.readFileSync(htaccessPath, 'utf8');
  for (const line of ht.split('\n')) {
    const m = line.match(/^RewriteRule \^((?:[^()[\]|$]+|\[[0-9]{4}-[0-9]{2}-[0-9]{2}\])+)\/?\$/);
    if (!m) continue;
    const raw = m[1].replace(/\\\//g, '/');
    if (raw.includes('(') || raw.includes('*')) continue;
    paths.add(normalizePath(`/${raw}`));
  }
  return paths;
}

function loadPageRedirects() {
  const file = path.join(ROOT, 'scripts/redirects/page-redirects.json');
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadMarketingRedirectSources() {
  const files = [
    path.join(ROOT, 'scripts/redirects/marketing.htaccess'),
    path.join(ROOT, 'scripts/redirects/legacy-prefix.htaccess'),
  ];
  const sources = new Set();

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const marketing = fs.readFileSync(file, 'utf8');
    for (const line of marketing.split('\n')) {
      const m = line.match(/^RewriteRule \^(.+?)\s+/);
      if (!m) continue;
      let pat = m[1];
      if (pat.includes('(') || pat.includes('*') || pat.includes('[')) continue;
      pat = pat.replace(/\\\//g, '/').replace(/\\\./g, '.').replace(/\$$/, '').replace(/\/\?$/, '');
      sources.add(normalizePath(`/${pat.replace(/^\^/, '')}`));
    }
  }

  return sources;
}

function classifyPath(pathname, ctx) {
  const norm = normalizePath(pathname);

  if (norm === '/' || norm === '/en/') {
    return { status: 'v2_static', note: 'Accueil v2' };
  }

  if (ctx.pageRedirects[norm]) {
    return { status: 'marketing_301', note: 'page-redirects.json' };
  }

  if (ctx.htaccessPaths.has(norm)) {
    return { status: 'marketing_301', note: 'Règle .htaccess explicite' };
  }

  const stripped = stripLegacyPrefixes(norm);
  if (stripped !== norm) {
    if (ctx.htaccessPaths.has(stripped) || ctx.pageRedirects[stripped]) {
      return { status: 'legacy_301', note: `Préfixe legacy → ${stripped}` };
    }
    if (ctx.postPaths.has(stripped)) {
      return { status: 'legacy_301', note: `Préfixe legacy → article ${stripped}` };
    }
    if (ctx.v2Paths.has(stripped)) {
      return { status: 'legacy_301', note: `Préfixe legacy → v2 ${stripped}` };
    }
    if (ctx.marketingSources.has(stripped)) {
      return { status: 'legacy_301', note: `Préfixe legacy → marketing ${stripped}` };
    }
  }

  if (ctx.v2Paths.has(norm)) {
    return { status: 'v2_static', note: 'Page v2 (même chemin)' };
  }

  if (ctx.marketingSources.has(norm)) {
    return { status: 'marketing_301', note: 'Règle marketing .htaccess' };
  }

  if (
    norm.startsWith('/blog-fr/') ||
    norm === '/blog-fr/' ||
    norm.startsWith('/en/blog-en/') ||
    norm === '/en/blog-en/' ||
    norm.startsWith('/wp-content/') ||
    norm.startsWith('/wp-admin') ||
    norm.startsWith('/wp-json/') ||
    norm === '/feed/' ||
    norm.startsWith('/comments/feed') ||
    norm.startsWith('/blog/') ||
    norm.startsWith('/author/') ||
    norm.startsWith('/fr/news/') ||
    norm.startsWith('/news/') ||
    /^\/20\d{2}\//.test(norm)
  ) {
    return { status: 'blog_301', note: 'Règle globale → blog.greenspector.com' };
  }

  if (norm.startsWith('/downloads/')) {
    return { status: 'blog_301', note: 'downloads → wp-content blog' };
  }

  if (ctx.postPaths.has(norm) || ctx.postPaths.has(stripped)) {
    return { status: 'blog_301', note: 'Article blog (post-sitemap)' };
  }

  if (norm.startsWith('/fr/') || norm === '/fr/') {
    return { status: 'legacy_301', note: 'Couvert par règle /fr/' };
  }

  if (ctx.pagePaths.has(norm)) {
    return { status: 'missing_301', note: 'Page WP (page-sitemap) sans redirection' };
  }

  return { status: 'missing_301', note: 'Aucune règle connue — risque 404' };
}

function fetchJsonWithHeaders(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'greenspector-v2-link-audit' } }, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`${url} → HTTP ${res.statusCode}`));
            return;
          }
          try {
            resolve({
              json: JSON.parse(data),
              totalPages: Number(res.headers['x-wp-totalpages'] || 1),
              total: Number(res.headers['x-wp-total'] || 0),
            });
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

async function fetchAllPosts() {
  const posts = [];
  const first = await fetchJsonWithHeaders(`${WP_API}?per_page=100&page=1&status=publish`);
  posts.push(...first.json);
  const totalPages = first.totalPages;

  for (let page = 2; page <= totalPages; page += 1) {
    const batch = await fetchJsonWithHeaders(`${WP_API}?per_page=100&page=${page}&status=publish`);
    posts.push(...batch.json);
    process.stdout.write(`  posts ${page}/${totalPages}\r`);
  }

  console.log(`\n  ${posts.length} articles chargés via API`);
  return posts;
}

async function main() {
  console.log('Audit des liens internes dans les articles WordPress…\n');

  const postXml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const postPaths = new Set(
    parseSitemapLocs(postXml).map((u) => {
      const p = u.replace('https://greenspector.com', '');
      return p.endsWith('/') ? p : `${p}/`;
    })
  );

  let pagePaths = new Set();
  try {
    const pageXml = await fetchText(PAGE_SITEMAP_URL);
    pagePaths = new Set(
      parseSitemapLocs(pageXml).map((u) => {
        const p = u.replace('https://greenspector.com', '');
        return p.endsWith('/') ? p : `${p}/`;
      })
    );
  } catch (e) {
    console.warn('  page-sitemap non chargé:', e.message);
  }

  const rawPageRedirects = loadPageRedirects();
  const pageRedirects = Object.fromEntries(
    Object.entries(rawPageRedirects).map(([k, v]) => [normalizePath(k), v])
  );

  const ctx = {
    postPaths,
    pagePaths,
    v2Paths: loadRegistryStaticPaths(),
    marketingSources: loadMarketingRedirectSources(),
    pageRedirects,
    htaccessPaths: loadHtaccessExactPaths(),
  };

  const posts = await fetchAllPosts();

  const linkIndex = new Map();
  const byPost = [];

  for (const post of posts) {
    const html = post.content?.rendered || '';
    const hrefs = extractHrefs(html);
    const postPath = new URL(post.link).pathname;
    const internal = [];

    for (const href of hrefs) {
      const pathname = normalizeInternalUrl(href);
      if (!pathname) continue;

      const classification = classifyPath(pathname, ctx);
      internal.push({ href, pathname, ...classification });

      if (!linkIndex.has(pathname)) {
        linkIndex.set(pathname, {
          pathname,
          status: classification.status,
          note: classification.note,
          exampleHrefs: [],
          foundInPosts: [],
        });
      }
      const entry = linkIndex.get(pathname);
      if (!entry.exampleHrefs.includes(href)) entry.exampleHrefs.push(href);
      if (!entry.foundInPosts.includes(postPath)) entry.foundInPosts.push(postPath);
    }

    if (internal.length) {
      byPost.push({
        id: post.id,
        title: post.title?.rendered,
        link: post.link,
        internalLinks: internal,
      });
    }
  }

  const all = [...linkIndex.values()];
  const summary = {
    totalPosts: posts.length,
    postsWithInternalLinks: byPost.length,
    uniqueInternalPaths: all.length,
    byStatus: {},
  };

  for (const item of all) {
    summary.byStatus[item.status] = (summary.byStatus[item.status] || 0) + 1;
  }

  const missing = all.filter((x) => x.status === 'missing_301').sort((a, b) => b.foundInPosts.length - a.foundInPosts.length);

  const report = {
    generatedAt: new Date().toISOString(),
    summary,
    missing301: missing,
    allPaths: all.sort((a, b) => a.pathname.localeCompare(b.pathname)),
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n--- Résumé ---');
  console.log(`Articles analysés : ${summary.totalPosts}`);
  console.log(`Articles avec liens internes : ${summary.postsWithInternalLinks}`);
  console.log(`URLs internes uniques : ${summary.uniqueInternalPaths}`);
  for (const [status, count] of Object.entries(summary.byStatus)) {
    console.log(`  ${status}: ${count}`);
  }

  if (missing.length) {
    console.log('\n--- URLs à risque (pas de 301 marketing / blog) ---');
    for (const m of missing.slice(0, 25)) {
      console.log(`  ${m.pathname}  (${m.foundInPosts.length} article(s)) — ${m.note}`);
    }
    if (missing.length > 25) {
      console.log(`  … et ${missing.length - 25} autres (voir ${REPORT_PATH})`);
    }
  } else {
    console.log('\nAucune URL interne non couverte détectée.');
  }

  console.log(`\nRapport complet : ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
