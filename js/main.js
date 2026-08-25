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
// Services slider
// ========================================
if (typeof Swiper !== 'undefined' && document.querySelector('.services__slider')) {
  new Swiper('.services__slider', {
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
