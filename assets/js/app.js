document.body.classList.add('js-enabled');

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

  const courseSelect = document.getElementById('course-filter');
  const lastNameInput = document.getElementById('lastname-filter');
  const results = document.getElementById('cert-results');
  let certData = [];

  if (!courseSelect || !lastNameInput || !results) {
    return;
  }

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
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
