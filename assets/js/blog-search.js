(function () {
  const form = document.querySelector('[data-blog-search]');
  const grid = document.querySelector('.blog-index-grid');
  if (!form || !grid) {
    return;
  }

  const input = form.querySelector('input');
  const status = form.querySelector('.blog-search__status');
  const pagination = document.querySelector('.blog-pagination');
  const originalGrid = grid.innerHTML;
  let articles = null;
  let pending = null;

  function fold(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  function rel(path) {
    const root = form.dataset.root || './';
    return `${root}${String(path || '').replace(/^\//, '')}`;
  }

  function esc(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function card(item) {
    const media = item.image
      ? `<figure class="case-study-card__media blog-card__media"><img src="${esc(rel(item.image))}" alt="" width="640" height="480" loading="lazy" decoding="async"></figure>`
      : '<figure class="case-study-card__media blog-card__media blog-card__media--empty" aria-hidden="true"></figure>';
    return `<article class="case-study-card"><a class="case-study-card__link" href="${esc(rel(item.href))}">${media}<div class="case-study-card__body"><p class="eyebrow">${esc(form.dataset.eyebrow || '')}</p><h2 class="case-study-card__title">${esc(item.title)}</h2><p class="case-study-card__desc">${esc(item.description || '')}</p><span class="case-study-card__cta">${esc(form.dataset.cta || '')}</span></div></a></article>`;
  }

  function countLabel(count) {
    if (count === 1) {
      return form.dataset.one || '1';
    }
    return (form.dataset.many || '{count}').replace('{count}', String(count));
  }

  function showStatus(text) {
    status.hidden = !text;
    status.textContent = text || '';
  }

  function render() {
    const query = fold(input.value.trim());
    if (!query) {
      grid.innerHTML = originalGrid;
      if (pagination) {
        pagination.hidden = false;
      }
      showStatus('');
      return;
    }
    if (!articles) {
      return;
    }
    const hits = articles.filter((item) => fold(`${item.title} ${item.description}`).includes(query));
    if (pagination) {
      pagination.hidden = true;
    }
    if (!hits.length) {
      grid.innerHTML = '';
      showStatus(form.dataset.empty || '');
      return;
    }
    grid.innerHTML = hits.map(card).join('');
    showStatus(countLabel(hits.length));
  }

  function loadIndex() {
    if (articles) {
      return Promise.resolve(articles);
    }
    if (!pending) {
      pending = fetch(form.dataset.index)
        .then((response) => {
          if (!response.ok) {
            throw new Error(String(response.status));
          }
          return response.json();
        })
        .then((data) => {
          articles = Array.isArray(data) ? data : [];
          return articles;
        })
        .catch(() => {
          pending = null;
          articles = [];
          return articles;
        });
    }
    return pending;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });
  input.addEventListener('focus', () => {
    loadIndex().then(render);
  });
  input.addEventListener('input', () => {
    loadIndex().then(render);
  });
})();
