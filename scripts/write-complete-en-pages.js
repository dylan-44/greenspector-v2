#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/registry.json'), 'utf8'));
const overrides = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/en/page-overrides.json'), 'utf8'));

const ACTION_LABELS = {
  'Demander une démo': 'Request a demo',
  'Essayer gratuitement': 'Try for free',
  'Découvrir Greenspector Studio': 'Discover Greenspector Studio',
  'Découvrir\n                        Greenspector Studio': 'Discover\n                        Greenspector Studio',
  'Parler de votre projet': 'Discuss your project',
  'Voir le projet client': 'View client project',
  'Parler avec un expert': 'Talk to an expert',
  'Découvrir Treebal': 'Discover Treebal',
  'Contacter Greenspector': 'Contact Greenspector'
};

function pageJsonPath(locale, pagePath) {
  const rel = pagePath === 'index' ? 'index.json' : `${pagePath}.json`;
  return path.join(ROOT, 'content', locale, 'pages', rel);
}

function deepMerge(base, patch) {
  if (!patch) return base;
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

function translateHero(hero, pageOverrides) {
  if (!hero) return hero;
  const merged = deepMerge(hero, pageOverrides.hero || {});
  return {
    ...merged,
    actions: merged.actions?.map((action) => ({
      ...action,
      label: ACTION_LABELS[action.label] || action.label
    }))
  };
}

function translateNav(nav, pageOverrides) {
  if (!nav) return nav;
  const merged = deepMerge(nav, pageOverrides.nav || {});
  return {
    ...merged,
    name: merged.name
  };
}

function translateMeta(meta, pageOverrides) {
  return deepMerge(meta, pageOverrides.meta || {});
}

function translateLdJson(ldJson) {
  if (!ldJson) return ldJson;
  return ldJson
    .replace(/Solution SaaS pour valider la sobriété et la performance des applications mobile et web sur terminaux réels\./g,
      'SaaS solution to validate the frugality and performance of mobile and web applications on real devices.')
    .replace(/Cas client Air France sur l'intégration du green testing avec Greenspector Studio pour mesurer la sobriété des applications web, iOS et Android\./g,
      'Air France client case on integrating green testing with Greenspector Studio to measure the frugality of web, iOS and Android applications.')
    .replace(/Air France : intégrer le green testing dans la qualité applicative/g,
      'Air France: integrating green testing into application quality')
    .replace(/Crédit Agricole Technologies & Services : labelliser la sobriété des applications/g,
      'Crédit Agricole Technologies & Services: certifying application frugality')
    .replace(/Cas client Crédit Agricole Technologies & Services sur l'évaluation et la labellisation interne de la sobriété des produits web et mobiles avec Greenspector\./g,
      'Crédit Agricole Technologies & Services client case on assessing and internally labelling the frugality of web and mobile products with Greenspector.')
    .replace(/Orange Innovation : accompagner l'écoconception des applications/g,
      'Orange Innovation: supporting application ecodesign')
    .replace(/Cas client Orange Innovation sur l'utilisation de Greenspector pour mesurer l'impact environnemental des applications et accompagner l'écoconception dans le Groupe Orange\./g,
      'Orange Innovation client case on using Greenspector to measure application environmental impact and support ecodesign across the Orange Group.')
    .replace(/Région Bretagne : piloter l'écoconception d'un portail serviciel/g,
      'Région Bretagne: steering the ecodesign of a service portal')
    .replace(/Cas client Région Bretagne sur la refonte écoconçue d'un portail serviciel et le pilotage des résultats avec Greenspector Studio\./g,
      'Région Bretagne client case on the ecodesigned redesign of a service portal and results tracking with Greenspector Studio.');
}

function seedCaseStudy(fr, pageOverrides) {
  const en = {
    id: fr.id,
    slug: fr.slug,
    template: fr.template,
    meta: translateMeta(fr.meta, pageOverrides),
    nav: translateNav(fr.nav, pageOverrides),
    hero: translateHero(fr.hero, pageOverrides),
    logos: fr.logos?.map((logo) => ({
      ...logo,
      alt: pageOverrides.logos?.find((l) => l.src === logo.src)?.alt || translateLogoAlt(logo.alt)
    }))
  };

  if (fr.intro) {
    en.intro = deepMerge(fr.intro, pageOverrides.intro || {});
    en.intro.eyebrow = en.intro.eyebrow === 'Contexte' ? 'Context' : en.intro.eyebrow;
    if (en.intro.paragraphs) {
      en.intro.paragraphs = en.intro.paragraphs.filter((p) => p !== 'Contexte' && p !== 'Context');
      if (pageOverrides.intro?.paragraphs) {
        en.intro.paragraphs = pageOverrides.intro.paragraphs;
      }
    }
    if (fr.intro.image) {
      en.intro.image = {
        ...fr.intro.image,
        alt: pageOverrides.intro?.image?.alt || translateLogoAlt(fr.intro.image.alt)
      };
    }
  }

  if (fr.results) {
    en.results = deepMerge(fr.results, pageOverrides.results || {});
    en.results.eyebrow = 'Results';
    if (pageOverrides.results?.items) en.results.items = pageOverrides.results.items;
    delete en.results.intro;
  }

  if (fr.successKeys) {
    en.successKeys = deepMerge(fr.successKeys, pageOverrides.successKeys || {});
    en.successKeys.eyebrow = 'Keys to success';
    if (pageOverrides.successKeys?.items) {
      en.successKeys.items = fr.successKeys.items.map((item, i) =>
        deepMerge(item, pageOverrides.successKeys.items[i] || {})
      );
    }
  }

  if (fr.testimonial) {
    en.testimonial = deepMerge(fr.testimonial, pageOverrides.testimonial || {});
    en.testimonial.eyebrow = 'Testimonial';
    if (pageOverrides.testimonial?.role) {
      en.testimonial.role = pageOverrides.testimonial.role.replace(/&amp;amp;/g, '&amp;');
    }
  }

  if (fr.testimonials) {
    en.testimonials = deepMerge(fr.testimonials, pageOverrides.testimonials || {});
    en.testimonials.eyebrow = 'Testimonials';
    if (pageOverrides.testimonials?.items) {
      en.testimonials.items = pageOverrides.testimonials.items;
    }
  }

  if (fr.media) {
    en.media = fr.media.map((item, i) => ({
      ...item,
      alt: pageOverrides.media?.[i]?.alt || translateLogoAlt(item.alt),
      caption: pageOverrides.media?.[i]?.caption || item.caption
    }));
  }

  if (fr.mediaEyebrow !== undefined) {
    en.mediaEyebrow = fr.mediaEyebrow ? 'Visuals' : '';
  }
  if (fr.mediaTitle) en.mediaTitle = 'The project in pictures';

  if (fr.cta) {
    en.cta = deepMerge(fr.cta, pageOverrides.cta || {});
    en.cta.eyebrow = 'Your turn';
    if (pageOverrides.cta?.text) en.cta.text = pageOverrides.cta.text;
  }

  if (fr.ldJson) en.ldJson = translateLdJson(fr.ldJson);

  return en;
}

function translateLogoAlt(alt) {
  if (!alt) return alt;
  const map = {
    'Logo Greenspector': 'Greenspector logo',
    "Logo de la République française, Ministère des Solidarités et de la Santé": 'Logo of the French Republic, Ministry of Solidarity and Health',
    "Logo de l'Agence du Numérique en Santé": 'French Digital Health Agency logo',
    "Capture d'écran du Portail Écoscore utilisé pour l'évaluation des applications de santé": 'Screenshot of the Ecoscore Portal used to assess health applications',
    "Interface de restitution des résultats d'impact environnemental": 'Environmental impact results display interface',
    'Interface Greenspector Studio utilisée pour les mesures sur terminaux réels': 'Greenspector Studio interface used for measurements on real devices',
    'Logo SNCF Connect & Tech': 'SNCF Connect & Tech logo',
    "Illustration du cas client SNCF Connect & Tech sur la sobriété numérique de l'application de réservation": 'SNCF Connect & Tech client case illustration on digital sobriety of the booking application',
    'Logo Air France': 'Air France logo',
    'Logo Sogeti': 'Sogeti logo',
    'Graphique du temps de parcours mesuré dans le cadre du cas client Air France': 'Journey time chart measured as part of the Air France client case',
    'Logo Crédit Agricole Technologies & Services': 'Crédit Agricole Technologies & Services logo',
    "Illustration de la démarche Smart'Use chez Crédit Agricole Technologies & Services": "Smart'Use approach illustration at Crédit Agricole Technologies & Services",
    "Interface ou support lié à l'évaluation de la sobriété des applications Crédit Agricole Technologies & Services": 'Interface or material related to assessing application frugality at Crédit Agricole Technologies & Services',
    'Logo Orange Innovation': 'Orange Innovation logo',
    'Visuel associé au POC Greenspector mené par Orange Innovation': 'Visual associated with the Greenspector POC led by Orange Innovation',
    'Interface de résultats Greenspector utilisée dans le cadre du cas client Orange Innovation': 'Greenspector results interface used in the Orange Innovation client case',
    'Logo Région Bretagne': 'Région Bretagne logo',
    'Capture du portail serviciel de la Région Bretagne': 'Screenshot of the Région Bretagne service portal',
    "Extrait d'interface illustrant les résultats du portail Région Bretagne": 'Interface excerpt showing Région Bretagne portal results',
    'Interface ou écran associé au portail Région Bretagne': 'Interface or screen associated with the Région Bretagne portal'
  };
  return map[alt] || alt;
}

function main() {
  let written = 0;
  for (const regPage of registry.pages) {
    const frPath = pageJsonPath('fr', regPage.path);
    if (!fs.existsSync(frPath)) {
      console.warn('Skip missing FR:', frPath);
      continue;
    }
    const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
    const pageOverrides = overrides[regPage.id] || {};
    let en;

    if (regPage.template === 'case-study' && pageOverrides.intro) {
      en = seedCaseStudy(fr, pageOverrides);
    } else if (fs.existsSync(pageJsonPath('en', regPage.path))) {
      // Keep manually written EN files for non-case-study pages without bodyHtml override
      if (!pageOverrides.bodyHtml && !fr.bodyHtml) {
        console.log('Keep existing:', regPage.path);
        written++;
        continue;
      }
    }

    if (!en) {
      console.log('Skip (no handler):', regPage.path);
      continue;
    }

    const enPath = pageJsonPath('en', regPage.path);
    fs.mkdirSync(path.dirname(enPath), { recursive: true });
    fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`, 'utf8');
    console.log('Wrote:', enPath);
    written++;
  }
  console.log('Case studies written:', written);
}

main();
