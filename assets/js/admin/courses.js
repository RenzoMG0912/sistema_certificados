import { el, escapeHtml, apiFetch, showToast, showConfirmModal, openModal, resetForm } from './utils.js';
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

const getCategoryBadgeClass = (category) => {
  const cat = (category || '').toLowerCase().trim();
  if (cat.includes('seguridad')) return 'bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full text-xs font-semibold';
  if (cat.includes('operacion') || cat.includes('operaciones')) return 'bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-full text-xs font-semibold';
  if (cat.includes('salud') || cat.includes('ocupacional')) return 'bg-purple-50 text-purple-600 border border-purple-100 px-2.5 py-1 rounded-full text-xs font-semibold';
  return 'bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-full text-xs font-semibold';
};

export const renderCourses = () => {
  const list = el('courses-list');
  const countLabel = el('courses-count-label');
  const pagesContainer = el('courses-pages');
  const prevButton = el('courses-prev');
  const nextButton = el('courses-next');
  if (!list) return;

  const query = (state.courseQuery || '').trim().toLowerCase();
  const filtered = state.courses.filter(course => {
    if (!query) return true;
    return [course.codigo_curso, course.nombre, course.duracion, course.categoria, course.entrenador]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(query));
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / state.coursePageSize));
  state.coursePage = Math.min(Math.max(1, state.coursePage), totalPages);
  const startIndex = (state.coursePage - 1) * state.coursePageSize;
  const pageItems = filtered.slice(startIndex, startIndex + state.coursePageSize);

  if (total === 0) {
    list.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-on-surface-variant">No hay cursos registrados.</td></tr>';
    if (countLabel) countLabel.textContent = 'Mostrando 0 de 0 cursos';
    if (pagesContainer) pagesContainer.innerHTML = '';
    if (prevButton) prevButton.disabled = true;
    if (nextButton) nextButton.disabled = true;
    return;
  }

  list.innerHTML = pageItems.map(course => `
    <tr>
      <td class="px-6 py-4"><code>${escapeHtml(course.codigo_curso || '')}</code></td>
      <td class="px-6 py-4"><strong>${escapeHtml(course.nombre || '')}</strong></td>
      <td class="px-6 py-4">${escapeHtml(course.duracion || '')}</td>
      <td class="px-6 py-4"><span class="${getCategoryBadgeClass(course.categoria)}">${escapeHtml(course.categoria || 'N/A')}</span></td>
      <td class="px-6 py-4">${escapeHtml(course.entrenador || 'N/A')}</td>
      <td class="px-6 py-4 text-center">
        <div class="flex items-center justify-center gap-2">
          <button type="button" class="btn-icon btn-edit-course" data-id="${course.id}" title="Editar"><i class="fa-solid fa-pen"></i></button>
          <button type="button" class="btn-icon btn-delete btn-delete-course" data-id="${course.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  const rangeStart = startIndex + 1;
  const rangeEnd = Math.min(startIndex + pageItems.length, total);
  if (countLabel) countLabel.textContent = `Mostrando ${rangeStart} a ${rangeEnd} de ${total} cursos`;
  
  if (prevButton && nextButton) {
    prevButton.disabled = state.coursePage === 1;
    nextButton.disabled = state.coursePage === totalPages;
    prevButton.classList.toggle('opacity-40', state.coursePage === 1);
    prevButton.classList.toggle('pointer-events-none', state.coursePage === 1);
    nextButton.classList.toggle('opacity-40', state.coursePage === totalPages);
    nextButton.classList.toggle('pointer-events-none', state.coursePage === totalPages);
  }

  if (pagesContainer) {
    pagesContainer.innerHTML = '';
    const createPageButton = (page) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(page);
      button.className = page === state.coursePage
        ? 'w-10 h-10 rounded-xl border border-primary bg-primary text-white font-semibold'
        : 'w-10 h-10 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors';
      button.addEventListener('click', () => {
        state.coursePage = page;
        renderCourses();
      });
      return button;
    };

    const maxButtons = 5;
    let startPage = Math.max(1, state.coursePage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    startPage = Math.max(1, endPage - maxButtons + 1);

    for (let page = startPage; page <= endPage; page += 1) {
      pagesContainer.appendChild(createPageButton(page));
    }
  }

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
      el('course-syllabus').value = course.temario || '';
      openModal('modal-course');
    });
  });

  list.querySelectorAll('.btn-delete-course').forEach(button => {
    button.addEventListener('click', async () => {
      if (!await showConfirmModal('Eliminar Curso', '¿Está seguro de eliminar este curso? Esta acción no se puede deshacer.')) return;
      await apiFetch(`/api/cursos/${button.dataset.id}`, { method: 'DELETE' });
      showToast('Curso eliminado correctamente');
      await loadCourses();
    });
  });
};

export const loadCourses = async () => {
  const list = el('courses-list');
  if (!list) return;
  list.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-on-surface-variant">Cargando...</td></tr>';

  const courses = await apiFetch('/api/cursos');
  state.courses = Array.isArray(courses) ? courses : [];

  // Update course stats
  const totalCourses = state.courses.length;
  const activeCourses = state.courses.filter(c => c.firma_id !== null && c.firma_id !== undefined).length;
  const activePct = totalCourses > 0 ? ((activeCourses / totalCourses) * 100).toFixed(1) : 0;
  
  const totalHours = state.courses.reduce((sum, c) => {
    const hrs = parseInt(c.duracion) || 0;
    return sum + hrs;
  }, 0);

  const uniqueTrainers = new Set(state.courses.map(c => c.entrenador).filter(Boolean)).size;

  if (el('course-stat-total')) el('course-stat-total').textContent = totalCourses;
  if (el('course-stat-active')) el('course-stat-active').textContent = activeCourses;
  if (el('course-stat-active-pct')) el('course-stat-active-pct').textContent = `${activePct}% del total`;
  if (el('course-stat-hours')) el('course-stat-hours').textContent = totalHours;
  if (el('course-stat-trainers')) el('course-stat-trainers').textContent = uniqueTrainers;

  state.coursePage = 1;
  renderCourses();
};
