#!/usr/bin/env node
/* eslint-disable no-console, max-len */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const overrides = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/en/page-overrides.json'), 'utf8'));
const EXTRA_REPLACEMENTS = require('./en-extra-replacements');

const PAGE_META = {
  'index': {
    nav: { name: 'Home', secondary: 'Green IT SaaS, software ecodesign, digital impact measurement' },
    hero: {
      subtitle: 'The SaaS solution to validate the frugality and performance of your\n                            apps. Cover the blind spots of software quality.',
      actions: [{ label: 'Request a demo' }, { label: 'Discover Greenspector\n                                Studio' }]
    },
    ldJson: '{\n        "@context": "https://schema.org",\n        "@type": "SoftwareApplication",\n        "name": "Greenspector Studio",\n        "applicationCategory": "BusinessApplication",\n        "operatingSystem": "Web",\n        "description": "SaaS solution to validate the frugality and performance of mobile and web applications on real devices.",\n        "provider": {\n            "@type": "Organization",\n            "name": "Greenspector",\n            "url": "https://greenspector.com/"\n        }\n    }'
  },
  'about-equipe': {
    meta: {
      title: 'About us | Greenspector',
      description: 'Greenspector, a French pioneer in responsible digital for over 15 years. Measuring and optimising the environmental footprint and performance of digital services.',
      keywords: 'Greenspector, about us, responsible digital, software ecodesign, mission-driven company, DRI Group',
      ogTitle: 'About us | Greenspector',
      ogDescription: 'Greenspector, a French pioneer in responsible digital for over 15 years. Measuring and optimising the environmental footprint and performance of digital services.'
    },
    nav: { name: 'About us', primary: 'Greenspector', secondary: 'about us, responsible digital' },
    hero: { title: 'About us&nbsp;?', subtitle: 'French pioneer in responsible digital for over 15 years.' }
  },
  'conseil-audit': {
    meta: {
      title: 'Mobile application audit | mobile application audit | Greenspector',
      description: 'Greenspector page dedicated to: mobile application audit.',
      keywords: 'mobile application audit, energy performance audit',
      ogTitle: 'Mobile application audit | mobile application audit | Greenspector',
      ogDescription: 'Greenspector page dedicated to: mobile application audit.'
    },
    nav: { name: 'Mobile application audit', primary: 'mobile application audit', secondary: 'energy performance audit' },
    hero: {
      title: 'Mobile application audit',
      subtitle: 'Obtain your Digital Service Frugality Certificate with support from Greenspector experts.'
    }
  },
  'conseil-ecoconception': {
    meta: {
      title: 'Software ecodesign consulting | software ecodesign consulting | Greenspector',
      description: 'Greenspector page dedicated to: software ecodesign consulting.',
      keywords: 'software ecodesign consulting, responsible digital audit',
      ogTitle: 'Software ecodesign consulting | software ecodesign consulting | Greenspector',
      ogDescription: 'Greenspector page dedicated to: software ecodesign consulting.'
    },
    nav: { name: 'Software ecodesign consulting', primary: 'software ecodesign consulting', secondary: 'responsible digital audit' },
    hero: {
      title: 'Software ecodesign consulting',
      subtitle: 'Green IT consulting: get support from Greenspector experts.'
    }
  },
  'studio-banc-tests': {
    meta: {
      title: 'Key features | mobile test bench | Greenspector',
      description: 'Greenspector page dedicated to: mobile test bench.',
      keywords: 'mobile test bench, device lab, real smartphone testing',
      ogTitle: 'Key features | mobile test bench | Greenspector',
      ogDescription: 'Greenspector page dedicated to: mobile test bench.'
    },
    nav: { name: 'Key features', primary: 'mobile test bench', secondary: 'device lab, real smartphone testing' },
    hero: {
      title: 'Greenspector Studio',
      subtitle: 'Application frugality and performance, measurement of your digital services.'
    }
  },
  'studio-devgreenops': {
    meta: {
      title: 'For DevGreenOps | DevGreenOps | Greenspector',
      description: 'Greenspector page dedicated to: DevGreenOps.',
      keywords: 'DevGreenOps, GreenOps, responsible CI/CD',
      ogTitle: 'For DevGreenOps | DevGreenOps | Greenspector',
      ogDescription: 'Greenspector page dedicated to: DevGreenOps.'
    },
    nav: { name: 'For DevGreenOps', primary: 'DevGreenOps', secondary: 'GreenOps, responsible CI/CD' },
    hero: {
      title: 'DevGreenOps and continuous integration',
      subtitle: 'Measure and control your application resources throughout its lifecycle.'
    }
  },
  'studio-performance': {
    meta: {
      title: 'App performance measurement | mobile application performance | Greenspector',
      description: 'Assess the real performance of your mobile applications and websites on physical devices with Greenspector Studio. Identify performance bugs before your users do.',
      keywords: 'app performance measurement, mobile performance, user experience, device lab',
      ogTitle: 'App performance measurement | mobile application performance | Greenspector',
      ogDescription: 'Assess the real performance of your mobile applications and websites on physical devices with Greenspector Studio. Identify performance bugs before your users do.'
    },
    nav: { name: 'For application performance', primary: 'app performance measurement', secondary: 'mobile performance, user experience' },
    hero: {
      title: 'App performance measurement',
      subtitle: 'Assess the real performance of your digital services on physical\n                    devices, identify bugs before your users do.'
    }
  },
  'studio-batterie': {
    meta: {
      title: 'For battery discharge measurement | battery discharge measurement | Greenspector',
      description: 'Greenspector page dedicated to: battery discharge measurement.',
      keywords: 'battery discharge measurement, mobile battery life, battery consumption',
      ogTitle: 'For battery discharge measurement | battery discharge measurement | Greenspector',
      ogDescription: 'Greenspector page dedicated to: battery discharge measurement.'
    },
    nav: { name: 'For battery discharge measurement', primary: 'battery discharge measurement', secondary: 'mobile battery life, battery consumption' },
    hero: {
      title: 'App performance measurement',
      subtitle: 'Quickly identify performance bugs in your web and mobile applications.'
    }
  },
  'studio-ecoconception': {
    meta: {
      title: 'For software ecodesign | software ecodesign | Greenspector',
      description: 'Greenspector page dedicated to: software ecodesign.',
      keywords: 'software ecodesign, digital sobriety, green IT',
      ogTitle: 'For software ecodesign | software ecodesign | Greenspector',
      ogDescription: 'Greenspector page dedicated to: software ecodesign.'
    },
    nav: { name: 'For software ecodesign', primary: 'software ecodesign', secondary: 'digital sobriety, green IT' },
    hero: {
      title: 'Drive ecodesign by results',
      subtitle: 'Measurement indicators, environmental impacts and an ecoscore to guide every decision.'
    }
  },
  'studio-impact-env': {
    meta: {
      title: 'For environmental impact | digital environmental impact measurement | Greenspector',
      description: 'Greenspector page dedicated to: digital environmental impact measurement.',
      keywords: 'digital environmental impact measurement, digital footprint, energy impact',
      ogTitle: 'For environmental impact | digital environmental impact measurement | Greenspector',
      ogDescription: 'Greenspector page dedicated to: digital environmental impact measurement.'
    },
    nav: { name: 'For environmental impact', primary: 'digital environmental impact measurement', secondary: 'digital footprint, energy impact' },
    hero: {
      title: 'Digital environmental impact measurement',
      subtitle: 'A multi-criteria assessment of environmental impacts across the full lifecycle.'
    }
  },
  'case-bruxelles': {
    meta: {
      title: 'Bruxelles Environnement | ecodesign consulting | Greenspector',
      description: 'Greenspector case study: Bruxelles Environnement.',
      keywords: 'ecodesign consulting, public sector',
      ogTitle: 'Bruxelles Environnement | ecodesign consulting | Greenspector',
      ogDescription: 'Greenspector case study: Bruxelles Environnement.'
    },
    nav: { name: 'Bruxelles Environnement', primary: 'ecodesign consulting', secondary: 'public sector' },
    hero: {
      title: 'Bruxelles Environnement - Ecobuild',
      subtitle: 'How to integrate ecodesign into a public website redesign and measure results over time.'
    }
  },
  'case-treebal': {
    meta: {
      title: 'Treebal | eco-responsible application | Greenspector',
      description: 'Greenspector case study: Treebal.',
      keywords: 'eco-responsible application, messaging',
      ogTitle: 'Treebal | eco-responsible application | Greenspector',
      ogDescription: 'Greenspector case study: Treebal.'
    },
    nav: { name: 'Treebal', primary: 'eco-responsible application', secondary: 'digital sobriety' },
    hero: {
      title: 'How Treebal assessed the environmental impact of its eco-responsible messaging application',
      subtitle: 'An ecodesign approach validated by measurement and formalised with a Greenspector Bronze Certificate.'
    }
  },
  'case-bouygues': {
    meta: {
      title: 'Bouygues Telecom | mobile digital sobriety | Greenspector',
      description: 'Greenspector case study: Bouygues Telecom.',
      keywords: 'mobile digital sobriety, DevOps, frugality certification',
      ogTitle: 'Bouygues Telecom | mobile digital sobriety | Greenspector',
      ogDescription: 'Greenspector case study: Bouygues Telecom.'
    },
    nav: { name: 'Bouygues Telecom', primary: 'mobile digital sobriety', secondary: 'DevOps, frugality certification' },
    hero: {
      title: 'Bouygues Telecom obtains the Digital Frugality Certificate',
      subtitle: 'Silver level, with a 36% reduction in carbon impact on the Android mobile journey.'
    }
  }
};

const REPLACEMENTS = [
  ['La solution SaaS pour valider la sobriété et la performance de vos\n                            apps. Couvrez les angles morts de la qualité logicielle.', 'The SaaS solution to validate the frugality and performance of your\n                            apps. Cover the blind spots of software quality.'],
  ['Interface Greenspector Studio sur smartphone et tableau de bord', 'Greenspector Studio interface on smartphone and dashboard'],
  ['Demander une démo', 'Request a demo'],
  ['Découvrir Greenspector\n                                Studio', 'Discover Greenspector\n                                Studio'],
  ['Solution SaaS Green IT', 'Green IT SaaS solution'],
  ['Découvrez les problèmes de votre app avant vos utilisateurs', 'Find your app issues before your users do'],
  ['Consommation de batterie', 'Battery consumption'],
  ['Baisse de performance sur terminaux anciens', 'Performance drop on older devices'],
  ['Interruptions de parcours quand le réseau se dégrade', 'Journey interruptions when the network degrades'],
  ["Ralentissements à cause de l'IA", 'Slowdowns caused by AI'],
  ['Impact environnemental', 'Environmental impact'],
  ['Comment ça marche', 'How it works'],
  ['Mesurez, comprenez et améliorez en trois étapes', 'Measure, understand and improve in three steps'],
  ['Décrivez le parcours utilisateurs', 'Describe user journeys'],
  ['Décrivez le parcours de vos utilisateurs en quelques clics, ou utilisez notre langage de\n                            script DSL simple et efficace pour tester une app Android, une app iOS ou un parcours web.\n                        ', 'Describe your user journeys in a few clicks, or use our simple, efficient DSL scripting language to test an Android app, an iOS app or a web journey.\n                        '],
  ["Description d'un parcours utilisateur avec le langage DSL", 'Describing a user journey with the DSL language'],
  ['Choisissez les conditions de test', 'Choose test conditions'],
  ['Terminal récent ou ancien, réseau WiFi ou GSM&nbsp;: choisissez sur notre device cloud réel\n                            les conditions adaptées à vos objectifs. Puis lancez le test ou laissez votre CI/CD le\n                            faire.', 'Recent or older device, WiFi or cellular network&nbsp;: choose on our real device cloud\n                            the conditions suited to your goals. Then launch the test or let your CI/CD\n                            run it.'],
  ['Sélection des conditions de test sur le device cloud', 'Selecting test conditions on the device cloud'],
  ['Pilotez avec une vision claire', 'Manage with clear visibility'],
  ["Conso de batterie, performance, écoscore, impacts environnementaux… Observez vos résultats\n                            dans l'interface web ou utilisez nos API pour extraire les indicateurs clés vers vos\n                            tableaux de bord. Identifiez les axes de progrès et optimisez votre app&nbsp;!", 'Battery consumption, performance, ecoscore, environmental impacts… View your results\n                            in the web interface or use our APIs to export key indicators to your\n                            dashboards. Identify improvement areas and optimise your app&nbsp;!'],
  ['Tableau de bord des indicateurs et impacts', 'Indicators and impact dashboard'],
  ['Appel à l\'action', 'Call to action'],
  ["Passez de la mesure à l'action", 'Move from measurement to action'],
  ['Essayer gratuitement', 'Try for free'],
  ['Références clients', 'Client references'],
  ['Ils utilisent Greenspector Studio pour allier responsabilité\n                        environnementale, satisfaction des utilisateurs et performance de leurs applications', 'They use Greenspector Studio to combine environmental\n                        responsibility, user satisfaction and application performance'],
  ['Logo SNCF Connect', 'SNCF Connect logo'],
  ['Logo CATS', 'CATS logo'],
  ['Logo Air France', 'Air France logo'],
  ['Logo Bouygues Telecom', 'Bouygues Telecom logo'],
  ['Logo Orange', 'Orange logo'],
  ['Logo France Télévisions', 'France Télévisions logo'],
  ['Logo Région Bretagne', 'Région Bretagne logo'],
  ['Pourquoi Greenspector Studio', 'Why Greenspector Studio'],
  ["Du device à l'app, pilotez énergie, impacts et performance", 'From device to app, manage energy, impacts and performance'],
  ['Terminaux Android et iOS réels et stables pour des mesures\n                            fiables et répétables', 'Real, stable Android and iOS devices for reliable,\n                            repeatable measurements'],
  ['Le seul device cloud avec mesure réelle et précise de\n                            consommation de batterie', 'The only device cloud with real, precise\n                            battery consumption measurement'],
  ['Le seul device cloud souverain', 'The only sovereign device cloud'],
  ['Pas de changement dans votre code source, pas de SDK à\n                            ajouter', 'No changes to your source code, no SDK to\n                            add'],
  ['Facilement intégrable dans votre CI/CD&nbsp;: GitLab CI\n                        ', 'Easily integrated into your CI/CD&nbsp;: GitLab CI\n                        '],
  ['Cas client', 'Client case study'],
  ['Bouygues Telecom obtient le Certificat de Sobriété Numérique', 'Bouygues Telecom obtains the Digital Frugality Certificate'],
  ["Niveau Argent, avec une réduction de <strong>36&nbsp;%</strong>\n                            de l'impact carbone sur le parcours mobile Android — soit\n                            <strong>693&nbsp;tCO2e évitées par an</strong>.", 'Silver level, with a <strong>36&nbsp;%</strong>\n                            reduction in carbon impact on the Android mobile journey —\n                            <strong>693&nbsp;tCO2e avoided per year</strong>.'],
  ['Progression du niveau Bronze au niveau Argent en deux ans', 'Progression from Bronze to Silver level in two years'],
  ['Mesures régulières via Greenspector Studio intégrées à la CI/CD', 'Regular measurements via Greenspector Studio integrated into CI/CD'],
  ['Application Espace Client utilisée par des millions de clients chaque mois', 'Customer Portal application used by millions of customers every month'],
  ["Avec Greenspector Studio, nous mesurons l'efficacité énergétique de notre application,\n                                utilisée par 7 millions de clients chaque mois, après chaque build. Cela nous permet de\n                                réduire notre empreinte carbone, d'améliorer nos performances et de renforcer notre\n                                image de marque.", "With Greenspector Studio, we measure the energy efficiency of our application,\n                                used by 7 million customers every month, after each build. This allows us to\n                                reduce our carbon footprint, improve our performance and strengthen our\n                                brand image."],
  ['Responsable de Pôle Mobile Care et Assistance, Bouygues Telecom', 'Head of Mobile Care and Assistance Division, Bouygues Telecom'],
  ["Lire l'étude\n                            de cas", 'Read the case\n                            study'],
  ["Certification Sobriété Numérique niveau Argent pour l'application Bouygues Telecom", 'Silver Digital Frugality certification for the Bouygues Telecom application'],
  ["Prêt à améliorer la qualité de votre app comme jamais auparavant&nbsp;?", 'Ready to improve your app quality like never before&nbsp;?'],
  ['Notre histoire', 'Our story'],
  ['Notre mission&nbsp;:', 'Our mission&nbsp;:'],
  ['Du Device Lab aux applications, pilotez votre impact énergétique et vos\n                                    performances', 'From the Device Lab to applications, manage your energy impact and\n                                    performance'],
  ['Comment Greenspector contribue au bien commun&nbsp;?', 'How does Greenspector contribute to the common good&nbsp;?'],
  ['Cette question est légitime, comment Greenspector participe au bien commun&nbsp;?', 'This is a legitimate question: how does Greenspector contribute to the common good&nbsp;?'],
  ['Voyez par vous-même les actions que nous entreprenons.', 'See for yourself the actions we take.'],
  ["Contribuer à réduire l'impact de nos clients", 'Help reduce our clients\' impact'],
  ['Sensibiliser à l\'impact du numérique', 'Raise awareness of digital impact'],
  ['Améliorer les méthodologies du secteur', 'Improve industry methodologies'],
  ['Identifier et diffuser des bonnes pratiques de sobriété', 'Identify and share frugality best practices'],
  ['Fournir un outil de mesure pour certaines structures spéciales', 'Provide a measurement tool for certain special organisations'],
  ["Repenser la gouvernance de l'entreprise et sa place dans le bien commun", 'Rethink corporate governance and its role in the common good'],
  ['Participer à des publications extérieures', 'Contribute to external publications'],
  ["Et l'ouverture du code source&nbsp;?", 'And open source?'],
  ['Nous recrutons&nbsp;!', 'We are hiring&nbsp;!'],
  ['Postulez', 'Apply'],
  ['Leur avis sur Greenspector Studio', 'Their view on Greenspector Studio'],
  ['Expertise', 'Expertise'],
  ['Des experts écoconception et performance au service de votre projet', 'Software ecodesign and performance experts at the service of your project'],
  ['Démarrage', 'Getting started'],
  ['Auditer une application', 'Audit an application'],
  ['Certificat', 'Certificate'],
  ['Ils en parlent', 'What they say'],
  ['Standards', 'Standards'],
  ['Références', 'References'],
  ['Ils utilisent Greenspector Studio', 'They use Greenspector Studio'],
  ['Parler de votre projet', 'Discuss your project'],
  ['Mesure du parcours utilisateur', 'User journey measurement'],
  ['Nouveaux KPI', 'New KPIs'],
  ['Parcours en 4 étapes', '4-step journey'],
  ["Vue d'ensemble", 'Overview'],
  ['Pour les tech leads', 'For tech leads'],
  ['Mesure continue', 'Continuous measurement'],
  ['Usines logicielles', 'Software factories'],
  ['API REST', 'REST API'],
  ['GreenOps', 'GreenOps'],
  ['Cycle de vie', 'Lifecycle'],
  ['Performance réelle', 'Real performance'],
  ['Précision de mesure', 'Measurement precision'],
  ['Diagnostic', 'Diagnostics'],
  ['Stratégie de mesure', 'Measurement strategy'],
  ['Suivi continu', 'Continuous tracking'],
  ['Commencez dès maintenant', 'Get started now'],
  ['Investigation performance', 'Performance investigation'],
  ['Mesure batterie', 'Battery measurement'],
  ['Conditions terrain', 'Field conditions'],
  ['Automatisation', 'Automation'],
  ['Rapports de test', 'Test reports'],
  ['Maîtrise hardware', 'Hardware control'],
  ['Écoconception logicielle', 'Software ecodesign'],
  ['KPIs projet', 'Project KPIs'],
  ['Résultats concrets', 'Concrete results'],
  ['Collaboration', 'Collaboration'],
  ['Amélioration continue', 'Continuous improvement'],
  ['Méthodologie', 'Methodology'],
  ['Mesure directe', 'Direct measurement'],
  ['Multicritères', 'Multi-criteria'],
  ['Écoscore', 'Ecoscore'],
  ['Intégration métier', 'Business integration'],
  ['R&amp;D', 'R&amp;D'],
  ['Étude de cas', 'Case study'],
  ['Contexte de la mission', 'Mission context'],
  ['Mesures avant / après', 'Before / after measurements'],
  ['Interview', 'Interview'],
  ['Mise en oeuvre', 'Implementation'],
  ['Conseils opérationnels', 'Operational advice'],
  ['Ressources', 'Resources'],
  ['Challenge', 'Challenge'],
  ['Solution mise en place', 'Solution implemented'],
  ['Résultats', 'Results'],
  ['Avis expert', 'Expert opinion'],
  ['À vous de jouer', 'Your turn'],
  ['Auteur', 'Author'],
  ['Contexte', 'Context'],
  ['Industrialisation', 'Industrialisation'],
  ['Application', 'Application'],
  ['Choix techniques', 'Technical choices'],
  ['Demander une démo gratuite', 'Request a free demo'],
  ['Demander\n                                    une démo gratuite', 'Request a\n                                    free demo'],
  ['Demander\n                                        une démo gratuite', 'Request a\n                                        free demo'],
  ['Demander une\n                                        démo gratuite', 'Request a\n                                        free demo'],
  ['En savoir plus sur l\'intégration continue', 'Learn more about continuous integration'],
  ['En savoir plus sur\n                                    les impacts environnementaux', 'Learn more about\n                                    environmental impacts'],
  ['En savoir plus sur les\n                                    impacts (méthodologie, indicateurs...)', 'Learn more about\n                                    impacts (methodology, indicators...)'],
  ['En savoir plus sur l\'évaluation d\'impact', 'Learn more about impact assessment'],
  ['Découvrir nos partenaires', 'Discover our partners'],
  ['Consulter la documentation des API', 'View API documentation'],
  ['Voir un exemple de badge certifié', 'View a certified badge example'],
  ['Comment évaluer votre service numérique', 'How to assess your digital service'],
  ['Lire\n                                    l\'article détaillé dans Programmez!', 'Read\n                                    the detailed article in Programmez!'],
  ['Voir le communiqué Bouygues Telecom', 'View the Bouygues Telecom press release'],
  ['Voir l\'application sur Google Play', 'View the application on Google Play'],
  ['Je\n                                        contacte l\'équipe Greenspector', 'I\n                                        contact the Greenspector team'],
  ['Contacter Greenspector', 'Contact Greenspector'],
  ['Découvrir Treebal', 'Discover Treebal'],
  ['Voir le projet client', 'View client project'],
  ['Parler avec un expert', 'Talk to an expert'],
  ['Reconnaissance', 'Recognition'],
  ['Compatibilité standards', 'Standards compatibility'],
  ['Compatibilité méthodologique', 'Methodological compatibility'],
  ['Références reconnues', 'Recognised references'],
  ['Approche scientifique', 'Scientific approach'],
  ['Référentiels', 'Frameworks'],
  ['Compatible avec les meilleurs standards', 'Compatible with leading standards'],
  ['Compatible avec les meilleurs référentiels du domaine', 'Compatible with leading industry frameworks'],
  ['Compatible avec les meilleurs standards du domaine', 'Compatible with leading industry standards'],
  ['Pour allier responsabilité environnementale, satisfaction utilisateur et performance\n                            applicative.', 'To combine environmental responsibility, user satisfaction and application\n                            performance.'],
  ['Pour allier responsabilité environnementale, satisfaction utilisateur et performance\n                            applicative.', 'To combine environmental responsibility, user satisfaction and application\n                            performance.'],
  ['Solution reconnue pour son efficacité environnementale.', 'Solution recognised for its environmental efficiency.'],
  ['Solution reconnue pour son efficacité environnementale et sa précision de mesure.', 'Solution recognised for its environmental efficiency and measurement precision.'],
  ['Solution reconnue pour sa contribution à la protection de l\'environnement.', 'Solution recognised for its contribution to protecting the environment.'],
  ['Solution reconnue pour son efficacité environnementale et sa rigueur de mesure.', 'Solution recognised for its environmental efficiency and measurement rigour.'],
  ['Une expertise fondée sur la recherche et les retours terrain.', 'Expertise built on research and field feedback.'],
  ['Une expertise fondée sur la recherche, les publications et les retours terrain.', 'Expertise built on research, publications and field feedback.'],
  ['Une innovation continue nourrie par la recherche et les retours terrain.', 'Continuous innovation driven by research and field feedback.'],
  ['Une innovation continue nourrie par la recherche et les retours terrain depuis plus\n                                    de 12 ans.', 'Continuous innovation driven by research and field feedback for over\n                                    12 years.'],
  ['Une méthodologie alimentée par la recherche et des publications internationales.', 'A methodology powered by research and international publications.'],
  ['Des innovations issues de la recherche et présentées dans des conférences\n                                    internationales.', 'Innovations from research presented at international\n                                    conferences.'],
  ['Les innovations Greenspector sont le fruit d\'un travail de recherche et d\'une\n                                    contribution continue à des articles et conférences internationales.', 'Greenspector innovations are the result of research work and ongoing\n                                    contribution to international articles and conferences.'],
  ['ACV (ISO 14040), SCI Green Software Foundation, RCP ADEME et références associées.', 'LCA (ISO 14040), Green Software Foundation SCI, ADEME RCP and related references.'],
  ['ACV (ISO 14040), SCI Green Software Foundation, RCP ADEME et standards associés.', 'LCA (ISO 14040), Green Software Foundation SCI, ADEME RCP and related standards.'],
  ['ACV (ISO 14040), SCI Green Software Foundation, RCP ADEME et référentiels associés.', 'LCA (ISO 14040), Green Software Foundation SCI, ADEME RCP and related frameworks.'],
  ['Le modèle d\'impacts est compatible avec les standards du domaine : ACV ISO 14040,\n                                    SCI de la Green Software Foundation, RCP ADEME et autres références du secteur.', 'The impact model is compatible with industry standards: ISO 14040 LCA,\n                                    Green Software Foundation SCI, ADEME RCP and other sector references.'],
  ['Tarifs', 'Pricing'],
  ['Page Greenspector dédiée au sujet :', 'Greenspector page dedicated to:'],
  ['Mot-clé principal :', 'Primary keyword:'],
  ['Mots-clés secondaires :', 'Secondary keywords:']
];

function translateHtml(html) {
  if (!html) return html;
  let out = html;
  for (const [fr, en] of [...REPLACEMENTS, ...EXTRA_REPLACEMENTS]) {
    out = out.split(fr).join(en);
  }
  return out;
}

function translateContentMeta(arr) {
  return arr?.map((item) =>
    item
      .replace(/^Mot-clé principal : /, 'Primary keyword: ')
      .replace(/^Mots-clés secondaires : /, 'Secondary keywords: ')
  );
}

function pageJsonPath(locale, pagePath) {
  const rel = pagePath === 'index' ? 'index.json' : `${pagePath}.json`;
  return path.join(ROOT, 'content', locale, 'pages', rel);
}

const PAGES = [
  { id: 'home', path: 'index' },
  { id: 'about-equipe', path: 'a-propos/equipe-greenspector' },
  { id: 'conseil-audit', path: 'conseil/audit-application-mobile' },
  { id: 'conseil-ecoconception', path: 'conseil/ecoconception-logicielle' },
  { id: 'studio-banc-tests', path: 'studio/banc-tests-mobiles' },
  { id: 'studio-devgreenops', path: 'studio/devgreenops' },
  { id: 'studio-performance', path: 'studio/mesure-performance-app' },
  { id: 'studio-batterie', path: 'studio/mesure-decharge-batterie' },
  { id: 'studio-ecoconception', path: 'studio/outil-ecoconception-logicielle' },
  { id: 'studio-impact-env', path: 'studio/mesure-impact-environnemental-numerique' },
  { id: 'case-bruxelles', path: 'ressources/etudes-de-cas/bruxelles-environnement-ecobuild' },
  { id: 'case-treebal', path: 'ressources/etudes-de-cas/treebal-application-ecoresponsable' },
  { id: 'case-bouygues', path: 'ressources/etudes-de-cas/bouygues-telecom-sobriete-numerique-mobile' }
];

function main() {
  for (const { id, path: pagePath } of PAGES) {
    const fr = JSON.parse(fs.readFileSync(pageJsonPath('fr', pagePath), 'utf8'));
    const pm = PAGE_META[id] || {};
    const po = overrides[id] || {};

    const en = {
      id: fr.id,
      slug: fr.slug,
      template: fr.template,
      meta: { ...fr.meta, ...pm.meta, ...po.meta },
      nav: { ...fr.nav, ...pm.nav, ...po.nav },
      hero: {
        ...fr.hero,
        ...pm.hero,
        ...po.hero,
        label: fr.hero?.label,
        actions: fr.hero?.actions?.map((a, i) => ({
          ...a,
          label: pm.hero?.actions?.[i]?.label || translateHtml(a.label)
        }))
      }
    };

    if (fr.bodyHtml) en.bodyHtml = translateHtml(fr.bodyHtml);
    if (fr.contentMeta) en.contentMeta = translateContentMeta(fr.contentMeta);
    if (pm.ldJson) en.ldJson = pm.ldJson;
    else if (fr.ldJson) en.ldJson = translateHtml(fr.ldJson);

    if (po.meta) en.meta = { ...en.meta, ...po.meta };
    if (po.hero) {
      en.hero = { ...en.hero, ...po.hero };
      if (po.hero.actions) {
        en.hero.actions = fr.hero.actions.map((a, i) => ({
          ...a,
          label: po.hero.actions?.[i]?.label || en.hero.actions?.[i]?.label || translateHtml(a.label)
        }));
      }
    }

    const enPath = pageJsonPath('en', pagePath);
    fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`, 'utf8');
    console.log('Wrote', enPath);
  }
}

main();
