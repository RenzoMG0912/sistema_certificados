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
  return date.toLocaleDateString('es-PE');
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
    window.location.href = '/login';
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

export const closeModal = (modalId) => {
  const modal = el(modalId);
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  modal.setAttribute('inert', '');
  if (modal.contains(document.activeElement)) {
    document.activeElement.blur();
  }
};

export const openModal = (modalId) => {
  const modal = el(modalId);
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  modal.removeAttribute('inert');
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

export const showConfirmModal = (title, message, confirmText = 'Sí, confirmar', cancelText = 'Cancelar', variant = 'danger') => {
  return new Promise((resolve) => {

    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText('modal-confirm-title', title);
    setText('modal-confirm-message', message);
    setText('modal-confirm-confirm', confirmText);
    setText('modal-confirm-cancel', cancelText);

    const iconWrapper = document.getElementById('modal-confirm-icon-wrapper');
    const icon = document.getElementById('modal-confirm-icon');
    const confirmBtn = document.getElementById('modal-confirm-confirm');
    const cancelBtn = document.getElementById('modal-confirm-cancel');

    iconWrapper?.classList.remove('is-danger', 'is-info');
    icon?.classList.remove('is-danger', 'is-info', 'fa-circle-check', 'fa-triangle-exclamation');
    confirmBtn?.classList.remove('is-danger', 'is-info');

    if (variant === 'info') {
      iconWrapper?.classList.add('is-info');
      icon?.classList.add('fa-circle-check', 'is-info');
      confirmBtn?.classList.add('is-info');
    } else {
      iconWrapper?.classList.add('is-danger');
      icon?.classList.add('fa-triangle-exclamation', 'is-danger');
      confirmBtn?.classList.add('is-danger');
    }

    const cleanup = () => {
      closeModal('modal-confirm');
      confirmBtn?.removeEventListener('click', onConfirm);
      cancelBtn?.removeEventListener('click', onCancel);
    };

    const onConfirm = () => {
      cleanup();
      resolve(true);
    };

    const onCancel = () => {
      cleanup();
      resolve(false);
    };

    confirmBtn?.addEventListener('click', onConfirm);
    cancelBtn?.addEventListener('click', onCancel);

    openModal('modal-confirm');
  });
};

export const readFileAsDataURL = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});
