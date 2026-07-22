#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const publications = {
  fr: [
    "AndroWatts: Unpacking the Power Consumption of Mobile Device's Components — MobileSoft 2025 (Greenspector + INRIA, 2025)",
    'Managing Uncertainties in ICT Services Life Cycle Assessment using Fuzzy Logic — ICT4S Stockholm 2024 (Greenspector, INRIA, CNRS)',
    'Assessing the environmental impact of mobile applications: a measure framework toward DevGreenOps — MobileSoft 2024 (Greenspector, 2024)',
    'Reducing the environmental impact of digital health: Development of an ecoscore for health apps — DigitalHealth 2023 (Greenspector + Ministère de la Santé / ANS, 2023)',
    'The GreenLab4IoT project: development of an IoT measurement testbench for better eco-design — LCM 2023 (Greenspector + Evea Conseil, 2023)',
    'Investigating the Correlation between Performance Scores and Energy Consumption of Mobile Web Apps — Greenspector + Vrije Universiteit Amsterdam, 2020',
    'Software Measurement of Energy Consumption on Smartphones — Convince Project consortium, 2018',
    'Is “software eco-design” a solution to reduce the environmental impact of electronic equipment? — Vautier M., Philippot O., EGG 2016, Fraunhofer IZM, Berlin (Greenspector + Orange, IEEE, 2016)',
    'Characterization of the energy consumption of websites: Impact of website implementation on resource consumption — ICT4S 2014 (Greenspector + ADEME, 2014)'
  ],
  en: [
    "AndroWatts: Unpacking the Power Consumption of Mobile Device's Components — MobileSoft 2025 (Greenspector + INRIA, 2025)",
    'Managing Uncertainties in ICT Services Life Cycle Assessment using Fuzzy Logic — ICT4S Stockholm 2024 (Greenspector, INRIA, CNRS)',
    'Assessing the environmental impact of mobile applications: a measure framework toward DevGreenOps — MobileSoft 2024 (Greenspector, 2024)',
    'Reducing the environmental impact of digital health: Development of an ecoscore for health apps — DigitalHealth 2023 (Greenspector + French Ministry of Health / ANS, 2023)',
    'The GreenLab4IoT project: development of an IoT measurement testbench for better eco-design — LCM 2023 (Greenspector + Evea Conseil, 2023)',
    'Investigating the Correlation between Performance Scores and Energy Consumption of Mobile Web Apps — Greenspector + Vrije Universiteit Amsterdam, 2020',
    'Software Measurement of Energy Consumption on Smartphones — Convince Project consortium, 2018',
    'Is “software eco-design” a solution to reduce the environmental impact of electronic equipment? — Vautier M., Philippot O., EGG 2016, Fraunhofer IZM, Berlin (Greenspector + Orange, IEEE, 2016)',
    'Characterization of the energy consumption of websites: Impact of website implementation on resource consumption — ICT4S 2014 (Greenspector + ADEME, 2014)'
  ]
};

function renderPublications(locale) {
  return publications[locale]
    .map((publication) => `<li>${publication}</li>`)
    .join('\n                                ');
}

function renderBody(locale) {
  if (locale === 'fr') {
    return `<div class="test-bench-page innovation-page">
                    <div class="content-panel studio-page">
                    <section class="studio-section studio-intro">
                        <div class="studio-copy">
                            <p class="eyebrow">Notre positionnement</p>
                            <h2>Mesurer, pas estimer</h2>
                            <p>La plupart des outils d'évaluation environnementale du numérique reposent sur des modèles théoriques génériques appliqués à des données déclaratives ou à des analyses statiques de pages. Résultat : des estimations invérifiables, souvent très éloignées de la réalité.</p>
                            <p>Greenspector a fait un autre choix, plus exigeant : partir de la mesure réelle, sur appareils réels, et construire par la recherche les modèles qui transforment cette mesure en impacts environnementaux fiables. C'est ce qui fait de notre méthodologie l'une des rares du marché à être documentée, publiée et évaluée par la communauté scientifique.</p>
                        </div>
                    </section>

                    <section class="studio-section" aria-labelledby="innovation-pillars-title">
                        <p class="eyebrow">Nos 4 innovations</p>
                        <h2 id="innovation-pillars-title">De la mesure physique à l'indicateur actionnable</h2>
                        <div class="studio-grid test-bench-pillars">
                            <article class="studio-card">
                                <h3><span class="test-bench-pillar-icon" aria-hidden="true">⚡</span> La mesure réelle d'énergie sur appareils, en mode SaaS</h3>
                                <p>Notre banc de test (Test Bench) mesure l'énergie réellement consommée par des smartphones et tablettes réels, équipés de sondes haute précision, placés en conditions réelles d'utilisation : sur batterie, non connectés en USB pendant la mesure.</p>
                                <p>L'innovation ne réside pas seulement dans la mesure, mais dans son industrialisation en SaaS : lancer une mesure d'énergie sur un iPhone réel depuis son navigateur ou sa CI/CD, c'est une capacité unique au monde — fruit de plusieurs années de R&amp;D sur l'automatisation, la stabilisation des terminaux et la fiabilité métrologique.</p>
                                <p><a href="/a-propos/banc-tests-smartphones/">En savoir plus sur le Test Bench</a></p>
                            </article>
                            <article class="studio-card">
                                <h3><span class="test-bench-pillar-icon" aria-hidden="true">🌍</span> Un modèle d'impacts pour une ACV simplifiée</h3>
                                <p>Nos mesures alimentent un modèle d'impacts exclusif qui réalise une analyse de cycle de vie simplifiée du service numérique :</p>
                                <ul>
                                    <li>Toutes les phases du cycle de vie des matériels sollicités, sur l'ensemble de la chaîne : terminaux, réseaux, serveurs ;</li>
                                    <li>Un mécanisme de propagation des incertitudes, des sources et mesures jusqu'au résultat final ;</li>
                                    <li>8 indicateurs d'impacts pour aller au-delà du seul CO₂.</li>
                                </ul>
                                <p>Cette gestion rigoureuse des incertitudes a fait l'objet d'une publication scientifique avec l'INRIA et le CNRS (ICT4S 2024).</p>
                            </article>
                            <article class="studio-card">
                                <h3><span class="test-bench-pillar-icon" aria-hidden="true">🎯</span> L'Ecoscore : l'impact global en un coup d'œil</h3>
                                <p>Comment rendre actionnable une ACV multicritère ? Nous avons conçu l'Ecoscore, une note synthétique de A à G qui agrège la sobriété d'une application ou d'un site sur ses dimensions clés : ressources client, réseau et énergie.</p>
                                <p>Simple à communiquer, comparable dans le temps et entre applications, l'Ecoscore permet à toutes les parties prenantes de partager un même indicateur de pilotage. Son application au domaine de la santé a été développée avec le Ministère de la Santé et l'Agence du Numérique en Santé, et publiée (DigitalHealth 2023).</p>
                            </article>
                            <article class="studio-card">
                                <h3><span class="test-bench-pillar-icon" aria-hidden="true">✍️</span> L'automatisation des tests à la portée de tous</h3>
                                <p>Mesurer un parcours utilisateur réel nécessite de l'automatiser. Pour lever cette barrière, nous avons créé le GDSL, un langage de script simplifié conçu pour décrire un parcours en quelques lignes lisibles, complété par une interface visuelle de rédaction des tests.</p>
                                <p>Pas besoin d'être expert en automatisation mobile : équipes QA, product owners ou consultants écrivent leurs parcours et lancent leurs mesures en toute autonomie.</p>
                            </article>
                        </div>
                    </section>

                    <section class="studio-section" aria-labelledby="innovation-foundations-title">
                        <p class="eyebrow">Les fondations R&amp;D</p>
                        <h2 id="innovation-foundations-title">Plus de 12 ans de recherche, en collaboration</h2>
                        <div class="studio-grid innovation-foundations">
                            <article class="studio-card">
                                <h3>Recherche collaborative</h3>
                                <p>Nos outils et notre expertise sont le fruit de plus de 12 ans de R&amp;D, dont de nombreuses collaborations sur des projets labellisés français et européens avec des partenaires académiques et industriels : INRIA, CNRS, Vrije Universiteit Amsterdam, ADEME, Orange, Ministère de la Santé…</p>
                            </article>
                            <article class="studio-card">
                                <h3>Contribuer aux normes de demain</h3>
                                <p>Nous ne nous contentons pas d'appliquer les référentiels : nous participons à leur écriture.</p>
                                <ul>
                                    <li><strong>AFNOR / ISO :</strong> participation au groupe de travail français pour une norme ISO sur l'écoconception des services numériques.</li>
                                    <li><strong>W3C :</strong> contribution aux groupes de travail sur l'écoconception des sites web.</li>
                                </ul>
                            </article>
                            <article class="studio-card">
                                <h3>Labellisé Solar Impulse</h3>
                                <p>Greenspector est labellisé par la Fondation Solar Impulse, qui distingue les solutions à la fois écologiquement pertinentes et économiquement viables.</p>
                                <p><a href="https://solarimpulse.com/solutions-explorer/greenspector" target="_blank" rel="noopener noreferrer">Voir Greenspector sur Solar Impulse</a></p>
                            </article>
                        </div>
                    </section>

                    <section id="publications" class="studio-section" aria-labelledby="innovation-publications-title">
                        <p class="eyebrow">Publications scientifiques</p>
                        <h2 id="innovation-publications-title">Une méthodologie évaluée par des pairs</h2>
                        <p>La méthodologie Greenspector est régulièrement soumise à la communauté scientifique, dans des conférences et publications internationales :</p>
                        <div class="studio-card innovation-publications-card">
                            <ol class="innovation-publications">
                                ${renderPublications('fr')}
                            </ol>
                        </div>
                    </section>

                    <section class="studio-section studio-highlight test-bench-final-cta">
                        <div class="studio-copy">
                            <p class="eyebrow">Science &amp; industrie</p>
                            <h2>Une solution industrielle, une rigueur scientifique</h2>
                            <p>Appuyez vos décisions d'écoconception sur des mesures réelles et une méthodologie publiée.</p>
                            <div class="innovation-final-actions">
                                <a class="btn btn-gs-primary" href="/contact/">Demander une démo</a>
                                <a class="btn btn-gs-outline" href="/studio/mesure-impact-environnemental-numerique/">Consulter la méthodologie complète</a>
                            </div>
                        </div>
                    </section>
                    </div>
                </div>`;
  }

  return `<div class="test-bench-page innovation-page">
                    <div class="content-panel studio-page">
                    <section class="studio-section studio-intro">
                        <div class="studio-copy">
                            <p class="eyebrow">Our positioning</p>
                            <h2>Measure, do not estimate</h2>
                            <p>Most digital environmental assessment tools rely on generic theoretical models applied to declarative data or static page analyses. The result: unverifiable estimates, often far removed from reality.</p>
                            <p>Greenspector made a different, more demanding choice: start with real measurements on real devices and use research to build the models that turn those measurements into reliable environmental impacts. This makes our methodology one of the few on the market to be documented, published and assessed by the scientific community.</p>
                        </div>
                    </section>

                    <section class="studio-section" aria-labelledby="innovation-pillars-title">
                        <p class="eyebrow">Our 4 innovations</p>
                        <h2 id="innovation-pillars-title">From physical measurement to actionable indicators</h2>
                        <div class="studio-grid test-bench-pillars">
                            <article class="studio-card">
                                <h3><span class="test-bench-pillar-icon" aria-hidden="true">⚡</span> Real device energy measurement, delivered as SaaS</h3>
                                <p>Our Test Bench measures the energy actually consumed by real smartphones and tablets equipped with high-precision probes, under real usage conditions: on battery and without USB during measurement.</p>
                                <p>The innovation lies not only in measurement, but in delivering it at SaaS scale. Triggering an energy measurement on a real iPhone from a browser or CI/CD pipeline is a unique capability built through years of R&amp;D in automation, device stabilisation and metrological reliability.</p>
                                <p><a href="/a-propos/banc-tests-smartphones/">Learn more about the Test Bench</a></p>
                            </article>
                            <article class="studio-card">
                                <h3><span class="test-bench-pillar-icon" aria-hidden="true">🌍</span> An impact model for simplified LCA</h3>
                                <p>Our measurements feed an exclusive impact model that performs a simplified life-cycle assessment of a digital service:</p>
                                <ul>
                                    <li>All hardware life-cycle phases across devices, networks and servers;</li>
                                    <li>Uncertainty propagation from sources and measurements to the final result;</li>
                                    <li>8 impact indicators that go beyond CO₂ alone.</li>
                                </ul>
                                <p>This rigorous uncertainty management was published with INRIA and CNRS at ICT4S 2024.</p>
                            </article>
                            <article class="studio-card">
                                <h3><span class="test-bench-pillar-icon" aria-hidden="true">🎯</span> Ecoscore: global impact at a glance</h3>
                                <p>How can a multi-criteria LCA become actionable? We created Ecoscore, a synthetic A-to-G rating that aggregates the frugality of an app or website across client resources, network and energy.</p>
                                <p>Easy to communicate and compare over time or across applications, Ecoscore gives management, product and development teams a shared indicator. Its health-app application was developed with the French Ministry of Health and ANS and published at DigitalHealth 2023.</p>
                            </article>
                            <article class="studio-card">
                                <h3><span class="test-bench-pillar-icon" aria-hidden="true">✍️</span> Test automation accessible to everyone</h3>
                                <p>Measuring a real user journey requires automation. We created GDSL, a simplified scripting language that describes a journey in a few readable lines, complemented by a visual test editor.</p>
                                <p>QA teams, product owners and consultants can write journeys and launch measurements independently, without being mobile automation experts.</p>
                            </article>
                        </div>
                    </section>

                    <section class="studio-section" aria-labelledby="innovation-foundations-title">
                        <p class="eyebrow">R&amp;D foundations</p>
                        <h2 id="innovation-foundations-title">Over 12 years of collaborative research</h2>
                        <div class="studio-grid innovation-foundations">
                            <article class="studio-card">
                                <h3>Collaborative research</h3>
                                <p>Our tools and expertise are the result of over 12 years of R&amp;D, including French and European labelled projects with leading academic and industrial partners: INRIA, CNRS, Vrije Universiteit Amsterdam, ADEME, Orange, the French Ministry of Health and more.</p>
                            </article>
                            <article class="studio-card">
                                <h3>Contributing to tomorrow's standards</h3>
                                <p>We do more than apply standards: we help write them.</p>
                                <ul>
                                    <li><strong>AFNOR / ISO:</strong> participation in the French working group for an ISO standard on digital service ecodesign.</li>
                                    <li><strong>W3C:</strong> contribution to working groups on website ecodesign.</li>
                                </ul>
                            </article>
                            <article class="studio-card">
                                <h3>Solar Impulse labelled</h3>
                                <p>Greenspector has received the Solar Impulse Foundation label, recognising solutions that are both environmentally relevant and economically viable.</p>
                                <p><a href="https://solarimpulse.com/solutions-explorer/greenspector" target="_blank" rel="noopener noreferrer">See Greenspector on Solar Impulse</a></p>
                            </article>
                        </div>
                    </section>

                    <section id="publications" class="studio-section" aria-labelledby="innovation-publications-title">
                        <p class="eyebrow">Scientific publications</p>
                        <h2 id="innovation-publications-title">A peer-reviewed methodology</h2>
                        <p>Greenspector's methodology is regularly submitted to the scientific community through international conferences and publications:</p>
                        <div class="studio-card innovation-publications-card">
                            <ol class="innovation-publications">
                                ${renderPublications('en')}
                            </ol>
                        </div>
                    </section>

                    <section class="studio-section studio-highlight test-bench-final-cta">
                        <div class="studio-copy">
                            <p class="eyebrow">Science &amp; industry</p>
                            <h2>An industrial solution with scientific rigour</h2>
                            <p>Base your ecodesign decisions on real measurements and a published methodology.</p>
                            <div class="innovation-final-actions">
                                <a class="btn btn-gs-primary" href="/contact/">Request a demo</a>
                                <a class="btn btn-gs-outline" href="/studio/mesure-impact-environnemental-numerique/">View the complete methodology</a>
                            </div>
                        </div>
                    </section>
                    </div>
                </div>`;
}

const pages = {
  fr: {
    file: 'content/fr/pages/a-propos/innovations.json',
    page: {
      id: 'about-innovations',
      slug: '/a-propos/innovations/',
      template: 'html',
      meta: {
        title: 'Innovation et R&D | mesure environnementale scientifique | Greenspector',
        description: "Découvrez la R&D Greenspector : mesure réelle d'énergie, modèle d'impacts, Ecoscore, publications scientifiques et contributions aux normes.",
        keywords: 'innovation Greenspector, R&D, mesure énergie, Ecoscore, ACV numérique',
        ogTitle: "Innovation & R&D | La mesure d'impact fondée sur la science",
        ogDescription: "Plus de 12 ans de recherche au service d'une mesure environnementale réelle, documentée et publiée."
      },
      nav: {
        section: 'À propos',
        name: 'Nos innovations',
        primary: 'innovations Greenspector',
        secondary: 'R&D, Ecoscore'
      },
      hero: {
        label: 'Innovation & R&D',
        title: "La mesure d'impact environnemental du numérique, fondée sur la science",
        subtitle: "Là où le marché applique des modèles théoriques, Greenspector produit la recherche : mesure réelle d'énergie, modèle d'impacts avec propagation des incertitudes, publications évaluées par des pairs, contribution aux normes ISO et W3C.",
        actions: [
          { label: 'Découvrir notre méthodologie', href: '/studio/mesure-impact-environnemental-numerique/', primary: true, external: false },
          { label: 'Nos publications', href: '#publications', primary: false, external: false }
        ],
        reassurance: [
          { label: 'Recherche', value: '+12 ans de R&D' },
          { label: 'Reconnaissance', value: 'Projets labellisés France & Europe' },
          { label: 'Impact', value: 'Label Solar Impulse' },
          { label: 'Standards', value: 'Contributeur AFNOR/ISO & W3C' }
        ]
      }
    }
  },
  en: {
    file: 'content/en/pages/a-propos/innovations.json',
    page: {
      id: 'about-innovations',
      slug: '/a-propos/innovations/',
      template: 'html',
      meta: {
        title: 'Innovation and R&D | science-based environmental measurement | Greenspector',
        description: 'Explore Greenspector R&D: real energy measurement, impact model, Ecoscore, scientific publications and standards contributions.',
        keywords: 'Greenspector innovation, R&D, energy measurement, Ecoscore, digital LCA',
        ogTitle: 'Innovation & R&D | Science-based impact measurement',
        ogDescription: 'Over 12 years of research supporting real, documented and published environmental measurement.'
      },
      nav: {
        section: 'À propos',
        name: 'Our innovations',
        primary: 'Greenspector innovations',
        secondary: 'R&D, Ecoscore'
      },
      hero: {
        label: 'Innovation & R&D',
        title: 'Digital environmental impact measurement, grounded in science',
        subtitle: 'Where the market applies theoretical models, Greenspector produces research: real energy measurement, impact modelling with uncertainty propagation, peer-reviewed publications, and contributions to ISO and W3C standards.',
        actions: [
          { label: 'Discover our methodology', href: '/studio/mesure-impact-environnemental-numerique/', primary: true, external: false },
          { label: 'Our publications', href: '#publications', primary: false, external: false }
        ],
        reassurance: [
          { label: 'Research', value: '12+ years of R&D' },
          { label: 'Recognition', value: 'French & European labelled projects' },
          { label: 'Impact', value: 'Solar Impulse label' },
          { label: 'Standards', value: 'AFNOR/ISO & W3C contributor' }
        ]
      }
    }
  }
};

for (const [locale, config] of Object.entries(pages)) {
  const output = { ...config.page, bodyHtml: renderBody(locale) };
  fs.writeFileSync(path.join(ROOT, config.file), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${config.file}`);
}
