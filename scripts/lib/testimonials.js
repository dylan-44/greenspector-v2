const ASSETS = '/assets/img/external/greenspector.com/';

const testimonials = [
  {
    quote: {
      fr: 'Avec Greenspector Studio, nous mesurons l\'efficacité énergétique de notre application, utilisée par 7 millions de clients chaque mois, après chaque Build. Cela nous permet de réduire notre empreinte carbone, d\'améliorer nos performances et de renforcer notre image de marque.',
      en: 'With Greenspector Studio, we measure the energy efficiency of our application, used by 7 million customers every month, after every build. This helps us reduce our carbon footprint, improve performance and strengthen our brand image.'
    },
    photo: `${ASSETS}FLankar-150x150_9a821a87.jpg`,
    alt: { fr: 'Portrait de François Lankar', en: 'Portrait of François Lankar' },
    name: 'François LANKAR',
    role: {
      fr: 'Applications Manager, Bouygues Telecom',
      en: 'Applications Manager, Bouygues Telecom'
    }
  },
  {
    quote: {
      fr: 'Travailler sur la sobriété permet clairement d\'obtenir une application plus performante.',
      en: 'Working on digital sobriety clearly leads to a more performant application.'
    },
    photo: `${ASSETS}JAzria-150x150_fe3bb536.jpg`,
    alt: { fr: 'Portrait de Julien Azria', en: 'Portrait of Julien Azria' },
    name: 'Julien AZRIA',
    role: {
      fr: 'Digital Front Chapter Leader, Crédit Agricole Technologie & Services',
      en: 'Digital Front Chapter Leader, Crédit Agricole Technology & Services'
    }
  },
  {
    quote: {
      fr: 'Avec Greenspector Studio, les testeurs peuvent guider les développeurs en identifiant les régressions ou les effets indésirables d\'une modification.',
      en: 'With Greenspector Studio, testers can guide developers by identifying regressions or unwanted side effects from a change.'
    },
    photo: `${ASSETS}FGuerlais-150x150_7633ec1e.png`,
    alt: { fr: 'Portrait de Florence Guerlais', en: 'Portrait of Florence Guerlais' },
    name: 'Florence GUERLAIS',
    role: {
      fr: 'Manager, Test & QA Center of Expertise, Air France',
      en: 'Manager, Test & QA Center of Expertise, Air France'
    }
  },
  {
    quote: {
      fr: 'Nos développeurs ont été sensibilisés dès le démarrage du projet et ont – petit à petit – modifié leur manière de travailler pour adopter des réflexes d\'écoconception. Il s\'agit d\'une modification profonde des pratiques. Les indicateurs d\'écoscore de Greenspector nous ont servi d\'étalon tout au long de ce process.',
      en: 'Our developers were made aware from the start of the project and gradually changed how they work to adopt ecodesign habits. It is a deep change in practices. Greenspector ecoscore indicators served as our benchmark throughout this process.'
    },
    photo: `${ASSETS}NDesmons_7932a04e.jpeg`,
    alt: { fr: 'Portrait de Nicolas Desmons', en: 'Portrait of Nicolas Desmons' },
    name: 'Nicolas DESMONS',
    role: {
      fr: 'Chef d\'équipe services numériques aux usagers, Région Bretagne',
      en: 'Head of user digital services team, Région Bretagne'
    }
  },
  {
    quote: {
      fr: [
        'Il était important pour nous de pouvoir chiffrer et objectiver l\'impact concret des efforts que nous allions déployer en écoconception. Grâce à l\'écoscore de Greenspector, nous avons pu évaluer rationnellement le résultat de nos efforts avant et après projet.',
        'Greenspector met à disposition un outil de mesure qui permet d\'évaluer l\'évolution progressive des bonnes pratiques mises en place et d\'identifier les réajustements nécessaires pour davantage de sobriété.'
      ],
      en: [
        'It was important for us to quantify and objectify the concrete impact of the ecodesign efforts we were going to deploy. Thanks to the Greenspector ecoscore, we were able to rationally assess the results of our efforts before and after the project.',
        'Greenspector provides a measurement tool to track the progressive evolution of good practices implemented and identify adjustments needed for greater sobriety.'
      ]
    },
    photo: `${ASSETS}CSmeyers-150x150_1e5f8ccb.jpg`,
    alt: { fr: 'Portrait de Caroline Smeyers', en: 'Portrait of Caroline Smeyers' },
    name: 'Caroline SMEYERS',
    role: {
      fr: 'Gestionnaire Web, Bruxelles Environnement / Leefmilieu Brussels',
      en: 'Web Manager, Bruxelles Environnement / Leefmilieu Brussels'
    }
  },
  {
    quote: {
      fr: [
        'Pour s\'assurer de la fiabilité maximale de l\'écoscore, les équipes se sont appuyées sur Greenspector qui permet d\'évaluer de façon fiable l\'impact environnemental d\'une application de santé.',
        'En effet, Greenspector se base sur la mesure tout au long du parcours de l\'usage réel de l\'application, plus que sur le simple calcul de l\'impact environnemental du chargement de la page d\'accueil.'
      ],
      en: [
        'To ensure maximum ecoscore reliability, teams relied on Greenspector to reliably assess the environmental impact of a health application.',
        'Greenspector is based on measurement throughout the real application usage journey, rather than simply calculating the environmental impact of loading the home page.'
      ]
    },
    photo: `${ASSETS}BSeroussi-150x148_bb960bb4.jpg`,
    alt: { fr: 'Portrait de Dr Brigitte Seroussi', en: 'Portrait of Dr Brigitte Seroussi' },
    name: 'Dr Brigitte SEROUSSI',
    role: {
      fr: 'Directrice de Projets, Agence du Numérique en Santé (Ministère de la Santé)',
      en: 'Project Director, Agence du Numérique en Santé (Ministry of Health)'
    }
  }
];

function t(value, locale) {
  if (value && typeof value === 'object' && !Array.isArray(value) && (value.fr || value.en)) {
    return value[locale] || value.fr;
  }
  return value;
}

function renderQuoteParagraphs(quote, locale) {
  const parts = Array.isArray(quote[locale]) ? quote[locale] : [quote[locale]];
  return parts.map((part) => `<p>${part}</p>`).join('\n                                ');
}

function renderTestimonialsCarousel(locale, options = {}) {
  const {
    carouselId = 'pricingTestimonialsCarousel',
    titleId = 'pricing-testimonials-title',
    title = locale === 'fr' ? 'Leur avis sur Greenspector Studio' : 'Their view on Greenspector Studio',
    eyebrow = locale === 'fr' ? 'Ils en parlent' : 'They say',
    sectionClass = 'studio-section studio-quote-section pricing-testimonials',
    wrapContainer = false
  } = options;

  const prevLabel = locale === 'fr' ? 'Témoignage précédent' : 'Previous testimonial';
  const nextLabel = locale === 'fr' ? 'Témoignage suivant' : 'Next testimonial';
  const slideLabel = locale === 'fr' ? 'Témoignage' : 'Testimonial';

  const slides = testimonials
    .map((item, index) => {
      const active = index === 0 ? ' active' : '';
      return `<div class="carousel-item${active}">
                                <blockquote class="studio-quote pricing-testimonial-slide">
                                    ${renderQuoteParagraphs(item.quote, locale)}
                                    <footer>
                                        <img src="${item.photo}" alt="${t(item.alt, locale)}" width="64" height="64" loading="lazy" decoding="async">
                                        <div>
                                            <strong>${item.name}</strong>
                                            <span>${t(item.role, locale)}</span>
                                        </div>
                                    </footer>
                                </blockquote>
                            </div>`;
    })
    .join('\n                            ');

  const indicators = testimonials
    .map((_, index) => {
      const active = index === 0 ? ' class="active" aria-current="true"' : '';
      return `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}"${active} aria-label="${slideLabel} ${index + 1}"></button>`;
    })
    .join('\n                                ');

  const carousel = `<div id="${carouselId}" class="carousel slide pricing-testimonials-carousel" data-bs-ride="carousel" data-bs-interval="7000" data-bs-pause="hover" aria-roledescription="carousel">
                            <div class="carousel-inner">
                            ${slides}
                            </div>
                            <button class="carousel-control-prev pricing-testimonials-control" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">${prevLabel}</span>
                            </button>
                            <button class="carousel-control-next pricing-testimonials-control" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">${nextLabel}</span>
                            </button>
                            <div class="carousel-indicators pricing-testimonials-indicators">
                                ${indicators}
                            </div>
                        </div>`;

  const inner = `<p class="eyebrow">${eyebrow}</p>
                        <h2 id="${titleId}">${title}</h2>
                        ${carousel}`;

  if (wrapContainer) {
    return `<section class="${sectionClass}" aria-labelledby="${titleId}">
            <div class="container">
                <div class="studio-quote-section pricing-testimonials">
                ${inner}
                </div>
            </div>
        </section>`;
  }

  return `<section class="${sectionClass}" aria-labelledby="${titleId}">
                        ${inner}
                    </section>`;
}

module.exports = {
  testimonials,
  t,
  renderQuoteParagraphs,
  renderTestimonialsCarousel
};
