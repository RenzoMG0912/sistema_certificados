// Archivo: assets/js/landing.js
// TEAM HSEC — fondo transformable por scroll + interacciones.
(() => {
  'use strict';

  const WA_BASE = 'https://wa.me/51992809049';
  const waLink = (msg) => `${WA_BASE}?text=${encodeURIComponent(msg)}`;

  // ---- CINTAS TRANSFORMABLES: estados según avance de scroll --------------
  // stage 0 (inicio): esquinas (referencia) · stage 1: intercambio y crecen
  // stage 2: banda lateral izquierda · stage 3: bandas horizontales
  const body = document.body;
  let currentStage = -1;

  const updateStage = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    const stage = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3;
    if (stage !== currentStage) {
      currentStage = stage;
      body.classList.toggle('scroll-stage-1', stage === 1);
      body.classList.toggle('scroll-stage-2', stage === 2);
      body.classList.toggle('scroll-stage-3', stage === 3);
    }
  };

  // ---- Navbar: sombra al hacer scroll -------------------------------------
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 10);
    updateStage();
  };
  updateStage();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- Mega-menús ---------------------------------------------------------
  const backdrop = document.getElementById('mega-backdrop');
  const megaBtns = document.querySelectorAll('[data-mega]');
  const megas = document.querySelectorAll('.mega');

  const closeMegas = () => {
    megas.forEach((m) => m.classList.remove('is-open'));
    megaBtns.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    backdrop && backdrop.classList.remove('is-open');
    document.body.classList.remove('mega-open');
  };

  const openMega = (btn, target) => {
    target.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    backdrop && backdrop.classList.add('is-open');
    document.body.classList.add('mega-open');
    // Enviar el foco al primer elemento del panel para navegación por teclado
    const firstLink = target.querySelector('a, button');
    if (firstLink) {
      firstLink.addEventListener('transitionend', () => firstLink.focus(), { once: true });
    }
  };

  megaBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = document.getElementById(`mega-${btn.dataset.mega}`);
      const willOpen = target && !target.classList.contains('is-open');
      closeMegas();
      if (willOpen) openMega(btn, target);
    });
  });

  // Clic sobre el velo oscuro: cierra el menú (comportamiento estándar)
  backdrop && backdrop.addEventListener('click', closeMegas);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.mega') && !e.target.closest('[data-mega]')) closeMegas();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMegas(); });
  document.querySelectorAll('[data-mega-close]').forEach((el) =>
    el.addEventListener('click', closeMegas)
  );

  // ---- Menú móvil ---------------------------------------------------------
  const toggle = document.getElementById('nav-toggle');
  const mobile = document.getElementById('nav-links-mobile');
  if (toggle && mobile) {
    const setMenu = (open) => {
      mobile.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('i').className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    };
    toggle.addEventListener('click', () => setMenu(!mobile.classList.contains('is-open')));
    mobile.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  }

  // ---- Widget lateral: modo oscuro / claro --------------------------------
  const THEME_KEY = 'hsec-theme';
  const btnDark = document.querySelector('[data-theme-dark]');
  const btnDay = document.querySelector('[data-theme-day]');

  const applyTheme = (dark) => {
    body.classList.add('theme-anim');
    body.classList.toggle('dark-mode', dark);
    // Los iconos son fijos: luna = oscuro, sol = claro. Solo cambia el resaltado.
    if (btnDark) btnDark.setAttribute('aria-pressed', String(dark));
    if (btnDay) btnDay.setAttribute('aria-pressed', String(!dark));
    try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch (_) { /* sin storage */ }
    clearTimeout(applyTheme._t);
    applyTheme._t = setTimeout(() => body.classList.remove('theme-anim'), 600);
  };

  // Cada botón lleva a SU modo; si ya estás en él, no hace nada (evita parpadeos)
  if (btnDark) btnDark.addEventListener('click', () => {
    if (!body.classList.contains('dark-mode')) applyTheme(true);
  });
  if (btnDay) btnDay.addEventListener('click', () => {
    if (body.classList.contains('dark-mode')) applyTheme(false);
  });

  // Preferencia guardada (la landing siempre arranca en claro salvo elección previa)
  let savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (_) { /* sin storage */ }
  if (savedTheme === 'dark') applyTheme(true);

  // ---- Filtros del catálogo ----------------------------------------------
  const search = document.getElementById('course-search');
  const category = document.getElementById('course-category');
  const cards = document.querySelectorAll('.course');
  if (search && category && cards.length) {
    const apply = () => {
      const q = search.value.trim().toLowerCase();
      const cat = category.value;
      cards.forEach((card) => {
        const title = (card.dataset.title || card.querySelector('h3')?.textContent || '').toLowerCase();
        const okQ = !q || title.includes(q);
        const okC = !cat || card.dataset.category === cat;
        card.classList.toggle('is-hidden', !(okQ && okC));
      });
    };
    search.addEventListener('input', apply);
    category.addEventListener('change', apply);
  }

  // ---- Modal de curso (datos en data-*) ----------------------------------
  const modal = document.getElementById('course-modal');
  if (modal) {
    const titleEl = document.getElementById('modal-title');
    const durEl = document.getElementById('modal-duration');
    const dateEl = document.getElementById('modal-date');
    const trainerEl = document.getElementById('modal-trainer');
    const summaryEl = document.getElementById('modal-summary');
    const enrollEl = document.getElementById('modal-enroll');
    let lastFocus = null;

    const open = (card) => {
      const d = card.dataset;
      titleEl.textContent = d.title || '';
      durEl.textContent = d.duration || '';
      dateEl.textContent = d.date || '';
      trainerEl.textContent = d.trainer || '';
      summaryEl.textContent = d.summary || '';
      enrollEl.href = waLink(`Hola, quiero inscribirme en el curso "${d.title}" (${d.date}).`);
      lastFocus = document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      modal.querySelector('.modal__close').focus();
    };

    const close = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };

    document.querySelectorAll('.course__link[data-course]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.course');
        if (card) open(card);
      });
    });

    modal.querySelectorAll('[data-modal-close]').forEach((el) => el.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }

  // ---- Reveal on scroll (fluido: easing premium + escalonado por grupo) ---
  const revealEls = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    // Escalonado: los hermanos .reveal del mismo contenedor entran en cascada
    revealEls.forEach((el) => {
      const parent = el.parentElement;
      if (!parent || parent.dataset.staggerBound) return;
      parent.dataset.staggerBound = '1';
      const siblings = [...parent.querySelectorAll(':scope > .reveal')];
      siblings.forEach((sib, i) => sib.style.setProperty('--stagger', `${Math.min(i * 90, 540)}ms`));
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  }

  // ---- Píldora flotante: estado activo según sección ----------------------
  const pillLinks = document.querySelectorAll('.float-pill a[href^="#"]');
  if (pillLinks.length && 'IntersectionObserver' in window) {
    const sections = [...pillLinks].map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const pio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          pillLinks.forEach((a) =>
            a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`)
          );
        }
      });
    }, { threshold: 0.3 });
    sections.forEach((s) => pio.observe(s));
  }
})();
