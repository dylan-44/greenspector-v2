/**
 * Génère .htaccess complet : marketing + legacy + pages + articles blog
 *
 * Usage: node scripts/generate-blog-redirects.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITEMAP_PATH = path.join(ROOT, 'content/post-sitemap.xml');
const MARKETING_PATH = path.join(__dirname, 'redirects/marketing.htaccess');
const LEGACY_PREFIX_PATH = path.join(__dirname, 'redirects/legacy-prefix.htaccess');
const CANONICAL_HOST_PATH = path.join(__dirname, 'redirects/canonical-host.htaccess');
const PAGE_REDIRECTS_PATH = path.join(__dirname, 'redirects/page-redirects.json');
const AUDIT_REPORT_PATH = path.join(ROOT, 'content/redirects/link-audit-report.json');
const OUT_PATH = path.join(ROOT, '.htaccess');

const BLOG_HOST = 'https://blog.greenspector.com';

const MARKETING_FR_SLUGS = new Set([
  'mesure-performance-et-energie-du-numerique',
  'impact-environnemental-numerique',
  'pilotez-ecoconception-par-les-resultats',
  'diagnostic-batterie-performance-2',
  'diagnostic-batterie-performance',
  'devgreenops-3',
  'devgreenops',
  'green-testing-qa',
  'gs-pour-la-performance-applicative',
  'services-conseils-2',
  'audit-application-mobile',
  'tarifs',
  'contactez-nous',
  'login',
  'l-entreprise',
  'a-propos-equipe-greenspector',
  'partenaires',
  'etude-de-cas',
  'certification-bordeaux-fr',
  'certification-site-web-bordeaux-metropole',
  'mentions-legales',
  'cgu',
  'publications',
  'webinaires',
  'plan-du-site',
  'blog-fr',
]);

const MARKETING_EN_SLUGS = new Set([
  'home',
  'overview',
  'environmental-impacts',
  'green-testing-and-qa',
  'drive-eco-design-through-results',
  'troubleshooot-battery-and-performance',
  'devgreenops-and-continuous-integration',
  'consulting-and-services',
  'pricing',
  'contact-us',
  'our-partners',
  'the-company',
  'blog-en',
  'legal-notices',
  'gcu',
  'publications',
  'webinar',
  'site-map',
  'our-services',
]);

function escapeRewritePattern(slug) {
  return slug.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
}

function pathFromUrl(url) {
  const p = url.replace('https://greenspector.com', '').replace(/\/$/, '');
  return p.startsWith('/') ? p : `/${p}`;
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
  if (p.startsWith('/fr/')) p = p.slice(3) || '/';
  p = p.replace(/^\/en\/articles\/\d{4}-\d{2}-\d{2}-/, '/en/');
  p = p.replace(/^\/fr\/articles\/\d{4}-\d{2}-\d{2}-/, '/');
  p = p.replace(/^\/articles\/\d{4}-\d{2}-\d{2}-/, '/');
  return normalizePath(p);
}

function loadPostSlugSets(xml) {
  const fr = new Set();
  const en = new Set();
  const urls = [...xml.matchAll(/<loc>(https:\/\/greenspector\.com\/[^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const url of urls) {
    const p = pathFromUrl(url);
    if (p.startsWith('/en/')) {
      en.add(p.slice(4).replace(/\/$/, ''));
    } else {
      fr.add(p.replace(/^\//, '').replace(/\/$/, ''));
    }
  }
  return { fr, en };
}

function parsePostUrls(xml) {
  const fr = [];
  const en = [];
  const urls = [...xml.matchAll(/<loc>(https:\/\/greenspector\.com\/[^<]+)<\/loc>/g)].map((m) => m[1]);

  for (const url of urls) {
    const p = pathFromUrl(url);
    if (p.startsWith('/en/')) {
      const slug = p.slice(4).replace(/\/$/, '');
      if (!slug || MARKETING_EN_SLUGS.has(slug.split('/')[0])) continue;
      en.push(slug);
    } else {
      const slug = p.replace(/^\//, '').replace(/\/$/, '');
      if (!slug || MARKETING_FR_SLUGS.has(slug.split('/')[0])) continue;
      fr.push(slug);
    }
  }
  return { fr, en };
}

function loadMarketingPatterns(marketingText) {
  const patterns = new Set();
  for (const line of marketingText.split('\n')) {
    const m = line.match(/^RewriteRule \^(.+?)\s+/);
    if (!m) continue;
    let pat = m[1];
    if (pat.includes('(') || pat.includes('[')) continue;
    pat = pat.replace(/\\\//g, '/').replace(/\\\./g, '.').replace(/\$$/, '').replace(/\/\?$/, '');
    patterns.add(normalizePath(`/${pat.replace(/^\^/, '').replace(/^\//, '')}`));
  }
  return patterns;
}

function splitMarketing(text) {
  const marker = '# --- Greenspector Studio';
  const idx = text.indexOf(marker);
  if (idx === -1) return [text.trim(), ''];
  return [text.slice(0, idx).trim(), text.slice(idx).trim()];
}

function pathnameToRewriteSource(pathname) {
  const inner = pathname.replace(/^\//, '').replace(/\/$/, '');
  if (!inner) return null;
  return `^${escapeRewritePattern(inner)}/?$`;
}

function buildExplicitRules(pageRedirects) {
  const lines = [];
  const seen = new Set();
  for (const [from, to] of Object.entries(pageRedirects)) {
    const src = normalizePath(from);
    const pat = pathnameToRewriteSource(src);
    if (!pat || seen.has(pat)) continue;
    seen.add(pat);
    const target = to.startsWith('http') ? to : normalizePath(to);
    lines.push(`RewriteRule ${pat} ${target} [R=301,L,NC]`);
  }
  return lines;
}

function resolveAuditTarget(pathname, postSlugs, pageRedirects, marketingPatterns) {
  const norm = normalizePath(pathname);
  if (pageRedirects[norm]) return pageRedirects[norm];

  const stripped = stripLegacyPrefixes(norm);
  const strippedSlug = stripped.replace(/^\//, '').replace(/\/$/, '');

  if (stripped.startsWith('/en/')) {
    const enSlug = stripped.slice(4).replace(/\/$/, '');
    if (postSlugs.en.has(enSlug)) return `${BLOG_HOST}/en/${enSlug}/`;
  } else if (strippedSlug && postSlugs.fr.has(strippedSlug)) {
    return `${BLOG_HOST}/${strippedSlug}/`;
  }

  if (marketingPatterns.has(stripped) || marketingPatterns.has(norm)) {
    return null;
  }

  if (norm.startsWith('/en/')) {
    return `${BLOG_HOST}/en/${norm.slice(4).replace(/\/$/, '')}/`;
  }

  if (strippedSlug && !strippedSlug.includes('.')) {
    return `${BLOG_HOST}/${strippedSlug}/`;
  }

  return `${BLOG_HOST}${norm}`;
}

function buildAuditRules(reportPath, postSlugs, pageRedirects, marketingPatterns) {
  if (!fs.existsSync(reportPath)) {
    return [];
  }
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const missing = report.missing301 || [];
  const lines = [];
  const seen = new Set();

  for (const item of missing) {
    const norm = normalizePath(item.pathname);
    const target = resolveAuditTarget(norm, postSlugs, pageRedirects, marketingPatterns);
    if (!target) continue;

    const pat = pathnameToRewriteSource(norm);
    if (!pat || seen.has(pat)) continue;

    const stripped = stripLegacyPrefixes(norm);
    const strippedSlug = stripped.replace(/^\//, '').replace(/\/$/, '');
    if (strippedSlug && postSlugs.fr.has(strippedSlug) && !norm.startsWith('/fr/') && !norm.includes('/articles/')) {
      continue;
    }
    if (norm.startsWith('/en/')) {
      const enSlug = norm.slice(4).replace(/\/$/, '');
      if (postSlugs.en.has(enSlug) && !norm.includes('/articles/')) continue;
    }

    seen.add(pat);
    const dest = target.startsWith('http') ? target : normalizePath(target);
    lines.push(`RewriteRule ${pat} ${dest} [R=301,L,NC]`);
  }

  return lines;
}

function main() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error('Missing', SITEMAP_PATH);
    process.exit(1);
  }

  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const marketing = fs.readFileSync(MARKETING_PATH, 'utf8').trim();
  const [blogInfra, marketingPages] = splitMarketing(marketing);
  const legacyPrefix = fs.existsSync(LEGACY_PREFIX_PATH)
    ? fs.readFileSync(LEGACY_PREFIX_PATH, 'utf8').trim()
    : '';
  const canonicalHost = fs.existsSync(CANONICAL_HOST_PATH)
    ? fs.readFileSync(CANONICAL_HOST_PATH, 'utf8').trim()
    : '';
  const pageRedirects = JSON.parse(fs.readFileSync(PAGE_REDIRECTS_PATH, 'utf8'));
  const marketingPatterns = loadMarketingPatterns(marketing);
  const postSlugs = loadPostSlugSets(xml);
  const { fr, en } = parsePostUrls(xml);

  const explicitRules = buildExplicitRules(pageRedirects);
  const auditRules = buildAuditRules(AUDIT_REPORT_PATH, postSlugs, pageRedirects, marketingPatterns);

  const lines = [
    '# Greenspector v2 — redirections 301 (migration WordPress → site statique + blog)',
    '# Régénérer : npm run generate-redirects',
    '# Sources : post-sitemap.xml, marketing.htaccess, page-redirects.json, link-audit-report.json',
    '',
    '<IfModule mod_rewrite.c>',
    'RewriteEngine On',
    'RewriteBase /',
    '',
    canonicalHost,
    '',
    blogInfra,
    '',
    legacyPrefix,
    '',
    marketingPages,
    '',
    `# --- Pages explicites (${explicitRules.length}) ---`,
    ...explicitRules,
    '',
    `# --- Liens internes articles (audit, ${auditRules.length}) ---`,
    ...auditRules,
    '',
    `# --- Articles blog FR (${fr.length}) → ${BLOG_HOST} ---`,
  ];

  for (const slug of fr) {
    const pat = escapeRewritePattern(slug);
    lines.push(`RewriteRule ^${pat}/?$ ${BLOG_HOST}/${slug}/ [R=301,L,NC]`);
  }

  lines.push('', `# --- Articles blog EN (${en.length}) → ${BLOG_HOST}/en/ ---`);

  for (const slug of en) {
    const pat = escapeRewritePattern(slug);
    lines.push(`RewriteRule ^en/${pat}/?$ ${BLOG_HOST}/en/${slug}/ [R=301,L,NC]`);
  }

  lines.push('', '</IfModule>', '');

  fs.writeFileSync(OUT_PATH, lines.join('\n'), 'utf8');
  console.log(`Written ${OUT_PATH}`);
  console.log(`  explicit page rules: ${explicitRules.length}`);
  console.log(`  audit-derived rules: ${auditRules.length}`);
  console.log(`  blog articles FR: ${fr.length}, EN: ${en.length}`);
}

main();
