#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Bootstrap EN pages from FR + page-overrides.json.
 * WARNING: overwrites content/en/pages/*.json — do NOT run after full manual EN translations.
 * Prefer editing content/en/pages/ directly (see docs/RAG_TRANSLATION_RULES.md).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const registry = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'content/registry.json'), 'utf8')
);

const SECTION_LABELS = {
  'Greenspector Studio': 'Greenspector Studio',
  Conseil: 'Consulting',
  Tarifs: 'Pricing',
  Ressources: 'Resources',
  'À propos': 'About',
  Contact: 'Contact',
  Home: 'Home',
  'Étude de cas': 'Case study'
};

const HERO_LABELS = {
  'Étude de cas': 'Case study',
  'Greenspector Studio': 'Greenspector Studio',
  Conseil: 'Consulting',
  'À propos': 'About',
  Ressources: 'Resources',
  Tarifs: 'Pricing',
  Contact: 'Contact'
};

const ACTION_LABELS = {
  'Demander une démo': 'Request a demo',
  'Essayer gratuitement': 'Try for free',
  'Découvrir Greenspector Studio': 'Discover Greenspector Studio',
  'Lire l\'étude de cas': 'Read case study',
  'Nous contacter': 'Contact us'
};

const COMMON_HTML_REPLACEMENTS = [
  ['Demander une démo', 'Request a demo'],
  ['Essayer gratuitement', 'Try for free'],
  ['Découvrir Greenspector Studio', 'Discover Greenspector Studio'],
  ['Comment ça marche', 'How it works'],
  ['Étude de cas', 'Case study'],
  ['Étude de cas client', 'Client case study'],
  ['Contexte', 'Context'],
  ['Résultats', 'Results'],
  ['Clés du succès', 'Keys to success'],
  ['Témoignage', 'Testimonial'],
  ['Témoignages', 'Testimonials'],
  ['Visuels', 'Visuals'],
  ['Le projet en images', 'The project in pictures'],
  ['À vous de jouer', 'Your turn'],
  ['Aller au contenu principal', 'Skip to main content'],
  ['Solution SaaS Green IT', 'Green IT SaaS solution'],
  ['Découvrez les problèmes de votre app avant vos utilisateurs', 'Find your app issues before your users do'],
  ['Consommation de batterie', 'Battery consumption'],
  ['Baisse de performance sur terminaux anciens', 'Performance drop on older devices'],
  ['Interruptions de parcours quand le réseau se dégrade', 'Journey interruptions when the network degrades'],
  ['Ralentissements à cause de l\'IA', 'Slowdowns caused by AI'],
  ['Impact environnemental', 'Environmental impact'],
  ['Mesurez, comprenez et améliorez en trois étapes', 'Measure, understand and improve in three steps'],
  ['Décrivez le parcours utilisateurs', 'Describe user journeys'],
  ['Mesurez sur terminaux réels', 'Measure on real devices'],
  ['Analysez et améliorez', 'Analyze and improve'],
  ['Pourquoi Greenspector Studio', 'Why Greenspector Studio'],
  ['Lire l\'étude de cas client', 'Read the client case study'],
  ['Page Accueil', 'Home']
];

function pageJsonPath(locale, pagePath) {
  const rel = pagePath === 'index' ? 'index.json' : `${pagePath}.json`;
  return path.join(ROOT, 'content', locale, 'pages', rel);
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function translateText(text) {
  if (!text) {
    return text;
  }
  let out = text;
  for (const [fr, en] of COMMON_HTML_REPLACEMENTS) {
    out = out.split(fr).join(en);
  }
  return out;
}

function translateHero(hero) {
  if (!hero) {
    return hero;
  }
  return {
    ...hero,
    label: hero.label ? HERO_LABELS[hero.label] || translateText(hero.label) : undefined,
    title: translateText(hero.title),
    subtitle: hero.subtitle ? translateText(hero.subtitle) : undefined,
    slugNote: hero.slugNote ? translateText(hero.slugNote) : undefined,
    actions: hero.actions?.map((action) => ({
      ...action,
      label: ACTION_LABELS[action.label] || translateText(action.label)
    }))
  };
}

function translateMeta(meta, pageId) {
  const overrides = loadOverrides()[pageId]?.meta;
  if (overrides) {
    return { ...meta, ...overrides };
  }
  return {
    ...meta,
    title: translateText(meta.title),
    description: translateText(meta.description),
    keywords: meta.keywords ? translateText(meta.keywords) : undefined,
    ogTitle: meta.ogTitle ? translateText(meta.ogTitle) : undefined,
    ogDescription: meta.ogDescription ? translateText(meta.ogDescription) : undefined
  };
}

function translateNav(nav) {
  if (!nav) {
    return nav;
  }
  return {
    ...nav,
    section: nav.section === 'Home' ? 'Home' : nav.section,
    name: translateText(nav.name),
    primary: translateText(nav.primary),
    secondary: translateText(nav.secondary)
  };
}

function translateStructured(obj) {
  if (!obj) {
    return obj;
  }
  if (typeof obj === 'string') {
    return translateText(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(translateStructured);
  }
  if (typeof obj === 'object') {
    const out = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'src' || key === 'href' || key === 'photo' || key === 'icon') {
        out[key] = value;
      } else {
        out[key] = translateStructured(value);
      }
    }
    return out;
  }
  return obj;
}

let overridesCache;

function loadOverrides() {
  if (overridesCache) {
    return overridesCache;
  }
  const overridePath = path.join(ROOT, 'content/en/page-overrides.json');
  overridesCache = fs.existsSync(overridePath)
    ? JSON.parse(fs.readFileSync(overridePath, 'utf8'))
    : {};
  return overridesCache;
}

function deepMerge(base, patch) {
  if (!patch) {
    return base;
  }
  const out = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = deepMerge(base[key] || {}, value);
    } else if (value !== undefined) {
      out[key] = value;
    }
  }
  return out;
}

function seedPage(regPage) {
  const frPath = pageJsonPath('fr', regPage.path);
  if (!fs.existsSync(frPath)) {
    console.warn(`Skip missing FR: ${frPath}`);
    return;
  }

  const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
  const pageOverrides = loadOverrides()[regPage.id] || {};

  const en = {
    ...fr,
    id: fr.id,
    slug: fr.slug,
    template: fr.template,
    meta: translateMeta(fr.meta, regPage.id),
    nav: translateNav(deepMerge(fr.nav || {}, pageOverrides.nav || {})),
    hero: translateHero(deepMerge(fr.hero || {}, pageOverrides.hero || {}))
  };

  if (pageOverrides.meta) {
    en.meta = { ...en.meta, ...pageOverrides.meta };
  }

  if (regPage.template === 'case-study') {
    if (pageOverrides.intro || pageOverrides.logos) {
      en.logos = fr.logos;
      en.intro = deepMerge(fr.intro || {}, pageOverrides.intro || {});
      en.results = deepMerge(fr.results || {}, pageOverrides.results || {});
      en.successKeys = deepMerge(fr.successKeys || {}, pageOverrides.successKeys || {});
      if (pageOverrides.successKeys?.items) {
        en.successKeys.items = fr.successKeys.items.map((item, index) =>
          deepMerge(item, pageOverrides.successKeys.items[index] || {})
        );
      }
      en.testimonial = deepMerge(fr.testimonial || {}, pageOverrides.testimonial || {});
      en.testimonials = deepMerge(fr.testimonials || {}, pageOverrides.testimonials || {});
      if (pageOverrides.media) {
        en.media = fr.media.map((item, index) => deepMerge(item, pageOverrides.media[index] || {}));
      }
      en.cta = deepMerge(fr.cta || {}, pageOverrides.cta || {});
    } else {
      Object.assign(en, translateStructured({
        logos: fr.logos,
        intro: fr.intro,
        results: fr.results,
        successKeys: fr.successKeys,
        testimonial: fr.testimonial,
        testimonials: fr.testimonials,
        media: fr.media,
        mediaEyebrow: fr.mediaEyebrow,
        mediaTitle: fr.mediaTitle,
        cta: fr.cta
      }));
    }
  } else if (fr.bodyHtml) {
    en.bodyHtml = pageOverrides.bodyHtml || translateText(fr.bodyHtml);
  }

  if (regPage.template === 'case-studies-index') {
    en.gridLabel = pageOverrides.gridLabel || 'Greenspector client case studies';
  }

  if (fr.contentMeta) {
    en.contentMeta = fr.contentMeta.map(translateText);
  }

  const enPath = pageJsonPath('en', regPage.path);
  ensureDir(enPath);
  fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`, 'utf8');
  console.log(`Seeded EN: ${enPath}`);
}

function main() {
  for (const page of registry.pages) {
    seedPage(page);
  }
  console.log('EN pages seeded.');
}

main();
