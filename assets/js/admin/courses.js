import { el, escapeHtml, apiFetch, showToast, openModal, resetForm, closeModal } from './utils.js';
import { state } from './state.js';

export const populateCourseTrainerSelect = async (selectedFirmaId = '') => {
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

export const loadCourses = async () => {
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
