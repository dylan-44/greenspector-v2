#!/usr/bin/env node
/**
 * Liste les articles WP contenant des liens relatifs (href="/..." etc.)
 * Usage: node scripts/audit-relative-links.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'content/redirects/relative-links-by-article.json');
const WP_API = 'https://greenspector.com/wp-json/wp/v2/posts';

function fetchJsonWithHeaders(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'greenspector-v2-relative-links-audit' } }, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`${url} → HTTP ${res.statusCode}`));
            return;
          }
          resolve({
            json: JSON.parse(data),
            totalPages: Number(res.headers['x-wp-totalpages'] || 1),
          });
        });
      })
      .on('error', reject);
  });
}

function isRelativeInternal(href) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) {
    return false;
  }
  if (href.startsWith('//')) return false;
  if (/^https?:/i.test(href)) return false;
  return href.startsWith('/') || href.startsWith('./') || href.startsWith('../');
}

function isMarketingRelative(href) {
  if (!isRelativeInternal(href)) return false;
  if (href.includes('/wp-content/')) return false;
  if (href.startsWith('/wp-admin') || href.startsWith('/wp-json')) return false;
  return true;
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

function stripHtml(s) {
  return (s || '').replace(/<[^>]+>/g, '').trim();
}

async function fetchAllPosts() {
  const first = await fetchJsonWithHeaders(`${WP_API}?per_page=100&page=1&status=publish`);
  const posts = [...first.json];
  for (let page = 2; page <= first.totalPages; page += 1) {
    const batch = await fetchJsonWithHeaders(`${WP_API}?per_page=100&page=${page}&status=publish`);
    posts.push(...batch.json);
  }
  return posts;
}

async function main() {
  console.log('Extraction des liens relatifs dans les articles WordPress…\n');
  const posts = await fetchAllPosts();
  const articles = [];
  const hrefCounts = new Map();

  for (const post of posts) {
    const html = post.content?.rendered || '';
    const relativeLinks = extractHrefs(html).filter(isRelativeInternal);
    if (!relativeLinks.length) continue;

    const marketingLinks = relativeLinks.filter(isMarketingRelative);
    articles.push({
      id: post.id,
      title: stripHtml(post.title?.rendered),
      url: post.link,
      slug: new URL(post.link).pathname,
      relativeLinks,
      marketingLinks,
    });

    for (const href of relativeLinks) {
      hrefCounts.set(href, (hrefCounts.get(href) || 0) + 1);
    }
  }

  articles.sort((a, b) => b.marketingLinks.length - a.marketingLinks.length);

  const report = {
    generatedAt: new Date().toISOString(),
    totalPosts: posts.length,
    articlesWithRelativeLinks: articles.length,
    articlesWithMarketingRelativeLinks: articles.filter((a) => a.marketingLinks.length > 0).length,
    uniqueRelativeHrefs: [...hrefCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([href, count]) => ({ href, count })),
    articles,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log(`Articles analysés : ${report.totalPosts}`);
  console.log(`Avec liens relatifs (tous) : ${report.articlesWithRelativeLinks}`);
  console.log(`Avec liens relatifs marketing (hors wp-content) : ${report.articlesWithMarketingRelativeLinks}`);
  console.log(`\nRapport : ${OUT_PATH}`);

  const topMarketing = report.uniqueRelativeHrefs.filter(
    (x) => !x.href.includes('/wp-content/') && !x.href.startsWith('/wp-admin')
  );
  if (topMarketing.length) {
    console.log('\nTop liens relatifs marketing :');
    for (const { href, count } of topMarketing.slice(0, 20)) {
      console.log(`  ${count}× ${href}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
