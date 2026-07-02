import { el, escapeHtml, formatDate, apiFetch, showToast } from './utils.js';
import { state } from './state.js';

export const loadCertificates = async () => {
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
