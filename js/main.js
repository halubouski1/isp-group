// ========================================
// Lenis smooth scroll
// ========================================
let lenis = null;
if (typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  const lenisRaf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(lenisRaf);
  };
  requestAnimationFrame(lenisRaf);
}

// ========================================
// AOS init
// ========================================
if (typeof AOS !== 'undefined') {
  AOS.init({
    duration: 900,
    once: true,
    offset: 80,
    easing: 'ease-out-cubic',
  });
  if (lenis) lenis.on('scroll', AOS.refresh);
}
// ========================================
// Fixed viewport height (hero)
// ========================================
const setFixedVh = () => {
  document.documentElement.style.setProperty('--fixed-vh', window.innerHeight + 'px');
};

setFixedVh();

let lastVhWidth = window.innerWidth;
window.addEventListener('resize', () => {
  // ignore mobile address-bar height changes, react only to real width changes
  if (window.innerWidth !== lastVhWidth) {
    lastVhWidth = window.innerWidth;
    setFixedVh();
  }
});
window.addEventListener('orientationchange', setFixedVh);

// ========================================
// CountUp — hero stats
// ========================================
if (typeof countUp !== 'undefined') {
  const counters = document.querySelectorAll('[data-countup]');

  const runCountUp = (el) => {
    const value = parseFloat(el.dataset.countup);
    const counter = new countUp.CountUp(el, value, {
      duration: 2,
      suffix: el.dataset.countupSuffix || '',
    });
    if (!counter.error) counter.start();
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      runCountUp(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  counters.forEach((el) => observer.observe(el));
}

// ========================================
// Services slider — a stack of cards below 570px
// ========================================
if (typeof Swiper !== 'undefined' && document.querySelector('.services__slider')) {
  const deckQuery = window.matchMedia('(max-width: 570px)');
  let servicesSwiper = null;

  const syncServicesSlider = () => {
    if (deckQuery.matches) {
      // destroy(true, true) also strips the inline styles Swiper added, which
      // would otherwise fight the sticky stack in media.css
      if (servicesSwiper) {
        servicesSwiper.destroy(true, true);
        servicesSwiper = null;
      }
      return;
    }

    if (servicesSwiper) return;

    servicesSwiper = new Swiper('.services__slider', {
      slidesPerView: 'auto',
      // values below 1920px are the layout scaled by 0.75 (see media.css)
      spaceBetween: 11.25,
      slidesOffsetBefore: 11.25,
      breakpoints: {
        1920: {
          spaceBetween: 15,
          slidesOffsetBefore: 15,
        },
      },
      slidesOffsetAfter: 15,
      speed: 700,
      navigation: {
        nextEl: '.slider-btn--next',
        prevEl: '.slider-btn--prev',
      },
    });
  };

  syncServicesSlider();
  deckQuery.addEventListener('change', syncServicesSlider);
}

// ========================================
// Stages slider (service page) — same deck behaviour as the services slider
// ========================================
if (typeof Swiper !== 'undefined' && document.querySelector('.stages__slider')) {
  const deckQuery = window.matchMedia('(max-width: 570px)');
  let stagesSwiper = null;

  const syncStagesSlider = () => {
    if (deckQuery.matches) {
      if (stagesSwiper) {
        stagesSwiper.destroy(true, true);
        stagesSwiper = null;
      }
      return;
    }

    if (stagesSwiper) return;

    stagesSwiper = new Swiper('.stages__slider', {
      slidesPerView: 'auto',
      // values below 1920px are the layout scaled by 0.75 (see media-service.css)
      spaceBetween: 11.25,
      slidesOffsetBefore: 11.25,
      breakpoints: {
        1920: {
          spaceBetween: 15,
          slidesOffsetBefore: 25,
        },
      },
      slidesOffsetAfter: 15,
      speed: 700,
      navigation: {
        nextEl: '.stages-btn--next',
        prevEl: '.stages-btn--prev',
      },
    });
  };

  syncStagesSlider();
  deckQuery.addEventListener('change', syncStagesSlider);
}

// ========================================
// Purpose slider
// ========================================
if (typeof Swiper !== 'undefined' && document.querySelector('.purpose__slider')) {
  new Swiper('.purpose__slider', {
    slidesPerView: 'auto',
    // values below 1920px are the layout scaled by 0.75 (see media.css)
    spaceBetween: 25.5,
    breakpoints: {
      1920: {
        spaceBetween: 34,
      },
      570: {
        spaceBetween: 34,
      },
      0: {
        spaceBetween: 10,
      },
    },
    slidesOffsetAfter: 34,
    speed: 700,
    navigation: {
      nextEl: '.purpose-btn--next',
      prevEl: '.purpose-btn--prev',
    },
  });
}

// ========================================
// Insights slider (post page)
// ========================================
if (typeof Swiper !== 'undefined' && document.querySelector('.insights__slider')) {
  new Swiper('.insights__slider', {
    slidesPerView: 'auto',
    // breakpoints are min-width, so this is the value for 1919px and below
    spaceBetween: 20,
    breakpoints: {
      1920: {
        spaceBetween: 32,
      },
    },
    // the 20px side inset lives here rather than in CSS padding, so the track
    // still clips the cards at the gutter instead of showing them through it
    slidesOffsetBefore: 20,
    slidesOffsetAfter: 20,
    speed: 700,
    navigation: {
      nextEl: '.insights-btn--next',
      prevEl: '.insights-btn--prev',
    },
  });
}

// ========================================
// News list
// ----------------------------------------
// Every article sits in .news__pool. Desktop shows one paginated page at a
// time (PER_GRID in the grid, the rest in the slider); below the mobile
// breakpoint the slider and pagination give way to a Load more button.
// ========================================
if (document.querySelector('.news__pool')) {
  const PER_PAGE = 10;
  const PER_GRID = 4;
  const MOBILE_FIRST = 4;
  const MOBILE_STEP = 4;

  const pool = document.querySelector('.news__pool');
  const grid = document.querySelector('.news__grid');
  const slider = document.querySelector('.news__slider');
  const sliderNav = document.querySelector('.news__slider-nav');
  const wrapper = slider.querySelector('.swiper-wrapper');
  const pagination = document.querySelector('.news-pagination');
  const loadMore = document.querySelector('.news__load-more');
  const head = document.querySelector('.news__head');

  const all = [...pool.querySelectorAll('.news-card')].map((c) => ({
    html: c.outerHTML,
    categories: (c.dataset.categories || '').split(/\s+/).filter(Boolean),
    date: c.dataset.date || '',
    views: Number(c.dataset.views) || 0,
  }));
  const mobile = window.matchMedia('(max-width: 570px)');

  let swiper = null;
  let current = 0;
  let shown = MOBILE_FIRST;
  let category = '';
  let sort = '';
  let cards = all.map((n) => n.html);
  let pageCount = Math.max(1, Math.ceil(cards.length / PER_PAGE));

  // Rebuilds the working list from the two filters. Sorting is done on a copy
  // so the pool order stays the source of truth.
  const applyFilters = () => {
    let list = category ? all.filter((n) => n.categories.includes(category)) : all.slice();

    if (sort === 'newest-first') list.sort((a, b) => b.date.localeCompare(a.date));
    else if (sort === 'oldest-first') list.sort((a, b) => a.date.localeCompare(b.date));
    else if (sort === 'most-read') list.sort((a, b) => b.views - a.views);

    cards = list.map((n) => n.html);
    pageCount = Math.max(1, Math.ceil(cards.length / PER_PAGE));
    current = 0;
    shown = MOBILE_FIRST;

    pagination.innerHTML = Array.from({ length: pageCount }, (_, i) =>
      `<a class="news-pagination__link" href="#" data-page="${i}">${i + 1}</a>`).join('');

    grid.dataset.empty = cards.length ? 'false' : 'true';
    renderCurrentMode();
  };

  // Cards fade up as they arrive; the stagger is applied per card and the
  // class is dropped again so nothing lingers on the element.
  const animate = (container, from = 0) => {
    [...container.children].forEach((child, i) => {
      if (i < from) return;
      const card = child.classList.contains('news-card') ? child : child.querySelector('.news-card');
      if (!card) return;
      card.classList.add('news-card--enter');
      card.style.animationDelay = `${(i - from) * 60}ms`;
      card.addEventListener('animationend', () => {
        card.classList.remove('news-card--enter');
        card.style.animationDelay = '';
      }, { once: true });
    });
  };

  const buildSwiper = () => {
    if (typeof Swiper === 'undefined') return;
    if (swiper) {
      swiper.update();
      swiper.slideTo(0, 0);
      return;
    }
    swiper = new Swiper('.news__slider', {
      slidesPerView: 'auto',
      spaceBetween: 18,
      // the side inset lives here rather than in CSS padding, so the track
      // still clips the cards at the gutter instead of showing them through it
      slidesOffsetBefore: 30,
      slidesOffsetAfter: 30,
      speed: 700,
      navigation: {
        nextEl: '.news-btn--next',
        prevEl: '.news-btn--prev',
      },
    });
  };

  const renderDesktop = (page) => {
    const slice = cards.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

    grid.innerHTML = slice.slice(0, PER_GRID).join('');
    wrapper.innerHTML = slice
      .slice(PER_GRID)
      .map((card) => `<div class="swiper-slide">${card}</div>`)
      .join('');

    // the slider is pointless with nothing left over for it
    const rest = slice.length - PER_GRID;
    slider.hidden = rest <= 0;
    sliderNav.hidden = rest <= 0;
    pagination.hidden = pageCount < 2;
    loadMore.hidden = true;

    pagination.querySelectorAll('.news-pagination__link').forEach((link, i) => {
      link.classList.toggle('is-active', i === page);
      link.setAttribute('aria-current', i === page ? 'page' : 'false');
    });

    current = page;
    buildSwiper();
    animate(grid);
    animate(wrapper);
  };

  // `append` keeps the cards already on screen instead of re-rendering them,
  // so only the new batch animates in
  const renderMobile = (count, append = false) => {
    const next = Math.min(count, cards.length);

    if (append) {
      const from = grid.children.length;
      grid.insertAdjacentHTML('beforeend', cards.slice(from, next).join(''));
      animate(grid, from);
    } else {
      grid.innerHTML = cards.slice(0, next).join('');
      animate(grid);
    }

    shown = next;
    slider.hidden = true;
    sliderNav.hidden = true;
    pagination.hidden = true;
    loadMore.hidden = shown >= cards.length;
  };

  const renderCurrentMode = () => {
    if (mobile.matches) {
      renderMobile(shown);
    } else {
      shown = MOBILE_FIRST;
      renderDesktop(current);
    }
  };

  // ----- pagination -----
  pagination.addEventListener('click', (e) => {
    const link = e.target.closest('.news-pagination__link');
    if (!link) return;
    e.preventDefault();

    const page = Number(link.dataset.page);
    if (page === current) return;
    renderDesktop(page);

    // glide back up to the heading rather than jumping
    if (lenis) {
      lenis.scrollTo(head, { duration: 1.2, offset: -100 });
    } else {
      head.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // ----- load more (mobile): one batch at a time -----
  loadMore.addEventListener('click', () => {
    renderMobile(shown + MOBILE_STEP, true);
  });

  // ----- filters -----
  document.querySelectorAll('[data-news-filter]').forEach((filter) => {
    const name = filter.querySelector('input[type="hidden"]').name;
    filter.addEventListener('news-filter:change', (e) => {
      if (name === 'categories') category = e.detail === 'all' ? '' : e.detail;
      else sort = e.detail;
      applyFilters();
    });
  });

  mobile.addEventListener('change', renderCurrentMode);
  applyFilters();
}

// ========================================
// News filters — overlay dropdowns (category / recency)
// ========================================
document.querySelectorAll('[data-news-filter]').forEach((filter) => {
  const trigger = filter.querySelector('.news-filter__trigger');
  const valueEl = filter.querySelector('.news-filter__value');
  const hidden = filter.querySelector('input[type="hidden"]');
  const options = filter.querySelectorAll('.news-filter__option');
  const label = valueEl.textContent;

  const close = () => {
    filter.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !filter.classList.contains('is-open');
    // only one panel at a time
    document.querySelectorAll('[data-news-filter].is-open').forEach((other) => {
      other.classList.remove('is-open');
      other.querySelector('.news-filter__trigger').setAttribute('aria-expanded', 'false');
    });
    filter.classList.toggle('is-open', willOpen);
    trigger.setAttribute('aria-expanded', String(willOpen));
  });

  options.forEach((option) => {
    option.addEventListener('click', () => {
      options.forEach((o) => o.classList.remove('is-selected'));
      option.classList.add('is-selected');
      // the first option resets the filter back to its label
      const isReset = option.dataset.value === 'all';
      valueEl.textContent = isReset ? label : option.textContent;
      if (hidden) hidden.value = isReset ? '' : option.dataset.value;
      close();

      // the news list listens for this and re-renders
      filter.dispatchEvent(new CustomEvent('news-filter:change', {
        detail: option.dataset.value,
      }));
    });
  });

  document.addEventListener('click', (e) => {
    if (!filter.contains(e.target)) close();
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('[data-news-filter].is-open').forEach((f) => {
    f.classList.remove('is-open');
    f.querySelector('.news-filter__trigger').setAttribute('aria-expanded', 'false');
  });
});

// ========================================
// Scroll-filled text
// ========================================
const fillTexts = document.querySelectorAll('[data-fill-text]');

if (fillTexts.length) {
  const blocks = [];

  fillTexts.forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((word) => `<span class="fill-text__word">${word}</span>`)
      .join(' ');
    blocks.push({ el, words: el.querySelectorAll('.fill-text__word') });
  });

  const updateFill = () => {
    const viewportHeight = window.innerHeight;

    blocks.forEach(({ el, words }) => {
      const rect = el.getBoundingClientRect();
      // fill starts when the block enters the lower part of the screen
      // and completes once it has scrolled past the middle
      const start = viewportHeight * 0.85;
      const distance = rect.height + viewportHeight * 0.35;
      const progress = Math.min(Math.max((start - rect.top) / distance, 0), 1);
      const active = Math.round(progress * words.length);

      words.forEach((word, i) => {
        word.classList.toggle('is-active', i < active);
      });
    });
  };

  updateFill();
  window.addEventListener('scroll', updateFill, { passive: true });
  window.addEventListener('resize', updateFill);
  if (lenis) lenis.on('scroll', updateFill);
}

// ========================================
// FAQ accordion
// ========================================
if (typeof Accordion !== 'undefined' && document.querySelector('.faq__accordion')) {
  new Accordion('.faq__accordion', {
    duration: 400,
    showMultiple: false,
    openOnInit: [0],
  });
}

// ========================================
// Contact — custom dropdown(s)
// ========================================
document.querySelectorAll('[data-select]').forEach((select) => {
  const trigger = select.querySelector('.contact__select-trigger');
  const valueEl = select.querySelector('.contact__select-value');
  const hidden = select.querySelector('input[type="hidden"]');
  const options = select.querySelectorAll('.contact__select-option');

  const close = () => {
    select.classList.remove('is-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !select.classList.contains('is-open');
    // close any other open selects
    document.querySelectorAll('[data-select].is-open').forEach((s) => {
      if (s !== select) {
        s.classList.remove('is-open');
        const t = s.querySelector('.contact__select-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    });
    select.classList.toggle('is-open', willOpen);
    trigger.setAttribute('aria-expanded', String(willOpen));
  });

  options.forEach((option) => {
    option.addEventListener('click', () => {
      valueEl.textContent = option.textContent;
      select.classList.add('is-filled');
      if (hidden) hidden.value = option.dataset.value || option.textContent;
      options.forEach((o) => o.classList.remove('is-selected'));
      option.classList.add('is-selected');
      close();
    });
  });

  // close when clicking outside
  document.addEventListener('click', (e) => {
    if (!select.contains(e.target)) close();
  });
});

// Prevent the demo contact form from reloading the page
const contactForm = document.querySelector('.contact__form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => e.preventDefault());
}
// ========================================
// Back to top
// ========================================
document.querySelectorAll('.footer__totop, .footer-mob__totop').forEach((button) => {
  button.addEventListener('click', () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.6 });
      return;
    }
    // no Lenis (failed to load, or reduced motion) — fall back to the browser
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// ========================================
// Cases — grid + big sliders, both filtered by category
// ========================================
if (typeof Swiper !== 'undefined' && document.querySelector('.cases__grid')) {
  const casesGrid = new Swiper('.cases__grid', {
    slidesPerView: 'auto',
    spaceBetween: 26,
    slidesOffsetBefore: 30,
    slidesOffsetAfter: 0,
    speed: 600,
    grabCursor: true,
    navigation: {
      prevEl: '.cases__arrow--prev',
      nextEl: '.cases__arrow--next',
    },
    breakpoints: {
        1919: {
        spaceBetween: 26,
        slidesOffsetBefore: 30,
        slidesOffsetAfter: 30,
      },
      1026: {
        spaceBetween: 20,
        slidesOffsetBefore: 22,
        slidesOffsetAfter: 22,
      },
      571: {
        spaceBetween: 20,
        slidesOffsetBefore: 20,
        slidesOffsetAfter: 20,
      },
      0: {
        spaceBetween: 20,
        slidesOffsetBefore: 20,
        slidesOffsetAfter: 20,
      },
    },
  });

  const casesBig = document.querySelector('.cases__big')
    ? new Swiper('.cases__big', {
        // Always 'auto' — with slidesPerView: 1 Swiper overrides the CSS width
        // with the full container width, and the offsets below then push the
        // slide off-screen. The width lives in portfolio.css as
        // calc(100% - gutter * 2); these offsets must match --gutter.
        slidesPerView: 'auto',
        spaceBetween: 20,
        slidesOffsetBefore: 20,
        slidesOffsetAfter: 20,
        speed: 700,
        grabCursor: true,
        navigation: {
          prevEl: '.cases__big-arrow--prev',
          nextEl: '.cases__big-arrow--next',
        },
        breakpoints: {
          571: {
            spaceBetween: 20,
            slidesOffsetBefore: 20,
            slidesOffsetAfter: 20,
          },
          1026: {
            spaceBetween: 22,
            slidesOffsetBefore: 22,
            slidesOffsetAfter: 22,
          },
          1920: {
            spaceBetween: 30,
            slidesOffsetBefore: 30,
            slidesOffsetAfter: 30,
          },
        },
      })
    : null;

  // Hide non-matching slides, then replay the staggered appear animation
  const filterSlider = (swiper, slides, cat) => {
    if (!swiper || !slides.length) return;

    slides.forEach((slide) => {
      const match = cat === 'all' || slide.dataset.cat === cat;
      slide.classList.toggle('is-hidden', !match);
      slide.classList.remove('is-appearing');
    });

    swiper.update();
    swiper.slideTo(0, 0);

    void swiper.el.offsetWidth; // force reflow so the animation replays
    let visible = 0;
    slides.forEach((slide) => {
      if (slide.classList.contains('is-hidden')) return;
      slide.style.setProperty('--appear-delay', `${visible * 60}ms`);
      slide.classList.add('is-appearing');
      visible += 1;
    });
  };

  const filters = document.querySelectorAll('.cases__filter');
  const gridSlides = [...document.querySelectorAll('.cases__grid .swiper-slide')];
  const bigSlides = [...document.querySelectorAll('.cases__big .swiper-slide')];

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      filters.forEach((f) => f.classList.remove('is-active'));
      filter.classList.add('is-active');

      const cat = filter.dataset.filter;
      filterSlider(casesGrid, gridSlides, cat);
      filterSlider(casesBig, bigSlides, cat);
    });
  });
}

// ========================================
// Scroll down to the next section (hero control)
// ========================================
document.querySelectorAll('[data-scroll-next]').forEach((button) => {
  button.addEventListener('click', (e) => {
    const section = button.closest('section');
    const target = section && section.nextElementSibling;
    if (!target) return;

    // the trigger can be an <a> with a same-page href as a no-JS fallback —
    // stop the jump so Lenis can glide there instead
    e.preventDefault();

    if (lenis) {
      // same 100px gap the CSS scroll-margin-top gives native #hash jumps
      lenis.scrollTo(target, { duration: 1.4, offset: -100 });
      return;
    }
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ========================================
// Experience — pinned circle
// ========================================
const experiencePin = document.querySelector('[data-experience]');

if (experiencePin) {
  const stage = experiencePin.querySelector('.experience__stage');
  const items = [...experiencePin.querySelectorAll('[data-experience-item]')];
  const slides = [...experiencePin.querySelectorAll('[data-experience-slide]')];
  const line = experiencePin.querySelector('[data-experience-line]');

  // six items evenly around the circle
  const STEP = 360 / items.length;
  // matches the transition on .experience__icon plus the line's delay
  const TRAVEL = 450;
  let activeIndex = -1;
  let targetIndex = 0;
  let stepTimer = null;

  const setActive = (index) => {
    if (index === activeIndex) return;
    activeIndex = index;

    items.forEach((item, i) => item.classList.toggle('is-active', i === index));
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));

    // replay the line: collapse without a transition, then grow back
    if (line) {
      line.classList.add('is-resetting');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => line.classList.remove('is-resetting'));
      });
    }
  };

  const render = (index) => {
    items.forEach((item, i) => {
      // positive angle = clockwise, so an item leaves to the right once passed
      item.style.setProperty('--a', (index - i) * STEP + 'deg');
    });
    setActive(index);
  };

  // Walk towards the index the scroll asks for one point at a time. A fast
  // flick would otherwise jump several points at once and the ones in between
  // would never be seen.
  const stepTowardsTarget = () => {
    if (stepTimer || targetIndex === activeIndex) return;

    render(activeIndex + Math.sign(targetIndex - activeIndex));

    stepTimer = setTimeout(() => {
      stepTimer = null;
      stepTowardsTarget();
    }, TRAVEL);
  };

  // How far the page scrolls for one point. The pin is exactly this times the
  // number of gaps plus the stage itself, so the last point lands at the very
  // end of the pin — no empty scrolling after the circle.
  const SCROLL_PER_STEP = 1.5;

  // On mobile the address bar hiding fires resize, and window.innerHeight
  // changes by ~100px. With 5 gaps that moved the pin's height by ~750px in
  // the middle of a scroll: everything below shifted and the page looked like
  // it jumped backwards. --fixed-vh deliberately ignores those address-bar
  // changes, so the pin is measured against it instead.
  const screenHeight = () => {
    const fixed = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--fixed-vh')
    );
    return fixed || window.innerHeight;
  };

  const layout = () => {
    const step = screenHeight() * SCROLL_PER_STEP;
    experiencePin.style.height =
      stage.offsetHeight + step * (items.length - 1) + 'px';
  };

  const update = () => {
    const distance = experiencePin.offsetHeight - stage.offsetHeight;
    const scrolled = -experiencePin.getBoundingClientRect().top;
    const progress = distance > 0 ? Math.min(Math.max(scrolled / distance, 0), 1) : 0;

    // progress 0 → first point on top, progress 1 → last one, so the animation
    // finishes exactly where the pin releases
    targetIndex = Math.round(progress * (items.length - 1));

    if (activeIndex === -1) {
      render(targetIndex);
      return;
    }

    stepTowardsTarget();
  };

  layout();
  update();
  window.addEventListener('scroll', update, { passive: true });

  // Only a real resize re-measures the pin; an address-bar resize just
  // refreshes the current position.
  let lastPinWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth !== lastPinWidth) {
      lastPinWidth = window.innerWidth;
      layout();
    }
    update();
  });
  window.addEventListener('orientationchange', () => {
    layout();
    update();
  });

  if (lenis) lenis.on('scroll', update);
}

// ========================================
// How We Work slider
// ========================================
if (typeof Swiper !== 'undefined' && document.querySelector('.how__slider')) {
  new Swiper('.how__slider', {
    slidesPerView: 'auto',
    // the columns are separated by their own dashed borders, so no gap here
    spaceBetween: 0,
    // matches the .how__top padding at each breakpoint
    slidesOffsetBefore: 20,
    slidesOffsetAfter: 20,
    breakpoints: {
      571: { slidesOffsetBefore: 21, slidesOffsetAfter: 21 },
      1920: { slidesOffsetBefore: 46, slidesOffsetAfter: 46 },
    },
    speed: 700,
    grabCursor: true,
    navigation: {
      nextEl: '.how__arrow--next',
      prevEl: '.how__arrow--prev',
    },
  });
}

// ========================================
// Career path — the line fills on scroll
// ========================================
const careerGrid = document.querySelector('[data-career]');

if (careerGrid) {
  const track = careerGrid.querySelector('.career__track');
  const years = [...careerGrid.querySelectorAll('[data-career-year]')];
  const labels = [...careerGrid.querySelectorAll('[data-career-label]')];

  // Below 1025px the timeline scrolls sideways, so the fill follows that
  // swipe. On wider screens the row fits and the page's vertical scroll
  // drives it instead.
  const isSideways = () => careerGrid.scrollWidth - careerGrid.clientWidth > 1;

  const getProgress = () => {
    if (isSideways()) {
      const travelled = careerGrid.scrollWidth - careerGrid.clientWidth;
      return Math.min(Math.max(careerGrid.scrollLeft / travelled, 0), 1);
    }

    const rect = track.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // starts once the line enters the lower part of the screen and completes
    // by the time it has travelled to the upper third
    const start = viewportHeight * 0.9;
    const distance = viewportHeight * 0.55;
    return Math.min(Math.max((start - rect.top) / distance, 0), 1);
  };

  const updateCareer = () => {
    const progress = getProgress();

    careerGrid.style.setProperty('--progress', progress);

    // a step lights up as the fill reaches its column and stays lit
    years.forEach((year, i) => {
      const point = years.length > 1 ? i / (years.length - 1) : 0;
      const reached = progress >= point;
      year.classList.toggle('is-reached', reached);
      if (labels[i]) labels[i].classList.toggle('is-reached', reached);
    });
  };

  updateCareer();
  careerGrid.addEventListener('scroll', updateCareer, { passive: true });
  window.addEventListener('scroll', updateCareer, { passive: true });
  window.addEventListener('resize', updateCareer);
  if (lenis) lenis.on('scroll', updateCareer);
}

// ========================================
// Popup — open via [data-popup], close via [data-popup-close] / overlay / Esc
// ========================================
const openPopup = (popup) => {
  popup.classList.add('is-open');
  popup.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (lenis) lenis.stop();
};

const closePopup = (popup) => {
  popup.classList.remove('is-open');
  popup.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lenis) lenis.start();
};

document.querySelectorAll('[data-popup]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(btn.dataset.popup);
    if (target) openPopup(target);
  });
});

document.querySelectorAll('.popup').forEach((popup) => {
  popup.querySelectorAll('[data-popup-close]').forEach((el) => {
    el.addEventListener('click', () => closePopup(popup));
  });
});

// intl-tel-input — auto-detect country from the typed phone number
const phoneInput = document.querySelector('#popup-phone');
if (phoneInput && typeof window.intlTelInput !== 'undefined') {
  window.intlTelInput(phoneInput, {
    initialCountry: 'us',
    nationalMode: false, // keep the full "+…" number inside the field, editable
    allowDropdown: false, // no manual picker — the flag only follows the typed number
  });

  // "+1" is a real (dark) value; the rest of the number is shown as a grey mask.
  const DIAL = '+1';
  phoneInput.value = DIAL;

  const field = phoneInput.closest('.popup__field');
  const hint = document.createElement('span');
  hint.className = 'popup__phone-hint';
  hint.setAttribute('aria-hidden', 'true');
  // Invisible "+1" reserves the exact width of the real value so the mask lines up after it
  hint.innerHTML = `<span class="popup__phone-hint-prefix">${DIAL}</span> (000)-000-00-00`;
  field.appendChild(hint);

  const syncHint = () => {
    const cs = getComputedStyle(phoneInput);
    hint.style.paddingLeft = cs.paddingLeft;
    hint.style.fontSize = cs.fontSize;
    // Show the mask only while nothing beyond the dial code has been typed
    hint.style.display = phoneInput.value.trim() === DIAL ? 'flex' : 'none';
  };

  phoneInput.addEventListener('input', syncHint);
  syncHint();
}

// ========================================
// Menu — slide-out drawer opened by the burger
// ========================================
const menu = document.querySelector('.menu');
const burger = document.querySelector('.burger');

const openMenu = () => {
  menu.classList.add('is-open');
  menu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (lenis) lenis.stop();
};

const closeMenu = () => {
  menu.classList.remove('is-open');
  menu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lenis) lenis.start();
};

if (menu && burger) {
  burger.addEventListener('click', openMenu);
  menu.querySelectorAll('[data-menu-close]').forEach((el) => {
    el.addEventListener('click', closeMenu);
  });
  menu.querySelectorAll('.menu__nav a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const openedPopup = document.querySelector('.popup.is-open');
  if (openedPopup) closePopup(openedPopup);
  if (menu && menu.classList.contains('is-open')) closeMenu();
});

// ========================================
// Project detail — image slider
// ========================================
if (typeof Swiper !== 'undefined' && document.querySelector('.project__slider')) {
  new Swiper('.project__slider', {
    slidesPerView: 'auto',
    spaceBetween: 16,
    slidesOffsetBefore: 50,
    slidesOffsetAfter: 50,
    speed: 600,
    grabCursor: true,
    navigation: {
      prevEl: '.project__prev',
      nextEl: '.project__next',
    },
    breakpoints: {
      1919: {
        spaceBetween: 16,
        slidesOffsetBefore: 50,
        slidesOffsetAfter: 50,
      },
      1024: {
        spaceBetween: 12,
        slidesOffsetBefore: 38,
        slidesOffsetAfter: 38,
      },
      0: {
        spaceBetween: 12,
        slidesOffsetBefore: 20,
        slidesOffsetAfter: 20,
      }
    }
  });
}

// ========================================
// Portfolio slider (Swiper)
// ========================================
if (typeof Swiper !== 'undefined' && document.querySelector('.portfolio__swiper')) {
  new Swiper('.portfolio__swiper', {
    loop: false,
    speed: 800,
    spaceBetween: 20,
    grabCursor: true,
    navigation: {
      prevEl: '.portfolio__prev',
      nextEl: '.portfolio__next',
    },
    breakpoints: {
      1024: {
        spaceBetween: 0,
      },
      },
  });
}