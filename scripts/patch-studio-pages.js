#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LOCALES = ['fr', 'en'];

const DEMO_CTA = {
  fr: { label: 'Demander une démo', href: '/contact/' },
  en: { label: 'Request a demo', href: '/contact/' }
};

function demoActions(locale) {
  const cta = DEMO_CTA[locale];
  return [
    {
      label: cta.label,
      href: cta.href,
      primary: true,
      external: false
    }
  ];
}

function removeFootnotes(html) {
  let out = html;
  out = out.replace(/\s*<p class="studio-footnote">[\s\S]*?<\/p>\s*/g, '\n');
  out = out.replace(
    /\s*<p><em>Certaines fonctionnalités[\s\S]*?<\/em><\/p>\s*/gi,
    '\n'
  );
  out = out.replace(
    /\s*<p><em>Some features[\s\S]*?<\/em><\/p>\s*/gi,
    '\n'
  );
  return out;
}

function moveQuoteToMiddle(html) {
  const quoteRe = /<section class="studio-section studio-quote-section"[\s\S]*?<\/section>\s*/;
  const quoteMatch = html.match(quoteRe);
  if (!quoteMatch) {
    return html;
  }

  const quote = quoteMatch[0];
  const withoutQuote = html.replace(quoteRe, '');
  const sectionRe = /<section\b[\s\S]*?<\/section>/g;
  const sections = [];

  let match;
  while ((match = sectionRe.exec(withoutQuote)) !== null) {
    sections.push({ text: match[0], index: match.index });
  }

  if (!sections.length) {
    return html;
  }

  const insertAt = Math.floor(sections.length / 2);
  let out = withoutQuote.slice(0, sections[0].index);

  for (let i = 0; i < sections.length; i += 1) {
    if (i === insertAt) {
      out += quote;
    }
    out += sections[i].text;
    const end = sections[i].index + sections[i].text.length;
    const nextStart = i + 1 < sections.length ? sections[i + 1].index : withoutQuote.length;
    out += withoutQuote.slice(end, nextStart);
  }

  return out;
}

function patchPage(filePath, locale) {
  const page = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (page.hero) {
    page.hero.actions = demoActions(locale);
  }

  if (page.bodyHtml) {
    let html = removeFootnotes(page.bodyHtml);
    html = moveQuoteToMiddle(html);
    page.bodyHtml = html;
  }

  fs.writeFileSync(filePath, `${JSON.stringify(page, null, 2)}\n`, 'utf8');
  console.log(`Patched ${path.relative(ROOT, filePath)}`);
}

for (const locale of LOCALES) {
  const studioDir = path.join(ROOT, 'content', locale, 'pages', 'studio');
  if (!fs.existsSync(studioDir)) {
    continue;
  }

  for (const file of fs.readdirSync(studioDir).filter((name) => name.endsWith('.json'))) {
    patchPage(path.join(studioDir, file), locale);
  }
}
