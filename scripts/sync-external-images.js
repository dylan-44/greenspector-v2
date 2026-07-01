#!/usr/bin/env node
/*
  Sync external images referenced in HTML files.

  - Scans all .html files in the workspace.
  - Extracts <img src="..."> absolute URLs.
  - Downloads each image into assets/img/external/...
  - Writes a mapping file: assets/img/external/url-map.json

  Optional flag:
  --rewrite : rewrite HTML img src to local relative paths.
*/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const https = require('https');

const ROOT = process.cwd();
const EXTERNAL_ROOT = path.join(ROOT, 'assets', 'img', 'external');
const MAP_PATH = path.join(EXTERNAL_ROOT, 'url-map.json');
const REWRITE = process.argv.includes('--rewrite');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function walkHtmlFiles(dirPath, out = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(full, out);
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function extractImgSrcs(html) {
  const urls = [];
  const regex = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

function isAbsoluteHttpUrl(value) {
  return /^https?:\/\//i.test(value || '');
}

function normalizeWebArchiveCandidates(urlString) {
  const candidates = [];
  candidates.push(urlString);

  const archiveRegex = /^https?:\/\/web\.archive\.org\/web\/[^/]+(?:im_)?\/(https?:\/\/.*)$/i;
  const m = urlString.match(archiveRegex);
  if (m && m[1]) {
    candidates.unshift(m[1]);
  }

  return [...new Set(candidates)];
}

function safeBasenameFromUrl(urlObj) {
  const raw = path.basename(urlObj.pathname || '') || 'image';
  const clean = raw.replace(/[^a-zA-Z0-9._-]/g, '_');
  return clean || 'image';
}

function extFromContentType(contentType) {
  if (!contentType) return '';
  const ct = contentType.toLowerCase();
  if (ct.includes('image/jpeg')) return '.jpg';
  if (ct.includes('image/png')) return '.png';
  if (ct.includes('image/webp')) return '.webp';
  if (ct.includes('image/gif')) return '.gif';
  if (ct.includes('image/svg+xml')) return '.svg';
  if (ct.includes('image/avif')) return '.avif';
  return '';
}

function requestUrl(urlString, redirects = 0) {
  return new Promise((resolve, reject) => {
    const client = urlString.startsWith('https://') ? https : http;
    const req = client.get(urlString, { timeout: 20000 }, (res) => {
      const status = res.statusCode || 0;

      if (status >= 300 && status < 400 && res.headers.location && redirects < 5) {
        const nextUrl = new URL(res.headers.location, urlString).toString();
        res.resume();
        requestUrl(nextUrl, redirects + 1).then(resolve).catch(reject);
        return;
      }

      if (status < 200 || status >= 300) {
        res.resume();
        reject(new Error(`HTTP ${status}`));
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          buffer,
          contentType: res.headers['content-type'] || '',
          finalUrl: urlString
        });
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Timeout'));
    });

    req.on('error', reject);
  });
}

async function downloadWithFallbacks(sourceUrl) {
  const candidates = normalizeWebArchiveCandidates(sourceUrl);
  let lastError = null;
  for (const candidate of candidates) {
    try {
      const result = await requestUrl(candidate);
      return { ...result, fetchedFrom: candidate };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Download failed');
}

function hash8(value) {
  return crypto.createHash('sha1').update(value).digest('hex').slice(0, 8);
}

function relativePosix(fromFile, toFile) {
  const rel = path.relative(path.dirname(fromFile), toFile);
  return rel.split(path.sep).join('/');
}

async function main() {
  ensureDir(EXTERNAL_ROOT);

  const htmlFiles = walkHtmlFiles(ROOT);
  const urlToFiles = new Map();

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const srcs = extractImgSrcs(content).filter(isAbsoluteHttpUrl);
    for (const src of srcs) {
      if (!urlToFiles.has(src)) urlToFiles.set(src, new Set());
      urlToFiles.get(src).add(file);
    }
  }

  const urls = [...urlToFiles.keys()];
  if (urls.length === 0) {
    console.log('No external <img src> URLs found.');
    return;
  }

  console.log(`Found ${urls.length} external image URLs.`);

  const map = {};
  const failures = [];
  let downloaded = 0;
  let reused = 0;

  for (const sourceUrl of urls) {
    let urlObj;
    try {
      urlObj = new URL(sourceUrl);
    } catch (err) {
      failures.push({ url: sourceUrl, reason: 'Invalid URL' });
      continue;
    }

    const hostDir = urlObj.hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const hash = hash8(sourceUrl);
    const baseName = safeBasenameFromUrl(urlObj);
    const parsed = path.parse(baseName);

    const dir = path.join(EXTERNAL_ROOT, hostDir);
    ensureDir(dir);

    let finalPath = path.join(dir, `${parsed.name}_${hash}${parsed.ext || ''}`);

    if (!fs.existsSync(finalPath) || fs.statSync(finalPath).size === 0) {
      try {
        const data = await downloadWithFallbacks(sourceUrl);
        if (!parsed.ext) {
          const ext = extFromContentType(data.contentType);
          finalPath = path.join(dir, `${parsed.name}_${hash}${ext}`);
        }
        fs.writeFileSync(finalPath, data.buffer);
        downloaded += 1;
      } catch (err) {
        failures.push({ url: sourceUrl, reason: String(err.message || err) });
        continue;
      }
    } else {
      reused += 1;
    }

    const relFromRoot = path.relative(ROOT, finalPath).split(path.sep).join('/');
    map[sourceUrl] = relFromRoot;
  }

  fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2) + '\n', 'utf8');

  let rewrittenFiles = 0;
  if (REWRITE) {
    for (const file of htmlFiles) {
      let content = fs.readFileSync(file, 'utf8');
      let changed = false;

      content = content.replace(/(<img\b[^>]*\bsrc\s*=\s*["'])([^"']+)(["'][^>]*>)/gi, (full, pre, src, post) => {
        if (!map[src]) return full;
        const targetAbs = path.join(ROOT, map[src]);
        const rel = relativePosix(file, targetAbs);
        changed = true;
        return `${pre}${rel}${post}`;
      });

      if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        rewrittenFiles += 1;
      }
    }
  }

  console.log(`Downloaded: ${downloaded}`);
  console.log(`Reused existing: ${reused}`);
  console.log(`Mapped URLs: ${Object.keys(map).length}`);
  console.log(`Failures: ${failures.length}`);
  console.log(`Map file: ${path.relative(ROOT, MAP_PATH).split(path.sep).join('/')}`);

  if (REWRITE) {
    console.log(`Rewritten HTML files: ${rewrittenFiles}`);
  }

  if (failures.length) {
    const failPath = path.join(EXTERNAL_ROOT, 'download-failures.json');
    fs.writeFileSync(failPath, JSON.stringify(failures, null, 2) + '\n', 'utf8');
    console.log(`Failures detail: ${path.relative(ROOT, failPath).split(path.sep).join('/')}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
