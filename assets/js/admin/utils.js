export const el = (id) => document.getElementById(id);

export const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

export const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('es-ES');
};

export const showToast = (message, type = 'success', duration = 3500) => {
  const container = el('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'error'
    ? 'fa-solid fa-circle-exclamation'
    : type === 'warning'
      ? 'fa-solid fa-triangle-exclamation'
      : type === 'info'
        ? 'fa-solid fa-circle-info'
        : 'fa-solid fa-circle-check';
  toast.innerHTML = `<i class="${icon}"></i><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  window.setTimeout(() => {
    toast.style.opacity = '0';
    window.setTimeout(() => toast.remove(), 250);
  }, duration);
};

export const apiFetch = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const token = localStorage.getItem('admin_token');
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login.html';
    return null;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || `Error del servidor (${response.status})`);
  }

  return data;
};

export const closeModal = (modalId) => {
  const modal = el(modalId);
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
};

export const openModal = (modalId) => {
  const modal = el(modalId);
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
};

export const resetForm = (formId) => {
  const form = el(formId);
  if (!form) return;
  form.reset();
  form.querySelectorAll('input[type="hidden"]').forEach(input => {
    input.value = '';
  });
};

export const bindModalClose = (modalId) => {
  const modal = el(modalId);
  if (!modal) return;
  modal.querySelectorAll('[data-modal-close]').forEach(button => {
    button.addEventListener('click', () => closeModal(modalId));
  });
};

export const readFileAsDataURL = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});
