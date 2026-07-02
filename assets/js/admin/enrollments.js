import { el, escapeHtml, formatDate, apiFetch, showToast, openModal, resetForm, closeModal } from './utils.js';
import { state } from './state.js';

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
const PAGE_SIZE = 5; // alumnos visibles por curso antes del "ver todos"

const formatDateShort = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const isEnrollmentActive = (enrollment) => {
  if (!enrollment.fecha_fin) return true;
  return new Date(enrollment.fecha_fin) >= new Date();
};

// Descarga CSV de alumnos de un grupo
const downloadGroupCSV = (group) => {
  const header = ['N°', 'Alumno', 'DNI', 'Fecha Inicio', 'Fecha Fin', 'Estado'].join(',');
  const rows = (group.enrollments || []).map((item, idx) => {
    const active = isEnrollmentActive(item) ? 'Activa' : 'Vencida';
    return [
      idx + 1,
      `"${item.alumno_nombre || ''}"`,
      item.alumno_dni || '',
      formatDateShort(item.fecha_inicio),
      formatDateShort(item.fecha_fin),
      active
    ].join(',');
  });
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `matriculas-${(group.curso_nombre || 'curso').replace(/\s+/g, '-').toLowerCase()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────
// Render accordeon completo con Animaciones
// ─────────────────────────────────────────
export const renderEnrollments = () => {
  const container = document.getElementById('enrollments-accordion');
  if (!container) return;

  const query = (state.enrollmentQuery || '').trim().toLowerCase();

  const filtered = state.enrollments.filter(group => {
    if (!query) return true;
    const inCourse = [group.curso_nombre, group.curso_codigo, group.curso_entrenador]
      .filter(Boolean).some(v => String(v).toLowerCase().includes(query));
    if (inCourse) return true;
    return (group.enrollments || []).some(item =>
      [item.alumno_nombre, item.alumno_dni].filter(Boolean)
        .some(v => String(v).toLowerCase().includes(query))
    );
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="px-6 py-10 text-center text-on-surface-variant">
      ${query ? 'No se encontraron cursos que coincidan con la búsqueda.' : 'No hay matrículas registradas.'}
    </div>`;
    return;
  }

  container.innerHTML = filtered.map(group => {
    const courseId = String(group.curso_id);
    const isExpanded = state.expandedCourses.has(courseId);
    const showAll = state.showAllStudents.has(courseId);
    const enrollments = group.enrollments || [];
    const total = enrollments.length;
    const visible = showAll ? enrollments : enrollments.slice(0, PAGE_SIZE);

    const studentRows = visible.map((item, idx) => {
      const active = isEnrollmentActive(item);
      return `
        <tr class="hover:bg-slate-50/60 transition-colors">
          <td class="pl-8 pr-4 py-3 text-xs text-slate-400 font-medium w-10">${idx + 1}</td>
          <td class="px-4 py-3">
            <span class="text-sm font-semibold text-on-surface">${escapeHtml(item.alumno_nombre || '')}</span>
          </td>
          <td class="px-4 py-3 text-sm text-on-surface-variant">${escapeHtml(item.alumno_dni || '—')}</td>
          <td class="px-4 py-3 text-sm text-on-surface-variant">${formatDateShort(item.fecha_inicio)}</td>
          <td class="px-4 py-3 text-sm text-on-surface-variant">${formatDateShort(item.fecha_fin)}</td>
          <td class="px-4 py-3">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}">
              ${active ? 'Activa' : 'Vencida'}
            </span>
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-1.5">
              <button type="button" class="btn-icon btn-view-enrollment-student text-slate-400 hover:text-primary transition-colors" data-enrollment-id="${item.id}" data-course-id="${courseId}" title="Ver alumno">
                <i class="fa-solid fa-eye text-[12px]"></i>
              </button>
              <button type="button" class="btn-icon btn-delete btn-remove-enrollment-student text-slate-400 hover:text-red-600 transition-colors" data-enrollment-id="${item.id}" data-course-id="${courseId}" title="Quitar matrícula">
                <i class="fa-solid fa-trash text-[12px]"></i>
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');

    const paginationRow = !showAll && total > PAGE_SIZE ? `
      <tr>
        <td colspan="7" class="pl-8 pr-6 py-3.5 border-t border-slate-100 bg-slate-50/20">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400">Mostrando 1 a ${Math.min(PAGE_SIZE, total)} de ${total} alumnos</span>
            <button type="button"
              class="btn-show-all-students inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              data-course-id="${courseId}">
              <span class="material-symbols-outlined text-[16px] text-slate-500">groups</span>
              Ver todos los alumnos (${total})
              <span class="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
            </button>
          </div>
        </td>
      </tr>` : (showAll && total > PAGE_SIZE ? `
      <tr>
        <td colspan="7" class="pl-8 pr-6 py-3.5 border-t border-slate-100 bg-slate-50/20">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400">Mostrando todos los ${total} alumnos</span>
            <button type="button"
              class="btn-hide-all-students inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
              data-course-id="${courseId}">
              <span class="material-symbols-outlined text-[16px] text-slate-400">expand_less</span>
              Mostrar menos
            </button>
          </div>
        </td>
      </tr>` : '');

    const tableHTML = `
      <div class="border-t border-slate-100 bg-white">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-on-surface-variant bg-slate-50/50">
                <th class="pl-8 pr-4 py-3 font-semibold text-[10px] uppercase tracking-[0.14em] border-b border-slate-100 w-10">N°</th>
                <th class="px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.14em] border-b border-slate-100">Alumno</th>
                <th class="px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.14em] border-b border-slate-100">DNI / Identificación</th>
                <th class="px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.14em] border-b border-slate-100">Fecha de Inicio</th>
                <th class="px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.14em] border-b border-slate-100">Fecha de Fin</th>
                <th class="px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.14em] border-b border-slate-100">Estado</th>
                <th class="px-4 py-3 font-semibold text-[10px] uppercase tracking-[0.14em] border-b border-slate-100">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${studentRows || `<tr><td colspan="7" class="px-8 py-6 text-center text-sm text-slate-400">Sin alumnos matriculados.</td></tr>`}
              ${paginationRow}
            </tbody>
          </table>
        </div>
      </div>`;

    const maxHeightStyle = isExpanded ? 'max-height: none;' : 'max-height: 0px;';

    return `
      <div class="enrollment-accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm my-3" data-course-id="${courseId}">
        <!-- Course Header Row -->
        <div class="enrollment-course-header flex items-center gap-3 px-6 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer" data-toggle-course="${courseId}">
          <!-- Toggle arrow (left) -->
          <button type="button" class="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center shrink-0 transition-all hover:bg-slate-100" data-toggle-course="${courseId}">
            <span class="chevron-left material-symbols-outlined text-[18px] text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}">chevron_right</span>
          </button>

          <!-- Course Info -->
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm text-on-surface">${escapeHtml(group.curso_nombre || '')}</p>
            <p class="text-xs text-on-surface-variant mt-0.5">
              Entrenador: ${escapeHtml(group.curso_entrenador || 'N/A')}
              ${group.curso_duracion ? `<span class="mx-1.5 opacity-30">•</span> Duración: ${escapeHtml(group.curso_duracion)}` : ''}
            </p>
          </div>

          <!-- Alumno count -->
          <div class="text-right shrink-0 mr-4">
            <p class="text-base font-bold text-emerald-600 leading-none">${total}</p>
            <p class="text-[11px] text-on-surface-variant mt-0.5">Alumnos</p>
          </div>

          <!-- Action buttons -->
          <div class="flex items-center gap-1.5 shrink-0" onclick="event.stopPropagation()">
            <button type="button" class="btn-icon btn-download-enrollment text-slate-500 hover:text-primary transition-colors border border-slate-200 bg-white hover:bg-slate-50" data-course-id="${courseId}" title="Descargar lista de alumnos">
              <span class="material-symbols-outlined text-[18px]">download</span>
            </button>
            <button type="button" class="btn-icon btn-edit-enrollment text-slate-500 hover:text-primary transition-colors border border-slate-200 bg-white hover:bg-slate-50" data-course-id="${courseId}" title="Editar matrícula">
              <i class="fa-solid fa-pen text-[12px]"></i>
            </button>
            <button type="button" class="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 transition-all text-slate-500" data-toggle-course="${courseId}" title="${isExpanded ? 'Colapsar' : 'Expandir'}">
              <span class="chevron-right material-symbols-outlined text-[18px] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}">expand_more</span>
            </button>
          </div>
        </div>

        <!-- Expandable inner table container -->
        <div class="accordion-collapse-container" style="${maxHeightStyle}">
          ${tableHTML}
        </div>
      </div>`;
  }).join('');

  // ── Bind toggle events with smooth height transitions ──
  container.querySelectorAll('[data-toggle-course]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cid = btn.dataset.toggleCourse;
      
      const itemEl = container.querySelector(`.enrollment-accordion-item[data-course-id="${cid}"]`);
      if (!itemEl) return;
      
      const collapseEl = itemEl.querySelector('.accordion-collapse-container');
      const chevronLeft = itemEl.querySelector('.chevron-left');
      const chevronRight = itemEl.querySelector('.chevron-right');
      
      if (!collapseEl) return;
      
      const isCurrentlyOpen = state.expandedCourses.has(cid);
      
      if (isCurrentlyOpen) {
        // Collapse
        collapseEl.style.maxHeight = collapseEl.scrollHeight + 'px';
        collapseEl.offsetHeight; // force reflow
        collapseEl.style.maxHeight = '0px';
        
        chevronLeft?.classList.remove('rotate-90');
        chevronRight?.classList.remove('rotate-180');
        state.expandedCourses.delete(cid);
      } else {
        // Expand
        collapseEl.style.maxHeight = collapseEl.scrollHeight + 'px';
        chevronLeft?.classList.add('rotate-90');
        chevronRight?.classList.add('rotate-180');
        state.expandedCourses.add(cid);
        
        const transitionHandler = () => {
          if (state.expandedCourses.has(cid)) {
            collapseEl.style.maxHeight = 'none';
          }
          collapseEl.removeEventListener('transitionend', transitionHandler);
        };
        collapseEl.addEventListener('transitionend', transitionHandler);
      }
    });
  });

  // ── Bind download buttons ──
  container.querySelectorAll('.btn-download-enrollment').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const group = state.enrollments.find(g => String(g.curso_id) === btn.dataset.courseId);
      if (group) downloadGroupCSV(group);
    });
  });

  // ── Bind edit buttons ──
  container.querySelectorAll('.btn-edit-enrollment').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEnrollmentEditModal(btn.dataset.courseId);
    });
  });

  // ── Bind show-all-students ──
  container.querySelectorAll('.btn-show-all-students').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cid = btn.dataset.courseId;
      state.showAllStudents.add(cid);
      
      // Re-render to show all rows, but make sure it defaults to open height
      renderEnrollments();
      
      const itemEl = container.querySelector(`.enrollment-accordion-item[data-course-id="${cid}"]`);
      const collapseEl = itemEl?.querySelector('.accordion-collapse-container');
      if (collapseEl) {
        collapseEl.style.maxHeight = 'none';
      }
    });
  });

  // ── Bind hide-all-students ──
  container.querySelectorAll('.btn-hide-all-students').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cid = btn.dataset.courseId;
      state.showAllStudents.delete(cid);
      
      // Re-render back to page size
      renderEnrollments();
      
      const itemEl = container.querySelector(`.enrollment-accordion-item[data-course-id="${cid}"]`);
      const collapseEl = itemEl?.querySelector('.accordion-collapse-container');
      if (collapseEl) {
        collapseEl.style.maxHeight = 'none';
      }
    });
  });

  // ── Bind view specific student details inside enrollment list ──
  container.querySelectorAll('.btn-view-enrollment-student').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const enrollmentId = btn.dataset.enrollmentId;
      const courseId = btn.dataset.courseId;
      const group = state.enrollments.find(g => String(g.curso_id) === courseId);
      const student = group?.enrollments?.find(item => String(item.id) === enrollmentId);
      if (student) {
        // Open participant modal or details modal
        const part = await apiFetch(`/api/participantes/${student.participante_id}`);
        if (part) {
          el('detail-name').textContent = part.nombres || '—';
          el('detail-dni').textContent = part.dni || '—';
          el('detail-email').textContent = part.email || '—';
          el('detail-cargo').textContent = part.cargo || '—';
          el('detail-phone').textContent = part.telefono || '—';
          el('detail-procedencia').textContent = part.procedencia || '—';
          el('detail-induccion').textContent = part.induccion === 'si' ? 'Sí' : 'No';
          el('detail-medical').textContent = part.examen_medico === 'si' ? 'Sí' : 'No';
          openModal('modal-participant-details');
        }
      }
    });
  });

  // ── Bind remove student from enrollment ──
  container.querySelectorAll('.btn-remove-enrollment-student').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm('¿Deseas quitar este alumno de la matrícula?')) return;
      try {
        await apiFetch(`/api/matriculas/${btn.dataset.enrollmentId}`, { method: 'DELETE' });
        showToast('Matrícula eliminada correctamente');
        await loadEnrollments();
      } catch (err) {
        showToast(err.message || 'Error al eliminar la matrícula', 'error');
      }
    });
  });
};

// ─────────────────────────────────────────
// Load Enrollments (API + Stats)
// ─────────────────────────────────────────
export const loadEnrollments = async () => {
  const container = document.getElementById('enrollments-accordion');
  if (!container) return;
  container.innerHTML = '<div class="px-6 py-10 text-center text-on-surface-variant">Cargando...</div>';

  const enrollments = await apiFetch('/api/matriculas/grouped');
  state.enrollments = Array.isArray(enrollments) ? enrollments : [];

  // ── Stats ──
  const coursesCount = state.enrollments.length;
  const totalEnrollments = state.enrollments.reduce((sum, g) => sum + (g.enrollments?.length || 0), 0);
  const activeEnrollments = state.enrollments.reduce((sum, g) =>
    sum + (g.enrollments || []).filter(e => isEnrollmentActive(e)).length, 0);

  const now = new Date();
  const monthEnrollments = state.enrollments.reduce((sum, g) =>
    sum + (g.enrollments || []).filter(e => {
      if (!e.created_at) return false;
      const d = new Date(e.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length, 0);

  const elStat = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  elStat('enrollment-stat-active', activeEnrollments);
  elStat('enrollment-stat-courses', coursesCount);
  elStat('enrollment-stat-total', totalEnrollments);
  elStat('enrollment-stat-month', monthEnrollments);

  renderEnrollments();
};

// ─────────────────────────────────────────
// Create Enrollment Modal helpers
// ─────────────────────────────────────────
const renderEnrollmentParticipantList = (containerId, query, selectedIds, excludeIds = []) => {
  const container = document.getElementById(containerId);
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
      </label>`;
  }).join('');
};

const renderEnrollmentCourseDetails = (course) => {
  const details = document.getElementById('enrollment-course-details');
  if (!details) return;
  if (!course) { details.classList.add('hidden'); return; }
  details.classList.remove('hidden');
  const s = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  s('enrollment-course-name', course.nombre || '');
  s('enrollment-course-code', course.codigo_curso || '');
  s('enrollment-course-duration', course.duracion || '');
  s('enrollment-course-category', course.categoria || '');
  s('enrollment-course-trainer', course.entrenador || '');
};

export const openEnrollmentCreateModal = async () => {
  resetForm('form-enrollment');
  state.enrollmentCreateQuery = '';
  state.enrollmentCreateSelected = new Set();
  const courseSelect = document.getElementById('enrollment-course');
  const participantsContainer = document.getElementById('enrollment-participants-container');
  const searchInput = document.getElementById('enrollment-search');
  const selectedCount = document.getElementById('enrollment-selected-count');

  const courses = await apiFetch('/api/cursos');
  state.courses = Array.isArray(courses) ? courses : [];
  courseSelect.innerHTML = '<option value="">-- Primero selecciona un curso --</option>' + state.courses.map(course =>
    `<option value="${course.id}">${escapeHtml(course.nombre || '')}</option>`
  ).join('');

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
      if (selectedCount) selectedCount.textContent = `Seleccionados: ${state.enrollmentCreateSelected.size}`;
    }
  };

  const selectAllButton = document.getElementById('btn-select-all-participants');
  if (selectAllButton) {
    selectAllButton.onclick = () => {
      const visible = Array.from(participantsContainer.querySelectorAll('.participant-select'));
      visible.forEach(input => {
        input.checked = true;
        state.enrollmentCreateSelected.add(String(input.value));
      });
      if (selectedCount) selectedCount.textContent = `Seleccionados: ${state.enrollmentCreateSelected.size}`;
    };
  }

  openModal('modal-enrollment');
};

// ─────────────────────────────────────────
// Edit Enrollment Modal
// ─────────────────────────────────────────
const renderEnrollmentEditCurrentList = () => {
  const container = document.getElementById('enrollment-current-list');
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
  const container = document.getElementById('enrollment-add-participants-container');
  if (!container) return;
  const currentIds = new Set(state.enrollmentEditCurrent.map(item => String(item.participante_id)));
  const filtered = state.enrollmentEditAvailable.filter(participant => {
    if (currentIds.has(String(participant.id))) return false;
    if (!query.trim()) return true;
    return [participant.dni, participant.nombres].filter(Boolean)
      .some(value => String(value).toLowerCase().includes(query.trim().toLowerCase()));
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
      </label>`;
  }).join('');

  container.onchange = (event) => {
    const target = event.target;
    if (target && target.classList.contains('enrollment-edit-select')) {
      if (target.checked) state.enrollmentEditSelected.add(String(target.value));
      else state.enrollmentEditSelected.delete(String(target.value));
    }
  };
};

export const openEnrollmentEditModal = async (courseId) => {
  state.enrollmentEditCourseId = courseId;
  state.enrollmentEditSelected = new Set();

  const [course, currentEnrollments, participants] = await Promise.all([
    apiFetch(`/api/cursos/${courseId}`),
    apiFetch(`/api/matriculas/by-course/${courseId}`),
    apiFetch('/api/participantes')
  ]);

  state.enrollmentEditCurrent = Array.isArray(currentEnrollments) ? currentEnrollments : [];
  state.enrollmentEditAvailable = Array.isArray(participants) ? participants : [];

  const titleEl = document.getElementById('modal-enrollment-edit-title');
  if (titleEl) titleEl.textContent = `Editar Matrícula — ${course?.nombre || ''}`;

  const hiddenId = document.getElementById('enrollment-edit-curso-id');
  if (hiddenId) hiddenId.value = courseId;

  renderEnrollmentEditCurrentList();
  renderEnrollmentEditAvailableList('');

  const searchInput = document.getElementById('enrollment-edit-search');
  if (searchInput) {
    searchInput.oninput = () => {
      state.enrollmentEditQuery = searchInput.value;
      renderEnrollmentEditAvailableList(state.enrollmentEditQuery);
    };
  }

  const currentList = document.getElementById('enrollment-current-list');
  if (currentList) {
    currentList.onclick = async (event) => {
      const target = event.target.closest('.btn-remove-enrollment');
      if (!target) return;
      if (!confirm('¿Desea quitar este alumno de la matrícula?')) return;
      await apiFetch(`/api/matriculas/${target.dataset.id}`, { method: 'DELETE' });
      showToast('Matrícula eliminada correctamente');
      await openEnrollmentEditModal(courseId);
      await loadEnrollments();
    };
  }

  const addButton = document.getElementById('btn-enrollment-add-selected');
  if (addButton) {
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
  }

  const doneBtn = document.getElementById('btn-enrollment-edit-done');
  if (doneBtn) doneBtn.onclick = () => closeModal('modal-enrollment-edit');

  openModal('modal-enrollment-edit');
};
