const { slugToRelative, slugToAsset, rewriteBodyHtml } = require('./paths');

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderHeroActions(actions, pageSlug) {
  if (!actions || !actions.length) {
    return '';
  }

  return `<div class="hero-actions">${actions
    .map((action) => {
      const href = action.href.startsWith('http')
        ? action.href
        : slugToRelative(pageSlug, action.href.endsWith('/') ? action.href : `${action.href}/`);
      const cls = action.primary ? 'btn btn-gs-primary' : 'btn btn-gs-outline';
      const external = action.external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a class="${cls}" href="${esc(href)}"${external}>${esc(action.label)}</a>`;
    })
    .join('')}</div>`;
}

function renderHero(page, pageSlug, nav) {
  const { hero } = page;
  const label = hero.label ? `<p class="section-label">${esc(hero.label)}</p>` : '';
  const subtitle = hero.subtitle ? `<p class="hero-subtitle">${hero.subtitle}</p>` : '';
  const actions = renderHeroActions(hero.actions, pageSlug);
  const slugNote = page.slugNote ? `<p class="slug-note">${esc(page.slugNote)}</p>` : '';

  return `<section class="hero">
            <div class="container">
                ${label}
                <h1>${hero.title}</h1>
                ${subtitle}
                ${actions}
                ${slugNote}
            </div>
        </section>`;
}

function renderDefaultBody(page, nav, pageSlug) {
  if (page.bodyHtml) {
    return `<section class="content-shell">
            <div class="container">
                <div class="content-panel studio-page">
                    ${rewriteBodyHtml(page.bodyHtml, pageSlug)}
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

function renderCaseStudiesIndex(page, pageSlug, nav) {
  return `${renderHero(page, pageSlug, nav)}
        <section class="content-shell">
            <div class="container">
                <div id="case-studies-grid" class="case-studies-grid" aria-label="${esc(page.gridLabel || 'Case studies')}"></div>
            </div>
        </section>`;
}

function renderCaseStudyBody(page, pageSlug, nav) {
  const logos = (page.logos || [])
    .map(
      (logo) =>
        `<img src="${esc(logo.src.startsWith('http') ? logo.src : slugToAsset(pageSlug, logo.src))}" alt="${esc(logo.alt)}" width="160" height="48" loading="eager" decoding="async">`
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
                            <img src="${esc(page.intro.image.src.startsWith('http') ? page.intro.image.src : slugToAsset(pageSlug, page.intro.image.src))}" alt="${esc(page.intro.image.alt)}" width="960" height="540" loading="lazy" decoding="async">
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
                                <span class="case-study-key__icon" aria-hidden="true"><i class="fa-solid fa-${esc(key.icon)}"></i></span>
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
      ? `<img src="${esc(t.photo.startsWith('http') ? t.photo : slugToAsset(pageSlug, t.photo))}" alt="" width="64" height="64" loading="lazy" decoding="async">`
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
                                <img src="${esc(item.src.startsWith('http') ? item.src : slugToAsset(pageSlug, item.src))}" alt="${esc(item.alt)}" width="960" height="540" loading="lazy" decoding="async">
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
                            <p><a class="btn btn-gs-primary" href="${esc(slugToRelative(pageSlug, page.cta.buttonHref || '/contact/'))}">${esc(page.cta.buttonLabel)}</a></p>
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

function renderMainContent(page, template, pageSlug, nav) {
  if (template === 'home' || template === 'html') {
    return rewriteBodyHtml(page.bodyHtml || '', pageSlug);
  }
  if (template === 'default') {
    return renderDefaultBody(page, nav, pageSlug);
  }
  if (template === 'case-studies-index') {
    return renderCaseStudiesIndex(page, pageSlug, nav).replace(renderHero(page, pageSlug, nav), '').trim();
  }
  if (template === 'case-study') {
    return renderCaseStudyBody(page, pageSlug, nav);
  }
  return '';
}

function renderPageBody(page, template, pageSlug, nav) {
  if (template === 'case-studies-index') {
    return renderCaseStudiesIndex(page, pageSlug, nav);
  }
  if (template === 'case-study') {
    return `${renderHero(page, pageSlug, nav)}${renderCaseStudyBody(page, pageSlug, nav)}`;
  }
  if (template === 'home') {
    return rewriteBodyHtml(page.bodyHtml || '', pageSlug);
  }
  if (template === 'html') {
    return `${renderHero(page, pageSlug, nav)}<section class="content-shell"><div class="container">${rewriteBodyHtml(page.bodyHtml || '', pageSlug)}</div></section>`;
  }
  return `${renderHero(page, pageSlug, nav)}${renderDefaultBody(page, nav, pageSlug)}`;
}

module.exports = {
  esc,
  renderPageBody
};
