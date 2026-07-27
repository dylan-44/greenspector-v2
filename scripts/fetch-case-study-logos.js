#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'img', 'case-studies', 'logos');

const REMOTE_LOGOS = [
  {
    id: 'bordeaux-metropole',
    url: 'https://www.bordeaux-metropole.fr/sites/MET-BXMETRO-DRUPAL/themes/custom/bx_metro_theme/assets/build/svg/logo-bordeaux-metropole-black.svg',
    file: 'bordeaux-metropole.svg'
  },
  {
    id: 'bruxelles-environnement',
    url: 'https://environnement.brussels/themes/custom/ocelot_baseline/components/logo/assets/logo.svg',
    file: 'bruxelles-environnement.svg'
  }
];

function download(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(
        url,
        {
          headers: {
            'User-Agent': 'greenspector-v2/1.0 (+https://greenspector.com)'
          }
        },
        (response) => {
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            download(response.headers.location).then(resolve, reject);
            return;
          }

          if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode} for ${url}`));
            return;
          }

          const chunks = [];
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => resolve(Buffer.concat(chunks)));
        }
      )
      .on('error', reject);
  });
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of REMOTE_LOGOS) {
    const outPath = path.join(OUT_DIR, entry.file);
    if (fs.existsSync(outPath)) {
      console.log(`Skip ${entry.id} (already exists)`);
      skipped += 1;
      continue;
    }

    try {
      const data = await download(entry.url);
      fs.writeFileSync(outPath, data);
      console.log(`Downloaded ${entry.id} -> ${path.relative(ROOT, outPath)} (${data.length} bytes)`);
      downloaded += 1;
    } catch (error) {
      console.warn(`Failed ${entry.id}: ${error.message}`);
      failed += 1;
    }
  }

  console.log(`Done. downloaded=${downloaded} skipped=${skipped} failed=${failed}`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

main();
