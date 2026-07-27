#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { renderTestimonialsCarousel } = require('./lib/testimonials');

const ROOT = path.join(__dirname, '..');
const IMG = {
  header: '/assets/img/external/greenspector.com/entete_tarifs_b429a4f7.svg',
  free: '/assets/img/external/greenspector.com/offre_0_star_4fb7d8b8.svg',
  pro: '/assets/img/external/greenspector.com/offre_1_star_06d337eb.svg',
  team: '/assets/img/external/greenspector.com/offre_2_star_ff79236f.svg',
  enterprise: '/assets/img/external/greenspector.com/offre_3_star_c583cf00.svg'
};

const ASSETS = '/assets/img/external/greenspector.com/';

const clientLogos = [
  { src: `${ASSETS}client_sncfconnect_04f4832d.jpg`, alt: { fr: 'Logo SNCF Connect', en: 'SNCF Connect logo' } },
  { src: `${ASSETS}client_cats_8cc5042d.jpg`, alt: { fr: 'Logo Crédit Agricole Technologies & Services', en: 'Crédit Agricole Technologies & Services logo' } },
  { src: `${ASSETS}Logo_AirFrance_616731c4.webp`, alt: { fr: 'Logo Air France', en: 'Air France logo' } },
  { src: `${ASSETS}logo-bouygues-telecom_889990d1.svg`, alt: { fr: 'Logo Bouygues Telecom', en: 'Bouygues Telecom logo' } },
  { src: `${ASSETS}client_orange_338b842b.jpg`, alt: { fr: 'Logo Orange', en: 'Orange logo' } },
  { src: `${ASSETS}Logo-France-televisions-300x157_e988d666.jpg`, alt: { fr: 'Logo France Télévisions', en: 'France Télévisions logo' } },
  { src: `${ASSETS}client_regionbretagne_b8829f76.jpg`, alt: { fr: 'Logo Région Bretagne', en: 'Région Bretagne logo' } }
];

const Y = { fr: 'Inclus', en: 'Included' };
const N = { fr: 'Non inclus', en: 'Not included' };
const ALL_Y = [Y, Y, Y, Y];

const tableRows = [
  {
    theme: {
      fr: 'Test de Parcours Utilisateurs (app Android, app iOS, web)',
      en: 'User Journey testing (Android app, iOS app, web)'
    },
    rows: 5,
    cells: [
      ['Nombre de Parcours Utilisateurs inclus', 'Number of User Journeys included', ['0', '1', '3', { fr: 'Illimité', en: 'Unlimited' }]],
      ['Tableau de Bord synthétique des analyses de Parcours', 'Summary dashboard of Journey analyses', [N, Y, Y, Y]],
      ['Archivage des analyses', 'Analysis archiving', [N, Y, Y, Y]],
      ['Préparation de scénarios de tests par interface visuelle sans code', 'No-code visual test scenario preparation', [N, Y, Y, Y]],
      ['Préparation de scénarios de tests par script GDSL', 'Test scenario preparation with GDSL script', [N, Y, Y, Y]]
    ]
  },
  {
    theme: { fr: 'Test de Benchmark simple', en: 'Simple Benchmark test' },
    rows: 6,
    cells: [
      ['Nombre maximum de Benchmarks actifs', 'Maximum active Benchmarks', ['10', '50', '150', { fr: 'Illimité', en: 'Unlimited' }]],
      ['Applications Android', 'Android applications', ALL_Y],
      ['Pages web', 'Web pages', ALL_Y],
      ['Applications iOS', 'iOS applications', ['Roadmap', 'Roadmap', 'Roadmap', 'Roadmap']],
      ['Écoscore Benchmark avec sous-domaines Réseau et Ressources', 'Benchmark Ecoscore with Network and Resources sub-domains', ALL_Y],
      ['Recommandations priorisées pour la gestion des Ressources et du Réseau', 'Prioritized recommendations for Resources and Network management', ALL_Y]
    ]
  },
  {
    theme: {
      fr: "Mesures de consommations et d'énergie : métriques",
      en: 'Consumption and energy measurements: metrics'
    },
    rows: 6,
    cells: [
      ['Tableau de bord avec nombreux graphes d\'analyse des résultats', 'Dashboard with numerous result analysis charts', ALL_Y],
      ['Gestion des itérations de tests avec calculs statistiques intégrés', 'Test iteration management with integrated statistical calculations', ALL_Y],
      ['Calcul d\'impact environnemental multi-critères paramétrable', 'Configurable multi-criteria environmental impact calculation', ALL_Y],
      ['Métriques vitales : batterie hyper précise, data, temps de parcours', 'Vital metrics: highly accurate battery, data, journey time', ALL_Y],
      ['Métriques essentielles liées au processus et à la plate-forme (CPU, RAM) (sauf iOS)', 'Essential process and platform metrics (CPU, RAM) (except iOS)', ALL_Y],
      ['Métriques Android avancées (Dumpsys, températures)', 'Advanced Android metrics (Dumpsys, temperatures)', [N, N, Y, Y]]
    ]
  },
  {
    theme: { fr: 'Déroulement des mesures', en: 'Measurement workflow' },
    rows: 8,
    cells: [
      ['Sur les terminaux réels de notre Test Bench', 'On real devices on our Test Bench', ALL_Y],
      ['Choix de connectivité réseau (WiFi, 3G, 4G) sur Test Bench', 'Network connectivity choice (WiFi, 3G, 4G) on Test Bench', [N, Y, Y, Y]],
      ['Accès aux screenshots, dumps et logs de tests', 'Access to screenshots, dumps and test logs', [N, Y, Y, Y]],
      ['Temps maximal de test sur le Test Bench (par mois)**', 'Maximum Test Bench test time (per month)**', [{ fr: 'Illimité', en: 'Unlimited' }, { fr: 'Illimité', en: 'Unlimited' }, { fr: 'Illimité', en: 'Unlimited' }, { fr: 'Illimité', en: 'Unlimited' }]],
      ['Sur un Test Bench avec terminaux dédiés à votre organisation', 'Test Bench with devices dedicated to your organization', [N, N, { fr: 'Option', en: 'Optional' }, { fr: 'Option', en: 'Optional' }]],
      ['Sur un Test Bench installé on-premises', 'On-premises Test Bench', [N, N, { fr: 'Option', en: 'Optional' }, { fr: 'Option', en: 'Optional' }]],
      ['Localement sur votre appareil en ADB WiFi ou USB (via module TestRunner)', 'Locally on your device via ADB WiFi or USB (TestRunner module)', [N, N, Y, Y]],
      ['Localement sur votre appareil, en mode offline* (via module TestRunner)', 'Locally on your device, in offline mode* (TestRunner module)', [N, N, Y, Y]]
    ]
  },
  {
    theme: { fr: 'Intégration et lancement des tests', en: 'Test integration and launch' },
    rows: 6,
    cells: [
      ['Lancement depuis l\'interface web : sur le Test Bench', 'Launch from web interface: on Test Bench', ALL_Y],
      ['Lancement par votre CI/CD : utilisation du CLI ou scripts CURL', 'Launch via your CI/CD: CLI or CURL scripts', [N, N, Y, Y]],
      ['Export de tous les résultats par API', 'Export all results via API', [N, N, Y, Y]],
      ['Lancement avec le module en ligne de commande (CLI)', 'Launch with command-line module (CLI)', [N, N, Y, Y]],
      ['Lancement avec le module TestRunner : en local', 'Launch with TestRunner module: locally', [N, N, Y, Y]],
      ['Test à main levée sur terminal local (mode "FreeRunner")*', 'Manual testing on local device ("FreeRunner" mode)*', [N, N, Y, Y]]
    ]
  },
  {
    theme: { fr: "Gestion d'accès multi-utilisateurs", en: 'Multi-user access management' },
    rows: 2,
    cells: [
      ['Accès mono-utilisateur', 'Single-user access', [Y, N, N, N]],
      ['Accès multi-utilisateurs avec gestion de droits intégrée', 'Multi-user access with integrated rights management', [N, Y, Y, Y]]
    ]
  },
  {
    theme: { fr: 'Support utilisateurs', en: 'User support' },
    rows: 3,
    cells: [
      ['Accès au wiki intégré (Confluence)', 'Integrated wiki access (Confluence)', ALL_Y],
      ['Support utilisateurs par tchat', 'User support via chat', ALL_Y],
      ['Support utilisateurs par Service Desk web', 'User support via web Service Desk', [N, N, Y, Y]]
    ]
  },
  {
    theme: { fr: "Services d'accompagnement", en: 'Support services' },
    rows: 5,
    cells: [
      ['Formation initiale des utilisateurs', 'Initial user training', [N, { fr: 'Onboarding 2h', en: '2h onboarding' }, { fr: 'Sur devis', en: 'Custom quote' }, { fr: 'Sur devis', en: 'Custom quote' }]],
      ['Délivrance de Certificat Greenspector incluse', 'Included Greenspector Certificate', [N, N, { fr: '3 /an', en: '3 /year' }, { fr: '3 /an', en: '3 /year' }]],
      ['Support utilisateurs inclus, lun-ven 9h-18h en français ou anglais', 'Included user support, Mon–Fri 9am–6pm in French or English', [N, { fr: '1h/mois', en: '1h/month' }, { fr: '2h/mois', en: '2h/month' }, { fr: '2h/mois', en: '2h/month' }]],
      ['Support utilisateurs personnalisé selon vos besoins', 'Customized user support based on your needs', [N, N, { fr: 'Sur devis', en: 'Custom quote' }, { fr: 'Sur devis', en: 'Custom quote' }]],
      ['Cadrage, formation utilisateurs, aide au déploiement…', 'Scoping, user training, deployment support…', [N, N, { fr: 'Nous consulter', en: 'Contact us' }, { fr: 'Nous consulter', en: 'Contact us' }]]
    ]
  }
];

const planMeta = [
  {
    id: 'free',
    img: IMG.free,
    imgAlt: { fr: 'Offre Free', en: 'Free plan' },
    name: 'Free',
    amount: { fr: '0 €', en: '€0' },
    period: { fr: 'HT / mois', en: 'excl. VAT / mo' },
    commitment: null,
    statLines: {
      fr: ['Gratuit et sans engagement', 'Test Bench partagé'],
      en: ['Free with no commitment', 'Shared Test Bench']
    },
    tagline: { fr: 'Évaluez simplement une page web ou une app Android.', en: 'Simply evaluate a web page or an Android app.' },
    featured: false,
    cta: { fr: 'Débuter', en: 'Get started' },
    highlights: {
      fr: ['10 Benchmarks actifs', 'Android & pages web', 'Écoscore Benchmark', 'Support par tchat'],
      en: ['10 active Benchmarks', 'Android & web pages', 'Benchmark Ecoscore', 'Chat support']
    }
  },
  {
    id: 'pro',
    img: IMG.pro,
    imgAlt: { fr: 'Offre Pro', en: 'Pro plan' },
    name: 'Pro',
    amount: { fr: '290 €', en: '€290' },
    period: { fr: 'HT / mois', en: 'excl. VAT / mo' },
    commitment: { fr: 'Sans engagement', en: 'No commitment' },
    statLines: {
      fr: ['Temps de mesure illimité', 'Parcours utilisateur complet'],
      en: ['Unlimited measurement time', 'Full user journey']
    },
    tagline: { fr: 'La puissance d\'un outil professionnel à un prix accessible.', en: 'Professional-grade power at an accessible price.' },
    featured: true,
    cta: { fr: 'Essayer gratuitement', en: 'Try for free' },
    highlights: {
      fr: ['50 Benchmarks actifs', '1 Parcours Utilisateur', 'Scénarios visuels & GDSL', 'Accès multi-utilisateurs'],
      en: ['50 active Benchmarks', '1 User Journey', 'Visual & GDSL scenarios', 'Multi-user access']
    }
  },
  {
    id: 'team',
    img: IMG.team,
    imgAlt: { fr: 'Offre Team', en: 'Team plan' },
    name: 'Team',
    amount: { fr: '990 €', en: '€990' },
    period: { fr: 'HT / mois', en: 'excl. VAT / mo' },
    commitment: { fr: 'Engagement 12 mois', en: '12-month commitment' },
    statLines: {
      fr: ['Intégration DevGreenOps', 'Export API des résultats'],
      en: ['DevGreenOps integration', 'API export of results']
    },
    tagline: { fr: 'Passez au DevGreenOps avec la mesure de sobriété en CI/CD.', en: 'Move to DevGreenOps with sobriety measurement in CI/CD.' },
    featured: false,
    cta: { fr: 'Essayer gratuitement', en: 'Try for free' },
    highlights: {
      fr: ['150 Benchmarks actifs', '3 Parcours Utilisateurs', 'API & intégration CI/CD', 'Service Desk web'],
      en: ['150 active Benchmarks', '3 User Journeys', 'API & CI/CD integration', 'Web Service Desk']
    }
  },
  {
    id: 'enterprise',
    img: IMG.enterprise,
    imgAlt: { fr: 'Offre Enterprise', en: 'Enterprise plan' },
    name: 'Enterprise',
    amount: { fr: 'Sur devis', en: 'Custom quote' },
    period: null,
    commitment: null,
    statLines: {
      fr: ['Contrat sur mesure', 'Multi-équipes & gouvernance'],
      en: ['Custom contract', 'Multi-team governance']
    },
    tagline: { fr: 'Greenspector Studio pour tous vos projets mobiles et web.', en: 'Greenspector Studio for all your mobile and web projects.' },
    featured: false,
    cta: { fr: 'Demander un devis', en: 'Request a quote' },
    highlights: {
      fr: ['Benchmarks illimités', 'Parcours illimités', 'Multi-utilisateurs & droits', 'Test Bench dédié en option'],
      en: ['Unlimited Benchmarks', 'Unlimited Journeys', 'Multi-user & permissions', 'Dedicated Test Bench optional']
    }
  }
];

const faq = [
  {
    q: { fr: 'Puis-je faire un essai gratuit ?', en: 'Can I try for free?' },
    a: {
      fr: 'Oui bien sûr ! Cliquez sur « Essayez gratuitement » et laissez-vous guider. Nous sommes aussi à votre disposition pour vous faire une démo.',
      en: 'Yes, of course! Click "Try for free" and follow the steps. We are also available to give you a demo.'
    }
  },
  {
    q: { fr: "Ai-je besoin d'une carte bancaire pour l'essai gratuit ?", en: 'Do I need a credit card for the free trial?' },
    a: {
      fr: "Non, vous n'avez pas besoin de saisir votre carte de crédit durant la période d'essai.",
      en: 'No, you do not need to enter your credit card during the trial period.'
    }
  },
  {
    q: { fr: "Quelle est la durée d'engagement ?", en: 'What is the commitment period?' },
    a: {
      fr: "Vous souscrivez pour un mois. L'abonnement sera reconduit le mois suivant, sauf si vous décidez de résilier. Vous recevrez un courriel de rappel 3 jours avant chaque échéance de renouvellement.",
      en: 'You subscribe for one month. The subscription renews the following month unless you cancel. You will receive a reminder email 3 days before each renewal date.'
    }
  },
  {
    q: { fr: 'Proposez-vous des abonnements annuels ?', en: 'Do you offer annual subscriptions?' },
    a: {
      fr: "Pour l'instant vous pouvez souscrire uniquement les abonnements mensuels depuis ce site. Toutefois, si vous êtes intéressé par un abonnement annuel, contactez-nous, nous le ferons pour vous, en appliquant une remise de 20% sur le tarif mensuel.",
      en: 'For now you can only subscribe to monthly plans from this site. However, if you are interested in an annual subscription, contact us and we will set it up for you with a 20% discount on the monthly rate.'
    }
  },
  {
    q: { fr: 'Qu\'est-ce qu\'un "Parcours" ?', en: 'What is a "Journey"?' },
    a: {
      fr: "Avec Greenspector Studio, vous suivez la sobriété, la performance et les impacts environnementaux à l'échelle d'un Parcours utilisateurs. Un Parcours est constitué d'un nombre illimité d'étapes : clic, chargement de page, saisie de texte… Pour plus de clarté, vous pouvez regrouper les étapes en domaines fonctionnels.",
      en: 'With Greenspector Studio, you track sobriety, performance and environmental impacts at User Journey level. A Journey consists of an unlimited number of steps: click, page load, text input… For clarity, you can group steps into functional domains.'
    }
  },
  {
    q: { fr: 'Puis-je souscrire des Parcours supplémentaires ?', en: 'Can I add extra Journeys?' },
    a: {
      fr: 'Oui, la souscription de Parcours utilisateurs supplémentaires est possible. Contactez-nous !',
      en: 'Yes, you can subscribe to additional User Journeys. Contact us!'
    }
  },
  {
    q: { fr: 'Comment est compté le temps de mesure ?', en: 'How is measurement time counted?' },
    a: {
      fr: 'Nouveau en 2026 : le temps de mesure est illimité pour les offres Pro, Team et Enterprise 🙂',
      en: 'New in 2026: measurement time is unlimited for Pro, Team and Enterprise plans 🙂'
    }
  }
];

function t(value, locale) {
  if (value && typeof value === 'object' && ('fr' in value || 'en' in value)) {
    return value[locale];
  }
  return value;
}

function isIncludedValue(value, locale) {
  const lower = String(t(value, locale)).toLowerCase();
  return lower === 'inclus' || lower === 'included';
}

function isExcludedValue(value, locale) {
  const lower = String(t(value, locale)).toLowerCase();
  return lower.startsWith('non') || lower.startsWith('not ');
}

function cellClass(value, locale) {
  if (isIncludedValue(value, locale)) return 'pricing-cell pricing-cell--yes';
  if (isExcludedValue(value, locale)) return 'pricing-cell pricing-cell--no';
  return 'pricing-cell';
}

function renderCellContent(value, locale) {
  const text = String(t(value, locale));
  if (isIncludedValue(value, locale)) {
    const label = locale === 'fr' ? 'Inclus' : 'Included';
    return `<span class="pricing-cell__mark pricing-cell__mark--yes" aria-hidden="true"></span><span class="visually-hidden">${label}</span>`;
  }
  if (isExcludedValue(value, locale)) {
    return `<span class="pricing-cell__mark pricing-cell__mark--no" aria-hidden="true"></span><span class="visually-hidden">${text}</span>`;
  }
  return text;
}

function renderPlan(plan, locale) {
  const featured = plan.featured ? ' pricing-plan--featured' : '';
  const commitment = plan.commitment
    ? `<p class="pricing-plan__commitment">${t(plan.commitment, locale)}</p>`
    : '';
  const period = plan.period
    ? `<span class="pricing-plan__period">${t(plan.period, locale)}</span>`
    : '';
  const highlights = plan.highlights[locale]
    .map((item) => `<li>${item}</li>`)
    .join('\n                                        ');
  const statLines = plan.statLines[locale]
    .map((line) => `<p class="pricing-plan__stat">${line}</p>`)
    .join('\n                                    ');
  const compareLabel = locale === 'fr' ? 'Voir le comparatif détaillé' : 'See detailed comparison';

  return `<article class="pricing-plan${featured}">
                                <div class="pricing-plan__head">
                                    <img class="pricing-plan__badge" src="${plan.img}" alt="${t(plan.imgAlt, locale)}" width="40" height="40" loading="lazy" decoding="async">
                                    <h3 class="pricing-plan__name">${plan.name}</h3>
                                </div>
                                <div class="pricing-plan__price-block">
                                    <span class="pricing-plan__amount">${t(plan.amount, locale)}</span>
                                    ${period}
                                </div>
                                ${commitment}
                                <p class="pricing-plan__tagline">${t(plan.tagline, locale)}</p>
                                <div class="pricing-plan__stats">
                                    ${statLines}
                                </div>
                                <ul class="pricing-plan__highlights">${highlights}</ul>
                                <footer class="pricing-plan__footer">
                                    <a class="btn ${plan.featured ? 'btn-gs-primary' : 'btn-gs-outline'} pricing-plan__cta" href="/contact/">${t(plan.cta, locale)}</a>
                                    <a class="pricing-plan__compare" href="#pricing-table-title">${compareLabel}</a>
                                </footer>
                            </article>`;
}

function renderTableHead(locale) {
  const labels = locale === 'fr'
    ? ['Thème', 'Fonctionnalité / Capacité']
    : ['Theme', 'Feature / Capacity'];

  const planHeaders = planMeta
    .map((plan) => {
      const priceLine = plan.period
        ? `<span class="pricing-table__plan-price">${t(plan.amount, locale)} ${t(plan.period, locale)}</span>`
        : `<span class="pricing-table__plan-price">${t(plan.amount, locale)}</span>`;
      const featured = plan.featured ? ' pricing-table__plan--featured' : '';
      return `<th scope="col" class="pricing-table__plan${featured}"><span class="pricing-table__plan-name">${plan.name}</span>${priceLine}</th>`;
    })
    .join('\n                                        ');

  return `<tr>
                                        <th scope="col">${labels[0]}</th>
                                        <th scope="col">${labels[1]}</th>
                                        ${planHeaders}
                                    </tr>`;
}

function renderTestimonials(locale) {
  return renderTestimonialsCarousel(locale);
}

function renderClientLogos(locale) {
  const title = locale === 'fr'
    ? 'Ils utilisent Greenspector Studio pour allier responsabilité environnementale, satisfaction des utilisateurs et performance de leurs applications'
    : 'They use Greenspector Studio to combine environmental responsibility, user satisfaction and application performance';
  const eyebrow = locale === 'fr' ? 'Clients' : 'Clients';

  const logos = clientLogos
    .map(
      (logo) => `<figure class="studio-logo-card"><img src="${logo.src}" alt="${t(logo.alt, locale)}" width="160" height="80" loading="lazy" decoding="async"></figure>`
    )
    .join('\n                            ');

  return `<section class="studio-section pricing-clients" aria-labelledby="pricing-clients-title">
                        <p class="eyebrow">${eyebrow}</p>
                        <h2 id="pricing-clients-title">${title}</h2>
                        <div class="studio-logo-grid pricing-clients-grid">
                            ${logos}
                        </div>
                    </section>`;
}

function renderTable(locale) {
  let body = '';
  for (const group of tableRows) {
    group.cells.forEach((row, index) => {
      const [featureFr, featureEn, values] = row;
      const feature = locale === 'fr' ? featureFr : featureEn;
      const themeCell = index === 0
        ? `<th scope="rowgroup" rowspan="${group.rows}" class="pricing-table__theme">${t(group.theme, locale)}</th>`
        : '';
      body += `<tr>${themeCell}<th scope="row" class="pricing-table__feature">${feature}</th>${values
        .map((value) => `<td class="${cellClass(value, locale)}">${renderCellContent(value, locale)}</td>`)
        .join('')}</tr>\n                            `;
    });
  }

  return `<div class="pricing-table-wrap" tabindex="0" role="region" aria-label="${locale === 'fr' ? 'Comparatif des offres Greenspector Studio' : 'Greenspector Studio plan comparison'}">
                            <table class="pricing-table">
                                <thead>
                                    ${renderTableHead(locale)}
                                </thead>
                                <tbody>
                            ${body}</tbody>
                            </table>
                        </div>`;
}

function renderBody(locale) {
  const copy = locale === 'fr'
    ? {
        intro: 'Greenspector Studio, la solution SaaS pour valider réellement la sobriété et la performance de vos applications mobiles et web.',
        plansTitle: 'Greenspector Studio pour toutes les tailles de projets',
        tableTitle: 'Détail des fonctionnalités par offre',
        footnote1: '* Test local : consommation de batterie uniquement disponible sur terminaux Android compatibles.',
        footnote2: '** Sous réserve d\'un usage raisonnable du service.',
        faqTitle: 'Une question ?',
        faqIntro: 'Si vous ne trouvez pas la réponse ci-dessous, contactez-nous.',
        faqCta: 'Contactez-nous',
        headerAlt: 'Illustration des formules et tarifs Greenspector Studio'
      }
    : {
        intro: 'Greenspector Studio, the SaaS solution to truly validate the sobriety and performance of your mobile and web applications.',
        plansTitle: 'Greenspector Studio for projects of every size',
        tableTitle: 'Feature breakdown by plan',
        footnote1: '* Local testing: battery consumption only available on compatible Android devices.',
        footnote2: '** Subject to reasonable service use.',
        faqTitle: 'Have a question?',
        faqIntro: 'If you cannot find the answer below, contact us.',
        faqCta: 'Contact us',
        headerAlt: 'Greenspector Studio plans and pricing illustration'
      };

  const plansHtml = planMeta.map((plan) => renderPlan(plan, locale)).join('\n                            ');
  const faqHtml = faq
    .map(
      (item) => `<details class="pricing-faq-item">
                                <summary><span>${t(item.q, locale)}</span></summary>
                                <div class="pricing-faq-item__answer"><p>${t(item.a, locale)}</p></div>
                            </details>`
    )
    .join('\n                            ');

  return `<article class="content-panel studio-page pricing-page">
                    <section class="studio-section" aria-labelledby="pricing-plans-title">
                        <p class="eyebrow">${locale === 'fr' ? 'Offres' : 'Plans'}</p>
                        <h2 id="pricing-plans-title">${copy.plansTitle}</h2>
                        <div class="pricing-plans">
                            ${plansHtml}
                        </div>
                    </section>

                    <section class="studio-section" aria-labelledby="pricing-table-title">
                        <p class="eyebrow">${locale === 'fr' ? 'Comparatif' : 'Comparison'}</p>
                        <h2 id="pricing-table-title">${copy.tableTitle}</h2>
                        ${renderTable(locale)}
                        <div class="pricing-footnotes">
                            <p><small>${copy.footnote1}</small></p>
                            <p><small>${copy.footnote2}</small></p>
                        </div>
                    </section>

                    <section class="studio-section pricing-faq" aria-labelledby="pricing-faq-title">
                        <p class="eyebrow">FAQ</p>
                        <h2 id="pricing-faq-title">${copy.faqTitle}</h2>
                        <p>${copy.faqIntro} <a href="/contact/">${copy.faqCta}</a></p>
                        <div class="pricing-faq-list">
                            ${faqHtml}
                        </div>
                    </section>

                    ${renderTestimonials(locale)}

                    ${renderClientLogos(locale)}
                </article>`;
}

const locales = {
  fr: {
    path: path.join(ROOT, 'content/fr/pages/tarifs-greenspector-studio.json'),
    page: {
      id: 'tarifs',
      slug: '/tarifs-greenspector-studio/',
      template: 'html',
      meta: {
        title: 'Tarifs Greenspector Studio | SaaS sobriété numérique | Greenspector',
        description: 'Comparez les offres Free, Pro, Team et Enterprise de Greenspector Studio : benchmarks, parcours utilisateurs, DevGreenOps et mesure d\'impact sur terminaux réels.',
        keywords: 'tarifs Greenspector Studio, prix SaaS Green IT, offre Free, DevGreenOps',
        ogTitle: 'Tarifs Greenspector Studio | SaaS sobriété numérique',
        ogDescription: 'Greenspector Studio : de l\'évaluation gratuite au DevGreenOps en entreprise. Comparez nos offres SaaS.'
      },
      nav: {
        section: 'Tarifs',
        name: 'Tarifs',
        primary: 'tarifs Greenspector Studio',
        secondary: 'prix SaaS Green IT'
      },
      hero: {
        label: 'Tarifs',
        title: 'Nos offres',
        subtitle: 'Greenspector Studio, la solution SaaS pour valider la sobriété et la performance de vos applications.'
      }
    }
  },
  en: {
    path: path.join(ROOT, 'content/en/pages/tarifs-greenspector-studio.json'),
    page: {
      id: 'tarifs',
      slug: '/tarifs-greenspector-studio/',
      template: 'html',
      meta: {
        title: 'Greenspector Studio pricing | Digital sobriety SaaS | Greenspector',
        description: 'Compare Free, Pro, Team and Enterprise Greenspector Studio plans: benchmarks, user journeys, DevGreenOps and impact measurement on real devices.',
        keywords: 'Greenspector Studio pricing, Green IT SaaS pricing, Free plan, DevGreenOps',
        ogTitle: 'Greenspector Studio pricing | Digital sobriety SaaS',
        ogDescription: 'Greenspector Studio: from free evaluation to enterprise DevGreenOps. Compare our SaaS plans.'
      },
      nav: {
        section: 'Tarifs',
        name: 'Pricing',
        primary: 'Greenspector Studio pricing',
        secondary: 'Green IT SaaS pricing'
      },
      hero: {
        label: 'Pricing',
        title: 'Our plans',
        subtitle: 'Greenspector Studio, the SaaS solution to validate the sobriety and performance of your applications.'
      }
    }
  }
};

for (const [locale, config] of Object.entries(locales)) {
  const output = { ...config.page, bodyHtml: renderBody(locale) };
  fs.writeFileSync(config.path, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(ROOT, config.path)}`);
}
