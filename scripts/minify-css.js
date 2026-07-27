#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const https = require('https');
const CleanCSS = require('clean-css');

const ROOT = path.resolve(__dirname, '..');
const CSS_SRC = path.join(ROOT, 'assets/css/styles.css');
const CSS_OUT = path.join(ROOT, 'assets/css/styles.min.css');

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchBuffer(res.headers.location).then(resolve).catch(reject);
          return;
        }
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      })
      .on('error', reject);
  });
}

async function ensureBootstrapVendor() {
  const vendorDir = path.join(ROOT, 'assets/vendor/bootstrap');
  fs.mkdirSync(vendorDir, { recursive: true });

  const files = [
    {
      url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
      out: 'bootstrap.min.css'
    },
    {
      url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
      out: 'bootstrap.bundle.min.js'
    }
  ];

  for (const file of files) {
    const target = path.join(vendorDir, file.out);
    if (!fs.existsSync(target)) {
      const buffer = await fetchBuffer(file.url);
      fs.writeFileSync(target, buffer);
      console.log(`Downloaded ${file.out}`);
    }
  }
}

function minifyCss() {
  const source = fs.readFileSync(CSS_SRC, 'utf8');
  const result = new CleanCSS({ level: 1 }).minify(source);
  if (result.errors.length) {
    throw new Error(result.errors.join('\n'));
  }
  fs.writeFileSync(CSS_OUT, result.styles);
  console.log(`Minified CSS: ${(source.length / 1024).toFixed(1)}KB -> ${(result.styles.length / 1024).toFixed(1)}KB`);
}

async function main() {
  await ensureBootstrapVendor();
  minifyCss();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
