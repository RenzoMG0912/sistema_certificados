document.body.classList.remove('js-loading');
document.body.classList.add('js-enabled');

(() => {
  const html = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const icon = toggle ? toggle.querySelector('i') : null;
  const saved = localStorage.getItem('theme');
  const isDark = saved === 'dark';

  if (isDark) {
    html.setAttribute('data-theme', 'dark');
    if (icon) { icon.className = 'fa-solid fa-sun'; }
    if (toggle) { toggle.title = 'Modo claro'; }
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const now = html.getAttribute('data-theme') === 'dark';
      html.setAttribute('data-theme', now ? '' : 'dark');
      localStorage.setItem('theme', now ? 'light' : 'dark');
      if (icon) { icon.className = now ? 'fa-solid fa-moon' : 'fa-solid fa-sun'; }
      toggle.title = now ? 'Modo oscuro' : 'Modo claro';
    });
  }
})();

const initPage = () => {
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  const sections = navLinks
    .map((link) => link.getAttribute('href'))
    .filter((href) => href && href.startsWith('#'))
    .map((href) => document.querySelector(href))
    .filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!href.startsWith('#')) {
        return;
      }
      const targetId = href.replace('#', '');
      link.classList.toggle('active', targetId === id);
    });
  };

  const triggerNavFx = (link) => {
    link.classList.add('is-activating');
    window.setTimeout(() => link.classList.remove('is-activating'), 460);
  };

  // Interceptar todos los clics en enlaces internos para transiciones suaves
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || link.getAttribute('target') === '_blank') return;

    // Ignorar protocolos especiales
    if (href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    let url;
    try {
      url = new URL(href, window.location.href);
    } catch (e) {
      return;
    }

    // Comprobar si es un enlace de origen interno
    if (url.origin !== window.location.origin) return;

    const samePage = url.pathname === window.location.pathname;
    const isHashTarget = (href.startsWith('#') && href.length > 1) || (samePage && url.hash);

    if (isHashTarget) {
      event.preventDefault();
      const targetId = url.hash.replace('#', '');
      const target = document.getElementById(targetId);
      if (!target) {
        window.location.href = url.toString();
        return;
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      const navLink = link.closest('.nav-links') ? link : null;
      if (navLink) {
        triggerNavFx(navLink);
      }
      setActive(targetId);
      return;
    }

    // Efecto de salida (fade-out)
    event.preventDefault();
    document.body.classList.add('page-exit');
    window.setTimeout(() => {
      window.location.href = url.toString();
    }, 350);
  });

  let ticking = false;
  const updateActiveOnScroll = () => {
    const offset = window.innerHeight * 0.35;
    const current = sections.find((section) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      return window.scrollY + offset >= top && window.scrollY + offset < bottom;
    });
    if (current) {
      setActive(current.id);
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateActiveOnScroll);
      ticking = true;
    }
  });
  window.addEventListener('resize', updateActiveOnScroll);
  updateActiveOnScroll();

  const revealTargets = document.querySelectorAll('.reveal');
  const revealAll = () => {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  };

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealTargets.forEach((el) => revealObserver.observe(el));
    setTimeout(revealAll, 1200);
  } else {
    revealAll();
  }

  const courseData = {
    'respuesta-emergencias': {
      title: 'Respuesta a emergencias',
      duration: '2 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      summary:
        'Capacitacion orientada a preparar al personal para actuar correctamente ante emergencias, evacuaciones, incidentes y situaciones de riesgo dentro de operaciones mineras e industriales.',
    },
    'trabajo-altura': {
      title: 'Trabajo en altura y plataforma elevada',
      duration: '4 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      summary:
        'Curso enfocado en el uso seguro de trabajos en altura, lineas de vida, arneses y plataformas elevadas, reduciendo riesgos de caidas y accidentes laborales.',
    },
    'equipos-moviles': {
      title: 'Equipos moviles / Manejo de llantas',
      duration: '2 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      summary:
        'Capacitacion sobre operacion segura de equipos moviles y procedimientos adecuados para el manejo y cambio de llantas en entornos mineros.',
    },
    'aislamiento-bloqueo': {
      title: 'Aislamiento y bloqueo',
      duration: '3 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      summary:
        'Curso disenado para aplicar procedimientos LOTO (Lockout/Tagout), asegurando el aislamiento de energias peligrosas durante mantenimientos y reparaciones.',
    },
    'seguridad-electrica': {
      title: 'Seguridad electrica',
      duration: '3 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      summary:
        'Capacitacion enfocada en la prevencion de accidentes electricos, identificacion de riesgos y aplicacion de medidas de proteccion en trabajos electricos.',
    },
    'elevacion-izaje': {
      title: 'Elevacion / izaje de cargas',
      duration: '2 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      summary:
        'Curso orientado al manejo seguro de maniobras de izaje, uso de accesorios y control de cargas para prevenir incidentes operacionales.',
    },
    'incendio-explosion': {
      title: 'Incendio y explosion',
      duration: '2 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      summary:
        'Capacitacion sobre prevencion, control y respuesta ante incendios y explosiones en areas industriales y mineras.',
    },
    'herramientas-manuales': {
      title: 'Herramientas manuales y de poder',
      duration: '2 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      summary:
        'Curso enfocado en el uso seguro, inspeccion y mantenimiento basico de herramientas manuales y electricas utilizadas en operaciones industriales.',
    },
    'sustancias-quimicas': {
      title: 'Sustancias quimicas',
      duration: '2 horas',
      trainer: 'Ing. Gregorio A. Escajadillo Sarmiento',
      summary:
        'Capacitacion para la manipulacion segura de sustancias quimicas, lectura de hojas MSDS y control de riesgos quimicos en el trabajo.',
    },
  };

  const courseModal = document.getElementById('course-modal');
  const isLandingPage = Boolean(document.getElementById('catalog-courses'));
  if (courseModal && !isLandingPage) {
    const titleEl = document.getElementById('modal-title');
    const durationEl = document.getElementById('modal-duration');
    const trainerEl = document.getElementById('modal-trainer');
    const summaryEl = document.getElementById('modal-summary');

    const openCourseModal = (data) => {
      if (!data) {
        return;
      }
      titleEl.textContent = data.title;
      durationEl.textContent = data.duration;
      trainerEl.textContent = data.trainer;
      summaryEl.textContent = data.summary;
      courseModal.classList.add('is-open');
      courseModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    };

    const closeCourseModal = () => {
      courseModal.classList.remove('is-open');
      courseModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    };

    document.querySelectorAll('[data-course]').forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.dataset.course || '';
        openCourseModal(courseData[key]);
      });
    });

    courseModal.addEventListener('click', (event) => {
      if (event.target.closest('[data-modal-close]')) {
        closeCourseModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && courseModal.classList.contains('is-open')) {
        closeCourseModal();
      }
    });
  }

  const courseSelect = document.getElementById('course-filter');
  const lastNameInput = document.getElementById('lastname-filter');
  const results = document.getElementById('cert-results');
  let certData = [];

  if (courseSelect && lastNameInput && results) {
    const renderResults = (items, courseOrder) => {
      if (!items.length) {
        results.innerHTML = '<p class="results__empty">Sin resultados.</p>';
        return;
      }

      const grouped = courseOrder
        .map((course) => ({
          course,
          items: items
            .filter((item) => item.course === course)
            .sort((a, b) => a.file.localeCompare(b.file, 'es', { sensitivity: 'base' })),
        }))
        .filter((group) => group.items.length);

      results.innerHTML = grouped
        .map((group) => {
          const rows = group.items
            .map((item) => {
              const name = item.file.replace(/\.pdf$/i, '');
              const href = `/certificados/${encodeURIComponent(item.course)}/${encodeURIComponent(item.file)}`;
              return `
                <div class="result">
                  <div class="result__info">
                    <span class="result__name">${name}</span>
                  </div>
                  <a class="result__view" href="${href}" target="_blank" rel="noopener" aria-label="Ver certificado">
                    <span class="result__icon">&#128065;</span>
                    Ver
                  </a>
                </div>
              `;
            })
            .join('');
          return `
            <div class="result-group">
              <div class="result-group__title">${group.course}</div>
              <div class="result-group__list">${rows}</div>
            </div>
          `;
        })
        .join('');
    };

    const applyFilters = () => {
      const courseName = courseSelect.value;
      const lastName = lastNameInput.value.trim().toLowerCase();

      const items = certData.flatMap((course) =>
        course.files.map((file) => ({
          course: course.name,
          file,
        }))
      );

      const filtered = items.filter((item) => {
        const matchesCourse = !courseName || item.course === courseName;
        const matchesLast = item.file.toLowerCase().includes(lastName);
        return matchesCourse && matchesLast;
      });

      const order = certData.map((course) => course.name);
      renderResults(filtered, order);
    };

    document.getElementById('cert-search').addEventListener('submit', (event) => {
      event.preventDefault();
      applyFilters();
    });

    lastNameInput.addEventListener('input', applyFilters);
    courseSelect.addEventListener('change', applyFilters);

    const certIndexUrl = window.location.protocol === 'file:'
      ? 'certificados/index.json'
      : new URL('/certificados/index.json', window.location.origin).toString();

    results.innerHTML = '<p class="results__empty">Cargando certificados...</p>';

    fetch(certIndexUrl, { cache: 'no-store' })
      .then(async (response) => {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} - ${text.slice(0, 120)}`);
        }
        try {
          return JSON.parse(text);
        } catch (error) {
          throw new Error('JSON invalido');
        }
      })
      .then((data) => {
        certData = data.courses || [];
        if (!certData.length) {
          results.innerHTML = '<p class="results__empty">No hay cursos en el indice.</p>';
          return;
        }
        certData.forEach((course) => {
          const option = document.createElement('option');
          option.value = course.name;
          option.textContent = course.name;
          courseSelect.appendChild(option);
        });
        courseSelect.value = '';
        applyFilters();
      })
      .catch((error) => {
        results.innerHTML = `<p class="results__empty">No se pudo cargar la lista de certificados. ${error.message}</p>`;
      });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
