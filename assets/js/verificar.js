// Archivo: assets/js/verificar.js
// Lógica frontend para la página de verificación pública de TEAM HSEC

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.remove('js-loading');
  const spinner = document.getElementById('loading-spinner');
  const searchSection = document.getElementById('search-section');
  const resultSection = document.getElementById('result-section');
  const errorSection = document.getElementById('error-section');
  const errorMsg = document.getElementById('error-msg');

  // Parse query parameters
  const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  const showSection = (section) => {
    spinner.style.display = 'none';
    searchSection.style.display = 'none';
    resultSection.style.display = 'none';
    errorSection.style.display = 'none';

    if (section === 'spinner') spinner.style.display = 'flex';
    if (section === 'search') searchSection.style.display = 'block';
    if (section === 'result') resultSection.style.display = 'block';
    if (section === 'error') errorSection.style.display = 'block';
  };

  // Render certificate details
  const renderCertificate = (cert) => {
    document.getElementById('res-student').textContent = cert.alumno_nombre;
    document.getElementById('res-dni').textContent = cert.alumno_dni;
    document.getElementById('res-course').textContent = cert.curso_nombre;
    document.getElementById('res-duration').textContent = cert.curso_duracion;
    document.getElementById('res-trainer').textContent = cert.curso_entrenador;
    
    document.getElementById('res-issued').textContent = new Date(cert.fecha_emision).toLocaleDateString('es-ES');
    document.getElementById('res-expired').textContent = cert.fecha_vencimiento 
      ? new Date(cert.fecha_vencimiento).toLocaleDateString('es-ES') 
      : 'Sin vencimiento';
    
    document.getElementById('res-code').textContent = cert.codigo;
    document.getElementById('res-signature').textContent = cert.firma_nombre_1 ? `${cert.firma_nombre_1} (${cert.firma_cargo_1})` : 'Registrado';
    document.getElementById('res-signature2').textContent = cert.firma_nombre_2 ? `${cert.firma_nombre_2} (${cert.firma_cargo_2})` : 'N/A';
    document.getElementById('res-hash').textContent = cert.hash;

    // Check expiration status
    const isExpired = cert.fecha_vencimiento && new Date(cert.fecha_vencimiento) < new Date();
    const statusBadge = document.getElementById('status-badge');
    
    if (isExpired) {
      statusBadge.className = 'status-badge status-expired';
      statusBadge.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> <span>Vencido / Expirado</span>';
    } else {
      statusBadge.className = 'status-badge status-valid';
      statusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Válido y Auténtico</span>';
    }

    // Configure download link
    const pdfBtn = document.getElementById('btn-pdf-download');
    if (cert.pdf_path) {
      pdfBtn.href = cert.pdf_path;
      pdfBtn.setAttribute('download', `Certificado_${cert.codigo}.pdf`);
      pdfBtn.style.display = 'inline-flex';
    } else {
      pdfBtn.style.display = 'none';
    }

    showSection('result');
  };

  // Perform Verification by Hash (QR Scan)
  const verifyHash = async (hash) => {
    showSection('spinner');
    try {
      const response = await fetch(`/api/verificar/${hash}`);
      const data = await response.json();

      if (response.ok && data.valid && data.certificado) {
        renderCertificate(data.certificado);
      } else {
        throw new Error(data.message || 'El código del certificado no es válido o ha sido revocado.');
      }
    } catch (error) {
      errorMsg.textContent = error.message;
      showSection('error');
    }
  };

  // Perform Verification by DNI and Code
  const verifyManual = async (codigo, dni) => {
    showSection('spinner');
    try {
      const response = await fetch('/api/verificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ codigo, dni })
      });
      const data = await response.json();

      if (response.ok && data.valid && data.certificado) {
        renderCertificate(data.certificado);
      } else {
        throw new Error(data.message || 'No se encontró coincidencia para los datos provistos. Verifique código y DNI.');
      }
    } catch (error) {
      errorMsg.textContent = error.message;
      showSection('error');
    }
  };

  // Handle manual submit
  const form = document.getElementById('verify-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const codigo = document.getElementById('verify-code').value.trim();
    const dni = document.getElementById('verify-dni').value.trim();
    verifyManual(codigo, dni);
  });

  // Reset actions
  const resetVerification = () => {
    // Clear URL query params
    window.history.replaceState({}, document.title, window.location.pathname);
    document.getElementById('verify-code').value = '';
    document.getElementById('verify-dni').value = '';
    showSection('search');
  };

  document.getElementById('btn-search-again').addEventListener('click', resetVerification);
  document.getElementById('btn-error-retry').addEventListener('click', resetVerification);

  // Check if hash parameter is present in URL
  const hashParam = getQueryParam('h');
  if (hashParam) {
    verifyHash(hashParam);
  } else {
    showSection('search');
  }

  // Interceptar todos los clics en enlaces internos para transiciones suaves de salida
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || link.getAttribute('target') === '_blank') return;

    if (href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    let url;
    try {
      url = new URL(href, window.location.href);
    } catch (e) {
      return;
    }

    if (url.origin !== window.location.origin) return;

    const samePage = url.pathname === window.location.pathname;
    const isHashTarget = (href.startsWith('#') && href.length > 1) || (samePage && url.hash);

    if (isHashTarget) return;

    event.preventDefault();
    document.body.classList.add('page-exit');
    window.setTimeout(() => {
      window.location.href = url.toString();
    }, 350);
  });
});
