(() => {
  const WA_BASE = 'https://wa.me/51992809049';

  const courseData = {
    'respuesta-emergencias': {
      title: 'Respuesta a emergencias',
      duration: '2 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      price: 'S/ 100.00',
      date: '15 Jul 2026',
      summary: 'Capacitación orientada a preparar al personal para actuar correctamente ante emergencias, evacuaciones, incidentes y situaciones de riesgo dentro de operaciones mineras e industriales.',
    },
    'trabajo-altura': {
      title: 'Trabajo en altura y plataforma elevada',
      duration: '4 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      price: 'S/ 100.00',
      date: '22 Jul 2026',
      summary: 'Curso enfocado en el uso seguro de trabajos en altura, líneas de vida, arneses y plataformas elevadas, reduciendo riesgos de caídas y accidentes laborales.',
    },
    'equipos-moviles': {
      title: 'Equipos móviles / Manejo de llantas',
      duration: '2 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      price: 'S/ 100.00',
      date: '05 Ago 2026',
      summary: 'Capacitación sobre operación segura de equipos móviles y procedimientos adecuados para el manejo y cambio de llantas en entornos mineros.',
    },
    'aislamiento-bloqueo': {
      title: 'Aislamiento y bloqueo',
      duration: '3 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      price: 'S/ 100.00',
      date: '14 Oct 2026',
      summary: 'Curso diseñado para aplicar procedimientos LOTO (Lockout/Tagout), asegurando el aislamiento de energías peligrosas durante mantenimientos y reparaciones.',
    },
    'seguridad-electrica': {
      title: 'Seguridad eléctrica',
      duration: '3 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      price: 'S/ 100.00',
      date: '07 Oct 2026',
      summary: 'Capacitación enfocada en la prevención de accidentes eléctricos, identificación de riesgos y aplicación de medidas de protección en trabajos eléctricos.',
    },
    'elevacion-izaje': {
      title: 'Elevación / izaje de cargas',
      duration: '2 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      price: 'S/ 100.00',
      date: '30 Sep 2026',
      summary: 'Curso orientado al manejo seguro de maniobras de izaje, uso de accesorios y control de cargas para prevenir incidentes operacionales.',
    },
    'incendio-explosion': {
      title: 'Incendio y explosión',
      duration: '2 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      price: 'S/ 100.00',
      date: '23 Sep 2026',
      summary: 'Capacitación sobre prevención, control y respuesta ante incendios y explosiones en áreas industriales y mineras.',
    },
    'herramientas-manuales': {
      title: 'Herramientas manuales y de poder',
      duration: '2 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      price: 'S/ 100.00',
      date: '16 Sep 2026',
      summary: 'Curso enfocado en el uso seguro, inspección y mantenimiento básico de herramientas manuales y eléctricas utilizadas en operaciones industriales.',
    },
    'sustancias-quimicas': {
      title: 'Sustancias químicas',
      duration: '2 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      price: 'S/ 100.00',
      date: '12 Ago 2026',
      summary: 'Capacitación para la manipulación segura de sustancias químicas, lectura de hojas MSDS y control de riesgos químicos en el trabajo.',
    },
  };

  window.TEAMHSEC_COURSE_DATA = courseData;

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

  const initCourseModal = () => {
    const modal = document.getElementById('course-modal');
    if (!modal) return;

    const titleEl = document.getElementById('modal-title');
    const durationEl = document.getElementById('modal-duration');
    const trainerEl = document.getElementById('modal-trainer');
    const priceEl = document.getElementById('modal-price');
    const dateEl = document.getElementById('modal-date');
    const summaryEl = document.getElementById('modal-summary');
    const enrollEl = document.getElementById('modal-enroll');

    const open = (data) => {
      if (!data) return;
      titleEl.textContent = data.title;
      durationEl.textContent = data.duration;
      trainerEl.textContent = data.trainer;
      if (priceEl) priceEl.textContent = data.price || 'S/ 100.00';
      if (dateEl) dateEl.textContent = data.date || 'Por confirmar';
      summaryEl.textContent = data.summary;
      if (enrollEl) {
        const msg = encodeURIComponent(`Hola, quiero inscribirme en ${data.title}`);
        enrollEl.href = `${WA_BASE}?text=${msg}`;
      }
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    };

    const close = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    };

    document.querySelectorAll('[data-course]').forEach((el) => {
      if (el.tagName === 'A') return;
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const key = el.dataset.course || '';
        open(courseData[key]);
      });
    });

    modal.addEventListener('click', (e) => {
      if (e.target.closest('[data-modal-close]')) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  };

  const initTestimonials = () => {
    const track = document.getElementById('testimonials-track');
    const wrapper = document.querySelector('.testimonials__wrapper');
    const prev = document.querySelector('.testimonials__prev');
    const next = document.querySelector('.testimonials__next');
    const originalCards = track ? [...track.querySelectorAll('.testimonial-card')] : [];
    if (!track || !originalCards.length) return;

    if (prev) prev.style.display = 'none';
    if (next) next.style.display = 'none';

    const total = originalCards.length;
    const COPIES = 3;
    track.innerHTML = '';
    for (let i = 0; i < COPIES; i++) {
      originalCards.forEach(c => track.appendChild(c.cloneNode(true)));
    }

    let offsetX = 0, copyWidth = 0, cardW = 0;
    let animId = null, isPaused = false, speed = 0, lastTs = 0;

    const calc = () => {
      const el = track.querySelector('.testimonial-card');
      if (!el) return false;
      const s = getComputedStyle(el);
      const ml = parseFloat(s.marginLeft) || 0;
      const mr = parseFloat(s.marginRight) || 0;
      cardW = el.offsetWidth + ml + mr;
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

    if (calc()) {
      speed = copyWidth / 30;
      offsetX = 0;
      track.style.transform = 'translateX(0px)';
      start();
    } else {
      const retry = setInterval(() => {
        if (calc()) {
          clearInterval(retry);
          speed = copyWidth / 30;
          offsetX = 0;
          track.style.transform = 'translateX(0px)';
          start();
        }
      }, 150);
    }
  };

  const initContactForm = () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const nombre = fd.get('nombre') || '';
      const email = fd.get('email') || '';
      const telefono = fd.get('telefono') || '';
      const interes = fd.get('interes') || '';
      const mensaje = fd.get('mensaje') || '';

      const text = [
        'Hola TEAM HSEC, tengo una consulta:',
        '',
        `Nombre: ${nombre}`,
        `Email: ${email}`,
        telefono ? `Teléfono: ${telefono}` : '',
        `Interés: ${interes}`,
        '',
        `Mensaje: ${mensaje}`,
      ].filter(Boolean).join('\n');

      window.open(`${WA_BASE}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      form.reset();
    });
  };

  const init = () => {
    initMobileNav();
    initCourseFilters();
    initCourseModal();
    initTestimonials();
    initContactForm();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
