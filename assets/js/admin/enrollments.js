import { el, escapeHtml, formatDate, apiFetch, showToast, showConfirmModal, openModal, resetForm, closeModal } from './utils.js';
import { state } from './state.js';

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
const PAGE_SIZE = 5; // alumnos visibles por curso antes del "ver todos"

const parseLocalDate = (value) => {
  if (!value) return null;
  const str = String(value).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDateShort = (value) => {
  const d = parseLocalDate(value);
  if (!d) return '—';
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const isEnrollmentActive = (enrollment) => {
  if (!enrollment.fecha_fin) return true;
  const fin = parseLocalDate(enrollment.fecha_fin);
  if (!fin) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return fin >= today;
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

    // Group enrollments by edition
    const editionMap = {};
    (group.enrollments || []).forEach(item => {
      const eid = String(item.edicion_id);
      if (!editionMap[eid]) {
        editionMap[eid] = {
          edicion_id: eid,
          codigo_edicion: item.codigo_edicion || '—',
          fecha_inicio: item.fecha_inicio,
          fecha_fin: item.fecha_fin,
          enrollments: []
        };
      }
      editionMap[eid].enrollments.push(item);
    });
    const editions = Object.values(editionMap);
    const total = (group.enrollments || []).length;

    const editionPanels = editions.map(ed => {
      const eid = ed.edicion_id;
      const showAll = state.showAllStudents.has(`e-${eid}`);
      const visible = showAll ? ed.enrollments : ed.enrollments.slice(0, PAGE_SIZE);

      const studentRows = visible.map((item, idx) => {
        const active = isEnrollmentActive(item);
        return `
          <tr class="hover:bg-slate-50/60 transition-colors">
            <td class="pl-8 pr-4 py-3 text-xs text-slate-400 font-medium w-10">${idx + 1}</td>
            <td class="px-4 py-3">
              <span class="text-sm font-semibold text-on-surface">${escapeHtml(item.alumno_nombre || '')}</span>
            </td>
            <td class="px-4 py-3 text-sm text-on-surface-variant">${escapeHtml(item.alumno_dni || '—')}</td>
            <td class="px-4 py-3 text-sm text-on-surface-variant">${formatDateShort(ed.fecha_inicio)}</td>
            <td class="px-4 py-3 text-sm text-on-surface-variant">${formatDateShort(ed.fecha_fin)}</td>
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

      const paginationRow = !showAll && ed.enrollments.length > PAGE_SIZE ? `
        <tr>
          <td colspan="7" class="pl-8 pr-6 py-3.5 border-t border-slate-100 bg-slate-50/20">
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">Mostrando 1 a ${Math.min(PAGE_SIZE, ed.enrollments.length)} de ${ed.enrollments.length} alumnos</span>
              <button type="button"
                class="btn-show-all-students inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                data-edicion-id="${eid}">
                <span class="material-symbols-outlined text-[16px] text-slate-500">groups</span>
                Ver todos los alumnos (${ed.enrollments.length})
                <span class="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
              </button>
            </div>
          </td>
        </tr>` : (showAll && ed.enrollments.length > PAGE_SIZE ? `
        <tr>
          <td colspan="7" class="pl-8 pr-6 py-3.5 border-t border-slate-100 bg-slate-50/20">
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">Mostrando todos los ${ed.enrollments.length} alumnos</span>
              <button type="button"
                class="btn-hide-all-students inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                data-edicion-id="${eid}">
                <span class="material-symbols-outlined text-[16px] text-slate-400">expand_less</span>
                Mostrar menos
              </button>
            </div>
          </td>
        </tr>` : '');

      return `
        <div class="border-t border-slate-100 bg-white">
          <!-- Edition Sub-header -->
          <div class="flex items-center justify-between px-6 py-2.5 bg-slate-50/70 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px] text-slate-400">layers</span>
              <span class="text-xs font-semibold text-slate-600 uppercase tracking-wider">${escapeHtml(ed.codigo_edicion)}</span>
              <span class="text-[11px] text-slate-400">${formatDateShort(ed.fecha_inicio)} — ${formatDateShort(ed.fecha_fin)}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-emerald-600 mr-1">${ed.enrollments.length}</span>
              <span class="text-[10px] text-slate-400 mr-2">alumnos</span>
              <button type="button" class="btn-icon btn-bulk-generate-certs text-slate-500 hover:text-primary transition-colors" data-edicion-id="${eid}" title="Emitir certificados para esta edición">
                <span class="material-symbols-outlined text-[16px]">workspace_premium</span>
              </button>
              <button type="button" class="btn-icon btn-delete btn-delete-all-enrollments text-slate-500 hover:text-red-600 transition-colors" data-edicion-id="${eid}" title="Eliminar todas las matrículas de esta edición">
                <i class="fa-solid fa-trash text-[11px]"></i>
              </button>
            </div>
          </div>
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
    }).join('');

    const maxHeightStyle = isExpanded ? 'max-height: none;' : 'max-height: 0px;';

    return `
      <div class="enrollment-accordion-item bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm my-3" data-course-id="${courseId}">
        <!-- Course Header Row -->
        <div class="enrollment-course-header flex items-center gap-3 px-6 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer" data-toggle-course="${courseId}">
          <button type="button" class="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center shrink-0 transition-all hover:bg-slate-100" data-toggle-course="${courseId}">
            <span class="chevron-left material-symbols-outlined text-[18px] text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}">chevron_right</span>
          </button>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm text-on-surface">${escapeHtml(group.curso_nombre || '')}</p>
            <p class="text-xs text-on-surface-variant mt-0.5">
              Entrenador: ${escapeHtml(group.curso_entrenador || 'N/A')}
              ${group.curso_duracion ? `<span class="mx-1.5 opacity-30">•</span> Duración: ${escapeHtml(group.curso_duracion)}` : ''}
              <span class="mx-1.5 opacity-30">•</span> Ediciones: ${editions.length}
            </p>
          </div>
          <div class="text-right shrink-0 mr-4">
            <p class="text-base font-bold text-emerald-600 leading-none">${total}</p>
            <p class="text-[11px] text-on-surface-variant mt-0.5">Alumnos</p>
          </div>
          <div class="flex items-center gap-1.5 shrink-0" onclick="event.stopPropagation()">
            <button type="button" class="btn-icon btn-edit-enrollment text-slate-500 hover:text-primary transition-colors border border-slate-200 bg-white hover:bg-slate-50" data-course-id="${courseId}" title="Editar matrícula">
              <i class="fa-solid fa-pen text-[12px]"></i>
            </button>
            <button type="button" class="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 transition-all text-slate-500" data-toggle-course="${courseId}" title="${isExpanded ? 'Colapsar' : 'Expandir'}">
              <span class="chevron-right material-symbols-outlined text-[18px] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}">expand_more</span>
            </button>
          </div>
        </div>

        <!-- Expandable inner container with edition panels -->
        <div class="accordion-collapse-container" style="${maxHeightStyle}">
          ${editionPanels}
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

  // ── Bind bulk generate certificates buttons ──
  container.querySelectorAll('.btn-bulk-generate-certs').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const edicionId = btn.dataset.edicionId;
      if (!edicionId) return;

      // Find the edition info from state
      let editionName = 'esta edición';
      let studentCount = 0;
      for (const g of state.enrollments) {
        const ed = (g.enrollments || []).find(item => String(item.edicion_id) === edicionId);
        if (ed) {
          editionName = `${g.curso_nombre} — ${ed.codigo_edicion || 'Edición ' + edicionId}`;
          studentCount = (g.enrollments || []).filter(item => String(item.edicion_id) === edicionId).length;
          break;
        }
      }
      
      if (studentCount === 0) {
        showToast('No hay alumnos matriculados en esta edición', 'warning');
        return;
      }

      if (!await showConfirmModal(
        'Confirmar Envío de Certificados',
        `¿Está seguro de que desea generar y enviar los certificados digitales a todos los estudiantes de "${editionName}"? Esta acción notificará automáticamente a los alumnos por correo electrónico.`,
        'Sí, enviar ahora',
        'Cancelar',
        'info',
        {
          badge: {
            icon: 'fa-solid fa-users',
            text: `TOTAL DE ALUMNOS: ${studentCount}`
          },
          confirmIcon: 'fa-solid fa-paper-plane'
        }
      )) {
        return;
      }

      btn.disabled = true;
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-[14px]"></i>`;

      try {
        const res = await apiFetch('/api/certificados/bulk-generate', {
          method: 'POST',
          body: JSON.stringify({ edicion_id: Number(edicionId) })
        });

        if (res.success) {
          showToast(res.message || 'Certificados emitidos y enviados correctamente');
        } else {
          showToast(res.message || 'Error al emitir certificados', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Error en emisión masiva', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    });
  });

  // ── Bind edit buttons ──
  container.querySelectorAll('.btn-edit-enrollment').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEnrollmentEditModal(btn.dataset.courseId);
    });
  });

  // ── Bind delete all enrollments by edition buttons ──
  container.querySelectorAll('.btn-delete-all-enrollments').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const edicionId = btn.dataset.edicionId;
      if (!edicionId) return;

      let editionName = 'esta edición';
      let studentCount = 0;
      for (const g of state.enrollments) {
        const ed = (g.enrollments || []).find(item => String(item.edicion_id) === edicionId);
        if (ed) {
          editionName = `${g.curso_nombre} — ${ed.codigo_edicion || 'Edición ' + edicionId}`;
          studentCount = (g.enrollments || []).filter(item => String(item.edicion_id) === edicionId).length;
          break;
        }
      }

      if (studentCount === 0) {
        showToast('No hay alumnos matriculados en esta edición', 'warning');
        return;
      }

      if (!await showConfirmModal(
        'Eliminar Matrículas de Edición',
        `¿Está seguro de eliminar TODAS las matrículas de los alumnos de "${editionName}"? Esta acción eliminará también los certificados vinculados y no se puede deshacer.`,
        'Sí, eliminar',
        'Cancelar',
        'danger',
        {
          badge: {
            icon: 'fa-solid fa-users',
            text: `TOTAL DE ALUMNOS: ${studentCount}`
          },
          confirmIcon: 'fa-solid fa-trash'
        }
      )) {
        return;
      }

      btn.disabled = true;
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-[12px]"></i>`;

      try {
        const res = await apiFetch(`/api/matriculas/by-edicion/${edicionId}`, {
          method: 'DELETE'
        });

        if (res.success) {
          showToast(res.message || 'Todas las matrículas han sido eliminadas correctamente');
          await loadEnrollments();
        } else {
          showToast(res.message || 'Error al eliminar matrículas', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Error al eliminar matrículas', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    });
  });

  // ── Bind show-all-students ──
  container.querySelectorAll('.btn-show-all-students').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const eid = btn.dataset.edicionId;
      state.showAllStudents.add(`e-${eid}`);
      renderEnrollments();
      const itemEl = container.querySelector(`.enrollment-accordion-item`);
      if (itemEl) {
        const collapseEl = itemEl.querySelector('.accordion-collapse-container');
        if (collapseEl) collapseEl.style.maxHeight = 'none';
      }
    });
  });

  // ── Bind hide-all-students ──
  container.querySelectorAll('.btn-hide-all-students').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const eid = btn.dataset.edicionId;
      state.showAllStudents.delete(`e-${eid}`);
      renderEnrollments();
      const itemEl = container.querySelector(`.enrollment-accordion-item`);
      if (itemEl) {
        const collapseEl = itemEl.querySelector('.accordion-collapse-container');
        if (collapseEl) collapseEl.style.maxHeight = 'none';
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
          el('participant-detail-name').textContent = part.nombres || '—';
          el('participant-detail-dni').textContent = part.dni || '—';
          el('participant-detail-email').textContent = part.email || '—';
          el('participant-detail-cargo').textContent = part.cargo || '—';
          el('participant-detail-phone').textContent = part.telefono || '—';
          el('participant-detail-origin').textContent = part.procedencia || '—';
          el('participant-detail-induccion').textContent = part.induccion || '—';
          el('participant-detail-examen').textContent = part.examen_medico || '—';
          openModal('modal-participant-details');
        }
      }
    });
  });

  // ── Bind remove student from enrollment ──
  container.querySelectorAll('.btn-remove-enrollment-student').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!await showConfirmModal('Quitar Alumno', '¿Deseas quitar este alumno de la matrícula?')) return;
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

  const editionSelect = document.getElementById('enrollment-edicion');
  if (editionSelect) editionSelect.innerHTML = '<option value="">-- Primero selecciona un curso --</option>';
  renderEnrollmentCourseDetails(null);
  renderEnrollmentParticipantList('enrollment-participants-container', '', state.enrollmentCreateSelected);
  if (selectedCount) selectedCount.textContent = 'Selecciona los alumnos que deseas matricular en este curso.';

  courseSelect.onchange = async () => {
    const course = state.courses.find(item => String(item.id) === courseSelect.value);
    renderEnrollmentCourseDetails(course || null);
    if (editionSelect) {
      if (!course) {
        editionSelect.innerHTML = '<option value="">-- Primero selecciona un curso --</option>';
        return;
      }
      editionSelect.innerHTML = '<option value="">Cargando ediciones...</option>';
      try {
        const editions = await apiFetch(`/api/ediciones/by-curso/${course.id}`);
        if (Array.isArray(editions) && editions.length > 0) {
          editionSelect.innerHTML = '<option value="">-- Seleccionar edición --</option>' +
            editions.map(e =>
              `<option value="${e.id}">${escapeHtml(e.codigo_edicion || 'Edición ' + e.id)} (${e.fecha_inicio || ''} — ${e.fecha_fin || ''})</option>`
            ).join('');
        } else {
          editionSelect.innerHTML = '<option value="">— No hay ediciones para este curso —</option>';
        }
      } catch (err) {
        editionSelect.innerHTML = '<option value="">— Error al cargar ediciones —</option>';
      }
    }
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
// ─────────────────────────────────────────
// Edit Enrollment Modal
// ─────────────────────────────────────────
const renderEnrollmentEditCurrentList = () => {
  const container = document.getElementById('enrollment-current-list');
  if (!container) return;
  const activeEnrollments = state.enrollmentEditCurrent.filter(item => !state.enrollmentEditToRemove.has(String(item.id)));
  if (activeEnrollments.length === 0) {
    container.innerHTML = '<p class="text-sm text-slate-400">No hay alumnos matriculados en este curso.</p>';
    return;
  }
  container.innerHTML = activeEnrollments.map(item => `
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
  const currentIds = new Set(
    state.enrollmentEditCurrent
      .filter(item => !state.enrollmentEditToRemove.has(String(item.id)))
      .map(item => String(item.participante_id))
  );
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
      const participantId = String(target.value);
      const originalEnrollment = state.enrollmentEditCurrent.find(item => String(item.participante_id) === participantId);
      
      if (target.checked) {
        if (originalEnrollment) {
          state.enrollmentEditToRemove.delete(String(originalEnrollment.id));
        } else {
          state.enrollmentEditSelected.add(participantId);
        }
      } else {
        if (originalEnrollment) {
          state.enrollmentEditToRemove.add(String(originalEnrollment.id));
        } else {
          state.enrollmentEditSelected.delete(participantId);
        }
      }
      renderEnrollmentEditCurrentList();
      renderEnrollmentEditAvailableList(state.enrollmentEditQuery || '');
    }
  };
};

export const openEnrollmentEditModal = async (courseId) => {
  const saveButton = document.getElementById('btn-enrollment-edit-save');
  if (saveButton) {
    saveButton.disabled = false;
    saveButton.textContent = 'Guardar';
  }

  state.enrollmentEditCourseId = courseId;
  state.enrollmentEditSelected = new Set();
  state.enrollmentEditToRemove = new Set();
  state.enrollmentEditQuery = '';

  const [course, editions, participants] = await Promise.all([
    apiFetch(`/api/cursos/${courseId}`),
    apiFetch(`/api/ediciones/by-curso/${courseId}`),
    apiFetch('/api/participantes')
  ]);

  state.ediciones = Array.isArray(editions) ? editions : [];

  const editionSelect = document.getElementById('enrollment-edit-edicion');
  if (editionSelect) {
    if (state.ediciones.length === 0) {
      editionSelect.innerHTML = '<option value="">— No hay ediciones —</option>';
    } else {
      editionSelect.innerHTML = '<option value="">-- Seleccionar edición --</option>' +
        state.ediciones.map(e =>
          `<option value="${e.id}">${escapeHtml(e.codigo_edicion || 'Edición ' + e.id)} (${e.fecha_inicio || ''} — ${e.fecha_fin || ''})</option>`
        ).join('');
    }

    editionSelect.onchange = async () => {
      const edId = editionSelect.value;
      if (!edId) {
        state.enrollmentEditCurrent = [];
        state.enrollmentEditSelected = new Set();
        state.enrollmentEditToRemove = new Set();
        renderEnrollmentEditCurrentList();
        renderEnrollmentEditAvailableList(state.enrollmentEditQuery || '');
        return;
      }
      state.enrollmentEditEdicionId = Number(edId);
      const currentEnrollments = await apiFetch(`/api/matriculas/by-edicion/${edId}`);
      state.enrollmentEditCurrent = Array.isArray(currentEnrollments) ? currentEnrollments : [];
      state.enrollmentEditSelected = new Set();
      state.enrollmentEditToRemove = new Set();
      renderEnrollmentEditCurrentList();
      renderEnrollmentEditAvailableList(state.enrollmentEditQuery || '');
    };
  }

  state.enrollmentEditAvailable = Array.isArray(participants) ? participants : [];

  const titleEl = document.getElementById('modal-enrollment-edit-title');
  if (titleEl) titleEl.textContent = `Editar Matrícula — ${course?.nombre || ''}`;

  const hiddenId = document.getElementById('enrollment-edit-curso-id');
  if (hiddenId) hiddenId.value = courseId;

  renderEnrollmentEditCurrentList();
  renderEnrollmentEditAvailableList('');

  const searchInput = document.getElementById('enrollment-edit-search');
  if (searchInput) {
    searchInput.value = '';
    searchInput.oninput = () => {
      state.enrollmentEditQuery = searchInput.value;
      renderEnrollmentEditAvailableList(state.enrollmentEditQuery);
    };
  }

  const currentList = document.getElementById('enrollment-current-list');
  if (currentList) {
    currentList.onclick = (event) => {
      const target = event.target.closest('.btn-remove-enrollment');
      if (!target) return;
      const enrollmentId = String(target.dataset.id);
      state.enrollmentEditToRemove.add(enrollmentId);
      
      const enrollment = state.enrollmentEditCurrent.find(item => String(item.id) === enrollmentId);
      if (enrollment) {
        state.enrollmentEditSelected.delete(String(enrollment.participante_id));
      }

      renderEnrollmentEditCurrentList();
      renderEnrollmentEditAvailableList(state.enrollmentEditQuery || '');
    };
  }

  if (saveButton) {
    saveButton.onclick = async () => {
      const hasChanges = state.enrollmentEditToRemove.size > 0 || state.enrollmentEditSelected.size > 0;
      if (hasChanges) {
        saveButton.disabled = true;
        const originalText = saveButton.textContent;
        saveButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i>Guardando...`;

        try {
          if (state.enrollmentEditToRemove.size > 0) {
            const deletePromises = Array.from(state.enrollmentEditToRemove).map(id =>
              apiFetch(`/api/matriculas/${id}`, { method: 'DELETE' })
            );
            await Promise.all(deletePromises);
          }

          if (state.enrollmentEditSelected.size > 0 && state.enrollmentEditEdicionId) {
            await apiFetch('/api/matriculas/bulk', {
              method: 'POST',
              body: JSON.stringify({
                edicion_id: state.enrollmentEditEdicionId,
                participante_ids: Array.from(state.enrollmentEditSelected).map(id => Number(id))
              })
            });
          }

          showToast('Matrículas actualizadas correctamente');
        } catch (err) {
          showToast(err.message || 'Error al guardar matrículas', 'error');
          saveButton.disabled = false;
          saveButton.textContent = originalText;
          return;
        }
      }
      closeModal('modal-enrollment-edit');
      await loadEnrollments();
    };
  }

  const selectAllEditBtn = document.getElementById('btn-edit-select-all');
  if (selectAllEditBtn) {
    selectAllEditBtn.onclick = () => {
      const container = document.getElementById('enrollment-add-participants-container');
      if (!container) return;
      container.querySelectorAll('.enrollment-edit-select').forEach(input => {
        if (!input.checked) {
          input.checked = true;
          const participantId = String(input.value);
          const originalEnrollment = state.enrollmentEditCurrent.find(item => String(item.participante_id) === participantId);
          if (originalEnrollment) {
            state.enrollmentEditToRemove.delete(String(originalEnrollment.id));
          } else {
            state.enrollmentEditSelected.add(participantId);
          }
        }
      });
      renderEnrollmentEditCurrentList();
      renderEnrollmentEditAvailableList(state.enrollmentEditQuery || '');
    };
  }

  openModal('modal-enrollment-edit');
};
