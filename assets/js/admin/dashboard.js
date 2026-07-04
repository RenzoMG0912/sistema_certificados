import { el, escapeHtml, formatDate, apiFetch } from './utils.js';
import { state } from './state.js';

export const loadDashboardStats = async () => {
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
    const parseLocal = (v) => {
      if (!v) return null;
      const m = String(v).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    const expiry = parseLocal(cert.fecha_vencimiento);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isExpired = expiry && expiry < today;
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
