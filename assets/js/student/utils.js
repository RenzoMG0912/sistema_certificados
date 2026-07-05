// Archivo: assets/js/student/utils.js

export const el = (id) => document.getElementById(id);

export const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const parseLocalDate = (value) => {
  if (!value) return null;
  const str = String(value).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDate = (value) => {
  const date = parseLocalDate(value);
  if (!date) return 'N/A';
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const showToast = (message, type = 'success', duration = 3500) => {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const iconMap = {
    error: 'error',
    warning: 'warning',
    info: 'info',
    success: 'check_circle'
  };
  toast.innerHTML = `<span class="material-symbols-outlined text-[18px]">${iconMap[type] || 'check_circle'}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  window.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s';
    window.setTimeout(() => toast.remove(), 250);
  }, duration);
};

export const apiFetch = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const token = localStorage.getItem('student_token');
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    window.location.href = '/login.html';
    return null;
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    // Fallback if response is not JSON
  }

  if (!response.ok) {
    throw new Error(data?.message || `Error del servidor (${response.status})`);
  }

  return data;
};

export const getInitials = (name) => {
  if (!name) return 'E';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};
