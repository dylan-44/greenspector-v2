#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const registry = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'content/registry.json'), 'utf8')
);

function pageJsonPath(locale, pagePath) {
  const rel = pagePath === 'index' ? 'index.json' : `${pagePath}.json`;
  return path.join(ROOT, 'content', locale, 'pages', rel);
}

let errors = 0;

for (const page of registry.pages) {
  for (const locale of registry.locales) {
    const jsonPath = pageJsonPath(locale, page.path);
    if (!fs.existsSync(jsonPath)) {
      console.error(`Missing: content/${locale}/pages/${page.path === 'index' ? 'index.json' : `${page.path}.json`}`);
      errors += 1;
    } else {
      try {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        if (!data.meta?.title || !data.meta?.description) {
          console.error(`Invalid meta in ${jsonPath}`);
          errors += 1;
        }
        if (!data.hero?.title) {
          console.error(`Missing hero.title in ${jsonPath}`);
          errors += 1;
        }
      } catch (err) {
        console.error(`Parse error ${jsonPath}: ${err.message}`);
        errors += 1;
      }
    }
  }
}

for (const locale of registry.locales) {
  for (const file of ['navigation.json', 'case-studies.json']) {
    const filePath = path.join(ROOT, 'content', locale, file);
    if (!fs.existsSync(filePath)) {
      console.error(`Missing: content/${locale}/${file}`);
      errors += 1;
    }
  }
}

if (errors) {
  console.error(`Validation failed with ${errors} error(s).`);
  process.exit(1);
}

console.log('Content validation passed.');
