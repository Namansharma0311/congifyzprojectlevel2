/* =========================================================
   Far & Few — site script v2
   Handles: mobile nav, destination card rendering + search/
   filter, contact form, destination detail page with:
     - Food cards (click photo or name to reveal description)
     - Restaurant pagination (3 at a time + Next > scroller)
     - Photo grid with "More Photos >" reveal
     - Lightbox with thumbnail strip
     - Pixelated mascot guide with rotating tips
   ========================================================= */

/* ---------- Mobile nav ---------- */
(function initNav() {
  const btn = document.getElementById('hamburgerBtn');
  const nav = document.getElementById('mainNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }));
})();

/* ---------- Helpers ---------- */
function slugList() { return Object.keys(DESTINATIONS); }
function destCover(dest) { return (dest.hero && dest.hero[0]) || ''; }
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

const REST_VISIBLE_PHOTOS = 3;   /* photos shown before "More Photos >" */
const RESTAURANTS_PER_PAGE = 3;  /* restaurants shown per page */

function prettyDomain(url) {
  if (!url) return 'Visit site';
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url.replace(/^https?:\/\//, '').split('/')[0]; }
}

/* =========================================================
   INDEX PAGE — card grid, search & filter
   ========================================================= */
function renderCardGrid() {
  const grid = document.getElementById('cardGrid');
  if (!grid) return;
  grid.innerHTML = '';
  slugList().forEach(slug => {
    const d = DESTINATIONS[slug];
    const article = document.createElement('article');
    article.className = 'card';
    article.dataset.category = d.category;
    article.dataset.name = (d.name + ' ' + d.country).toLowerCase();
    article.dataset.slug = slug;
    article.innerHTML = `
      <div class="card-img-wrap">
        <img src="${destCover(d)}" alt="${d.name}, ${d.country}" loading="lazy">
        <span class="price-badge">from $${d.price}</span>
      </div>
      <div class="card-body">
        <div class="card-top">
          <div>
            <h3>${d.name}</h3>
            <p class="country"><span aria-hidden="true">\uD83D\uDCCD</span> ${d.country}</p>
          </div>
          <span class="rating">\u2605 ${d.rating}</span>
        </div>
        <p class="desc">${d.desc}</p>
      </div>
      <button class="btn-card" type="button">View Trip \u2192</button>
    `;
    const go = () => { window.location.href = `destination.html?d=${slug}`; };
    article.querySelector('.btn-card').addEventListener('click', go);
    article.querySelector('.card-img-wrap img').addEventListener('click', go);
    article.querySelector('h3').addEventListener('click', go);
    article.style.cursor = 'pointer';
    grid.appendChild(article);
  });
  applyFilters();
}

function applyFilters() {
  const grid = document.getElementById('cardGrid');
  const noResults = document.getElementById('noResults');
  if (!grid) return;
  const term = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  const cat = document.getElementById('categorySelect')?.value || 'all';
  let visible = 0;
  grid.querySelectorAll('.card').forEach(card => {
    const matchesTerm = !term || card.dataset.name.includes(term);
    const matchesCat = cat === 'all' || card.dataset.category === cat;
    const show = matchesTerm && matchesCat;
    card.hidden = !show;
    if (show) visible++;
  });
  if (noResults) noResults.hidden = visible !== 0;
}

function initSearch() {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const select = document.getElementById('categorySelect');
  if (!form) return;
  form.addEventListener('submit', e => { e.preventDefault(); applyFilters(); });
  input.addEventListener('input', applyFilters);
  select.addEventListener('change', applyFilters);
}

function renderFeatured() {
  const wrap = document.getElementById('featuredGrid');
  if (!wrap) return;
  const picks = ['lofoten', 'mexico', 'vietnam'];
  wrap.innerHTML = picks.map(slug => {
    const d = DESTINATIONS[slug];
    if (!d) return '';
    return `
      <div class="featured-card" data-slug="${slug}" style="cursor:pointer">
        <img src="${destCover(d)}" alt="${d.name}, ${d.country}">
        <div class="featured-text">
          <h4>${d.name}, ${d.country}</h4>
          <p>${d.desc}</p>
        </div>
      </div>`;
  }).join('');
  wrap.querySelectorAll('.featured-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = `destination.html?d=${card.dataset.slug}`;
    });
  });
}

function renderGallery() {
  const wrap = document.getElementById('galleryGrid');
  if (!wrap) return;
  const shots = [];
  slugList().forEach(slug => {
    const d = DESTINATIONS[slug];
    if (d.hero && d.hero[1]) shots.push({ src: d.hero[1], slug, alt: d.name });
    else if (d.hero && d.hero[0]) shots.push({ src: d.hero[0], slug, alt: d.name });
  });
  wrap.innerHTML = shots.map(s =>
    `<img src="${s.src}" alt="${s.alt}" data-slug="${s.slug}" loading="lazy" style="cursor:pointer">`
  ).join('');
  wrap.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', () => {
      window.location.href = `destination.html?d=${img.dataset.slug}`;
    });
  });
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    success.hidden = false;
    form.reset();
    setTimeout(() => { success.hidden = true; }, 5000);
  });
}

/* =========================================================
   DESTINATION DETAIL PAGE
   ========================================================= */
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function renderDestinationPage() {
  const root = document.getElementById('destRoot');
  if (!root) return;
  const slug = getParam('d');
  const d = DESTINATIONS[slug];

  if (!d) {
    root.innerHTML = `
      <section class="section" style="text-align:center">
        <h2 style="font-family:var(--font-display);font-size:2.5rem;margin-bottom:1rem;">Destination not found</h2>
        <p style="margin-bottom:1.5rem;">We couldn't find that trip. Head back and pick another one.</p>
        <a href="index.html" class="btn-card" style="display:inline-block;">\u2190 Back to all destinations</a>
      </section>`;
    return;
  }

  document.title = `${d.name}, ${d.country} \u2014 Far & Few`;

  const heroImg = destCover(d);
  const hasVideo = !!d.video;
  const foodImages = d.food.map(f => f.image || f);

  root.innerHTML = `
    <section class="dest-hero" ${hasVideo ? '' : `style="background-image:url('${heroImg}')"`}>
      ${hasVideo ? `
        <video class="dest-hero-video" autoplay muted loop playsinline poster="${heroImg}">
          <source src="${d.video}" type="video/mp4">
        </video>` : ''}
      <div class="dest-hero-overlay"></div>
      <div class="dest-hero-inner">
        <a href="index.html" class="dest-back">\u2190 All destinations</a>
        <p class="dest-eyebrow"><span aria-hidden="true">\uD83D\uDCCD</span> ${d.country} \u00b7 ${capitalize(d.category)}</p>
        <h1>${d.name}</h1>
        <p class="dest-hero-desc">${d.desc}</p>
        <div class="dest-hero-meta">
          <span class="dest-rating">\u2605 ${d.rating}</span>
          <span class="dest-price">from $${d.price}</span>
          <button class="btn-card dest-plan-btn" type="button">Plan This Trip</button>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head" style="text-align:left;max-width:760px;margin-bottom:2.2rem;">
        <h2 style="font-size:clamp(2rem,4vw,3rem);">Why go</h2>
      </div>
      <p class="dest-long-desc">${d.long_desc}</p>
    </section>

    ${d.hero.length > 1 ? `
    <section class="section dest-gallery-section">
      <div class="section-head" style="text-align:left;margin-bottom:1.6rem;">
        <h2 style="font-size:clamp(2rem,4vw,3rem);">Gallery</h2>
        <p>A few frames from ${d.name}.</p>
      </div>
      <div class="dest-gallery-grid" id="destGalleryGrid">
        ${d.hero.map((src, i) => `<img src="${src}" alt="${d.name} photo ${i+1}" data-idx="${i}" loading="lazy">`).join('')}
      </div>
    </section>` : ''}

    ${renderFoodSection(d, foodImages)}

    ${renderRestaurantsSection(d)}

    <section class="section dest-cta">
      <div class="dest-cta-inner">
        <h2>Ready for ${d.name}?</h2>
        <p>Tell us your dates and we'll build the itinerary around ${d.name.split(' ')[0]}'s best bits.</p>
        <a href="index.html#contact" class="btn-card dest-plan-btn2">Start Planning \u2192</a>
      </div>
    </section>
  `;

  wireDestinationInteractions(d, foodImages);
}

/* =========================================================
   FOOD SECTION — cards with name + click-to-reveal description
   ========================================================= */
function renderFoodSection(d, foodImages) {
  if (!d.food || !d.food.length) return '';
  return `
    <section class="section dest-food-section">
      <div class="section-head" style="text-align:left;margin-bottom:1.6rem;">
        <h2 style="font-size:clamp(2rem,4vw,3rem);">Eat & Drink</h2>
        <p>Tap a dish or its name to read the story behind it.</p>
      </div>
      <div class="food-card-grid" id="destFoodGrid">
        ${d.food.map((f, i) => renderFoodCard(f, i)).join('')}
      </div>
    </section>`;
}

function renderFoodCard(f, i) {
  /* f may be a string (legacy) or an object {name, desc, image} */
  const isObj = (typeof f === 'object' && f !== null);
  const image = isObj ? (f.image || '') : f;
  const name = isObj ? (f.name || 'Untitled Dish') : `Dish ${i + 1}`;
  const desc = isObj ? (f.desc || '') : '';
  return `
    <article class="food-card" data-idx="${i}">
      <button type="button" class="food-photo-btn" aria-label="Show description for ${escapeHtml(name)}">
        <img src="${image}" alt="${escapeHtml(name)}" loading="lazy">
        <span class="food-photo-hint" aria-hidden="true">+ tap for story</span>
      </button>
      <div class="food-card-body">
        <button type="button" class="food-name-btn" aria-expanded="false">
          <span class="food-name">${escapeHtml(name)}</span>
          <span class="food-toggle" aria-hidden="true">+</span>
        </button>
        <div class="food-desc-wrap">
          <p class="food-desc">${escapeHtml(desc)}</p>
        </div>
      </div>
    </article>`;
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wireFoodCards(d, foodImages) {
  const cards = Array.from(document.querySelectorAll('#destFoodGrid .food-card'));
  cards.forEach((card, i) => {
    const photoBtn = card.querySelector('.food-photo-btn');
    const nameBtn = card.querySelector('.food-name-btn');
    const toggle = card.querySelector('.food-toggle');
    const descWrap = card.querySelector('.food-desc-wrap');

    function toggleDesc() {
      const isOpen = card.classList.toggle('is-open');
      nameBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.textContent = isOpen ? '\u2212' : '+';
    }

    photoBtn.addEventListener('click', e => {
      e.stopPropagation();
      toggleDesc();
    });
    nameBtn.addEventListener('click', e => {
      e.stopPropagation();
      toggleDesc();
    });

    /* Long-press / right-click on photo opens lightbox */
    let pressTimer = null;
    photoBtn.addEventListener('contextmenu', e => {
      e.preventDefault();
      openLightbox(foodImages, i, `${d.name} \u2014 Food`);
    });
  });
}

/* =========================================================
   RESTAURANTS SECTION — 3 at a time + Next > pagination
   ========================================================= */
function renderRestaurantsSection(d) {
  if (!d.restaurants || !d.restaurants.length) return '';
  return `
    <section class="section dest-restaurants-section">
      <div class="section-head" style="text-align:left;margin-bottom:1.6rem;">
        <h2 style="font-size:clamp(2rem,4vw,3rem);">Where to Eat</h2>
        <p>A short list of restaurants locals keep going back to.</p>
      </div>
      <div class="restaurant-pager" id="restPager" data-page="0" data-per="${RESTAURANTS_PER_PAGE}">
        <div class="restaurant-list" id="restaurantList"></div>
        <div class="rest-pagination-controls" id="restPaginationControls"></div>
      </div>
    </section>`;
}

function renderRestaurantCard(r, ri) {
  const total = r.images.length;
  const hasMore = total > REST_VISIBLE_PHOTOS;
  const hiddenCount = Math.max(0, total - REST_VISIBLE_PHOTOS);
  return `
    <article class="restaurant-card" data-ri="${ri}">
      <div class="rest-photo-block">
        <div class="photo-grid" data-total="${total}" data-visible="${REST_VISIBLE_PHOTOS}">
          ${r.images.map((src, i) => `
            <button type="button"
                    class="photo-thumb ${i >= REST_VISIBLE_PHOTOS ? 'is-hidden' : ''}"
                    data-idx="${i}"
                    aria-label="Open photo ${i + 1} of ${escapeHtml(r.name)}">
              <img src="${src}" alt="${escapeHtml(r.name)} photo ${i + 1}" loading="lazy">
              ${hasMore && i === REST_VISIBLE_PHOTOS - 1 ? `
                <span class="photo-more-badge">+${hiddenCount} more</span>
              ` : ''}
            </button>
          `).join('')}
        </div>
        ${hasMore ? `
          <button type="button" class="more-photos-btn" data-action="toggle">
            <span class="mp-text">More Photos</span>
            <span class="mp-count">+${hiddenCount}</span>
            <span class="mp-arrow">\u203a</span>
          </button>
        ` : ''}
      </div>
      <div class="restaurant-info">
        <div class="rest-header">
          <span class="rest-num">${String(ri + 1).padStart(2, '0')}</span>
          <div class="rest-title">
            <h4>${escapeHtml(r.name)}</h4>
            <p class="rest-cuisine">${escapeHtml(r.cuisine || 'Local Cuisine')}</p>
          </div>
        </div>
        ${r.desc ? `<p class="rest-desc">${escapeHtml(r.desc)}</p>` : ''}
        <div class="rest-meta-row">
          <span class="rest-photos-count">${total} photo${total !== 1 ? 's' : ''}</span>
          <span class="rest-divider" aria-hidden="true">\u00b7</span>
          <a href="${r.website}" class="rest-link-inline" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(prettyDomain(r.website))} \u2197
          </a>
        </div>
        <div class="restaurant-actions">
          <button class="btn-card rest-view-btn" type="button">View Gallery</button>
          <a href="${r.website}" class="btn-card rest-link-btn" target="_blank" rel="noopener noreferrer">
            Reserve / Visit \u2197
          </a>
        </div>
      </div>
    </article>`;
}

function renderRestaurantPage(d) {
  const pager = document.getElementById('restPager');
  if (!pager) return;
  const per = parseInt(pager.dataset.per, 10) || RESTAURANTS_PER_PAGE;
  const page = parseInt(pager.dataset.page, 10) || 0;
  const total = d.restaurants.length;
  const pages = Math.ceil(total / per);
  const start = page * per;
  const slice = d.restaurants.slice(start, start + per);

  const list = document.getElementById('restaurantList');
  list.innerHTML = slice.map((r, i) => renderRestaurantCard(r, start + i)).join('');

  const controls = document.getElementById('restPaginationControls');
  if (pages <= 1) {
    controls.innerHTML = `<span class="rest-page-info">${total} restaurant${total !== 1 ? 's' : ''} total</span>`;
  } else {
    controls.innerHTML = `
      <button type="button" class="rest-page-btn rest-prev-btn" ${page === 0 ? 'disabled' : ''} aria-label="Previous restaurants">
        <span class="rp-arrow">\u2039</span> Prev
      </button>
      <span class="rest-page-info">Page <strong>${page + 1}</strong> of ${pages}</span>
      <button type="button" class="rest-page-btn rest-next-btn" ${page === pages - 1 ? 'disabled' : ''} aria-label="Next restaurants">
        Next <span class="rp-arrow">\u203a</span>
      </button>
    `;
    controls.querySelector('.rest-prev-btn')?.addEventListener('click', () => {
      if (page > 0) { pager.dataset.page = String(page - 1); renderRestaurantPage(d); wireRestaurantCards(d); }
    });
    controls.querySelector('.rest-next-btn')?.addEventListener('click', () => {
      if (page < pages - 1) { pager.dataset.page = String(page + 1); renderRestaurantPage(d); wireRestaurantCards(d); }
    });
  }
  wireRestaurantCards(d);
}

function wireRestaurantCards(d) {
  document.querySelectorAll('.restaurant-card').forEach(card => {
    const ri = parseInt(card.dataset.ri, 10);
    const r = d.restaurants[ri];
    if (!r) return;
    const grid = card.querySelector('.photo-grid');
    const moreBtn = card.querySelector('.more-photos-btn');
    const viewBtn = card.querySelector('.rest-view-btn');

    card.querySelectorAll('.photo-thumb').forEach((thumb, idx) => {
      thumb.addEventListener('click', () => openLightbox(r.images, idx, r.name));
    });

    if (moreBtn) {
      moreBtn.addEventListener('click', e => {
        e.stopPropagation();
        const isExpanded = grid.classList.toggle('is-expanded');
        const textEl = moreBtn.querySelector('.mp-text');
        const countEl = moreBtn.querySelector('.mp-count');
        const arrowEl = moreBtn.querySelector('.mp-arrow');
        if (isExpanded) {
          textEl.textContent = 'Less Photos';
          if (countEl) countEl.style.display = 'none';
          arrowEl.textContent = '\u2039';
          moreBtn.classList.add('is-expanded');
          grid.querySelectorAll('.photo-thumb.is-hidden').forEach((thumb, i) => {
            setTimeout(() => {
              thumb.classList.remove('is-hidden');
              thumb.classList.add('is-revealed');
            }, i * 70);
          });
          const badge = grid.querySelector('.photo-more-badge');
          if (badge) badge.style.display = 'none';
        } else {
          textEl.textContent = 'More Photos';
          if (countEl) countEl.style.display = '';
          arrowEl.textContent = '\u203a';
          moreBtn.classList.remove('is-expanded');
          grid.querySelectorAll('.photo-thumb').forEach((thumb, i) => {
            if (i >= REST_VISIBLE_PHOTOS) {
              thumb.classList.add('is-hidden');
              thumb.classList.remove('is-revealed');
            }
          });
          const badge = grid.querySelector('.photo-more-badge');
          if (badge) badge.style.display = '';
        }
      });
    }

    if (viewBtn) {
      viewBtn.addEventListener('click', () => openLightbox(r.images, 0, r.name));
    }
  });
}

function wireDestinationInteractions(d, foodImages) {
  /* Gallery images */
  const galleryImgs = Array.from(document.querySelectorAll('#destGalleryGrid img'));
  galleryImgs.forEach((img, i) => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openLightbox(d.hero, i, `${d.name} \u2014 Gallery`));
  });

  /* Food cards: click photo or name to reveal description */
  wireFoodCards(d, foodImages);

  /* Restaurants: paginate 3 at a time */
  renderRestaurantPage(d);

  /* Plan This Trip */
  document.querySelectorAll('.dest-plan-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = 'index.html#contact';
    });
  });
}

/* =========================================================
   LIGHTBOX — full-screen photo viewer with thumbnail strip
   ========================================================= */
let lightboxState = { images: [], index: 0, caption: '' };

function buildLightboxDOM() {
  if (document.getElementById('lightbox')) return;
  const div = document.createElement('div');
  div.id = 'lightbox';
  div.className = 'lightbox';
  div.innerHTML = `
    <button class="lb-close" aria-label="Close">\u00d7</button>
    <button class="lb-prev" aria-label="Previous">\u2039</button>
    <img class="lb-img" src="" alt="">
    <button class="lb-next" aria-label="Next">\u203a</button>
    <p class="lb-caption"></p>
    <div class="lb-thumbs"></div>
  `;
  document.body.appendChild(div);

  div.querySelector('.lb-close').addEventListener('click', closeLightbox);
  div.addEventListener('click', e => { if (e.target === div) closeLightbox(); });
  div.querySelector('.lb-prev').addEventListener('click', () => stepLightbox(-1));
  div.querySelector('.lb-next').addEventListener('click', () => stepLightbox(1));
  document.addEventListener('keydown', e => {
    if (!div.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });
}

function openLightbox(images, index, caption) {
  buildLightboxDOM();
  lightboxState = { images, index, caption: caption || '' };
  const lb = document.getElementById('lightbox');
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  updateLightboxImage();
}

function updateLightboxImage() {
  const lb = document.getElementById('lightbox');
  const img = lb.querySelector('.lb-img');
  const capEl = lb.querySelector('.lb-caption');
  img.src = lightboxState.images[lightboxState.index];
  capEl.textContent = `${lightboxState.caption} \u2014 ${lightboxState.index + 1} / ${lightboxState.images.length}`;
  lb.querySelector('.lb-prev').style.display = lightboxState.images.length > 1 ? 'flex' : 'none';
  lb.querySelector('.lb-next').style.display = lightboxState.images.length > 1 ? 'flex' : 'none';
  const thumbsWrap = lb.querySelector('.lb-thumbs');
  thumbsWrap.innerHTML = lightboxState.images.map((src, i) => `
    <button class="lb-thumb ${i === lightboxState.index ? 'is-active' : ''}" data-i="${i}">
      <img src="${src}" alt="Thumb ${i + 1}" loading="lazy">
    </button>
  `).join('');
  thumbsWrap.querySelectorAll('.lb-thumb').forEach(b => {
    b.addEventListener('click', () => {
      lightboxState.index = parseInt(b.dataset.i, 10);
      updateLightboxImage();
    });
  });
}

function stepLightbox(dir) {
  const n = lightboxState.images.length;
  lightboxState.index = (lightboxState.index + dir + n) % n;
  updateLightboxImage();
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.remove('open');
  document.body.style.overflow = '';
}

/* =========================================================
   PIXELATED MASCOT GUIDE — small pixel-art traveler
   with rotating speech-bubble tips.
   ========================================================= */
const MASCOT_TIPS = [
  "Click any dish photo to read its story!",
  "Hit 'More Photos' to see all the shots!",
  "Use \u2190 \u2192 keys to navigate the gallery!",
  "Each restaurant links to its reservation page!",
  "Try the search bar to filter by mood!",
  "Tap 'Next \u203a' to see more restaurants!",
  "Right-click a food photo to zoom in!"
];

function buildMascot() {
  if (document.getElementById('mascotGuide')) return;

  const mascot = document.createElement('div');
  mascot.id = 'mascotGuide';
  mascot.className = 'mascot-guide';
  mascot.innerHTML = `
    <div class="mascot-bubble" id="mascotBubble" role="status" aria-live="polite">
      <span class="mascot-bubble-text" id="mascotBubbleText">${MASCOT_TIPS[0]}</span>
      <button type="button" class="mascot-bubble-close" id="mascotBubbleClose" aria-label="Dismiss tip">\u00d7</button>
    </div>
    <button type="button" class="mascot-character" id="mascotCharacter" aria-label="Show tip">
      ${MASCOT_SVG}
    </button>
  `;
  document.body.appendChild(mascot);

  const bubble = document.getElementById('mascotBubble');
  const bubbleText = document.getElementById('mascotBubbleText');
  const bubbleClose = document.getElementById('mascotBubbleClose');
  const character = document.getElementById('mascotCharacter');

  let tipIndex = 0;
  let tipTimer = null;

  function rotateTip() {
    tipIndex = (tipIndex + 1) % MASCOT_TIPS.length;
    bubbleText.style.opacity = '0';
    setTimeout(() => {
      bubbleText.textContent = MASCOT_TIPS[tipIndex];
      bubbleText.style.opacity = '1';
    }, 200);
  }

  function startRotation() {
    if (tipTimer) return;
    tipTimer = setInterval(rotateTip, 6000);
  }
  function stopRotation() { if (tipTimer) { clearInterval(tipTimer); tipTimer = null; } }

  character.addEventListener('click', () => {
    const isOpen = bubble.classList.toggle('is-open');
    if (isOpen) startRotation();
    else stopRotation();
  });

  bubbleClose.addEventListener('click', e => {
    e.stopPropagation();
    bubble.classList.remove('is-open');
    stopRotation();
  });

  /* Auto-open after 2.5s, then keep rotating */
  setTimeout(() => {
    bubble.classList.add('is-open');
    startRotation();
  }, 2500);

  /* Mascot blinks periodically */
  setInterval(() => {
    character.classList.add('is-blinking');
    setTimeout(() => character.classList.remove('is-blinking'), 180);
  }, 4200);
}

const MASCOT_SVG = `
<svg viewBox="0 0 16 18" width="56" height="63" shape-rendering="crispEdges" style="image-rendering:pixelated;display:block" aria-hidden="true">
  <!-- Hat top -->
  <rect x="5" y="1" width="6" height="1" fill="#7a3e1d"/>
  <rect x="5" y="2" width="6" height="1" fill="#8b4513"/>
  <rect x="4" y="3" width="8" height="1" fill="#8b4513"/>
  <!-- Hat brim -->
  <rect x="3" y="4" width="10" height="1" fill="#5c2f12"/>
  <rect x="3" y="5" width="10" height="1" fill="#6e3713"/>
  <!-- Face -->
  <rect x="5" y="5" width="6" height="3" fill="#ffd9b3"/>
  <rect x="5" y="5" width="6" height="1" fill="#f5c9a3"/>
  <!-- Eyes -->
  <rect x="6" y="6" width="1" height="1" fill="#1c2b22" class="mascot-eye"/>
  <rect x="9" y="6" width="1" height="1" fill="#1c2b22" class="mascot-eye"/>
  <!-- Smile -->
  <rect x="7" y="7" width="2" height="1" fill="#c8623a"/>
  <!-- Neck -->
  <rect x="6" y="8" width="4" height="1" fill="#f5c9a3"/>
  <!-- Body / shirt -->
  <rect x="4" y="9" width="8" height="4" fill="#c8623a"/>
  <rect x="4" y="9" width="8" height="1" fill="#b1532f"/>
  <!-- Backpack straps -->
  <rect x="4" y="9" width="1" height="3" fill="#2f4d3a"/>
  <rect x="11" y="9" width="1" height="3" fill="#2f4d3a"/>
  <!-- Arms -->
  <rect x="3" y="9" width="1" height="3" fill="#ffd9b3"/>
  <rect x="12" y="9" width="1" height="3" fill="#ffd9b3"/>
  <!-- Tiny flag in right hand -->
  <rect x="13" y="9" width="1" height="1" fill="#8b4513"/>
  <rect x="13" y="7" width="2" height="2" fill="#2f4d3a"/>
  <!-- Belt -->
  <rect x="4" y="12" width="8" height="1" fill="#3a2618"/>
  <!-- Legs -->
  <rect x="5" y="13" width="2" height="3" fill="#213827"/>
  <rect x="9" y="13" width="2" height="3" fill="#213827"/>
  <!-- Boots -->
  <rect x="5" y="16" width="2" height="1" fill="#1c2b22"/>
  <rect x="9" y="16" width="2" height="1" fill="#1c2b22"/>
  <rect x="4" y="16" width="1" height="1" fill="#1c2b22"/>
  <rect x="7" y="16" width="1" height="1" fill="#1c2b22"/>
  <rect x="8" y="16" width="1" height="1" fill="#1c2b22"/>
  <rect x="11" y="16" width="1" height="1" fill="#1c2b22"/>
</svg>`;

/* =========================================================
   WANDERING DOG — miniature pixelated dog that roams the page,
   sits when idle, and reacts when the user clicks / pets it.
   Can also be dragged to a new spot.
   ========================================================= */
const DOG_BARKS = [
  "Woof!",
  "Bark! Bark!",
  "Ruff!",
  "Yip yip!",
  "Arf!",
  "*happy tail wags*",
  "Pet me again?",
  "Where to next?",
  "I smell tagine!",
  "Found a good spot!"
];

const DOG_SVG = `
<svg viewBox="0 0 20 14" width="60" height="42" shape-rendering="crispEdges" style="image-rendering:pixelated;display:block" aria-hidden="true">
  <!-- Tail (animated via .dog-tail) -->
  <rect class="dog-tail" x="1" y="6" width="2" height="2" fill="#a05a2c"/>
  <rect class="dog-tail" x="0" y="6" width="1" height="2" fill="#7a3e1d"/>
  <!-- Back legs -->
  <rect class="dog-leg dog-leg-bl" x="3" y="11" width="2" height="2" fill="#7a3e1d"/>
  <rect class="dog-leg dog-leg-br" x="6" y="11" width="2" height="2" fill="#7a3e1d"/>
  <!-- Body -->
  <rect x="2" y="6" width="9" height="5" fill="#c87f4a"/>
  <rect x="2" y="6" width="9" height="1" fill="#d99355"/>
  <rect x="2" y="10" width="9" height="1" fill="#a05a2c"/>
  <!-- Belly spot -->
  <rect x="5" y="9" width="3" height="1" fill="#f0d5b8"/>
  <!-- Front legs (animated via .dog-leg) -->
  <rect class="dog-leg dog-leg-fl" x="9" y="11" width="2" height="2" fill="#7a3e1d"/>
  <rect class="dog-leg dog-leg-fr" x="12" y="11" width="2" height="2" fill="#7a3e1d"/>
  <!-- Head -->
  <rect x="11" y="3" width="7" height="6" fill="#c87f4a"/>
  <rect x="11" y="3" width="7" height="1" fill="#d99355"/>
  <rect x="11" y="8" width="7" height="1" fill="#a05a2c"/>
  <!-- Snout -->
  <rect x="16" y="6" width="3" height="2" fill="#f0d5b8"/>
  <!-- Nose -->
  <rect x="18" y="6" width="1" height="1" fill="#1c2b22"/>
  <!-- Mouth -->
  <rect class="dog-mouth" x="17" y="7" width="1" height="1" fill="#1c2b22"/>
  <!-- Eyes (blink via .dog-eye) -->
  <rect class="dog-eye" x="13" y="5" width="1" height="1" fill="#1c2b22"/>
  <rect class="dog-eye" x="15" y="5" width="1" height="1" fill="#1c2b22"/>
  <!-- Floppy ear -->
  <rect class="dog-ear" x="11" y="2" width="3" height="3" fill="#7a3e1d"/>
  <rect class="dog-ear" x="11" y="4" width="3" height="1" fill="#5c2f12"/>
  <!-- Collar -->
  <rect x="13" y="8" width="4" height="1" fill="#c8623a"/>
  <rect x="15" y="9" width="1" height="1" fill="#f5d76e"/>
</svg>`;

let dogState = {
  x: 0, y: 0,
  walking: false,
  dragOffX: 0, dragOffY: 0,
  isDragging: false,
  walkTimer: null,
  blinkTimer: null,
  petCooldown: false
};

function buildDog() {
  if (document.getElementById('wanderingDog')) return;

  const dog = document.createElement('div');
  dog.id = 'wanderingDog';
  dog.className = 'wandering-dog';
  dog.setAttribute('role', 'button');
  dog.setAttribute('tabindex', '0');
  dog.setAttribute('aria-label', 'Pet the dog');
  dog.innerHTML = `
    <div class="dog-shadow" aria-hidden="true"></div>
    <div class="dog-sprite">
      ${DOG_SVG}
      <span class="dog-bark" id="dogBark" aria-hidden="true"></span>
    </div>
    <div class="dog-particle-layer" id="dogParticles" aria-hidden="true"></div>
  `;
  document.body.appendChild(dog);

  /* Start at random spot in lower half of viewport */
  const startX = Math.random() * (window.innerWidth - 80) + 20;
  const startY = window.innerHeight * 0.6 + Math.random() * (window.innerHeight * 0.3 - 80);
  dogState.x = startX;
  dogState.y = Math.min(startY, window.innerHeight - 100);
  positionDog();

  /* Click → pet the dog */
  dog.addEventListener('click', e => {
    if (dogState.isDragging) return;
    if (dogState.petCooldown) return;
    petTheDog(e);
  });

  /* Keyboard: Enter / Space pets */
  dog.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      petTheDog();
    }
  });

  /* Drag support — pick up and drop elsewhere */
  let dragStartX = 0, dragStartY = 0, dragMoved = false;
  function onPointerDown(e) {
    dogState.isDragging = false;
    dragMoved = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    const rect = dog.getBoundingClientRect();
    dogState.dragOffX = e.clientX - rect.left - rect.width / 2;
    dogState.dragOffY = e.clientY - rect.top - rect.height / 2;
    dog.classList.add('is-grabbed');
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    e.stopPropagation();
  }
  function onPointerMove(e) {
    dragMoved = true;
    if (Math.abs(e.clientX - dragStartX) > 4 || Math.abs(e.clientY - dragStartY) > 4) {
      dogState.isDragging = true;
      dogState.walking = false;
      dog.classList.add('is-dragging');
      dog.classList.remove('is-walking');
    }
    if (dogState.isDragging) {
      dogState.x = e.clientX - dogState.dragOffX;
      dogState.y = e.clientY - dogState.dragOffY;
      positionDog();
    }
  }
  function onPointerUp() {
    dog.classList.remove('is-grabbed', 'is-dragging');
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    /* If it was a drag, pause wandering briefly; if just a tap, pet the dog */
    if (dogState.isDragging) {
      dogState.petCooldown = true;
      setTimeout(() => { dogState.petCooldown = false; }, 100);
      scheduleNextWalk(4000);
    }
  }
  dog.addEventListener('pointerdown', onPointerDown);

  /* Wander loop */
  scheduleNextWalk(3000);

  /* Blink loop */
  dogState.blinkTimer = setInterval(() => {
    dog.classList.add('is-blinking');
    setTimeout(() => dog.classList.remove('is-blinking'), 150);
  }, 3800);
}

function positionDog() {
  const dog = document.getElementById('wanderingDog');
  if (!dog) return;
  /* Keep the dog inside the viewport (with some margin) */
  const margin = 10;
  const w = dog.offsetWidth || 60;
  const h = dog.offsetHeight || 50;
  dogState.x = Math.max(margin, Math.min(window.innerWidth - w - margin, dogState.x));
  dogState.y = Math.max(margin + 60, Math.min(window.innerHeight - h - margin, dogState.y));
  dog.style.left = dogState.x + 'px';
  dog.style.top = dogState.y + 'px';
}

function scheduleNextWalk(delay) {
  if (dogState.walkTimer) clearTimeout(dogState.walkTimer);
  dogState.walkTimer = setTimeout(walkDog, delay || (5000 + Math.random() * 4000));
}

function walkDog() {
  const dog = document.getElementById('wanderingDog');
  if (!dog || dogState.isDragging) {
    scheduleNextWalk(3000);
    return;
  }

  /* Pick a random target within the lower 70% of the viewport */
  const targetX = Math.random() * (window.innerWidth - 100) + 20;
  const targetY = window.innerHeight * 0.3 + Math.random() * (window.innerHeight * 0.6 - 80);
  const startX = dogState.x;
  const startY = dogState.y;
  const dx = targetX - startX;
  const dy = targetY - startY;
  const dist = Math.hypot(dx, dy);
  const duration = Math.max(2000, Math.min(6000, dist * 8));

  /* Face the direction of travel */
  if (Math.abs(dx) > 5) {
    dog.classList.toggle('faces-left', dx < 0);
    dog.classList.toggle('faces-right', dx >= 0);
  }

  dogState.walking = true;
  dog.classList.add('is-walking');
  dog.classList.remove('is-sitting');

  const startTime = performance.now();
  function step(now) {
    if (dogState.isDragging) {
      dog.classList.remove('is-walking');
      dogState.walking = false;
      scheduleNextWalk(3000);
      return;
    }
    const t = Math.min(1, (now - startTime) / duration);
    /* Ease in-out for a more dog-like amble */
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    dogState.x = startX + dx * eased;
    dogState.y = startY + dy * eased;
    positionDog();
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      dogState.walking = false;
      dog.classList.remove('is-walking');
      dog.classList.add('is-sitting');
      /* Sit for a bit, then wander again */
      scheduleNextWalk(4000 + Math.random() * 5000);
    }
  }
  requestAnimationFrame(step);
}

function petTheDog(event) {
  const dog = document.getElementById('wanderingDog');
  if (!dog) return;
  if (dogState.petCooldown) return;
  dogState.petCooldown = true;
  setTimeout(() => { dogState.petCooldown = false; }, 600);

  /* Stop walking briefly, do a happy hop */
  dogState.walking = false;
  dog.classList.remove('is-walking');
  dog.classList.add('is-petting', 'is-sitting');

  /* Bark bubble */
  const bark = document.getElementById('dogBark');
  if (bark) {
    bark.textContent = DOG_BARKS[Math.floor(Math.random() * DOG_BARKS.length)];
    bark.classList.remove('is-show');
    void bark.offsetWidth; /* restart animation */
    bark.classList.add('is-show');
    setTimeout(() => bark.classList.remove('is-show'), 1800);
  }

  /* Heart particles */
  spawnHearts(dog);

  /* Hop animation */
  setTimeout(() => dog.classList.remove('is-petting'), 500);

  /* Resume wandering shortly */
  scheduleNextWalk(3500);
}

function spawnHearts(dog) {
  const layer = document.getElementById('dogParticles');
  if (!layer) return;
  const count = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('span');
    heart.className = 'dog-heart';
    heart.textContent = '\u2665';
    heart.style.setProperty('--hx', (Math.random() * 60 - 30) + 'px');
    heart.style.setProperty('--hd', (i * 120) + 'ms');
    heart.style.setProperty('--hr', (Math.random() * 30 - 15) + 'deg');
    layer.appendChild(heart);
    setTimeout(() => heart.remove(), 1600);
  }
}

/* Re-position on resize so the dog stays on screen */
window.addEventListener('resize', () => {
  if (document.getElementById('wanderingDog')) positionDog();
});

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  renderCardGrid();
  initSearch();
  renderFeatured();
  renderGallery();
  initContactForm();
  renderDestinationPage();
  buildMascot();
  buildDog();
});
