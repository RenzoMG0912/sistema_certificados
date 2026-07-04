import { el, escapeHtml, formatDate, apiFetch, showToast, openModal, closeModal } from './utils.js';
import { state } from './state.js';

// Helper to format date short (e.g. 30/06/2026)
const formatDateShort = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Calculate status for each certificate
const getCertificateStatus = (cert) => {
  if (!cert.fecha_vencimiento) return 'VIGENTE';
  const now = new Date();
  const expiry = new Date(cert.fecha_vencimiento);
  if (expiry < now) return 'VENCIDO';

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);
  if (expiry <= thirtyDaysFromNow) return 'POR VENCER';

  return 'VIGENTE';
};

// Populate the course select dropdown for filtering
const populateCourseFilterSelect = () => {
  const select = el('filter-cert-course');
  if (!select) return;

  // Extract unique course names from state.certificates
  const courses = Array.from(new Set(state.certificates.map(c => c.curso_nombre).filter(Boolean))).sort();
  select.innerHTML = '<option value="">Todos los cursos</option>' + courses.map(course =>
    `<option value="${escapeHtml(course)}">${escapeHtml(course)}</option>`
  ).join('');
};

// Main render function for certificates list
export const renderCertificates = () => {
  const list = el('certificates-list');
  if (!list) return;

  const query = (state.certQuery || '').trim().toLowerCase();
  const courseFilter = state.certCourseFilter || '';
  const dateFilter = state.certDateFilter || '';

  // 1. Filter certificates
  let filtered = state.certificates;

  // Search input filter
  if (query) {
    filtered = filtered.filter(cert =>
      [cert.codigo, cert.alumno_dni, cert.alumno_nombre, cert.curso_nombre]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(query))
    );
  }

  // Course dropdown filter
  if (courseFilter) {
    filtered = filtered.filter(cert => cert.curso_nombre === courseFilter);
  }

  // Date range dropdown filter
  if (dateFilter) {
    const now = new Date();
    const daysAgo = Number(dateFilter);
    const limitDate = new Date();
    limitDate.setDate(now.getDate() - daysAgo);

    filtered = filtered.filter(cert => {
      if (!cert.fecha_emision) return false;
      const issue = new Date(cert.fecha_emision);
      return issue >= limitDate && issue <= now;
    });
  }

  const totalFiltered = filtered.length;

  // 2. Pagination Math
  const totalPages = Math.max(1, Math.ceil(totalFiltered / state.certPageSize));
  if (state.certPage > totalPages) {
    state.certPage = totalPages;
  }

  const startIdx = (state.certPage - 1) * state.certPageSize;
  const endIdx = Math.min(startIdx + state.certPageSize, totalFiltered);
  const visibleCertificates = filtered.slice(startIdx, endIdx);

  // 3. Render Table rows
  if (visibleCertificates.length === 0) {
    list.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-on-surface-variant">
      ${query || courseFilter || dateFilter ? 'No se encontraron certificados que coincidan con los filtros.' : 'No hay certificados registrados.'}
    </td></tr>`;
    el('cert-pagination-info').textContent = 'Mostrando 0 a 0 de 0 certificados';
    el('cert-pagination-controls').innerHTML = '';
    return;
  }

  list.innerHTML = visibleCertificates.map(cert => {
    const status = getCertificateStatus(cert);
    const badgeClass = status === 'VENCIDO'
      ? 'bg-red-50 text-red-700'
      : status === 'POR VENCER'
        ? 'bg-amber-50 text-amber-700 font-bold'
        : 'bg-emerald-50 text-emerald-700';

    return `
      <tr class="hover:bg-slate-50/50 transition-colors">
        <td class="px-6 py-3.5"><span class="font-bold text-slate-800">${escapeHtml(cert.codigo || '')}</span></td>
        <td class="px-6 py-3.5">
          <div class="font-bold text-on-surface">${escapeHtml(cert.alumno_nombre || '')}</div>
          <div class="text-xs text-on-surface-variant font-medium mt-0.5">${escapeHtml(cert.alumno_dni || '')}</div>
        </td>
        <td class="px-6 py-3.5 text-sm text-on-surface-variant">${escapeHtml(cert.curso_nombre || '')}</td>
        <td class="px-6 py-3.5 text-sm text-on-surface-variant">${formatDateShort(cert.fecha_emision)}</td>
        <td class="px-6 py-3.5 text-sm text-on-surface-variant">${formatDateShort(cert.fecha_vencimiento)}</td>
        <td class="px-6 py-3.5">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}">
            ${status}
          </span>
        </td>
        <td class="px-6 py-3.5">
          <div class="flex items-center gap-2">
            <!-- Red PDF button -->
            <a href="${escapeHtml(cert.pdf_path || '#')}" target="_blank" rel="noreferrer" class="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-red-600 hover:bg-slate-50 transition-all" title="Descargar / Ver PDF">
              <i class="fa-solid fa-file-pdf text-[15px]"></i>
            </a>

            <!-- Send email button -->
            <button type="button" class="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center ${cert.alumno_email ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-300 cursor-not-allowed'} transition-all btn-send-certificate" data-id="${cert.id}" title="${cert.alumno_email ? 'Enviar por correo' : 'Sin correo registrado'}" ${cert.alumno_email ? '' : 'disabled'}>
              <i class="fa-solid fa-envelope text-[15px]"></i>
            </button>

            <!-- Action dropdown toggle -->
            <div class="relative cert-actions-container">
              <button type="button" class="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-100 transition-all text-slate-400 btn-cert-menu-toggle" data-id="${cert.id}">
                <i class="fa-solid fa-ellipsis-vertical text-[14px]"></i>
              </button>
              <div class="hidden absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 cert-menu-dropdown" id="cert-menu-${cert.id}">
                <button type="button" class="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors btn-cert-details" data-id="${cert.id}">
                  Ver Detalle
                </button>
                <button type="button" class="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors btn-delete-certificate" data-id="${cert.id}">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // 4. Update Pagination Info Text
  el('cert-pagination-info').textContent = `Mostrando ${startIdx + 1} a ${endIdx} de ${totalFiltered} certificados`;

  // 5. Render Pagination Controls
  let controls = '';
  // Prev button
  controls += `
    <button type="button" class="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all" id="cert-page-prev" ${state.certPage === 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
      <span class="material-symbols-outlined text-[18px]">chevron_left</span>
    </button>`;

  // Numbered buttons with ellipsis
  const range = 2; // how many buttons around current page
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= state.certPage - range && i <= state.certPage + range)) {
      controls += `
        <button type="button" class="w-8 h-8 rounded-lg border text-xs font-bold transition-all ${i === state.certPage ? 'bg-primary border-primary text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}" data-page="${i}">
          ${i}
        </button>`;
    } else if (i === 2 || i === totalPages - 1) {
      controls += `<span class="px-1 text-slate-400 text-xs">...</span>`;
    }
  }

  // Next button
  controls += `
    <button type="button" class="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all" id="cert-page-next" ${state.certPage === totalPages ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
      <span class="material-symbols-outlined text-[18px]">chevron_right</span>
    </button>`;

  el('cert-pagination-controls').innerHTML = controls;

  // 6. Bind events to controls
  el('cert-pagination-controls').querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.certPage = Number(btn.dataset.page);
      renderCertificates();
    });
  });

  el('cert-page-prev')?.addEventListener('click', () => {
    if (state.certPage > 1) {
      state.certPage--;
      renderCertificates();
    }
  });

  el('cert-page-next')?.addEventListener('click', () => {
    if (state.certPage < totalPages) {
      state.certPage++;
      renderCertificates();
    }
  });

  // 7. Bind floating actions menu toggles
  list.querySelectorAll('.btn-cert-menu-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      // Close all open dropdowns first
      document.querySelectorAll('.cert-menu-dropdown').forEach(d => {
        if (d.id !== `cert-menu-${id}`) d.classList.add('hidden');
      });
      // Toggle current
      const drop = el(`cert-menu-${id}`);
      drop?.classList.toggle('hidden');
    });
  });

  // Bind menu option actions (Ver Detalles)
  list.querySelectorAll('.btn-cert-details').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      el(`cert-menu-${btn.dataset.id}`)?.classList.add('hidden');
      const cert = state.certificates.find(c => String(c.id) === btn.dataset.id);
      if (cert) {
        el('cert-detail-codigo').textContent = cert.codigo || '—';
        el('cert-detail-hash').textContent = cert.hash || '—';
        el('cert-detail-alumno').textContent = cert.alumno_nombre || '—';
        el('cert-detail-dni').textContent = cert.alumno_dni || '—';
        el('cert-detail-curso').textContent = cert.curso_nombre || '—';
        el('cert-detail-emision').textContent = formatDateShort(cert.fecha_emision);
        el('cert-detail-vencimiento').textContent = formatDateShort(cert.fecha_vencimiento);
        el('cert-detail-created').textContent = formatDateShort(cert.created_at);
        const status = getCertificateStatus(cert);
        const badgeClass = status === 'VENCIDO' ? 'bg-red-50 text-red-700' : status === 'POR VENCER' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700';
        el('cert-detail-status').innerHTML = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}">${status}</span>`;
        el('cert-detail-pdf').href = cert.pdf_path || '#';
        openModal('modal-certificate-detail');
      }
    });
  });

  // Bind menu option actions (Eliminar)
  list.querySelectorAll('.btn-delete-certificate').forEach(button => {
    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      el(`cert-menu-${button.dataset.id}`)?.classList.add('hidden');
      if (!confirm('¿Eliminar este certificado?')) return;
      try {
        await apiFetch(`/api/certificados/${button.dataset.id}`, { method: 'DELETE' });
        showToast('Certificado eliminado correctamente');
        await loadCertificates();
      } catch (err) {
        showToast(err.message || 'Error al eliminar certificado', 'error');
      }
    });
  });

  // Bind send email buttons
  list.querySelectorAll('.btn-send-certificate').forEach(button => {
    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      const certId = button.dataset.id;
      const cert = state.certificates.find(c => String(c.id) === certId);
      if (!cert) return;
      if (!cert.alumno_email) {
        showToast('Este participante no tiene correo registrado', 'error');
        return;
      }
      if (!confirm(`Enviar certificado a ${cert.alumno_email}?`)) return;
      button.disabled = true;
      button.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-[15px]"></i>';
      try {
        await apiFetch(`/api/certificados/${certId}/send`, { method: 'POST' });
        showToast(`Certificado enviado a ${cert.alumno_email}`);
      } catch (err) {
        showToast(err.message || 'Error al enviar correo', 'error');
      } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fa-solid fa-envelope text-[15px]"></i>';
      }
    });
  });
};

// Global click handler to close dropdowns if clicked outside
document.addEventListener('click', () => {
  document.querySelectorAll('.cert-menu-dropdown').forEach(d => d.classList.add('hidden'));
});

// Load certificates API and perform stats calculations
export const loadCertificates = async () => {
  const list = el('certificates-list');
  if (!list) return;
  list.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-on-surface-variant">Cargando...</td></tr>';
  
  const certificates = await apiFetch('/api/certificados');
  state.certificates = Array.isArray(certificates) ? certificates : [];

  // Calculate Certificate Stats
  const total = state.certificates.length;
  
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  const expiredCount = state.certificates.filter(cert => {
    if (!cert.fecha_vencimiento) return false;
    return new Date(cert.fecha_vencimiento) < now;
  }).length;

  const soonCount = state.certificates.filter(cert => {
    if (!cert.fecha_vencimiento) return false;
    const expiry = new Date(cert.fecha_vencimiento);
    return expiry >= now && expiry <= thirtyDaysFromNow;
  }).length;

  const activeCount = state.certificates.filter(cert => {
    if (!cert.fecha_vencimiento) return true;
    const expiry = new Date(cert.fecha_vencimiento);
    return expiry > thirtyDaysFromNow;
  }).length;

  const activePct = total > 0 ? ((activeCount / total) * 100).toFixed(1) : '0.0';

  // Set values to DOM elements
  const setVal = (id, val) => { const e = el(id); if (e) e.textContent = val; };
  setVal('cert-stat-total', total);
  setVal('cert-stat-active', activeCount);
  setVal('cert-stat-active-pct', `${activePct}% del total`);
  setVal('cert-stat-soon', soonCount);
  setVal('cert-stat-expired', expiredCount);

  // Populate dropdown lists once
  populateCourseFilterSelect();

  renderCertificates();
};
