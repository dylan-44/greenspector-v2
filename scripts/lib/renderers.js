const { slugToRelative, slugToAsset, rewriteBodyHtml } = require('./paths');
const { renderTestimonialsCarousel } = require('./testimonials');
const { renderIcon } = require('./icons');
const { renderPicture } = require('./images');

const GREENSPECTOR_FAVICON = '/assets/img/cropped-greenspector-favicon-192x192.png';

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

// Bandeau logos homogène : [logo client] × [favicon Greenspector].
// Même emplacement et même aspect que le bandeau de la page ANS.
// Piloté par le champ JSON `clientLogo` { src, alt }. Si absent, repli
// sur `page.logos` (compatibilité) ; si rien, aucun bandeau n'est rendu.
function renderCaseStudyLogos(page, ctx) {
  const pageSlug = ctx.pageSlug;
  if (page.clientLogo && page.clientLogo.src) {
    const clientImg = renderPicture(page.clientLogo.src, {
      alt: page.clientLogo.alt || '',
      width: 160,
      height: 48,
      loading: 'eager',
      pageSlug
    });
    const gsImg = renderPicture(GREENSPECTOR_FAVICON, {
      alt: 'Greenspector',
      width: 48,
      height: 48,
      loading: 'eager',
      pageSlug
    });
    return `<div class="case-study-logos" aria-label="Logos">
                        ${clientImg}
                        <span class="case-study-logos__x" aria-hidden="true">×</span>
                        ${gsImg}
                    </div>`;
  }

  if (page.logos && page.logos.length) {
    const logos = page.logos
      .map((logo) =>
        renderPicture(logo.src, {
          alt: logo.alt,
          width: 160,
          height: 48,
          loading: 'eager',
          pageSlug
        })
      )
      .join('\n                        ');
    return `<div class="case-study-logos" aria-label="Logos">
                        ${logos}
                    </div>`;
  }

  return '';
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
  const logosBanner = renderCaseStudyLogos(page, ctx);

  if (page.bodyHtml) {
    return `<section class="content-shell">
            <div class="container">
                <div class="content-panel studio-page">
                    ${logosBanner}
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
                    ${logosBanner}
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

function blogIndexSlug(locale, pageNum = 1) {
  if (locale === 'en') {
    return pageNum <= 1 ? '/en/resources/blog/' : `/en/resources/blog/page/${pageNum}/`;
  }
  return pageNum <= 1 ? '/ressources/blog/' : `/ressources/blog/page/${pageNum}/`;
}

function blogPaginationWindow(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set([1, total]);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  } else if (current >= total - 2) {
    pages.add(total - 2);
    pages.add(total - 1);
  } else {
    pages.add(current - 1);
    pages.add(current);
    pages.add(current + 1);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const windowItems = [];
  sorted.forEach((num, index) => {
    if (index > 0 && num - sorted[index - 1] > 1) {
      windowItems.push('ellipsis');
    }
    windowItems.push(num);
  });
  return windowItems;
}

function renderBlogPagination({ pageIndex, totalPages, ctx, nav }) {
  if (totalPages <= 1) {
    return '';
  }

  const labels = nav.blogPagination || {};
  const previous = labels.previous || (ctx.locale === 'en' ? 'Previous' : 'Précédent');
  const next = labels.next || (ctx.locale === 'en' ? 'Next' : 'Suivant');
  const aria = labels.aria || (ctx.locale === 'en' ? 'Blog pagination' : 'Pagination du blog');

  const pageLink = (num) => slugToRelative(ctx.pageSlug, blogIndexSlug(ctx.locale, num));

  const numbers = blogPaginationWindow(pageIndex, totalPages)
    .map((item) => {
      if (item === 'ellipsis') {
        return '<li><span class="blog-pagination__ellipsis" aria-hidden="true">…</span></li>';
      }
      const current = item === pageIndex;
      return `<li><a class="blog-pagination__page${current ? ' is-current' : ''}" href="${esc(pageLink(item))}"${
        current ? ' aria-current="page"' : ''
      }>${item}</a></li>`;
    })
    .join('');

  const prev =
    pageIndex > 1
      ? `<a class="blog-pagination__nav" href="${esc(pageLink(pageIndex - 1))}" rel="prev">${esc(previous)}</a>`
      : `<span class="blog-pagination__nav is-disabled" aria-disabled="true">${esc(previous)}</span>`;
  const nextLink =
    pageIndex < totalPages
      ? `<a class="blog-pagination__nav" href="${esc(pageLink(pageIndex + 1))}" rel="next">${esc(next)}</a>`
      : `<span class="blog-pagination__nav is-disabled" aria-disabled="true">${esc(next)}</span>`;

  return `<nav class="blog-pagination" aria-label="${esc(aria)}">
                    ${prev}
                    <ol class="blog-pagination__pages">${numbers}</ol>
                    ${nextLink}
                </nav>`;
}

function renderBlogIndex(page, ctx, nav) {
  const labels = nav.blogCard || {};
  const search = nav.blogSearch || {};
  const eyebrow = labels.eyebrow || 'Article';
  const cta = labels.cta || (ctx.locale === 'en' ? 'Read the article' : "Lire l'article");
  const pageSize = ctx.blogPageSize || 8;
  const allItems = ctx.blogItems || [];
  const totalPages = Math.max(1, Math.ceil(allItems.length / pageSize));
  const pageIndex = Math.min(Math.max(ctx.blogPage || 1, 1), totalPages);
  const items = allItems.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
  const searchIndex = slugToAsset(ctx.pageSlug, `/assets/js/blog-search-${ctx.locale}.json`);
  const assetRoot = slugToAsset(ctx.pageSlug, '/');

  const cards = items
    .map((item) => {
      const href = slugToRelative(ctx.pageSlug, item.href || item.slug);
      const media = item.image
        ? `<figure class="case-study-card__media blog-card__media">
            <img src="${esc(slugToAsset(ctx.pageSlug, item.image))}" alt="" width="640" height="480" loading="lazy" decoding="async">
          </figure>`
        : `<figure class="case-study-card__media blog-card__media blog-card__media--empty" aria-hidden="true"></figure>`;
      return `<article class="case-study-card">
        <a class="case-study-card__link" href="${esc(href)}">
          ${media}
          <div class="case-study-card__body">
            <p class="eyebrow">${esc(eyebrow)}</p>
            <h2 class="case-study-card__title">${esc(item.title)}</h2>
            <p class="case-study-card__desc">${esc(item.description || '')}</p>
            <span class="case-study-card__cta">${esc(cta)}</span>
          </div>
        </a>
      </article>`;
    })
    .join('\n        ');

  return `${renderHero(page, ctx, nav)}
        <section class="content-shell">
            <div class="container">
                <form class="blog-search" role="search" data-blog-search data-index="${esc(searchIndex)}" data-root="${esc(assetRoot)}" data-eyebrow="${esc(eyebrow)}" data-cta="${esc(cta)}" data-empty="${esc(search.empty || '')}" data-one="${esc(search.one || '')}" data-many="${esc(search.many || '')}">
                    <label class="blog-search__label" for="blog-search-input">${esc(search.label || (ctx.locale === 'en' ? 'Search articles' : 'Rechercher un article'))}</label>
                    <input id="blog-search-input" class="blog-search__input" type="search" name="q" placeholder="${esc(search.placeholder || '')}" autocomplete="off" enterkeyhint="search">
                    <p class="blog-search__status" hidden></p>
                </form>
                <div class="case-studies-grid blog-index-grid" aria-label="${esc(page.gridLabel || 'Blog')}">
        ${cards}
                </div>
                ${renderBlogPagination({ pageIndex, totalPages, ctx, nav })}
            </div>
        </section>`;
}

function renderCaseStudyBody(page, ctx, nav) {
  const pageSlug = ctx.pageSlug;
  const logos = renderCaseStudyLogos(page, ctx);

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
                    ${logos}

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
  if (template === 'blog-index') {
    return renderBlogIndex(page, ctx, nav);
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
    const logosBanner = renderCaseStudyLogos(page, ctx);
    return `${renderHero(page, ctx, nav)}<section class="content-shell"><div class="container">${logosBanner}${rewriteHtml(page.bodyHtml || '', ctx)}</div></section>`;
  }
  return `${renderHero(page, ctx, nav)}${renderDefaultBody(page, nav, ctx)}`;
}

module.exports = {
  esc,
  renderPageBody,
  blogIndexSlug
};
