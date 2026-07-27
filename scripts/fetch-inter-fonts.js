#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets/fonts/inter');
const API_URL =
  'https://gwfh.mranftl.com/api/fonts/inter?download=zip&subsets=latin&formats=woff2&variants=regular,600,700,800';

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

async function main() {
  const AdmZip = require('adm-zip');
  const buffer = await fetchBuffer(API_URL);
  const zip = new AdmZip(buffer);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const renameMap = {
    'inter-v20-latin-regular.woff2': 'inter-400.woff2',
    'inter-v20-latin-600.woff2': 'inter-600.woff2',
    'inter-v20-latin-700.woff2': 'inter-700.woff2',
    'inter-v20-latin-800.woff2': 'inter-800.woff2'
  };

  for (const entry of zip.getEntries()) {
    if (!entry.entryName.endsWith('.woff2')) {
      continue;
    }
    const base = path.basename(entry.entryName);
    const outName = renameMap[base] || base;
    fs.writeFileSync(path.join(OUT_DIR, outName), entry.getData());
    console.log(`Wrote ${outName}`);
  }

  console.log('Inter fonts ready in assets/fonts/inter/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
