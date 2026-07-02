const state = {
  participants: [],
  courses: [],
  enrollments: [],
  certificates: [],
  signatures: [],
  participantQuery: '',
  participantPage: 1,
  participantPageSize: 5,
  enrollmentCreateQuery: '',
  enrollmentCreateSelected: new Set(),
  enrollmentEditQuery: '',
  enrollmentEditSelected: new Set(),
  enrollmentEditCourseId: null,
  enrollmentEditCurrent: [],
  enrollmentEditAvailable: []
};

const el = (id) => document.getElementById(id);

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('es-ES');
};

const showToast = (message, type = 'success', duration = 3500) => {
  const container = el('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'error'
    ? 'fa-solid fa-circle-exclamation'
    : type === 'warning'
      ? 'fa-solid fa-triangle-exclamation'
      : type === 'info'
        ? 'fa-solid fa-circle-info'
        : 'fa-solid fa-circle-check';
  toast.innerHTML = `<i class="${icon}"></i><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  window.setTimeout(() => {
    toast.style.opacity = '0';
    window.setTimeout(() => toast.remove(), 250);
  }, duration);
};

const apiFetch = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const token = localStorage.getItem('admin_token');
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login.html';
    return null;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || `Error del servidor (${response.status})`);
  }

  return data;
};

const closeModal = (modalId) => {
  const modal = el(modalId);
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
};

const openModal = (modalId) => {
  const modal = el(modalId);
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
};

const resetForm = (formId) => {
  const form = el(formId);
  if (!form) return;
  form.reset();
  form.querySelectorAll('input[type="hidden"]').forEach(input => {
    input.value = '';
  });
};

const bindModalClose = (modalId) => {
  const modal = el(modalId);
  if (!modal) return;
  modal.querySelectorAll('[data-modal-close]').forEach(button => {
    button.addEventListener('click', () => closeModal(modalId));
  });
};

const readFileAsDataURL = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

const updatePageHeader = (tabId) => {
  const pageTitle = el('page-title');
  const pageSubtitle = el('page-subtitle');
  const breadcrumb = el('breadcrumb-section');
  const titles = {
    inicio: 'Resumen del Sistema',
    cursos: 'Gestión de Cursos',
    participantes: 'Gestión de Alumnos',
    matriculas: 'Gestión de Matrículas',
    certificados: 'Historial de Certificados',
    firmas: 'Firmas Autorizadas'
  };
  const subtitles = {
    inicio: 'Visualiza un resumen general de la actividad del sistema.',
    cursos: 'Administra el catálogo de cursos y entrenamientos registrados.',
    participantes: 'Administra la información y el estado de los alumnos del sistema.',
    matriculas: 'Gestiona las inscripciones activas por curso.',
    certificados: 'Consulta y administra los certificados emitidos.',
    firmas: 'Controla las firmas autorizadas para certificados.'
  };
  const crumbs = {
    inicio: 'Panel',
    cursos: 'Cursos',
    participantes: 'Alumnos',
    matriculas: 'Matrículas',
    certificados: 'Certificados',
    firmas: 'Firmas'
  };

  if (pageTitle) pageTitle.textContent = titles[tabId] || 'TEAM HSEC';
  if (pageSubtitle) pageSubtitle.textContent = subtitles[tabId] || '';
  if (breadcrumb) breadcrumb.textContent = crumbs[tabId] || 'Panel';
};

const setActiveTab = (tabId) => {
  document.querySelectorAll('.sidebar-menu a[data-tab]').forEach(link => {
    link.classList.toggle('active', link.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(section => {
    section.classList.toggle('active', section.id === `tab-${tabId}`);
  });
  updatePageHeader(tabId);
};

const loadDashboardStats = async () => {
  const stats = await apiFetch('/api/admin/dashboard');
  if (!stats) return;

  if (el('stat-participantes')) el('stat-participantes').textContent = stats.totalParticipantes || 0;
  if (el('stat-cursos')) el('stat-cursos').textContent = stats.totalCursos || 0;
  if (el('stat-certificados')) el('stat-certificados').textContent = stats.totalCertificados || 0;

  const recentList = el('recent-certs-list');
  if (!recentList) return;

  if (!Array.isArray(stats.recientes) || stats.recientes.length === 0) {
    recentList.innerHTML = '<tr><td colspan="6" class="px-6 py-10 text-center text-on-surface-variant">No hay certificados emitidos recientemente.</td></tr>';
    return;
  }

  recentList.innerHTML = stats.recientes.map(cert => {
    const isExpired = cert.fecha_vencimiento && new Date(cert.fecha_vencimiento) < new Date();
    return `
      <tr>
        <td class="px-6 py-4"><strong>${escapeHtml(cert.codigo)}</strong></td>
        <td class="px-6 py-4">${escapeHtml(cert.alumno_nombre || '')}</td>
        <td class="px-6 py-4">${escapeHtml(cert.curso_nombre || '')}</td>
        <td class="px-6 py-4">${formatDate(cert.fecha_emision)}</td>
        <td class="px-6 py-4">
          <span class="badge-status ${isExpired ? 'badge-expired' : 'badge-active'}">${isExpired ? 'Vencido' : 'Vigente'}</span>
        </td>
        <td class="px-6 py-4">
          <a href="${escapeHtml(cert.pdf_path || '#')}" target="_blank" rel="noreferrer" class="btn-icon" title="Ver PDF"><i class="fa-solid fa-file-pdf" style="color:#ef4444;"></i></a>
        </td>
      </tr>
    `;
  }).join('');
};

const populateCourseTrainerSelect = async (selectedFirmaId = '') => {
  const select = el('course-trainer');
  if (!select) return;
  const firmas = await apiFetch('/api/firmas');
  if (!Array.isArray(firmas) || firmas.length === 0) {
    select.innerHTML = '<option value="">No hay firmantes registrados.</option>';
    return;
  }
  select.innerHTML = '<option value="">-- Seleccionar Entrenador / Ponente --</option>' + firmas.map(firma => {
    const label = `${firma.nombre}${firma.cargo ? ` (${firma.cargo})` : ''}`;
    return `<option value="${firma.id}" ${String(firma.id) === String(selectedFirmaId) ? 'selected' : ''}>${escapeHtml(label)}</option>`;
  }).join('');
};

const loadCourses = async () => {
  const list = el('courses-list');
  if (!list) return;
  list.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-on-surface-variant">Cargando...</td></tr>';

  const courses = await apiFetch('/api/cursos');
  state.courses = Array.isArray(courses) ? courses : [];

  if (state.courses.length === 0) {
    list.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-on-surface-variant">No hay cursos registrados.</td></tr>';
    return;
  }

  list.innerHTML = state.courses.map(course => `
    <tr>
      <td class="px-6 py-4"><code>${escapeHtml(course.codigo_curso || '')}</code></td>
      <td class="px-6 py-4"><strong>${escapeHtml(course.nombre || '')}</strong></td>
      <td class="px-6 py-4">${escapeHtml(course.duracion || '')}</td>
      <td class="px-6 py-4">${escapeHtml(course.categoria || 'N/A')}</td>
      <td class="px-6 py-4">${escapeHtml(course.entrenador || 'N/A')}</td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-2">
          <button type="button" class="btn-icon btn-edit-course" data-id="${course.id}" title="Editar"><i class="fa-solid fa-pen"></i></button>
          <button type="button" class="btn-icon btn-delete btn-delete-course" data-id="${course.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  list.querySelectorAll('.btn-edit-course').forEach(button => {
    button.addEventListener('click', async () => {
      const course = state.courses.find(item => String(item.id) === button.dataset.id);
      if (!course) return;
      await populateCourseTrainerSelect(course.firma_id || '');
      el('modal-course-title').textContent = 'Editar Curso';
      el('course-id').value = course.id;
      el('course-code').value = course.codigo_curso || '';
      el('course-name').value = course.nombre || '';
      el('course-duration').value = course.duracion || '';
      el('course-category').value = course.categoria || '';
      el('course-trainer').value = course.firma_id || '';
      openModal('modal-course');
    });
  });

  list.querySelectorAll('.btn-delete-course').forEach(button => {
    button.addEventListener('click', async () => {
      if (!confirm('¿Está seguro de eliminar este curso?')) return;
      await apiFetch(`/api/cursos/${button.dataset.id}`, { method: 'DELETE' });
      showToast('Curso eliminado correctamente');
      await loadCourses();
    });
  });
};

const openParticipantModal = (participant = null) => {
  el('modal-participant-title').textContent = participant ? 'Editar Alumno' : 'Registrar Alumno';
  el('participant-id').value = participant?.id || '';
  el('participant-dni').value = participant?.dni || '';
  el('participant-name').value = participant?.nombres || '';
  el('participant-cargo').value = participant?.cargo || '';
  el('participant-telefono').value = participant?.telefono || '';
  el('participant-procedencia').value = participant?.procedencia || '';
  el('participant-induccion').value = participant?.induccion || 'APTO';
  el('participant-examen-medico').value = participant?.examen_medico || 'APTO';
  el('participant-email').value = participant?.email || '';
  openModal('modal-participant');
};

const renderParticipantDetails = (participant) => {
  el('modal-participant-details-title').textContent = `Detalle de ${participant.nombres || 'Alumno'}`;
  el('participant-detail-dni').textContent = participant.dni || 'N/A';
  el('participant-detail-name').textContent = participant.nombres || 'N/A';
  el('participant-detail-cargo').textContent = participant.cargo || 'N/A';
  el('participant-detail-phone').textContent = participant.telefono || 'N/A';
  el('participant-detail-origin').textContent = participant.procedencia || 'N/A';
  el('participant-detail-email').textContent = participant.email || 'Sin correo';
  el('participant-detail-induccion').textContent = participant.induccion || 'N/A';
  el('participant-detail-examen').textContent = participant.examen_medico || 'N/A';
  openModal('modal-participant-details');
};

const renderParticipants = () => {
  const list = el('participants-list');
  const countLabel = el('participants-count-label');
  const pagesContainer = el('participants-pages');
  const prevButton = el('participants-prev');
  const nextButton = el('participants-next');
  if (!list || !countLabel || !pagesContainer || !prevButton || !nextButton) return;

  const query = state.participantQuery.trim().toLowerCase();
  const filtered = state.participants.filter(participant => {
    if (!query) return true;
    return [participant.dni, participant.nombres, participant.telefono, participant.procedencia, participant.email]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(query));
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / state.participantPageSize));
  state.participantPage = Math.min(Math.max(1, state.participantPage), totalPages);
  const startIndex = (state.participantPage - 1) * state.participantPageSize;
  const pageItems = filtered.slice(startIndex, startIndex + state.participantPageSize);

  if (total === 0) {
    list.innerHTML = '<tr><td colspan="7" class="px-6 py-10 text-center text-on-surface-variant">No hay alumnos registrados.</td></tr>';
    countLabel.textContent = 'Mostrando 0 de 0 alumnos';
    pagesContainer.innerHTML = '';
    prevButton.disabled = true;
    nextButton.disabled = true;
    return;
  }

  list.innerHTML = pageItems.map(participant => `
    <tr>
      <td class="px-6 py-4"><strong>${escapeHtml(participant.dni || '')}</strong></td>
      <td class="px-6 py-4">${escapeHtml(participant.nombres || '')}</td>
      <td class="px-6 py-4">${escapeHtml(participant.telefono || 'N/A')}</td>
      <td class="px-6 py-4">${escapeHtml(participant.procedencia || 'N/A')}</td>
      <td class="px-6 py-4">${escapeHtml(participant.email || 'Sin correo')}</td>
      <td class="px-6 py-4">${formatDate(participant.created_at)}</td>
      <td class="px-6 py-4">
        <div class="flex items-center justify-center gap-2">
          <button type="button" class="btn-icon btn-view-participant" data-id="${participant.id}" title="Ver detalles"><i class="fa-solid fa-eye"></i></button>
          <button type="button" class="btn-icon btn-edit-participant" data-id="${participant.id}" title="Editar"><i class="fa-solid fa-pen"></i></button>
          <button type="button" class="btn-icon btn-delete btn-delete-participant" data-id="${participant.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  const rangeStart = startIndex + 1;
  const rangeEnd = Math.min(startIndex + pageItems.length, total);
  countLabel.textContent = `Mostrando ${rangeStart} a ${rangeEnd} de ${total} alumnos`;
  prevButton.disabled = state.participantPage === 1;
  nextButton.disabled = state.participantPage === totalPages;
  prevButton.classList.toggle('opacity-40', state.participantPage === 1);
  prevButton.classList.toggle('pointer-events-none', state.participantPage === 1);
  nextButton.classList.toggle('opacity-40', state.participantPage === totalPages);
  nextButton.classList.toggle('pointer-events-none', state.participantPage === totalPages);

  pagesContainer.innerHTML = '';
  const createPageButton = (page) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(page);
    button.className = page === state.participantPage
      ? 'w-10 h-10 rounded-xl border border-primary bg-primary text-white font-semibold'
      : 'w-10 h-10 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors';
    button.addEventListener('click', () => {
      state.participantPage = page;
      renderParticipants();
    });
    return button;
  };

  const maxButtons = 5;
  let startPage = Math.max(1, state.participantPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  startPage = Math.max(1, endPage - maxButtons + 1);

  for (let page = startPage; page <= endPage; page += 1) {
    pagesContainer.appendChild(createPageButton(page));
  }

  list.querySelectorAll('.btn-view-participant').forEach(button => {
    button.addEventListener('click', () => {
      const participant = state.participants.find(item => String(item.id) === button.dataset.id);
      if (participant) renderParticipantDetails(participant);
    });
  });

  list.querySelectorAll('.btn-edit-participant').forEach(button => {
    button.addEventListener('click', () => {
      const participant = state.participants.find(item => String(item.id) === button.dataset.id);
      if (participant) openParticipantModal(participant);
    });
  });

  list.querySelectorAll('.btn-delete-participant').forEach(button => {
    button.addEventListener('click', async () => {
      if (!confirm('¿Está seguro de eliminar este alumno?')) return;
      await apiFetch(`/api/participantes/${button.dataset.id}`, { method: 'DELETE' });
      showToast('Alumno eliminado correctamente');
      await loadParticipants();
    });
  });
};

const loadParticipants = async () => {
  const list = el('participants-list');
  if (!list) return;
  list.innerHTML = '<tr><td colspan="7" class="px-6 py-10 text-center text-on-surface-variant">Cargando...</td></tr>';
  const [participants, dashboardStats] = await Promise.all([
    apiFetch('/api/participantes'),
    apiFetch('/api/admin/dashboard').catch(() => null)
  ]);
  state.participants = Array.isArray(participants) ? participants : [];

  if (el('alumnos-stat-total')) el('alumnos-stat-total').textContent = state.participants.length;
  const aptosCount = state.participants.filter(p => p.induccion === 'APTO' && p.examen_medico === 'APTO').length;
  if (el('alumnos-stat-aptos')) el('alumnos-stat-aptos').textContent = aptosCount;
  if (el('alumnos-stat-pendientes')) el('alumnos-stat-pendientes').textContent = Math.max(state.participants.length - aptosCount, 0);
  if (el('alumnos-stat-certificados')) el('alumnos-stat-certificados').textContent = dashboardStats?.totalCertificados || 0;

  state.participantPage = 1;
  renderParticipants();
};

const renderEnrollmentCourseDetails = (course) => {
  const details = el('enrollment-course-details');
  if (!details) return;
  if (!course) {
    details.classList.add('hidden');
    return;
  }
  details.classList.remove('hidden');
  el('enrollment-course-name').textContent = course.nombre || '';
  el('enrollment-course-code').textContent = course.codigo_curso || '';
  el('enrollment-course-duration').textContent = course.duracion || '';
  el('enrollment-course-category').textContent = course.categoria || '';
  el('enrollment-course-trainer').textContent = course.entrenador || '';
};

const renderEnrollmentParticipantList = (containerId, query, selectedIds, excludeIds = []) => {
  const container = el(containerId);
  if (!container) return;
  const filtered = state.participants.filter(participant => {
    if (excludeIds.includes(String(participant.id))) return false;
    if (!query.trim()) return true;
    const haystack = [participant.dni, participant.nombres].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-sm text-slate-400 text-center py-4">No hay alumnos que coincidan con la búsqueda.</p>';
    return;
  }

  container.innerHTML = filtered.map(participant => {
    const checked = selectedIds.has(String(participant.id)) ? 'checked' : '';
    return `
      <label class="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
        <input type="checkbox" class="participant-select" value="${participant.id}" ${checked}>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-slate-800 truncate">${escapeHtml(participant.nombres || '')}</p>
          <p class="text-xs text-slate-500">${escapeHtml(participant.dni || '')}</p>
        </div>
      </label>
    `;
  }).join('');
};

const loadEnrollments = async () => {
  const list = el('enrollments-list');
  if (!list) return;
  list.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-on-surface-variant">Cargando...</td></tr>';
  const enrollments = await apiFetch('/api/matriculas/grouped');
  state.enrollments = Array.isArray(enrollments) ? enrollments : [];

  if (state.enrollments.length === 0) {
    list.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-on-surface-variant">No hay matrículas registradas.</td></tr>';
    return;
  }

  list.innerHTML = state.enrollments.map(group => `
    <tr>
      <td class="px-6 py-4">
        <div>
          <div class="font-semibold text-on-surface">${escapeHtml(group.curso_nombre || '')}</div>
          <div class="text-xs text-on-surface-variant">${escapeHtml(group.curso_codigo || '')}</div>
        </div>
      </td>
      <td class="px-6 py-4 text-sm text-on-surface-variant">${(group.enrollments || []).slice(0, 3).map(item => escapeHtml(item.alumno_nombre || '')).join(', ')}${(group.enrollments?.length || 0) > 3 ? '...' : ''}</td>
      <td class="px-6 py-4">${group.enrollments?.length || 0}</td>
      <td class="px-6 py-4">
        <button type="button" class="btn-icon btn-edit-enrollment" data-course-id="${group.curso_id}" title="Editar matrícula"><i class="fa-solid fa-pen"></i></button>
      </td>
    </tr>
  `).join('');

  list.querySelectorAll('.btn-edit-enrollment').forEach(button => {
    button.addEventListener('click', async () => {
      await openEnrollmentEditModal(button.dataset.courseId);
    });
  });
};

const openEnrollmentCreateModal = async () => {
  resetForm('form-enrollment');
  state.enrollmentCreateQuery = '';
  state.enrollmentCreateSelected = new Set();
  const courseSelect = el('enrollment-course');
  const participantsContainer = el('enrollment-participants-container');
  const searchInput = el('enrollment-search');
  const selectedCount = el('enrollment-selected-count');

  const courses = await apiFetch('/api/cursos');
  state.courses = Array.isArray(courses) ? courses : [];
  courseSelect.innerHTML = '<option value="">-- Primero selecciona un curso --</option>' + state.courses.map(course => `
    <option value="${course.id}">${escapeHtml(course.nombre || '')}</option>
  `).join('');

  const participants = await apiFetch('/api/participantes');
  state.participants = Array.isArray(participants) ? participants : [];

  renderEnrollmentCourseDetails(null);
  renderEnrollmentParticipantList('enrollment-participants-container', '', state.enrollmentCreateSelected);
  if (selectedCount) selectedCount.textContent = 'Selecciona los alumnos que deseas matricular en este curso.';

  courseSelect.onchange = () => {
    const course = state.courses.find(item => String(item.id) === courseSelect.value);
    renderEnrollmentCourseDetails(course || null);
  };

  searchInput.oninput = () => {
    state.enrollmentCreateQuery = searchInput.value;
    renderEnrollmentParticipantList('enrollment-participants-container', state.enrollmentCreateQuery, state.enrollmentCreateSelected);
  };

  participantsContainer.onchange = (event) => {
    const target = event.target;
    if (target && target.classList.contains('participant-select')) {
      if (target.checked) state.enrollmentCreateSelected.add(String(target.value));
      else state.enrollmentCreateSelected.delete(String(target.value));
      selectedCount.textContent = `Seleccionados: ${state.enrollmentCreateSelected.size}`;
    }
  };

  const selectAllButton = el('btn-select-all-participants');
  if (selectAllButton) {
    selectAllButton.onclick = () => {
      const visible = Array.from(participantsContainer.querySelectorAll('.participant-select'));
      visible.forEach(input => {
        input.checked = true;
        state.enrollmentCreateSelected.add(String(input.value));
      });
      selectedCount.textContent = `Seleccionados: ${state.enrollmentCreateSelected.size}`;
    };
  }

  openModal('modal-enrollment');
};

const renderEnrollmentEditCurrentList = () => {
  const container = el('enrollment-current-list');
  if (!container) return;
  if (state.enrollmentEditCurrent.length === 0) {
    container.innerHTML = '<p class="text-sm text-slate-400">No hay alumnos matriculados en este curso.</p>';
    return;
  }
  container.innerHTML = state.enrollmentEditCurrent.map(item => `
    <div class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div>
        <p class="text-sm font-semibold text-slate-800">${escapeHtml(item.alumno_nombre || '')}</p>
        <p class="text-xs text-slate-500">${escapeHtml(item.alumno_dni || '')}</p>
      </div>
      <button type="button" class="btn-icon btn-remove-enrollment" data-id="${item.id}" title="Quitar"><i class="fa-solid fa-xmark"></i></button>
    </div>
  `).join('');
};

const renderEnrollmentEditAvailableList = (query) => {
  const container = el('enrollment-add-participants-container');
  if (!container) return;
  const currentIds = new Set(state.enrollmentEditCurrent.map(item => String(item.participante_id)));
  const filtered = state.enrollmentEditAvailable.filter(participant => {
    if (currentIds.has(String(participant.id))) return false;
    if (!query.trim()) return true;
    return [participant.dni, participant.nombres].filter(Boolean).some(value => String(value).toLowerCase().includes(query.trim().toLowerCase()));
  });

  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-sm text-slate-400 text-center py-3">No hay alumnos disponibles para agregar.</p>';
    return;
  }

  container.innerHTML = filtered.map(participant => {
    const checked = state.enrollmentEditSelected.has(String(participant.id)) ? 'checked' : '';
    return `
      <label class="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
        <input type="checkbox" class="enrollment-edit-select" value="${participant.id}" ${checked}>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-slate-800 truncate">${escapeHtml(participant.nombres || '')}</p>
          <p class="text-xs text-slate-500">${escapeHtml(participant.dni || '')}</p>
        </div>
      </label>
    `;
  }).join('');

  container.onchange = (event) => {
    const target = event.target;
    if (target && target.classList.contains('enrollment-edit-select')) {
      if (target.checked) state.enrollmentEditSelected.add(String(target.value));
      else state.enrollmentEditSelected.delete(String(target.value));
    }
  };
};

const openEnrollmentEditModal = async (courseId) => {
  state.enrollmentEditCourseId = courseId;
  state.enrollmentEditSelected = new Set();

  const [course, currentEnrollments, participants] = await Promise.all([
    apiFetch(`/api/cursos/${courseId}`),
    apiFetch(`/api/matriculas/by-course/${courseId}`),
    apiFetch('/api/participantes')
  ]);

  state.enrollmentEditCurrent = Array.isArray(currentEnrollments) ? currentEnrollments : [];
  state.enrollmentEditAvailable = Array.isArray(participants) ? participants : [];

  el('modal-enrollment-edit-title').textContent = `Editar Matrícula - ${course?.nombre || ''}`;
  el('enrollment-edit-curso-id').value = courseId;

  renderEnrollmentEditCurrentList();
  renderEnrollmentEditAvailableList('');

  const searchInput = el('enrollment-edit-search');
  searchInput.oninput = () => {
    state.enrollmentEditQuery = searchInput.value;
    renderEnrollmentEditAvailableList(state.enrollmentEditQuery);
  };

  const currentList = el('enrollment-current-list');
  currentList.onclick = async (event) => {
    const target = event.target.closest('.btn-remove-enrollment');
    if (!target) return;
    if (!confirm('¿Desea quitar este alumno de la matrícula?')) return;
    await apiFetch(`/api/matriculas/${target.dataset.id}`, { method: 'DELETE' });
    showToast('Matrícula eliminada correctamente');
    await openEnrollmentEditModal(courseId);
    await loadEnrollments();
  };

  const addButton = el('btn-enrollment-add-selected');
  addButton.onclick = async () => {
    if (state.enrollmentEditSelected.size === 0) {
      showToast('Selecciona al menos un alumno', 'warning');
      return;
    }
    await apiFetch('/api/matriculas/bulk', {
      method: 'POST',
      body: JSON.stringify({
        curso_id: Number(courseId),
        participante_ids: Array.from(state.enrollmentEditSelected).map(id => Number(id))
      })
    });
    showToast('Alumnos agregados correctamente');
    await openEnrollmentEditModal(courseId);
    await loadEnrollments();
  };

  el('btn-enrollment-edit-done').onclick = () => closeModal('modal-enrollment-edit');
  openModal('modal-enrollment-edit');
};

const loadCertificates = async () => {
  const list = el('certificates-list');
  if (!list) return;
  list.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-on-surface-variant">Cargando...</td></tr>';
  const certificates = await apiFetch('/api/certificados');
  state.certificates = Array.isArray(certificates) ? certificates : [];

  const query = (el('search-cert-query')?.value || '').trim().toLowerCase();
  const filtered = state.certificates.filter(cert => {
    if (!query) return true;
    return [cert.codigo, cert.alumno_dni, cert.alumno_nombre, cert.curso_nombre].filter(Boolean).some(value => String(value).toLowerCase().includes(query));
  });

  if (filtered.length === 0) {
    list.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-on-surface-variant">No se encontraron certificados.</td></tr>';
    return;
  }

  list.innerHTML = filtered.map(cert => {
    const expired = cert.fecha_vencimiento && new Date(cert.fecha_vencimiento) < new Date();
    return `
      <tr>
        <td class="px-6 py-4"><strong>${escapeHtml(cert.codigo || '')}</strong></td>
        <td class="px-6 py-4">${escapeHtml(cert.alumno_nombre || '')}</td>
        <td class="px-6 py-4">${escapeHtml(cert.curso_nombre || '')}</td>
        <td class="px-6 py-4">${formatDate(cert.fecha_emision)}</td>
        <td class="px-6 py-4">${formatDate(cert.fecha_vencimiento)}</td>
        <td class="px-6 py-4"><span class="badge-status ${expired ? 'badge-expired' : 'badge-active'}">${expired ? 'Vencido' : 'Vigente'}</span></td>
        <td class="px-6 py-4">
          <div class="flex items-center gap-2">
            <a href="${escapeHtml(cert.pdf_path || '#')}" target="_blank" rel="noreferrer" class="btn-icon" title="Ver PDF"><i class="fa-solid fa-file-pdf"></i></a>
            <button type="button" class="btn-icon btn-delete btn-delete-certificate" data-id="${cert.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  list.querySelectorAll('.btn-delete-certificate').forEach(button => {
    button.addEventListener('click', async () => {
      if (!confirm('¿Eliminar este certificado?')) return;
      await apiFetch(`/api/certificados/${button.dataset.id}`, { method: 'DELETE' });
      showToast('Certificado eliminado correctamente');
      await loadCertificates();
    });
  });
};

const loadSignatures = async () => {
  const list = el('signatures-list');
  if (!list) return;
  list.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-on-surface-variant">Cargando...</td></tr>';
  const signatures = await apiFetch('/api/firmas');
  state.signatures = Array.isArray(signatures) ? signatures : [];

  if (state.signatures.length === 0) {
    list.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-on-surface-variant">No hay firmas registradas.</td></tr>';
    return;
  }

  list.innerHTML = state.signatures.map(signature => `
    <tr>
      <td class="px-6 py-4">${escapeHtml(signature.id || '')}</td>
      <td class="px-6 py-4">${escapeHtml(signature.nombre || '')}</td>
      <td class="px-6 py-4">${escapeHtml(signature.cargo || '')}</td>
      <td class="px-6 py-4">${escapeHtml(signature.cip || 'N/A')}</td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-2">
          <button type="button" class="btn-icon btn-preview-signature" data-id="${signature.id}" title="Ver imagen"><i class="fa-solid fa-image"></i></button>
          <button type="button" class="btn-icon btn-edit-signature" data-id="${signature.id}" title="Editar"><i class="fa-solid fa-pen"></i></button>
          <button type="button" class="btn-icon btn-delete btn-delete-signature" data-id="${signature.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  list.querySelectorAll('.btn-preview-signature').forEach(button => {
    button.addEventListener('click', () => {
      const signature = state.signatures.find(item => String(item.id) === button.dataset.id);
      if (!signature) return;
      el('firma-preview-img').src = signature.firma_url || '';
      el('firma-preview-img').style.display = 'block';
      el('firma-preview-fallback').style.display = 'none';
      el('firma-preview-nombre').textContent = signature.nombre || '';
      el('firma-preview-cargo').textContent = signature.cargo || '';
      openModal('modal-firma-preview');
    });
  });

  list.querySelectorAll('.btn-edit-signature').forEach(button => {
    button.addEventListener('click', () => {
      const signature = state.signatures.find(item => String(item.id) === button.dataset.id);
      if (!signature) return;
      el('modal-signature-title').textContent = 'Editar Firma Autorizada';
      el('sig-id').value = signature.id || '';
      el('sig-name').value = signature.nombre || '';
      el('sig-role').value = signature.cargo || '';
      el('sig-cip').value = signature.cip || '';
      openModal('modal-signature');
    });
  });

  list.querySelectorAll('.btn-delete-signature').forEach(button => {
    button.addEventListener('click', async () => {
      if (!confirm('¿Eliminar esta firma?')) return;
      await apiFetch(`/api/firmas/${button.dataset.id}`, { method: 'DELETE' });
      showToast('Firma eliminada correctamente');
      await loadSignatures();
      await populateCourseTrainerSelect();
    });
  });
};

const loadCurrentSection = async (tabId) => {
  try {
    if (tabId === 'inicio') await loadDashboardStats();
    if (tabId === 'cursos') await loadCourses();
    if (tabId === 'participantes') await loadParticipants();
    if (tabId === 'matriculas') await loadEnrollments();
    if (tabId === 'certificados') await loadCertificates();
    if (tabId === 'firmas') await loadSignatures();
  } catch (error) {
    console.error(error);
    showToast(error.message || 'Error cargando información', 'error');
  }
};

const initTabs = () => {
  document.querySelectorAll('.sidebar-menu a[data-tab]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const tabId = link.dataset.tab;
      setActiveTab(tabId);
      loadCurrentSection(tabId);
    });
  });
};

const initModalButtons = () => {
  el('btn-new-course')?.addEventListener('click', async () => {
    resetForm('form-course');
    el('modal-course-title').textContent = 'Registrar Curso';
    await populateCourseTrainerSelect();
    openModal('modal-course');
  });

  el('btn-new-participant')?.addEventListener('click', () => {
    openParticipantModal();
  });

  el('btn-new-enrollment')?.addEventListener('click', async () => {
    await openEnrollmentCreateModal();
  });

  el('btn-new-certificate')?.addEventListener('click', async () => {
    resetForm('form-certificate');
    el('modal-certificate-title').textContent = 'Emitir Certificado Oficial';
    const [matriculas, firmas] = await Promise.all([
      apiFetch('/api/matriculas/grouped').catch(() => []),
      apiFetch('/api/firmas').catch(() => [])
    ]);

    const matSelect = el('cert-matricula');
    const sig1 = el('cert-signature-1');
    const sig2 = el('cert-signature-2');

    const flatMatriculas = (Array.isArray(matriculas) ? matriculas : []).flatMap(group => (group.enrollments || []).map(item => ({
      id: item.id,
      label: `${item.alumno_nombre} - ${group.curso_nombre}`
    })));

    matSelect.innerHTML = '<option value="">Selecciona una matrícula activa...</option>' + flatMatriculas.map(item => `<option value="${item.id}">${escapeHtml(item.label)}</option>`).join('');
    sig1.innerHTML = '<option value="">Seleccionar firma...</option>' + (Array.isArray(firmas) ? firmas : []).map(firma => `<option value="${firma.id}">${escapeHtml(firma.nombre || '')}</option>`).join('');
    sig2.innerHTML = '<option value="">Ninguna</option>' + (Array.isArray(firmas) ? firmas : []).map(firma => `<option value="${firma.id}">${escapeHtml(firma.nombre || '')}</option>`).join('');

    const today = new Date().toISOString().split('T')[0];
    if (el('cert-issue-date')) el('cert-issue-date').value = today;
    if (el('cert-course-date')) el('cert-course-date').value = today;
    openModal('modal-certificate');
  });

  el('btn-new-signature')?.addEventListener('click', () => {
    resetForm('form-signature');
    el('modal-signature-title').textContent = 'Agregar Firma Autorizada';
    openModal('modal-signature');
  });
};

const initForms = () => {
  el('form-course')?.addEventListener('submit', async event => {
    event.preventDefault();
    const id = el('course-id').value;
    const trainerSelect = el('course-trainer');
    const firmaId = trainerSelect.value ? Number(trainerSelect.value) : null;
    const selectedOption = trainerSelect.selectedOptions[0];
    const trainerName = selectedOption ? selectedOption.text.replace(/\s*\(.*\)$/, '').trim() : '';

    if (!firmaId) {
      showToast('Debes seleccionar un Entrenador / Ponente', 'error');
      return;
    }

    const payload = {
      codigo_curso: el('course-code').value.trim(),
      nombre: el('course-name').value.trim(),
      duracion: el('course-duration').value.trim(),
      categoria: el('course-category').value.trim(),
      entrenador: trainerName,
      firma_id: firmaId
    };

    await apiFetch(id ? `/api/cursos/${id}` : '/api/cursos', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    });

    showToast(id ? 'Curso actualizado correctamente' : 'Curso creado correctamente');
    closeModal('modal-course');
    await loadCourses();
  });

  el('form-participant')?.addEventListener('submit', async event => {
    event.preventDefault();
    const id = el('participant-id').value;
    const payload = {
      nombres: el('participant-name').value.trim(),
      dni: el('participant-dni').value.trim(),
      email: el('participant-email').value.trim(),
      cargo: el('participant-cargo').value.trim(),
      telefono: el('participant-telefono').value.trim(),
      procedencia: el('participant-procedencia').value.trim(),
      induccion: el('participant-induccion').value,
      examen_medico: el('participant-examen-medico').value
    };

    await apiFetch(id ? `/api/participantes/${id}` : '/api/participantes', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    });

    showToast(id ? 'Alumno actualizado correctamente' : 'Alumno creado correctamente');
    closeModal('modal-participant');
    await loadParticipants();
  });

  el('form-enrollment')?.addEventListener('submit', async event => {
    event.preventDefault();
    const cursoId = Number(el('enrollment-course').value);
    const selected = Array.from(el('enrollment-participants-container').querySelectorAll('.participant-select:checked')).map(input => Number(input.value));

    if (!cursoId || selected.length === 0) {
      showToast('Selecciona un curso y al menos un alumno', 'warning');
      return;
    }

    await apiFetch('/api/matriculas/bulk', {
      method: 'POST',
      body: JSON.stringify({ curso_id: cursoId, participante_ids: selected })
    });

    showToast('Matrícula registrada correctamente');
    closeModal('modal-enrollment');
    await loadEnrollments();
  });

  el('form-certificate')?.addEventListener('submit', async event => {
    event.preventDefault();
    await apiFetch('/api/certificados', {
      method: 'POST',
      body: JSON.stringify({
        matricula_id: Number(el('cert-matricula').value),
        firma_id_1: Number(el('cert-signature-1').value),
        firma_id_2: el('cert-signature-2').value ? Number(el('cert-signature-2').value) : null,
        fecha_emision: el('cert-issue-date').value,
        fecha_realizacion: el('cert-course-date').value,
        vigencia_anos: Number(el('cert-expiry-years').value)
      })
    });

    showToast('Certificado emitido correctamente');
    closeModal('modal-certificate');
    await loadCertificates();
  });

  el('form-signature')?.addEventListener('submit', async event => {
    event.preventDefault();
    const id = el('sig-id').value;
    const file = el('sig-file').files[0];
    let firma_base64 = null;
    if (file) {
      firma_base64 = await readFileAsDataURL(file);
    }

    const payload = {
      nombre: el('sig-name').value.trim(),
      cargo: el('sig-role').value.trim(),
      cip: el('sig-cip').value.trim(),
      ...(firma_base64 ? { firma_base64 } : {})
    };

    await apiFetch(id ? `/api/firmas/${id}` : '/api/firmas', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    });

    showToast(id ? 'Firma actualizada correctamente' : 'Firma creada correctamente');
    closeModal('modal-signature');
    await loadSignatures();
    await populateCourseTrainerSelect();
  });

  el('search-participant-dni')?.addEventListener('input', event => {
    state.participantQuery = event.target.value || '';
    state.participantPage = 1;
    renderParticipants();
  });

  el('participants-prev')?.addEventListener('click', () => {
    if (state.participantPage > 1) {
      state.participantPage -= 1;
      renderParticipants();
    }
  });

  el('participants-next')?.addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(state.participants.length / state.participantPageSize));
    if (state.participantPage < totalPages) {
      state.participantPage += 1;
      renderParticipants();
    }
  });

  el('search-cert-query')?.addEventListener('input', () => {
    loadCertificates();
  });
};

const init = async () => {
  bindModalClose('modal-course');
  bindModalClose('modal-participant');
  bindModalClose('modal-enrollment');
  bindModalClose('modal-enrollment-edit');
  bindModalClose('modal-firma-preview');
  bindModalClose('modal-participant-details');
  bindModalClose('modal-certificate');
  bindModalClose('modal-signature');

  initTabs();
  initModalButtons();
  initForms();

  if (!localStorage.getItem('admin_token')) {
    window.location.href = '/admin/login.html';
    return;
  }

  setActiveTab('inicio');
  await loadCurrentSection('inicio');
};

document.addEventListener('DOMContentLoaded', init);
