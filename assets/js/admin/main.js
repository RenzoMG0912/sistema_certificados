import { el, showToast, apiFetch, openModal, resetForm, closeModal, bindModalClose, readFileAsDataURL } from './utils.js';
import { initTabs, setActiveTab, loadCurrentSection } from './ui.js';
import { loadCourses, populateCourseTrainerSelect, renderCourses } from './courses.js';
import { loadParticipants, openParticipantModal, renderParticipants } from './participants.js';
import { loadEnrollments, renderEnrollments, openEnrollmentCreateModal, openEnrollmentEditModal } from './enrollments.js';
import { loadCertificates, renderCertificates } from './certificates.js';
import { loadSignatures } from './signatures.js';
import { state } from './state.js';
import { initNotifications } from './notifications.js';

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

    matSelect.innerHTML = '<option value="">Selecciona una matrícula activa...</option>' + flatMatriculas.map(item => `<option value="${item.id}">${item.label}</option>`).join('');
    sig1.innerHTML = '<option value="">Seleccionar firma...</option>' + (Array.isArray(firmas) ? firmas : []).map(firma => `<option value="${firma.id}">${firma.nombre || ''}</option>`).join('');
    sig2.innerHTML = '<option value="">Ninguna</option>' + (Array.isArray(firmas) ? firmas : []).map(firma => `<option value="${firma.id}">${firma.nombre || ''}</option>`).join('');

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
      firma_id: firmaId,
      temario: el('course-syllabus').value.trim() || null
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

    const fechaInicio = el('enrollment-fecha-inicio')?.value || null;
    const fechaFin = el('enrollment-fecha-fin')?.value || null;

    await apiFetch('/api/matriculas/bulk', {
      method: 'POST',
      body: JSON.stringify({ curso_id: cursoId, participante_ids: selected, fecha_inicio: fechaInicio, fecha_fin: fechaFin })
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

  el('search-course-query')?.addEventListener('input', event => {
    state.courseQuery = event.target.value || '';
    state.coursePage = 1;
    renderCourses();
  });

  el('courses-prev')?.addEventListener('click', () => {
    if (state.coursePage > 1) {
      state.coursePage -= 1;
      renderCourses();
    }
  });

  el('courses-next')?.addEventListener('click', () => {
    const query = (state.courseQuery || '').trim().toLowerCase();
    const filtered = state.courses.filter(course => {
      if (!query) return true;
      return [course.codigo_curso, course.nombre, course.duracion, course.categoria, course.entrenador]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query));
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / state.coursePageSize));
    if (state.coursePage < totalPages) {
      state.coursePage += 1;
      renderCourses();
    }
  });

  el('search-enrollment-query')?.addEventListener('input', event => {
    state.enrollmentQuery = event.target.value || '';
    renderEnrollments();
  });

  el('btn-filter-enrollments')?.addEventListener('click', () => {
    el('search-enrollment-query')?.focus();
    showToast('Escribe para filtrar por curso, alumno o DNI', 'info');
  });

  el('search-cert-query')?.addEventListener('input', event => {
    state.certQuery = event.target.value || '';
    state.certPage = 1;
    renderCertificates();
  });

  el('filter-cert-course')?.addEventListener('change', event => {
    state.certCourseFilter = event.target.value || '';
    state.certPage = 1;
    renderCertificates();
  });

  el('filter-cert-date')?.addEventListener('change', event => {
    state.certDateFilter = event.target.value || '';
    state.certPage = 1;
    renderCertificates();
  });



  el('search-sig-query')?.addEventListener('input', () => {
    loadSignatures();
  });
};

const init = async () => {
  bindModalClose('modal-course');
  bindModalClose('modal-participant');
  bindModalClose('modal-enrollment');
  bindModalClose('modal-enrollment-edit');
  bindModalClose('modal-firma-preview');
  bindModalClose('modal-participant-details');
  bindModalClose('modal-certificate-detail');
  bindModalClose('modal-certificate');
  bindModalClose('modal-signature');

  initTabs();
  initModalButtons();
  initForms();

  if (!localStorage.getItem('admin_token')) {
    window.location.href = '/login';
    return;
  }

  const userData = localStorage.getItem('admin_user');
  if (userData && el('user-display')) {
    try {
      el('user-display').textContent = JSON.parse(userData).nombre || 'Administrador';
    } catch {
      el('user-display').textContent = 'Administrador';
    }
  }

  el('logout-btn')?.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/login';
  });

  setActiveTab('inicio');
  await loadCurrentSection('inicio');

  initNotifications();
};

document.addEventListener('DOMContentLoaded', init);
