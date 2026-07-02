import { el, escapeHtml, apiFetch, showToast, openModal, resetForm, readFileAsDataURL } from './utils.js';
import { state } from './state.js';
import { populateCourseTrainerSelect } from './courses.js';

export const loadSignatures = async () => {
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
