#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IMG = {
  header: '/assets/img/external/greenspector.com/entete_tarifs_b429a4f7.svg',
  free: '/assets/img/external/greenspector.com/offre_0_star_4fb7d8b8.svg',
  pro: '/assets/img/external/greenspector.com/offre_1_star_06d337eb.svg',
  team: '/assets/img/external/greenspector.com/offre_2_star_ff79236f.svg',
  enterprise: '/assets/img/external/greenspector.com/offre_3_star_c583cf00.svg'
};

const tableRows = [
  { theme: { fr: 'Test de Benchmark simple', en: 'Simple Benchmark test' }, rows: 7, cells: [
    ['Nombre maximum de Benchmarks actifs', 'Maximum active Benchmarks', ['10', '50', '150', { fr: 'Illimité', en: 'Unlimited' }]],
    ['Applications Android', 'Android applications', [{ fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Pages web', 'Web pages', [{ fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Applications iOS', 'iOS applications', [{ fr: 'Roadmap', en: 'Roadmap' }, { fr: 'Roadmap', en: 'Roadmap' }, { fr: 'Roadmap', en: 'Roadmap' }, { fr: 'Roadmap', en: 'Roadmap' }]],
    ['Écoscore Benchmark avec sous-domaines Réseau et Ressources', 'Benchmark Ecoscore with Network and Resources sub-domains', [{ fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ["Évaluation de l'impact environnemental", 'Environmental impact assessment', [{ fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Recommandations priorisées pour la gestion des Ressources et du Réseau', 'Prioritized recommendations for Resources and Network management', [{ fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]]
  ]},
  { theme: { fr: 'Tests de Parcours Utilisateurs', en: 'User Journey tests' }, rows: 6, cells: [
    ['Nombre de Parcours Utilisateurs inclus', 'Number of User Journeys included', ['0', '1', '3', { fr: 'Illimité', en: 'Unlimited' }]],
    ['Tableau de bord synthétique des Analyses réalisées', 'Summary dashboard of completed Analyses', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Archivage des Analyses inutiles', 'Archiving of unused Analyses', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Préparation de scénarios de tests via interface visuelle', 'Test scenario preparation via visual interface', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Préparation de scénarios de tests en script GDSL simple', 'Test scenario preparation with simple GDSL script', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Consultation des résultats dans l\'interface web', 'Viewing results in the web interface', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]]
  ]},
  { theme: { fr: 'Mesures de consommations et d\'énergie', en: 'Consumption and energy measurements' }, rows: 7, cells: [
    ['Calcul d\'impact environnemental multi-critères paramétrable', 'Configurable multi-criteria environmental impact calculation', [{ fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Gestion des itérations de tests avec calculs statistiques intégrés', 'Test iteration management with integrated statistical calculations', [{ fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Tableau de bord avec nombreux graphes d\'analyse des résultats', 'Dashboard with numerous result analysis charts', [{ fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Métriques vitales : batterie hyper précise, data, temps de parcours', 'Vital metrics: highly accurate battery, data, journey time', [{ fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Métriques essentielles liées au processus : CPU, RAM, sauf iOS', 'Essential process metrics: CPU, RAM, except iOS', [{ fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Métriques essentielles liées à la plateforme : CPU, RAM, sauf iOS', 'Essential platform metrics: CPU, RAM, except iOS', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Métriques Android avancées : Dumpsys, températures', 'Advanced Android metrics: Dumpsys, temperatures', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]]
  ]},
  { theme: { fr: 'Déroulement de mesures', en: 'Measurement workflow' }, rows: 10, cells: [
    ['Sur les terminaux réels de notre Test Bench', 'On real devices on our Test Bench', [{ fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Temps maximal de test sur le Test Bench par mois', 'Maximum Test Bench test time per month', [{ fr: 'Illimité', en: 'Unlimited' }, { fr: 'Illimité', en: 'Unlimited' }, { fr: 'Illimité', en: 'Unlimited' }, { fr: 'Illimité', en: 'Unlimited' }]],
    ['Sur un Test Bench dédié à votre organisation', 'On a Test Bench dedicated to your organization', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Non inclus', en: 'Not included' }, { fr: 'Option', en: 'Optional' }, { fr: 'Option', en: 'Optional' }]],
    ['Sur un Test Bench installé on-premises chez vous', 'On a Test Bench installed on-premises at your site', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Non inclus', en: 'Not included' }, { fr: 'Option', en: 'Optional' }, { fr: 'Option', en: 'Optional' }]],
    ['Localement sur vos appareils, en ADB WiFi', 'Locally on your devices, via ADB WiFi', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Localement sur vos appareils, en ADB USB', 'Locally on your devices, via ADB USB', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Localement sur vos appareils, en mode offline', 'Locally on your devices, in offline mode', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Choix de connectivité réseau : WiFi, 3G, 4G sur Test Bench', 'Network connectivity choice: WiFi, 3G, 4G on Test Bench', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Accès aux screenshots, dumps et logs de tests', 'Access to screenshots, dumps and test logs', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Test local : consommation de batterie uniquement disponible sur terminaux Android compatibles', 'Local testing: battery consumption only available on compatible Android devices', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]]
  ]},
  { theme: { fr: 'Intégration et lancement des tests', en: 'Test integration and launch' }, rows: 6, cells: [
    ['Intégration CI/CD : utilisation du CLI ou scripts CURL', 'CI/CD integration: CLI or CURL scripts', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Export de tous les résultats via les API', 'Export of all results via APIs', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Lancement depuis l\'interface web sur le Test Bench', 'Launch from web interface on Test Bench', [{ fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Lancement avec le module CLI sur le Test Bench', 'Launch with CLI module on Test Bench', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Lancement avec le module TestRunner en local', 'Launch with TestRunner module locally', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Lancement avec le module TestRunner en local sans automatisation, mode FreeRunner', 'Launch with TestRunner locally without automation, FreeRunner mode', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]]
  ]},
  { theme: { fr: 'Gestion d\'accès multi-utilisateurs', en: 'Multi-user access management' }, rows: 2, cells: [
    ['Accès mono-utilisateur', 'Single-user access', [{ fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Non inclus', en: 'Not included' }]],
    ['Accès multi-utilisateurs avec gestion de droits intégrée', 'Multi-user access with integrated rights management', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Non inclus', en: 'Not included' }, { fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }]]
  ]},
  { theme: { fr: 'Support utilisateurs', en: 'User support' }, rows: 3, cells: [
    ['Accès au wiki intégré Confluence', 'Integrated Confluence wiki access', [{ fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Support utilisateurs par tchat', 'User support via chat', [{ fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]],
    ['Support utilisateurs par Service Desk web', 'User support via web Service Desk', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }, { fr: 'Inclus', en: 'Included' }]]
  ]},
  { theme: { fr: 'Services d\'accompagnement', en: 'Support services' }, rows: 1, cells: [
    ['Cadrage, formation utilisateurs, aide au déploiement…', 'Scoping, user training, deployment support…', [{ fr: 'Non inclus', en: 'Not included' }, { fr: 'Non inclus', en: 'Not included' }, { fr: 'Nous consulter', en: 'Contact us' }, { fr: 'Nous consulter', en: 'Contact us' }]]
  ]}
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
    benchmarks: '10',
    journeys: '0',
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
    benchmarks: '50',
    journeys: '1',
    tagline: { fr: 'La puissance d\'un outil professionnel à un prix accessible.', en: 'Professional-grade power at an accessible price.' },
    featured: true,
    cta: { fr: 'Essayer gratuitement', en: 'Try for free' },
    highlights: {
      fr: ['50 Benchmarks actifs', '1 Parcours Utilisateur', 'Scénarios visuels & GDSL', 'Service Desk web'],
      en: ['50 active Benchmarks', '1 User Journey', 'Visual & GDSL scenarios', 'Web Service Desk']
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
    benchmarks: '150',
    journeys: '3',
    tagline: { fr: 'Passez au DevGreenOps avec la mesure de sobriété en CI/CD.', en: 'Move to DevGreenOps with sobriety measurement in CI/CD.' },
    featured: false,
    cta: { fr: 'Essayer gratuitement', en: 'Try for free' },
    highlights: {
      fr: ['150 Benchmarks actifs', '3 Parcours Utilisateurs', 'API & intégration CI/CD', 'Mesures locales ADB'],
      en: ['150 active Benchmarks', '3 User Journeys', 'API & CI/CD integration', 'Local ADB measurements']
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
    benchmarks: { fr: 'Illimité', en: 'Unlimited' },
    journeys: { fr: 'Illimité', en: 'Unlimited' },
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

function cellClass(value, locale) {
  const text = String(t(value, locale));
  const lower = text.toLowerCase();
  if (lower === 'inclus' || lower === 'included') return 'pricing-cell pricing-cell--yes';
  if (lower.startsWith('non') || lower.startsWith('not ')) return 'pricing-cell pricing-cell--no';
  return 'pricing-cell';
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
  const statsLabels = locale === 'fr'
    ? { benchmarks: 'Benchmarks actifs', journeys: 'Parcours inclus' }
    : { benchmarks: 'Active Benchmarks', journeys: 'Journeys included' };
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
                                <dl class="pricing-plan__stats">
                                    <div class="pricing-plan__stat">
                                        <dt>${statsLabels.benchmarks}</dt>
                                        <dd>${t(plan.benchmarks, locale)}</dd>
                                    </div>
                                    <div class="pricing-plan__stat">
                                        <dt>${statsLabels.journeys}</dt>
                                        <dd>${t(plan.journeys, locale)}</dd>
                                    </div>
                                </dl>
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
        .map((value) => `<td class="${cellClass(value, locale)}">${t(value, locale)}</td>`)
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
        footnote2: '** Temps de mesure illimité sous réserve d\'un usage raisonnable du service.',
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
        footnote2: '** Unlimited measurement time subject to reasonable service use.',
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
