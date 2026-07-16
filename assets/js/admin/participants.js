import { el, escapeHtml, formatDate, apiFetch, showToast, showConfirmModal, openModal, resetForm } from './utils.js';
import { state } from './state.js';

export const openParticipantModal = (participant = null) => {
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

export const renderParticipants = () => {
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
      if (!await showConfirmModal('Eliminar Alumno', '¿Está seguro de eliminar este alumno? Esta acción no se puede deshacer.')) return;
      await apiFetch(`/api/participantes/${button.dataset.id}`, { method: 'DELETE' });
      showToast('Alumno eliminado correctamente');
      await loadParticipants();
    });
  });
};

export const loadParticipants = async () => {
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
