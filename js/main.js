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
  button.addEventListener('click', () => {
    const section = button.closest('section');
    const target = section && section.nextElementSibling;
    if (!target) return;

    if (lenis) {
      lenis.scrollTo(target, { duration: 1.4 });
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

