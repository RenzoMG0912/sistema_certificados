// Archivo: assets/js/certificados.js
// Lógica frontend unificada para la búsqueda y verificación de certificados

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const infoCardsWrapper = document.getElementById('info-cards-wrapper');
  const toggleBtnWrapper = document.getElementById('toggle-btn-wrapper');
  const btnToggleSearch = document.getElementById('btn-toggle-search');
  const toggleSearchText = document.getElementById('toggle-search-text');
  
  const searchBoxWrapper = document.getElementById('search-box-wrapper');
  const searchForm = document.getElementById('cert-search-form');
  const searchCodeInput = document.getElementById('search-code');
  const searchDniInput = document.getElementById('search-dni');
  
  const verificationResultWrapper = document.getElementById('verification-result-wrapper');
  const pdfFrame = document.getElementById('pdf-frame');
  const certStudentName = document.getElementById('cert-student-name');
  const certStatusBadge = document.getElementById('cert-status-badge');
  const certCourseName = document.getElementById('cert-course-name');
  const certOfficialCode = document.getElementById('cert-official-code');
  const certIssueDate = document.getElementById('cert-issue-date');
  const certExpiryDate = document.getElementById('cert-expiry-date');
  const certBlockchainHash = document.getElementById('cert-blockchain-hash');
  
  const btnSearchNew = document.getElementById('btn-search-new');
  const searchErrorBox = document.getElementById('search-error-box');
  const btnErrorRetry = document.getElementById('btn-error-retry');

  // Toggle Search form collapse state
  if (btnToggleSearch) {
    btnToggleSearch.addEventListener('click', () => {
      const isCollapsed = searchBoxWrapper.classList.toggle('collapsed');
      if (isCollapsed) {
        toggleSearchText.textContent = 'Mostrar Buscador';
        btnToggleSearch.innerHTML = '<i class="fa-solid fa-eye"></i> <span id="toggle-search-text">Mostrar Buscador</span>';
      } else {
        toggleSearchText.textContent = 'Ocultar Buscador';
        btnToggleSearch.innerHTML = '<i class="fa-solid fa-eye-slash"></i> <span id="toggle-search-text">Ocultar Buscador</span>';
      }
    });
  }

  // Parse URL search parameters
  const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  // Helper to show main search interface
  const showSearchInterface = () => {
    // Clear URL parameters smoothly
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Clear input fields
    searchCodeInput.value = '';
    searchDniInput.value = '';
    
    // Toggle views
    infoCardsWrapper.style.display = 'grid';
    toggleBtnWrapper.style.display = 'flex';
    searchBoxWrapper.style.display = 'block';
    searchBoxWrapper.classList.remove('collapsed');
    
    // Reset toggle button state
    toggleSearchText.textContent = 'Ocultar Buscador';
    btnToggleSearch.innerHTML = '<i class="fa-solid fa-eye-slash"></i> <span id="toggle-search-text">Ocultar Buscador</span>';
    
    // Hide results & error
    verificationResultWrapper.style.display = 'none';
    searchErrorBox.style.display = 'none';
    pdfFrame.src = '';
  };

  // Helper to show results view (Split Screen)
  const showDetailsInterface = (cert) => {
    // Hide main search, cards and toggle elements
    infoCardsWrapper.style.display = 'none';
    toggleBtnWrapper.style.display = 'none';
    searchBoxWrapper.style.display = 'none';
    searchErrorBox.style.display = 'none';
    
    // Render certificate metadata
    certStudentName.textContent = cert.alumno_nombre ? cert.alumno_nombre.toUpperCase() : 'ALUMNO';
    certCourseName.textContent = cert.curso_nombre || 'N/A';
    certOfficialCode.textContent = cert.codigo || 'N/A';
    
    // Format Dates
    const issueDate = cert.fecha_emision ? new Date(cert.fecha_emision) : null;
    certIssueDate.textContent = issueDate ? issueDate.toLocaleDateString('es-ES') : 'N/A';
    
    const expiryDate = cert.fecha_vencimiento ? new Date(cert.fecha_vencimiento) : null;
    const isExpired = expiryDate && expiryDate < new Date() && cert.fecha_vencimiento !== '2999-12-31';
    
    if (cert.fecha_vencimiento === '2999-12-31' || !cert.fecha_vencimiento) {
      certExpiryDate.textContent = 'Sin vencimiento';
    } else {
      certExpiryDate.textContent = expiryDate ? expiryDate.toLocaleDateString('es-ES') : 'N/A';
    }
    
    certBlockchainHash.textContent = cert.hash || 'N/A';

    // Verification status badge
    if (isExpired) {
      certStatusBadge.innerHTML = '<span class="badge-expired"><i class="fa-solid fa-circle-xmark"></i> Vencido / Expirado</span>';
    } else {
      certStatusBadge.innerHTML = '<span class="badge-verified"><i class="fa-solid fa-circle-check"></i> Válido y Auténtico</span>';
    }
    
    // Set PDF path into iframe
    if (cert.pdf_path) {
      pdfFrame.src = cert.pdf_path;
    } else {
      pdfFrame.src = '';
    }
    
    // Display result wrapper
    verificationResultWrapper.style.display = 'grid';
  };

  // Helper to show error interface
  const showErrorInterface = () => {
    infoCardsWrapper.style.display = 'none';
    toggleBtnWrapper.style.display = 'none';
    searchBoxWrapper.style.display = 'none';
    verificationResultWrapper.style.display = 'none';
    
    searchErrorBox.style.display = 'block';
  };

  // API query by Hash (QR code scan)
  const verifyByHash = async (hash) => {
    try {
      const response = await fetch(`/api/verificar/${hash}`);
      const data = await response.json();
      if (response.ok && data.valid && data.certificado) {
        showDetailsInterface(data.certificado);
      } else {
        throw new Error(data.message || 'Certificado no válido');
      }
    } catch (error) {
      console.error(error);
      showErrorInterface();
    }
  };

  // API query manual by Code & DNI
  const verifyManual = async (codigo, dni) => {
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
        showDetailsInterface(data.certificado);
      } else {
        throw new Error(data.message || 'Certificado no encontrado');
      }
    } catch (error) {
      console.error(error);
      showErrorInterface();
    }
  };

  // Form submit listener
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = searchCodeInput.value.trim();
      const dni = searchDniInput.value.trim();
      if (code && dni) {
        verifyManual(code, dni);
      }
    });
  }

  // Button listeners to reset to search state
  if (btnSearchNew) {
    btnSearchNew.addEventListener('click', showSearchInterface);
  }
  if (btnErrorRetry) {
    btnErrorRetry.addEventListener('click', showSearchInterface);
  }

  // Check QR Code parameter on load
  const hashParam = getQueryParam('h');
  if (hashParam) {
    verifyByHash(hashParam);
  }
});
