#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function faqItem(q, a) {
  return `<details class="pricing-faq-item">
                                <summary><span>${q}</span></summary>
                                <div class="pricing-faq-item__answer"><p>${a}</p></div>
                            </details>`;
}

function renderBody(locale) {
  if (locale === 'fr') {
    const faq = [
      faqItem(
        'En quoi votre mesure d\'énergie diffère-t-elle des estimations de batterie d\'Android ou iOS ?',
        'Les compteurs des OS estiment la consommation à partir de modèles internes, variables selon les constructeurs et les versions. Nos sondes mesurent l\'énergie réellement consommée par le terminal. C\'est la différence entre une estimation et une mesure.'
      ),
      faqItem(
        'Pourquoi les terminaux ne sont-ils pas branchés pendant les tests ?',
        'Un terminal alimenté en USB ne se comporte pas comme un terminal sur batterie : gestion d\'énergie, fréquences processeur, comportement réseau diffèrent. Mesurer sur batterie est la seule façon de refléter l\'expérience réelle de vos utilisateurs.'
      ),
      faqItem(
        'Puis-je tester sur iPhone ?',
        'Oui. Greenspector opère le premier banc de mesure d\'énergie sur appareils iOS réels au monde.'
      ),
      faqItem(
        'Comment garantissez-vous la fiabilité des mesures ?',
        'Par la stabilisation continue des terminaux, la répétition des mesures et l\'affichage systématique des incertitudes. Notre méthodologie est publique et documentée.'
      ),
      faqItem(
        'Le banc peut-il être installé chez nous ?',
        'C\'est possible, contactez-nous.'
      ),
      faqItem(
        'Est-ce compatible avec ma CI/CD ?',
        'Oui, Greenspector Studio expose des API permettant de déclencher les mesures à chaque build ou release et de piloter des budgets d\'énergie et de ressources.'
      )
    ].join('\n                            ');

    return `<div class="test-bench-page">
                    <div class="content-panel studio-page">
                    <section class="studio-section studio-intro">
                        <div class="studio-copy">
                            <p class="eyebrow">Le problème à résoudre</p>
                            <h2>Les device farms testent le fonctionnel. Le Test Bench mesure aussi l'efficience.</h2>
                            <p>Les device labs du marché vous donnent accès à des milliers d'appareils pour vérifier que votre application fonctionne. Mais ces appareils sont branchés en permanence, connectés en USB, dans un état énergétique incontrôlé. Impossible d'y mesurer ce que consomme réellement votre application dans la poche de vos utilisateurs.</p>
                            <p>Le Test Bench Greenspector a été conçu pour répondre à une autre question : combien votre application consomme-t-elle d'énergie, de données et de ressources — et comment l'optimiser ?</p>
                        </div>
                    </section>

                    <section class="studio-section" aria-labelledby="test-bench-pillars-title">
                        <p class="eyebrow">Les 4 piliers</p>
                        <h2 id="test-bench-pillars-title">Ce qui distingue le Test Bench Greenspector</h2>
                        <div class="studio-grid test-bench-pillars">
                            <article class="studio-card">
                                <h3><span class="test-bench-pillar-icon" aria-hidden="true">⚡</span> Une mesure d'énergie réelle, pas simulée</h3>
                                <p>Chaque terminal du banc est équipé de sondes de mesure haute précision qui mesurent l'énergie réellement consommée par l'appareil, à haute fréquence d'échantillonnage.</p>
                                <p>Résultat : des données d'énergie fiables, comparables et opposables, y compris sur iPhone — une première mondiale.</p>
                            </article>
                            <article class="studio-card">
                                <h3><span class="test-bench-pillar-icon" aria-hidden="true">🎯</span> Un environnement stabilisé pour des mesures précises</h3>
                                <p>Une mesure n'a de valeur que si elle est reproductible. Chaque terminal est surveillé et stabilisé en continu : luminosité, applications en arrière-plan, état de charge, services système. Vous comparez deux versions, deux parcours ou deux concurrents à conditions strictement identiques, avec une incertitude de mesure connue et affichée.</p>
                            </article>
                            <article class="studio-card">
                                <h3><span class="test-bench-pillar-icon" aria-hidden="true">📱</span> Des terminaux en conditions réelles d'utilisation</h3>
                                <p>Vos utilisateurs n'utilisent pas leur smartphone branché à un câble USB dans un data center. Sur le Test Bench, les terminaux sont en mode utilisateur réel : sur batterie et non alimentés pendant la mesure, sans connexion USB active, en connectivité Wi-Fi ou cellulaire selon votre stratégie de test.</p>
                            </article>
                            <article class="studio-card">
                                <h3><span class="test-bench-pillar-icon" aria-hidden="true">🌍</span> Un parc représentatif de vos vrais utilisateurs</h3>
                                <p>Tester uniquement sur le dernier flagship, c'est ignorer la majorité de vos utilisateurs. Le parc couvre 3 gammes (entrée, milieu, haut de gamme), plusieurs générations de terminaux, Android et iOS, smartphones et tablettes. Vous validez que votre service reste performant et sobre pour tous vos utilisateurs — y compris sur appareils anciens, un levier clé contre l'obsolescence.</p>
                            </article>
                        </div>
                    </section>

                    <section class="studio-section" aria-labelledby="test-bench-compare-title">
                        <p class="eyebrow">Comparatif</p>
                        <h2 id="test-bench-compare-title">Device farm classique vs Test Bench Greenspector</h2>
                        <div class="test-bench-table-wrap" tabindex="0" role="region" aria-label="Comparatif device farm et Test Bench Greenspector">
                            <table class="test-bench-table">
                                <thead>
                                    <tr>
                                        <th scope="col"></th>
                                        <th scope="col">Device farm classique</th>
                                        <th scope="col">Test Bench Greenspector</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">Objectif</th>
                                        <td>Tests fonctionnels et compatibilité</td>
                                        <td>Tests fonctionnels + mesure d'énergie, de performance et d'impact environnemental</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Mesure d'énergie</th>
                                        <td>Estimation logicielle (au mieux)</td>
                                        <td>Mesure réelle par sondes haute précision</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Alimentation pendant le test</th>
                                        <td>Terminal branché en USB</td>
                                        <td>Terminal sur batterie, en conditions réelles</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Stabilité de l'environnement</th>
                                        <td>Remise à zéro entre les tests</td>
                                        <td>Stabilisation continue et monitoring des conditions de mesure</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Parc</th>
                                        <td>Volume maximal de modèles</td>
                                        <td>Parc représentatif : 3 gammes × plusieurs générations, Android/iOS, smartphone/tablette</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Souveraineté</th>
                                        <td>Devices hébergés aux US ou en Europe, sur des technologies non souveraines (AWS, Google/Firebase…)</td>
                                        <td>Infrastructure souveraine, hébergée et opérée en France par Greenspector</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section class="studio-section pricing-faq test-bench-faq" aria-labelledby="test-bench-faq-title">
                        <p class="eyebrow">FAQ</p>
                        <h2 id="test-bench-faq-title">Questions fréquentes</h2>
                        <div class="pricing-faq-list">
                            ${faq}
                        </div>
                    </section>

                    <section class="studio-section studio-highlight test-bench-final-cta">
                        <div class="studio-copy">
                            <p class="eyebrow">Passez à la mesure réelle</p>
                            <h2>Mesurez. Ne simulez plus.</h2>
                            <p>Découvrez le comportement énergétique réel de votre application sur le Test Bench Greenspector.</p>
                            <p><a class="btn btn-gs-primary" href="/contact/">Demander une démo</a></p>
                        </div>
                    </section>
                    </div>
                </div>`;
  }

  const faqEn = [
    faqItem(
      'How is your energy measurement different from Android or iOS battery estimates?',
      'OS counters estimate consumption from internal models that vary by manufacturer and version. Our probes measure the energy actually consumed by the device. That is the difference between an estimate and a measurement.'
    ),
    faqItem(
      'Why are devices not plugged in during tests?',
      'A USB-powered device does not behave like one on battery: power management, CPU frequencies and network behaviour differ. Measuring on battery is the only way to reflect your users\' real experience.'
    ),
    faqItem(
      'Can I test on iPhone?',
      'Yes. Greenspector operates the world\'s first energy measurement bench on real iOS devices.'
    ),
    faqItem(
      'How do you guarantee measurement reliability?',
      'Through continuous device stabilisation, repeated measurements and systematic display of uncertainties. Our methodology is public and documented.'
    ),
    faqItem(
      'Can the bench be installed on our premises?',
      'Yes — contact us to discuss deployment options.'
    ),
    faqItem(
      'Is it compatible with my CI/CD pipeline?',
      'Yes. Greenspector Studio provides APIs to trigger measurements on every build or release and to manage energy and resource budgets.'
    )
  ].join('\n                            ');

  return `<div class="test-bench-page">
                    <div class="content-panel studio-page">
                    <section class="studio-section studio-intro">
                        <div class="studio-copy">
                            <p class="eyebrow">The problem to solve</p>
                            <h2>Device farms test functionality. The Test Bench also measures efficiency.</h2>
                            <p>Market device labs give you access to thousands of devices to check that your app works. But those devices stay plugged in, connected via USB, in an uncontrolled energy state. You cannot measure what your app actually consumes in your users\' pockets.</p>
                            <p>The Greenspector Test Bench was designed to answer a different question: how much energy, data and resources does your app consume — and how can you optimise it?</p>
                        </div>
                    </section>

                    <section class="studio-section" aria-labelledby="test-bench-pillars-title">
                        <p class="eyebrow">The 4 pillars</p>
                        <h2 id="test-bench-pillars-title">What sets the Greenspector Test Bench apart</h2>
                        <div class="studio-grid test-bench-pillars">
                            <article class="studio-card">
                                <h3><span class="test-bench-pillar-icon" aria-hidden="true">⚡</span> Real energy measurement, not simulation</h3>
                                <p>Every device on the bench is fitted with high-precision measurement probes that capture the energy actually consumed, at high sampling frequency.</p>
                                <p>The result: reliable, comparable and defensible energy data — including on iPhone, a world first.</p>
                            </article>
                            <article class="studio-card">
                                <h3><span class="test-bench-pillar-icon" aria-hidden="true">🎯</span> A stabilised environment for accurate measurements</h3>
                                <p>A measurement is only useful if it is reproducible. Each device is monitored and stabilised continuously: brightness, background apps, charge level, system services. Compare two versions, journeys or competitors under strictly identical conditions, with known and displayed measurement uncertainty.</p>
                            </article>
                            <article class="studio-card">
                                <h3><span class="test-bench-pillar-icon" aria-hidden="true">📱</span> Devices in real usage conditions</h3>
                                <p>Your users do not use their phone tethered to USB in a data centre. On the Test Bench, devices run in real user mode: on battery without external power during measurement, no active USB connection, on Wi-Fi or cellular according to your test strategy.</p>
                            </article>
                            <article class="studio-card">
                                <h3><span class="test-bench-pillar-icon" aria-hidden="true">🌍</span> A fleet representative of your real users</h3>
                                <p>Testing only on the latest flagship ignores most of your users. The fleet covers 3 tiers (entry, mid, high end), several device generations, Android and iOS, phones and tablets. Validate that your service stays performant and frugal for everyone — including older devices, a key lever against obsolescence.</p>
                            </article>
                        </div>
                    </section>

                    <section class="studio-section" aria-labelledby="test-bench-compare-title">
                        <p class="eyebrow">Comparison</p>
                        <h2 id="test-bench-compare-title">Classic device farm vs Greenspector Test Bench</h2>
                        <div class="test-bench-table-wrap" tabindex="0" role="region" aria-label="Device farm vs Greenspector Test Bench comparison">
                            <table class="test-bench-table">
                                <thead>
                                    <tr>
                                        <th scope="col"></th>
                                        <th scope="col">Classic device farm</th>
                                        <th scope="col">Greenspector Test Bench</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">Goal</th>
                                        <td>Functional and compatibility testing</td>
                                        <td>Functional testing + energy, performance and environmental impact measurement</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Energy measurement</th>
                                        <td>Software estimate (at best)</td>
                                        <td>Real measurement via high-precision probes</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Power during test</th>
                                        <td>Device plugged in via USB</td>
                                        <td>Device on battery, in real conditions</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Environment stability</th>
                                        <td>Reset between tests</td>
                                        <td>Continuous stabilisation and monitoring of measurement conditions</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Device fleet</th>
                                        <td>Maximum number of models</td>
                                        <td>Representative fleet: 3 tiers × several generations, Android/iOS, phone/tablet</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Sovereignty</th>
                                        <td>Devices hosted in the US or Europe on non-sovereign stacks (AWS, Google/Firebase…)</td>
                                        <td>Sovereign infrastructure, hosted and operated in France by Greenspector</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section class="studio-section pricing-faq test-bench-faq" aria-labelledby="test-bench-faq-title">
                        <p class="eyebrow">FAQ</p>
                        <h2 id="test-bench-faq-title">Frequently asked questions</h2>
                        <div class="pricing-faq-list">
                            ${faqEn}
                        </div>
                    </section>

                    <section class="studio-section studio-highlight test-bench-final-cta">
                        <div class="studio-copy">
                            <p class="eyebrow">Move to real measurement</p>
                            <h2>Measure. Stop simulating.</h2>
                            <p>Discover the real energy behaviour of your application on the Greenspector Test Bench.</p>
                            <p><a class="btn btn-gs-primary" href="/contact/">Request a demo</a></p>
                        </div>
                    </section>
                    </div>
                </div>`;
}

const pages = {
  fr: {
    path: 'content/fr/pages/a-propos/banc-tests-smartphones.json',
    page: {
      id: 'about-banc',
      slug: '/a-propos/banc-tests-smartphones/',
      template: 'html',
      meta: {
        title: 'Test Bench Greenspector | banc de tests smartphones | Greenspector',
        description:
          'Le seul banc de test qui mesure réellement l\'énergie de vos applications sur smartphones et tablettes réels, Android et iOS.',
        keywords: 'banc tests smartphones, Test Bench Greenspector, device lab, mesure énergie mobile',
        ogTitle: 'Test Bench Greenspector | mesure d\'énergie réelle',
        ogDescription:
          'Terminaux réels instrumentés, conditions utilisateur, parc représentatif : le Device Lab souverain Greenspector.'
      },
      nav: {
        section: 'À propos',
        name: 'Notre banc de tests',
        primary: 'Test Bench Greenspector',
        secondary: 'device lab, mesure énergie'
      },
      hero: {
        label: 'Le Test Bench Greenspector',
        title: 'Le seul banc de test qui mesure réellement l\'énergie de vos applications',
        subtitle:
          'Des smartphones et tablettes réels, instrumentés de sondes de mesure, placés dans les conditions exactes de vos utilisateurs. Pas d\'émulation, pas d\'estimation : de la mesure.',
        actions: [
          {
            label: 'Demander une démo',
            href: '/contact/',
            primary: true,
            external: false
          }
        ],
        reassurance: [
          { label: 'Compatibilité', value: 'Android & iOS' },
          { label: 'Appareils réels', value: 'Smartphones & tablettes' },
          { label: 'Parc représentatif', value: '3 gammes, plusieurs générations' },
          { label: 'Souveraineté', value: 'Hébergé et opéré en France' }
        ]
      }
    }
  },
  en: {
    path: 'content/en/pages/a-propos/banc-tests-smartphones.json',
    page: {
      id: 'about-banc',
      slug: '/a-propos/banc-tests-smartphones/',
      template: 'html',
      meta: {
        title: 'Greenspector Test Bench | smartphone test bench | Greenspector',
        description:
          'The only test bench that truly measures your applications\' energy on real smartphones and tablets, Android and iOS.',
        keywords: 'smartphone test bench, Greenspector Test Bench, device lab, mobile energy measurement',
        ogTitle: 'Greenspector Test Bench | real energy measurement',
        ogDescription:
          'Instrumented real devices, user-like conditions, representative fleet: Greenspector\'s sovereign Device Lab.'
      },
      nav: {
        section: 'À propos',
        name: 'Our test bench',
        primary: 'Greenspector Test Bench',
        secondary: 'device lab, energy measurement'
      },
      hero: {
        label: 'The Greenspector Test Bench',
        title: 'The only test bench that truly measures your applications\' energy',
        subtitle:
          'Real smartphones and tablets, fitted with measurement probes, under the same conditions as your users. No emulation, no estimates: measurement.',
        actions: [
          {
            label: 'Request a demo',
            href: '/contact/',
            primary: true,
            external: false
          }
        ],
        reassurance: [
          { label: 'Compatibility', value: 'Android & iOS' },
          { label: 'Real devices', value: 'Smartphones & tablets' },
          { label: 'Representative fleet', value: '3 tiers, multiple generations' },
          { label: 'Sovereignty', value: 'Hosted and operated in France' }
        ]
      }
    }
  }
};

for (const [locale, config] of Object.entries(pages)) {
  const output = { ...config.page, bodyHtml: renderBody(locale) };
  fs.writeFileSync(path.join(ROOT, config.path), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${config.path}`);
}
