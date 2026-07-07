import { el, apiFetch } from './utils.js';

let notifInterval = null;

export async function loadNotifications() {
  const [notifications, unreadData] = await Promise.all([
    apiFetch('/api/notificaciones/admin').catch(() => []),
    apiFetch('/api/notificaciones/admin/unread-count').catch(() => ({ count: 0 }))
  ]);

  updateBadge(unreadData?.count || 0);
  renderNotifications(Array.isArray(notifications) ? notifications : []);
}

function updateBadge(count) {
  const badge = el('notif-badge');
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function renderNotifications(notifications) {
  const container = el('notif-list');
  if (!container) return;

  if (notifications.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-sm text-on-surface-variant">
        <span class="material-symbols-outlined text-3xl text-outline-variant mb-2 block">notifications_off</span>
        No hay notificaciones
      </div>`;
    return;
  }

  container.innerHTML = notifications.map(n => {
    const icons = {
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
      info: 'info'
    };
    const icon = icons[n.tipo] || 'circle';
    const iconColors = {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-primary'
    };
    const iconColor = iconColors[n.tipo] || 'text-on-surface-variant';
    const bgClass = n.leida ? '' : 'bg-primary/5';

    return `
      <div class="px-4 py-3 hover:bg-surface-container transition-colors cursor-pointer ${bgClass} ${n.leida ? 'opacity-70' : ''}" data-notif-id="${n.id}" data-leida="${n.leida}">
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined text-[20px] mt-0.5 ${iconColor}">${icon}</span>
          <div class="flex-grow min-w-0">
            <p class="text-sm font-semibold text-on-surface truncate">${escapeHtml(n.titulo)}</p>
            <p class="text-xs text-on-surface-variant mt-0.5 line-clamp-2">${escapeHtml(n.mensaje || '')}</p>
            <p class="text-[10px] text-outline mt-1">${timeAgo(n.created_at)}</p>
          </div>
          ${!n.leida ? '<span class="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></span>' : ''}
        </div>
      </div>`;
  }).join('');

  container.querySelectorAll('[data-notif-id]').forEach(el => {
    el.addEventListener('click', async () => {
      const id = el.dataset.notifId;
      const leida = el.dataset.leida === '1';
      if (!leida) {
        await apiFetch(`/api/notificaciones/admin/${id}/read`, { method: 'PUT' }).catch(() => {});
        await loadNotifications();
      }
    });
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'ahora';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `hace ${diffHour}h`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `hace ${diffDay}d`;
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

function toggleDropdown() {
  const dropdown = el('notif-dropdown');
  if (!dropdown) return;
  const isHidden = dropdown.classList.contains('hidden');
  if (isHidden) {
    dropdown.classList.remove('hidden');
    loadNotifications();
  } else {
    dropdown.classList.add('hidden');
  }
}

export function initNotifications() {
  const btn = el('notif-btn');
  const dropdown = el('notif-dropdown');
  const markAllBtn = el('notif-mark-all-read');

  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  markAllBtn?.addEventListener('click', async (e) => {
    e.stopPropagation();
    await apiFetch('/api/notificaciones/admin/read-all', { method: 'PUT' }).catch(() => {});
    await loadNotifications();
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.classList.contains('hidden') && !dropdown.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });

  // Load initial count
  apiFetch('/api/notificaciones/admin/unread-count')
    .then(data => updateBadge(data?.count || 0))
    .catch(() => {});

  // Poll every 30 seconds
  notifInterval = setInterval(() => {
    apiFetch('/api/notificaciones/admin/unread-count')
      .then(data => updateBadge(data?.count || 0))
      .catch(() => {});
  }, 30000);
}

export function destroyNotifications() {
  if (notifInterval) {
    clearInterval(notifInterval);
    notifInterval = null;
  }
}
