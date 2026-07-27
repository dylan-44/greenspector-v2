const { slugToRelative, slugToAsset, rewriteBodyHtml } = require('./paths');
const { renderTestimonialsCarousel } = require('./testimonials');
const { renderIcon } = require('./icons');
const { renderPicture } = require('./images');

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function resolveInternalHref(href, ctx) {
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) {
    return href;
  }
  const normalized = href.endsWith('/') || href.includes('.') ? href : `${href}/`;
  const localeSlug = ctx.resolveLocaleSlug(normalized, ctx.locale, ctx.slugLookup);
  return slugToRelative(ctx.pageSlug, localeSlug);
}

function renderHeroActions(actions, ctx) {
  if (!actions || !actions.length) {
    return '';
  }

  return `<div class="hero-actions">${actions
    .map((action) => {
      const href = resolveInternalHref(action.href, ctx);
      const cls = action.primary ? 'btn btn-gs-primary' : 'btn btn-gs-outline';
      const external = action.external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a class="${cls}" href="${esc(href)}"${external}>${esc(action.label)}</a>`;
    })
    .join('')}</div>`;
}

function renderHeroReassurance(items, locale) {
  if (!items || !items.length) {
    return '';
  }

  const label = locale === 'fr' ? 'Points clés' : 'Highlights';
  const list = items
    .map((item) => {
      if (typeof item === 'string') {
        return `<li><strong>${esc(item)}</strong></li>`;
      }
      return `<li><span>${esc(item.label)}</span><strong>${esc(item.value)}</strong></li>`;
    })
    .join('');
  return `<div class="hero-reassurance-band">
            <div class="container">
                <ul class="hero-reassurance" aria-label="${label}">${list}</ul>
            </div>
        </div>`;
}

function renderHero(page, ctx, nav) {
  const { hero } = page;
  const label = hero.label ? `<p class="section-label">${esc(hero.label)}</p>` : '';
  const subtitle = hero.subtitle ? `<p class="hero-subtitle">${hero.subtitle}</p>` : '';
  const actions = renderHeroActions(hero.actions, ctx);
  const reassurance = renderHeroReassurance(hero.reassurance, ctx.locale);
  const slugNote = page.slugNote ? `<p class="slug-note">${esc(page.slugNote)}</p>` : '';

  return `<section class="hero">
            <div class="container">
                ${label}
                <h1>${hero.title}</h1>
                ${subtitle}
                ${actions}
                ${slugNote}
            </div>
        </section>${reassurance}`;
}

function rewriteHtml(html, ctx) {
  return rewriteBodyHtml(html, ctx.pageSlug, ctx.locale, ctx.slugLookup, ctx.resolveLocaleSlug);
}

function renderDefaultBody(page, nav, ctx) {
  if (page.bodyHtml) {
    return `<section class="content-shell">
            <div class="container">
                <div class="content-panel studio-page">
                    ${rewriteHtml(page.bodyHtml, ctx)}
                </div>
            </div>
        </section>`;
  }

  const metaTags = (page.contentMeta || [])
    .map((item) => `<span>${esc(item)}</span>`)
    .join('');

  return `<section class="content-shell">
            <div class="container">
                <div class="content-panel">
                    ${metaTags ? `<div class="content-meta">${metaTags}</div>` : ''}
                    <div class="empty-content" aria-label="${esc(nav.stubMessage)}"></div>
                </div>
            </div>
        </section>`;
}

function renderCaseStudiesIndex(page, ctx, nav) {
  return `${renderHero(page, ctx, nav)}
        <section class="content-shell">
            <div class="container">
                <div id="case-studies-grid" class="case-studies-grid" aria-label="${esc(page.gridLabel || 'Case studies')}"></div>
            </div>
        </section>`;
}

function renderCaseStudyBody(page, ctx, nav) {
  const pageSlug = ctx.pageSlug;
  const logos = (page.logos || [])
    .map(
      (logo) =>
        renderPicture(logo.src.startsWith('http') ? logo.src : logo.src, {
          alt: logo.alt,
          width: 160,
          height: 48,
          loading: 'eager',
          pageSlug
        })
    )
    .join('\n                        ');

  const introParagraphs = (page.intro?.paragraphs || [])
    .map((p) => `<p>${p}</p>`)
    .join('\n                            ');
  const introList = page.intro?.list?.length
    ? `<ul>${page.intro.list.map((li) => `<li>${li}</li>`).join('')}</ul>`
    : '';
  const introImage = page.intro?.image
    ? `<figure class="studio-figure">
                            ${renderPicture(page.intro.image.src.startsWith('http') ? page.intro.image.src : page.intro.image.src, {
                              alt: page.intro.image.alt,
                              width: 960,
                              height: 540,
                              loading: 'lazy',
                              pageSlug
                            })}
                        </figure>`
    : '';

  const results = page.results?.items?.length
    ? `<ul class="case-study-results">${page.results.items.map((item) => `<li>${item}</li>`).join('')}</ul>`
    : '';
  const resultsIntro = page.results?.intro ? `<p>${page.results.intro}</p>` : '';
  const resultsSub = page.results?.subtitle ? `<h3>${page.results.subtitle}</h3>` : '';

  const keys = (page.successKeys?.items || [])
    .map(
      (key) => `<article class="studio-card case-study-key">
                                <span class="case-study-key__icon" aria-hidden="true">${renderIcon(key.icon || 'check')}</span>
                                <h3>${key.title}</h3>
                                <p>${key.text}</p>
                            </article>`
    )
    .join('\n                            ');

  let testimonialBlock = '';
  if (page.testimonial) {
    const t = page.testimonial;
    const quotes = (t.quotes || []).map((q) => `<p>${q}</p>`).join('\n                            ');
    const photo = t.photo
      ? renderPicture(t.photo.startsWith('http') ? t.photo : t.photo, {
          alt: '',
          width: 64,
          height: 64,
          loading: 'lazy',
          pageSlug
        })
      : '';
    testimonialBlock = `<section class="studio-section studio-quote-section" aria-labelledby="temoignage-title">
                        <p class="eyebrow">${esc(t.eyebrow || 'Témoignage')}</p>
                        <h2 id="temoignage-title">${esc(t.title)}</h2>
                        <blockquote class="studio-quote case-study-quote">
                            ${quotes}
                            <footer>
                                ${photo}
                                <div>
                                    <cite>${esc(t.author)}</cite>
                                    ${t.role ? `<span>${esc(t.role)}</span>` : ''}
                                </div>
                            </footer>
                        </blockquote>
                    </section>`;
  }

  if (page.testimonials?.items?.length) {
    const items = page.testimonials.items
      .map(
        (item) => `<blockquote class="studio-quote about-testimonial">
                                <p>${item.quote}</p>
                                <footer>
                                    <div>
                                        <cite>${esc(item.author)}</cite>
                                        ${item.role ? `<span>${esc(item.role)}</span>` : ''}
                                    </div>
                                </footer>
                            </blockquote>`
      )
      .join('\n                            ');
    const gridClass = page.testimonials.items.length === 2 ? 'about-testimonials-grid case-study-quotes-grid--2' : 'about-testimonials-grid';
    testimonialBlock = `<section class="studio-section" aria-labelledby="temoignages-title">
                        <p class="eyebrow">${esc(page.testimonials.eyebrow || 'Témoignages')}</p>
                        <h2 id="temoignages-title">${esc(page.testimonials.title)}</h2>
                        <div class="${gridClass}">
                            ${items}
                        </div>
                    </section>`;
  }

  const media = (page.media || [])
    .map(
      (item) => `<figure class="case-study-media">
                                ${renderPicture(item.src.startsWith('http') ? item.src : item.src, {
                                  alt: item.alt,
                                  width: 960,
                                  height: 540,
                                  loading: 'lazy',
                                  pageSlug
                                })}
                                ${item.caption ? `<figcaption>${esc(item.caption)}</figcaption>` : ''}
                            </figure>`
    )
    .join('\n                            ');
  const mediaSection = media
    ? `<section class="studio-section" aria-labelledby="visuels-title">
                        <p class="eyebrow">${esc(page.mediaEyebrow || 'Visuels')}</p>
                        <h2 id="visuels-title">${esc(page.mediaTitle || 'Le projet en images')}</h2>
                        <div class="case-study-media-grid">
                            ${media}
                        </div>
                    </section>`
    : '';

  const cta = page.cta
    ? `<section class="studio-section studio-highlight">
                        <div class="studio-copy">
                            <p class="eyebrow">${esc(page.cta.eyebrow || 'À vous de jouer')}</p>
                            <h2>${page.cta.title}</h2>
                            <p>${page.cta.text}</p>
                            <p><a class="btn btn-gs-primary" href="${esc(resolveInternalHref(page.cta.buttonHref || '/contact/', ctx))}">${esc(page.cta.buttonLabel)}</a></p>
                        </div>
                    </section>`
    : '';

  return `<section class="content-shell">
            <div class="container">
                <article class="content-panel studio-page case-study-page">
                    <div class="case-study-logos" aria-label="Logos">
                        ${logos}
                    </div>

                    <section class="studio-section studio-intro">
                        <div class="studio-copy">
                            <p class="eyebrow">${esc(page.intro?.eyebrow || 'Contexte')}</p>
                            <h2>${page.intro?.title || ''}</h2>
                            ${introParagraphs}
                            ${introList}
                        </div>
                        ${introImage}
                    </section>

                    <section class="studio-section" aria-labelledby="resultats-title">
                        <p class="eyebrow">${esc(page.results?.eyebrow || 'Résultats')}</p>
                        <h2 id="resultats-title">${page.results?.title || ''}</h2>
                        ${resultsIntro}
                        ${resultsSub}
                        ${results}
                    </section>

                    <section class="studio-section" aria-labelledby="cles-succes-title">
                        <p class="eyebrow">${esc(page.successKeys?.eyebrow || 'Clés du succès')}</p>
                        <h2 id="cles-succes-title">${page.successKeys?.title || ''}</h2>
                        <div class="studio-grid studio-mini-grid case-study-keys">
                            ${keys}
                        </div>
                    </section>

                    ${testimonialBlock}
                    ${mediaSection}
                    ${cta}
                </article>
            </div>
        </section>`;
}

function renderPageBody(page, template, ctx, nav) {
  if (template === 'case-studies-index') {
    return renderCaseStudiesIndex(page, ctx, nav);
  }
  if (template === 'case-study') {
    return `${renderHero(page, ctx, nav)}${renderCaseStudyBody(page, ctx, nav)}`;
  }
  if (template === 'home') {
    let html = rewriteHtml(page.bodyHtml || '', ctx);
    const testimonialsHtml = rewriteHtml(
      renderTestimonialsCarousel(ctx.locale, {
        carouselId: 'homeTestimonialsCarousel',
        titleId: 'home-testimonials-title',
        sectionClass: 'home-section home-testimonials',
        wrapContainer: true
      }),
      ctx
    );

    if (html.includes('id="cas-client"')) {
      html = html.replace(
        /<section class="home-section home-section--light" id="cas-client"[\s\S]*?<\/section>\s*/m,
        testimonialsHtml
      );
    } else if (!html.includes('homeTestimonialsCarousel')) {
      html = html.replace(
        '<section class="home-final-cta"',
        `${testimonialsHtml}\n\n        <section class="home-final-cta"`
      );
    }

    return html;
  }
  if (template === 'html') {
    return `${renderHero(page, ctx, nav)}<section class="content-shell"><div class="container">${rewriteHtml(page.bodyHtml || '', ctx)}</div></section>`;
  }
  return `${renderHero(page, ctx, nav)}${renderDefaultBody(page, nav, ctx)}`;
}

module.exports = {
  esc,
  renderPageBody
};
