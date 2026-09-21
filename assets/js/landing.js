(() => {
  const WA_BASE = 'https://wa.me/51992809049';
  const waLink = (msg) => `${WA_BASE}?text=${encodeURIComponent(msg)}`;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsScrollTimeline =
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('animation-timeline', 'view()');

  const initMobileNav = () => {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('nav-links');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.querySelector('i').className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.querySelector('i').className = 'fa-solid fa-bars';
      });
    });
  };

  const initCourseFilters = () => {
    const search = document.getElementById('course-search');
    const category = document.getElementById('course-category');
    const cards = document.querySelectorAll('.catalog-card');
    if (!search || !category || !cards.length) return;

    const apply = () => {
      const q = search.value.trim().toLowerCase();
      const cat = category.value;
      cards.forEach((card) => {
        const title = (card.dataset.title || card.querySelector('h3')?.textContent || '').toLowerCase();
        const cardCat = card.dataset.category || '';
        const matchQ = !q || title.includes(q);
        const matchCat = !cat || cardCat === cat;
        card.classList.toggle('is-hidden', !(matchQ && matchCat));
      });
    };

    search.addEventListener('input', apply);
    category.addEventListener('change', apply);
  };

  // Los datos del curso viven en el propio HTML (atributos data-*), que es la
  // única fuente de verdad. Así no hay que duplicarlos en JavaScript.
  const initCourseModal = () => {
    const modal = document.getElementById('course-modal');
    if (!modal) return;

    const titleEl = document.getElementById('modal-title');
    const durationEl = document.getElementById('modal-duration');
    const dateEl = document.getElementById('modal-date');
    const trainerEl = document.getElementById('modal-trainer');
    const summaryEl = document.getElementById('modal-summary');
    const enrollEl = document.getElementById('modal-enroll');
    let lastFocused = null;

    const open = (card) => {
      if (!card) return;
      const d = card.dataset;
      lastFocused = document.activeElement;
      titleEl.textContent = d.title || '';
      durationEl.textContent = d.duration || '';
      if (dateEl) dateEl.textContent = d.date || 'Por confirmar';
      if (trainerEl) trainerEl.textContent = d.trainer || '';
      summaryEl.textContent = d.summary || '';
      if (enrollEl) {
        enrollEl.href = waLink(`Hola, quiero inscribirme en el curso ${d.title || ''}`);
      }
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (enrollEl) enrollEl.focus();
    };

    const close = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    };

    document.querySelectorAll('[data-course]').forEach((el) => {
      if (el.tagName === 'A') return;
      el.addEventListener('click', (e) => {
        const card = el.closest('.catalog-card');
        if (!card) return;
        e.preventDefault();
        open(card);
      });
    });

    modal.addEventListener('click', (e) => {
      if (e.target.closest('[data-modal-close]')) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  };

  const initStats = () => {
    const els = document.querySelectorAll('.stat-count[data-count]');
    if (!els.length) return;

    const animate = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const started = performance.now();

      const step = (now) => {
        const p = Math.min((now - started) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = Math.round(target * eased);
        el.textContent = `${prefix}${value}${suffix}`;
        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = `${prefix}${target}${suffix}`;
        }
      };
      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) {
      els.forEach(animate);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    els.forEach((el) => observer.observe(el));
  };

  const initTestimonials = () => {
    const track = document.getElementById('testimonials-track');
    const wrapper = document.querySelector('.testimonials__wrapper');
    const originalCards = track ? [...track.querySelectorAll('.testimonial-card')] : [];
    if (!track || !originalCards.length) return;

    const total = originalCards.length;
    const COPIES = 3;
    track.innerHTML = '';
    for (let i = 0; i < COPIES; i++) {
      originalCards.forEach((c) => track.appendChild(c.cloneNode(true)));
    }

    let offsetX = 0, copyWidth = 0, animId = null, isPaused = false, speed = 0, lastTs = 0;

    const calc = () => {
      const el = track.querySelector('.testimonial-card');
      if (!el) return false;
      const s = getComputedStyle(el);
      const ml = parseFloat(s.marginLeft) || 0;
      const mr = parseFloat(s.marginRight) || 0;
      const cardW = el.offsetWidth + ml + mr;
      copyWidth = total * cardW;
      return copyWidth > 0;
    };

    const tick = (ts) => {
      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      if (!isPaused) {
        offsetX += speed * dt;
        while (offsetX >= copyWidth) offsetX -= copyWidth;
        track.style.transform = `translateX(-${offsetX}px)`;
      }

      animId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (animId) cancelAnimationFrame(animId);
      lastTs = 0;
      animId = requestAnimationFrame(tick);
    };

    if (wrapper) {
      wrapper.addEventListener('mouseenter', () => { isPaused = true; });
      wrapper.addEventListener('mouseleave', () => { isPaused = false; lastTs = 0; });
    }

    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (calc()) {
          speed = copyWidth / 30;
          while (offsetX >= copyWidth) offsetX -= copyWidth;
          track.style.transform = `translateX(-${offsetX}px)`;
        }
      }, 300);
    });

    const boot = () => {
      speed = copyWidth / 30;
      offsetX = 0;
      track.style.transform = 'translateX(0px)';
      start();
    };

    if (calc()) {
      boot();
    } else {
      const retry = setInterval(() => {
        if (calc()) {
          clearInterval(retry);
          boot();
        }
      }, 150);
    }
  };

  // Parallax de profundidad: cada capa con data-parallax se desplaza a su
  // propia velocidad según su distancia al centro del viewport.
  const initParallax = () => {
    if (prefersReducedMotion) return;

    // En navegadores con animaciones ligadas al scroll, ese efecto ya mueve las
    // imágenes del catálogo: no duplicamos el trabajo desde JavaScript.
    if (!supportsScrollTimeline) {
      document
        .querySelectorAll('.catalog-card .course-card__image img')
        .forEach((img) => {
          if (!img.dataset.parallax) img.dataset.parallax = '0.045';
        });
    }

    const layers = [...document.querySelectorAll('[data-parallax]')];
    if (!layers.length) return;
    let ticking = false;

    const update = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      layers.forEach((el) => {
        const minWidth = parseInt(el.dataset.parallaxMin, 10) || 0;
        if (minWidth && vw < minWidth) {
          el.style.transform = '';
          return;
        }

        const speed = parseFloat(el.dataset.parallax) || 0;
        const rect = el.getBoundingClientRect();
        // Fuera de la pantalla no hay nada que animar.
        if (rect.bottom < -200 || rect.top > vh + 200) return;

        const centerOffset = rect.top + rect.height / 2 - vh / 2;
        const y = -centerOffset * speed;
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      });

      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  };

  // Tilt 3D con reflejo: la imagen reacciona a la posición del cursor.
  const initImageTilt = () => {
    if (prefersReducedMotion) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const MAX_DEG = 6;
    const panels = [...document.querySelectorAll('.catalog-card .course-card__image')];
    if (!panels.length) return;

    panels.forEach((panel) => {
      let glare = panel.querySelector('.course-card__glare');
      if (!glare) {
        glare = document.createElement('span');
        glare.className = 'course-card__glare';
        glare.setAttribute('aria-hidden', 'true');
        panel.appendChild(glare);
      }

      // El giro se interpola a mano: así no dependemos de la transición CSS,
      // que en este elemento entra en conflicto con la animación ligada al scroll.
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let frame = null;
      let hovering = false;

      const EASE = 0.18;

      const applyTilt = (rx, ry) => {
        panel.style.transform = `rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) scale(1.05)`;
      };

      const render = () => {
        currentX += (targetX - currentX) * EASE;
        currentY += (targetY - currentY) * EASE;

        const settled =
          Math.abs(targetX - currentX) < 0.01 && Math.abs(targetY - currentY) < 0.01;

        if (settled) {
          currentX = targetX;
          currentY = targetY;
          frame = null;
          if (hovering) {
            applyTilt(currentX, currentY);
          } else {
            // En reposo devolvemos el control a la hoja de estilos.
            panel.style.transform = '';
          }
          return;
        }

        applyTilt(currentX, currentY);
        frame = requestAnimationFrame(render);
      };

      const start = () => {
        if (frame === null) frame = requestAnimationFrame(render);
      };

      panel.addEventListener('pointerenter', () => {
        hovering = true;
        start();
      });

      panel.addEventListener('pointermove', (event) => {
        const rect = panel.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const px = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
        const py = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);

        targetY = (px - 0.5) * 2 * MAX_DEG;
        targetX = -(py - 0.5) * 2 * MAX_DEG;
        glare.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        glare.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
        start();
      });

      panel.addEventListener('pointerleave', () => {
        hovering = false;
        targetX = 0;
        targetY = 0;
        glare.style.setProperty('--mx', '50%');
        glare.style.setProperty('--my', '50%');
        start();
      });
    });
  };

  const init = () => {
    initMobileNav();
    initCourseFilters();
    initCourseModal();
    initStats();
    initTestimonials();
    initParallax();
    initImageTilt();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
