// Archivo: assets/js/student/dashboard.js
(function() {
  const TOKEN_KEY = 'student_token';
  const USER_KEY = 'student_user';

  // ========== UTILITIES ==========
  const el = (id) => document.getElementById(id);

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const parseLocalDate = (value) => {
    if (!value) return null;
    const str = String(value).trim();
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    const d = new Date(str);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (value) => {
    const date = parseLocalDate(value);
    if (!date) return 'N/A';
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { error: 'error', warning: 'warning', info: 'info', success: 'check_circle' };
    toast.innerHTML = `<span class="material-symbols-outlined text-[18px]">${icons[type] || 'check_circle'}</span><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.25s'; setTimeout(() => toast.remove(), 250); }, 3500);
  };

  const apiFetch = async (url, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
      return;
    }
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch {}
    if (!response.ok) throw new Error(data?.message || `Error del servidor (${response.status})`);
    return data;
  };

  const getInitials = (name) => {
    if (!name) return 'E';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  };

  // ========== STATE ==========
  let studentProfile = null;
  let studentCourses = [];
  let studentCertificates = [];
  let studentStats = null;

  // ========== AUTH CHECK ==========
  if (!localStorage.getItem(TOKEN_KEY)) {
    window.location.href = '/login';
    return;
  }

  // ========== TAB SWITCHING ==========
  const switchTab = (tabName) => {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(t => {
      t.classList.remove('active');
      t.style.display = 'none';
    });
    
    // Remove active from all sidebar links and reset styles
    document.querySelectorAll('.sidebar-link').forEach(l => {
      l.classList.remove('active');
      l.classList.remove('bg-primary-container', 'text-primary', 'font-semibold');
      l.classList.add('text-on-surface-variant');
    });
    
    // Remove active from mobile nav links
    document.querySelectorAll('.mobile-nav-link').forEach(l => {
      l.classList.remove('active');
      l.classList.add('text-on-surface-variant');
    });

    // Show selected tab
    const tab = el(`tab-${tabName}`);
    if (tab) {
      tab.classList.add('active');
      tab.style.display = 'block';
    }

    // Activate selected sidebar link
    document.querySelectorAll(`.sidebar-link[data-tab="${tabName}"]`).forEach(l => {
      l.classList.add('active');
      l.classList.remove('text-on-surface-variant');
      l.classList.add('bg-primary-container', 'text-primary', 'font-semibold');
    });
    
    // Activate selected mobile nav link
    document.querySelectorAll(`.mobile-nav-link[data-tab="${tabName}"]`).forEach(l => {
      l.classList.add('active');
      l.classList.remove('text-on-surface-variant');
      l.classList.add('text-primary');
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Bind tab links
  document.querySelectorAll('[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(link.dataset.tab);
    });
  });

  // Mobile menu toggle
  const mobileMenuBtn = el('mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const sidebar = el('sidebar');
      if (sidebar) {
        sidebar.classList.toggle('hidden');
        sidebar.classList.toggle('fixed');
        sidebar.classList.toggle('inset-0');
        sidebar.classList.toggle('z-50');
        sidebar.classList.toggle('w-full');
      }
    });
  }

  // Make switchTab global for inline onclick
  window.switchTab = switchTab;

  // ========== RENDER FUNCTIONS ==========
  const renderProfile = () => {
    if (!studentProfile) return;
    
    // Update header
    const nameDisplay = el('user-name-display');
    const roleDisplay = el('user-role-display');
    const avatar = el('user-avatar');
    const welcomeTitle = el('welcome-title');
    const welcomeSubtitle = el('welcome-subtitle');

    if (nameDisplay) nameDisplay.textContent = studentProfile.nombres || 'Estudiante';
    if (roleDisplay) roleDisplay.textContent = studentProfile.cargo || 'Estudiante';
    if (avatar) {
      avatar.innerHTML = `${getInitials(studentProfile.nombres)}<span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>`;
    }
    if (welcomeTitle) welcomeTitle.innerHTML = `Hola, ${escapeHtml(studentProfile.nombres || 'Estudiante')} 👋`;
    if (welcomeSubtitle) {
      const cursosCount = studentStats ? studentStats.totalCursos : 0;
      const certCount = studentStats ? studentStats.totalCertificados : 0;
      welcomeSubtitle.textContent = `Bienvenido a tu panel de control. Aquí puedes ver tu progreso y gestionar tus cursos y certificados.`;
    }

    // Profile card
    const profileCard = el('profile-card');
    if (profileCard) {
      profileCard.innerHTML = `
        <div class="flex items-center gap-4 mb-6 pb-6 border-b border-outline-variant">
          <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
            ${getInitials(studentProfile.nombres)}
          </div>
          <div>
            <h3 class="font-title text-xl font-bold text-on-surface">${escapeHtml(studentProfile.nombres)}</h3>
            <p class="text-sm text-on-surface-variant">${escapeHtml(studentProfile.email || 'Sin correo')}</p>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">DNI</label>
            <p class="text-sm font-medium text-on-surface bg-surface-container-low rounded-lg px-3 py-2">${escapeHtml(studentProfile.dni)}</p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Cargo / Puesto</label>
            <p class="text-sm font-medium text-on-surface bg-surface-container-low rounded-lg px-3 py-2">${escapeHtml(studentProfile.cargo || 'No registrado')}</p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Teléfono</label>
            <p class="text-sm font-medium text-on-surface bg-surface-container-low rounded-lg px-3 py-2">${escapeHtml(studentProfile.telefono || 'No registrado')}</p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Procedencia</label>
            <p class="text-sm font-medium text-on-surface bg-surface-container-low rounded-lg px-3 py-2">${escapeHtml(studentProfile.procedencia || 'No registrado')}</p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Inducción</label>
            <p class="text-sm font-medium text-on-surface bg-surface-container-low rounded-lg px-3 py-2">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${studentProfile.induccion === 'APTO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                ${escapeHtml(studentProfile.induccion || 'N/A')}
              </span>
            </p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Examen Médico</label>
            <p class="text-sm font-medium text-on-surface bg-surface-container-low rounded-lg px-3 py-2">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${studentProfile.examen_medico === 'APTO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                ${escapeHtml(studentProfile.examen_medico || 'N/A')}
              </span>
            </p>
          </div>
        </div>
        <div class="mt-4 space-y-1">
          <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Fecha de Registro</label>
          <p class="text-sm font-medium text-on-surface bg-surface-container-low rounded-lg px-3 py-2">${formatDate(studentProfile.created_at)}</p>
        </div>
      `;
    }
  };

  const renderStats = () => {
    if (!studentStats) return;
    el('stat-cursos').textContent = String(studentStats.totalCursos).padStart(2, '0');
    el('stat-certificados').textContent = String(studentStats.totalCertificados).padStart(2, '0');
    el('stat-progreso').textContent = `${studentStats.porcentajeCompletado}%`;
  };

  const renderHomeCourses = () => {
    const container = el('home-courses-list');
    if (!container) return;

    if (studentCourses.length === 0) {
      container.innerHTML = `
        <div class="bg-white border border-outline-variant rounded-2xl p-6 text-center text-on-surface-variant text-sm">
          <span class="material-symbols-outlined text-3xl text-outline-variant mb-2 block">school</span>
          No estás inscrito en ningún curso actualmente.
        </div>`;
      return;
    }

    // Show max 3 courses on home
    const displayCourses = studentCourses.slice(0, 3);
    container.innerHTML = displayCourses.map(course => {
      const tieneCert = course.tiene_certificado === 1;
      const progressPercent = tieneCert ? 100 : 50;
      return `
        <div class="bg-white border border-outline-variant rounded-2xl p-5 hover:shadow-md transition-all">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center text-primary flex-shrink-0">
              <span class="material-symbols-outlined text-2xl">auto_stories</span>
            </div>
            <div class="flex-grow min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <h4 class="font-title text-sm font-bold text-on-surface truncate">${escapeHtml(course.curso_nombre)}</h4>
                  <p class="text-xs text-on-surface-variant mt-0.5">Instructor: ${escapeHtml(course.entrenador || 'Sin asignar')}</p>
                  <p class="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span class="material-symbols-outlined text-[14px]">schedule</span>
                    ${escapeHtml(course.duracion || 'N/A')}
                  </p>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${tieneCert ? 'bg-green-100 text-green-700' : 'bg-surface-container text-on-surface-variant'}">
                  ${tieneCert ? 'Completado' : 'En curso'}
                </span>
              </div>
              <div class="mt-3">
                <div class="w-full bg-surface-container rounded-full h-2">
                  <div class="h-2 rounded-full transition-all duration-500 ${tieneCert ? 'bg-green-500' : 'bg-primary'}" style="width: ${progressPercent}%"></div>
                </div>
                <p class="text-right text-xs text-on-surface-variant mt-1">${progressPercent}%</p>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');
  };

  const renderHomeInstructors = () => {
    const container = el('home-instructors-list');
    if (!container) return;

    const instructors = new Map();
    studentCourses.forEach(c => {
      if (c.entrenador && !instructors.has(c.entrenador)) {
        instructors.set(c.entrenador, c.categoria || 'Instructor');
      }
    });

    if (instructors.size === 0) {
      container.innerHTML = `<div class="text-center text-on-surface-variant text-sm py-4">No hay instructores asignados.</div>`;
      return;
    }

    container.innerHTML = Array.from(instructors.entries()).map(([name, role]) => {
      return `
        <div class="flex flex-col items-center text-center py-2">
          <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg mb-3">
            ${getInitials(name)}
          </div>
          <h4 class="text-sm font-bold text-on-surface">${escapeHtml(name)}</h4>
          <p class="text-[11px] text-on-surface-variant uppercase tracking-wider mb-3">${escapeHtml(role)}</p>
          <button class="inline-flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container transition-colors">
            <span class="material-symbols-outlined text-[18px]">mail</span>
            Enviar mensaje
          </button>
        </div>`;
    }).join('');
  };

  const renderHomeCertificates = () => {
    const container = el('home-certificates-table');
    if (!container) return;

    if (studentCertificates.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-on-surface-variant text-sm">
          <span class="material-symbols-outlined text-3xl text-outline-variant mb-2 block">workspace_premium</span>
          Aún no tienes certificados emitidos.
        </div>`;
      return;
    }

    const displayCerts = studentCertificates.slice(0, 5);
    container.innerHTML = `
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-container-low border-b border-outline-variant">
            <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Curso</th>
            <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant hidden sm:table-cell">Fecha Emisión</th>
            <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant hidden md:table-cell">Código</th>
            <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant hidden md:table-cell">Estado</th>
            <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant text-right">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant">
          ${displayCerts.map((cert, i) => {
            const isVigente = !cert.fecha_vencimiento || new Date(cert.fecha_vencimiento) > new Date();
            return `
            <tr class="${i % 2 === 1 ? 'bg-surface-container-low' : ''} hover:bg-surface-container transition-colors">
              <td class="px-4 py-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
                <span class="text-sm font-medium">${escapeHtml(cert.curso_nombre)}</span>
              </td>
              <td class="px-4 py-3 text-sm text-on-surface-variant hidden sm:table-cell">${formatDate(cert.fecha_emision)}</td>
              <td class="px-4 py-3 text-sm text-on-surface-variant font-mono hidden md:table-cell">${escapeHtml(cert.codigo)}</td>
              <td class="px-4 py-3 hidden md:table-cell">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${isVigente ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                  ${isVigente ? 'Vigente' : 'Vencido'}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                ${cert.pdf_path ? `<a href="${escapeHtml(cert.pdf_path)}" target="_blank" class="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:opacity-70">
                  <span class="material-symbols-outlined text-[16px]">download</span> Descargar
                </a>` : '<span class="text-xs text-on-surface-variant">Sin PDF</span>'}
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;
  };

  const renderFullCourses = () => {
    const container = el('courses-full-list');
    if (!container) return;

    if (studentCourses.length === 0) {
      container.innerHTML = `
        <div class="bg-white border border-outline-variant rounded-2xl p-8 text-center text-on-surface-variant text-sm col-span-full">
          <span class="material-symbols-outlined text-4xl text-outline-variant mb-3 block">school</span>
          <p class="font-medium">No estás inscrito en ningún curso.</p>
          <p class="text-xs mt-1">Contacta al administrador para inscribirte.</p>
        </div>`;
      return;
    }

    container.innerHTML = studentCourses.map(course => {
      const tieneCert = course.tiene_certificado === 1;
      return `
        <div class="bg-white border border-outline-variant rounded-2xl p-5 hover:shadow-md transition-all">
          <div class="flex items-start justify-between mb-3">
            <div class="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
              <span class="material-symbols-outlined text-primary text-xl">auto_stories</span>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${tieneCert ? 'bg-green-100 text-green-700' : 'bg-surface-container text-on-surface-variant'}">
              ${tieneCert ? 'Completado' : 'En curso'}
            </span>
          </div>
          <h4 class="font-title text-base font-bold text-on-surface mb-1">${escapeHtml(course.curso_nombre)}</h4>
          <p class="text-xs text-on-surface-variant mb-3">${escapeHtml(course.codigo_curso)}</p>
          <div class="space-y-2 text-xs text-on-surface-variant">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">person</span>
              <span>${escapeHtml(course.entrenador || 'Sin asignar')}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">schedule</span>
              <span>${escapeHtml(course.duracion || 'N/A')}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">category</span>
              <span>${escapeHtml(course.categoria || 'Sin categoría')}</span>
            </div>
            ${course.fecha_inicio ? `<div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">calendar_today</span>
              <span>Inicio: ${formatDate(course.fecha_inicio)}</span>
            </div>` : ''}
          </div>
          ${tieneCert ? `
            <div class="mt-4 pt-3 border-t border-outline-variant">
              <div class="flex items-center gap-2 text-xs">
                <span class="material-symbols-outlined text-secondary text-[16px]" style="font-variation-settings: 'FILL' 1;">verified</span>
                <span class="font-semibold text-on-surface">Certificado: ${escapeHtml(course.certificado_codigo)}</span>
              </div>
              <p class="text-[10px] text-on-surface-variant mt-1">Emitido: ${formatDate(course.certificado_fecha)}</p>
            </div>
          ` : ''}
        </div>`;
    }).join('');
  };

  const renderFullCertificates = () => {
    const container = el('certificates-full-list');
    if (!container) return;

    if (studentCertificates.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-on-surface-variant text-sm">
          <span class="material-symbols-outlined text-4xl text-outline-variant mb-3 block">workspace_premium</span>
          <p class="font-medium">No tienes certificados emitidos aún.</p>
          <p class="text-xs mt-1">Completa tus cursos para obtener certificados.</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-container-low border-b border-outline-variant">
            <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Curso / Especialidad</th>
            <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant hidden sm:table-cell">Fecha Emisión</th>
            <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant hidden md:table-cell">Vencimiento</th>
            <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant hidden md:table-cell">Código</th>
            <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant hidden md:table-cell">Estado</th>
            <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant text-right">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant">
          ${studentCertificates.map((cert, i) => {
            const isVigente = !cert.fecha_vencimiento || new Date(cert.fecha_vencimiento) > new Date();
            return `
            <tr class="${i % 2 === 1 ? 'bg-surface-container-low' : ''} hover:bg-surface-container transition-colors">
              <td class="px-4 py-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
                <span class="text-sm font-medium">${escapeHtml(cert.curso_nombre)}</span>
              </td>
              <td class="px-4 py-3 text-sm text-on-surface-variant hidden sm:table-cell">${formatDate(cert.fecha_emision)}</td>
              <td class="px-4 py-3 text-sm text-on-surface-variant hidden md:table-cell">${formatDate(cert.fecha_vencimiento)}</td>
              <td class="px-4 py-3 text-sm text-on-surface-variant font-mono hidden md:table-cell">${escapeHtml(cert.codigo)}</td>
              <td class="px-4 py-3 hidden md:table-cell">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${isVigente ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                  ${isVigente ? 'Vigente' : 'Vencido'}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                ${cert.pdf_path ? `<a href="${escapeHtml(cert.pdf_path)}" target="_blank" class="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:opacity-70">
                  <span class="material-symbols-outlined text-[16px]">download</span> Descargar
                </a>` : '<span class="text-xs text-on-surface-variant">Sin PDF</span>'}
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;
  };

  // ========== DATA LOADING ==========
  const loadAllData = async () => {
    try {
      const [profile, stats, courses, certificates] = await Promise.all([
        apiFetch('/api/student/profile').catch(() => null),
        apiFetch('/api/student/stats').catch(() => null),
        apiFetch('/api/student/courses').catch(() => []),
        apiFetch('/api/student/certificates').catch(() => [])
      ]);

      studentProfile = profile;
      studentStats = stats;
      studentCourses = Array.isArray(courses) ? courses : [];
      studentCertificates = Array.isArray(certificates) ? certificates : [];

      renderStats();
      renderProfile();
      renderHomeCourses();
      renderHomeInstructors();
      renderHomeCertificates();
      renderFullCourses();
      renderFullCertificates();
    } catch (error) {
      console.error('Error loading student data:', error);
      showToast('Error al cargar los datos del estudiante', 'error');
    }
  };

  // ========== NOTIFICATIONS ==========
  let notifInterval = null;

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'ahora';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `hace ${diffMin} min`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `hace ${diffHour}h`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `hace ${diffDay}d`;
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  }

  function updateNotifBadge(count) {
    const badge = el('notif-badge');
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  function renderNotifications(notifications) {
    const container = el('notif-list');
    if (!container) return;

    if (notifications.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-sm text-on-surface-variant">
          <span class="material-symbols-outlined text-3xl text-outline-variant mb-2 block">notifications_off</span>
          No hay notificaciones
        </div>`;
      return;
    }

    container.innerHTML = notifications.map(n => {
      const icons = { success: 'check_circle', warning: 'warning', error: 'error', info: 'info' };
      const icon = icons[n.tipo] || 'circle';
      const iconColors = { success: 'text-green-600', warning: 'text-yellow-600', error: 'text-red-600', info: 'text-primary' };
      const iconColor = iconColors[n.tipo] || 'text-on-surface-variant';
      const bgClass = n.leida ? '' : 'bg-primary/5';

      return `
        <div class="px-4 py-3 hover:bg-surface-container transition-colors cursor-pointer ${bgClass} ${n.leida ? 'opacity-70' : ''}" data-notif-id="${n.id}" data-leida="${n.leida}">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-[20px] mt-0.5 ${iconColor}">${icon}</span>
            <div class="flex-grow min-w-0">
              <p class="text-sm font-semibold text-on-surface truncate">${escapeHtml(n.titulo)}</p>
              <p class="text-xs text-on-surface-variant mt-0.5 line-clamp-2">${escapeHtml(n.mensaje || '')}</p>
              <p class="text-[10px] text-outline mt-1">${timeAgo(n.created_at)}</p>
            </div>
            ${!n.leida ? '<span class="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></span>' : ''}
          </div>
        </div>`;
    }).join('');

    container.querySelectorAll('[data-notif-id]').forEach(el => {
      el.addEventListener('click', async () => {
        const id = el.dataset.notifId;
        const leida = el.dataset.leida === '1';
        if (!leida) {
          await apiFetch(`/api/notificaciones/student/${id}/read`, { method: 'PUT' }).catch(() => {});
          loadStudentNotifications();
        }
      });
    });
  }

  async function loadStudentNotifications() {
    const [notifications, unreadData] = await Promise.all([
      apiFetch('/api/notificaciones/student').catch(() => []),
      apiFetch('/api/notificaciones/student/unread-count').catch(() => ({ count: 0 }))
    ]);
    updateNotifBadge(unreadData?.count || 0);
    renderNotifications(Array.isArray(notifications) ? notifications : []);
  }

  function toggleNotifDropdown() {
    const dropdown = el('notif-dropdown');
    if (!dropdown) return;
    const isHidden = dropdown.classList.contains('hidden');
    if (isHidden) {
      dropdown.classList.remove('hidden');
      loadStudentNotifications();
    } else {
      dropdown.classList.add('hidden');
    }
  }

  function initStudentNotifications() {
    const btn = el('notif-btn');
    const dropdown = el('notif-dropdown');
    const markAllBtn = el('notif-mark-all-read');

    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNotifDropdown();
    });

    markAllBtn?.addEventListener('click', async (e) => {
      e.stopPropagation();
      await apiFetch('/api/notificaciones/student/read-all', { method: 'PUT' }).catch(() => {});
      await loadStudentNotifications();
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.classList.contains('hidden') && !dropdown.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });

    apiFetch('/api/notificaciones/student/unread-count')
      .then(data => updateNotifBadge(data?.count || 0))
      .catch(() => {});

    notifInterval = setInterval(() => {
      apiFetch('/api/notificaciones/student/unread-count')
        .then(data => updateNotifBadge(data?.count || 0))
        .catch(() => {});
    }, 30000);
  }

  // ========== LOGOUT ==========
  el('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
  });

  // ========== INIT ==========
  loadAllData();
  setTimeout(initStudentNotifications, 100);
})();
