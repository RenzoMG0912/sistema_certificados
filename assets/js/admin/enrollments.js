import { el, escapeHtml, apiFetch, showToast, openModal, resetForm, closeModal } from './utils.js';
import { state } from './state.js';

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

export const loadEnrollments = async () => {
  const list = el('enrollments-list');
  if (!list) return;
  list.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-on-surface-variant">Cargando...</td></tr>';
  const enrollments = await apiFetch('/api/matriculas/grouped');
  state.enrollments = Array.isArray(enrollments) ? enrollments : [];

  // Calculate enrollment stats
  const coursesCount = state.enrollments.length;
  const totalEnrollments = state.enrollments.reduce((sum, g) => sum + (g.enrollments?.length || 0), 0);
  const avgEnrollments = coursesCount > 0 ? (totalEnrollments / coursesCount).toFixed(1) : 0;

  if (el('enrollment-stat-courses')) el('enrollment-stat-courses').textContent = coursesCount;
  if (el('enrollment-stat-total')) el('enrollment-stat-total').textContent = totalEnrollments;
  if (el('enrollment-stat-avg')) el('enrollment-stat-avg').textContent = avgEnrollments;

  const query = (el('search-enrollment-query')?.value || '').trim().toLowerCase();
  const filtered = state.enrollments.filter(group => {
    if (!query) return true;
    const matchCourse = [group.curso_nombre, group.curso_codigo].filter(Boolean).some(v => String(v).toLowerCase().includes(query));
    if (matchCourse) return true;
    return (group.enrollments || []).some(item => 
      [item.alumno_nombre, item.alumno_dni].filter(Boolean).some(v => String(v).toLowerCase().includes(query))
    );
  });

  if (filtered.length === 0) {
    list.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-on-surface-variant">No hay matrículas registradas.</td></tr>';
    return;
  }

  list.innerHTML = filtered.map(group => `
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

export { openEnrollmentCreateModal, openEnrollmentEditModal };
