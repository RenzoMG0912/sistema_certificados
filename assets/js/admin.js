// Archivo: assets/js/admin.js
// Lógica frontend para el panel administrativo de TEAM HSEC

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    window.location.href = '/admin/login.html';
    return;
  }

  // Set user display email
  try {
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    document.getElementById('user-display').textContent = user.nombre || user.email || 'Admin';
  } catch (e) {
    document.getElementById('user-display').textContent = 'Admin';
  }

  // Toast notifications
  const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="${type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'}"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // Helper API fetch wrapper with token injection
  const apiFetch = async (url, options = {}) => {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(url, options);
      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login.html';
        return null;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Error del servidor (${response.status})`);
      }
      return data;
    } catch (error) {
      showToast(error.message, 'error');
      console.error(`API Fetch Error [${url}]:`, error);
      throw error;
    }
  };

  // Simple Router / Tab Switcher
  const sidebarLinks = document.querySelectorAll('.sidebar-menu li a');
  const tabContents = document.querySelectorAll('.tab-content');
  const pageTitle = document.getElementById('page-title');

  const switchTab = (tabId) => {
    sidebarLinks.forEach(link => link.classList.toggle('active', link.dataset.tab === tabId));
    tabContents.forEach(content => content.classList.toggle('active', content.id === `tab-${tabId}`));
    
    // Set titles
    const titles = {
      inicio: 'Resumen del Sistema',
      cursos: 'Gestión de Cursos',
      participantes: 'Gestión de Alumnos',
      matriculas: 'Gestión de Matrículas',
      certificados: 'Historial de Certificados',
      firmas: 'Firmas Autorizadas'
    };
    pageTitle.textContent = titles[tabId] || 'TEAM HSEC';

    // Fetch tab-specific data
    if (tabId === 'inicio') loadDashboardStats();
    if (tabId === 'cursos') loadCourses();
    if (tabId === 'participantes') loadParticipants();
    if (tabId === 'matriculas') loadEnrollments();
    if (tabId === 'certificados') loadCertificates();
    if (tabId === 'firmas') loadSignatures();
  };

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(link.dataset.tab);
    });
  });

  // Modal Open/Close handling
  const setupModalHandlers = (modalId, openButtonId, onOpen = () => {}) => {
    const modal = document.getElementById(modalId);
    const openBtn = document.getElementById(openButtonId);
    const closeElements = modal.querySelectorAll('[data-modal-close]');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        onOpen();
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
      });
    }

    closeElements.forEach(el => {
      el.addEventListener('click', () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
      });
    });
  };

  const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  // Logout handler
  document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login.html';
  });

  // ----------------------------------------------------
  // BUSINESS LOGIC: TAB: INICIO
  // ----------------------------------------------------
  const loadDashboardStats = async () => {
    try {
      const stats = await apiFetch('/api/admin/dashboard');
      if (!stats) return;

      document.getElementById('stat-participantes').textContent = stats.totalParticipantes || 0;
      document.getElementById('stat-cursos').textContent = stats.totalCursos || 0;
      document.getElementById('stat-certificados').textContent = stats.totalCertificados || 0;

      // Render recent certificates
      const recentList = document.getElementById('recent-certs-list');
      if (stats.recientes && stats.recientes.length) {
        recentList.innerHTML = stats.recientes.map(cert => {
          const formattedDate = new Date(cert.fecha_emision).toLocaleDateString('es-ES');
          const isExpired = cert.fecha_vencimiento && new Date(cert.fecha_vencimiento) < new Date();
          const badgeClass = isExpired ? 'badge-expired' : 'badge-active';
          const badgeText = isExpired ? 'Vencido' : 'Vigente';

          return `
            <tr>
              <td><strong>${cert.codigo}</strong></td>
              <td>${cert.alumno_nombre}</td>
              <td>${cert.curso_nombre}</td>
              <td>${formattedDate}</td>
              <td><span class="badge-status ${badgeClass}">${badgeText}</span></td>
              <td>
                <a href="${cert.pdf_path}" target="_blank" class="btn-icon" title="Ver PDF"><i class="fa-solid fa-file-pdf" style="color: #ef4444;"></i></a>
              </td>
            </tr>
          `;
        }).join('');
      } else {
        recentList.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b;">No hay certificados emitidos recientemente.</td></tr>`;
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // BUSINESS LOGIC: TAB: CURSOS
  // ----------------------------------------------------
  const loadCourses = async () => {
    const listContainer = document.getElementById('courses-list');
    listContainer.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b;">Cargando...</td></tr>';
    
    try {
      const courses = await apiFetch('/api/cursos');
      if (!courses) return;

      if (courses.length === 0) {
        listContainer.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b;">No hay cursos registrados.</td></tr>';
        return;
      }

      listContainer.innerHTML = courses.map(c => `
        <tr>
          <td><code>${c.codigo_curso}</code></td>
          <td><strong>${c.nombre}</strong></td>
          <td>${c.duracion}</td>
          <td>${c.categoria || 'N/A'}</td>
          <td>${c.entrenador}</td>
          <td class="actions-cell">
            <button class="btn-icon btn-edit-course" data-id="${c.id}" title="Editar"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-icon btn-delete btn-delete-course" data-id="${c.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `).join('');

      // Add edit/delete button listeners
      document.querySelectorAll('.btn-edit-course').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const course = courses.find(item => item.id == id);
          if (course) {
            document.getElementById('course-id').value = course.id;
            document.getElementById('course-code').value = course.codigo_curso;
            document.getElementById('course-name').value = course.nombre;
            document.getElementById('course-duration').value = course.duracion;
            document.getElementById('course-category').value = course.categoria || '';
            document.getElementById('course-trainer').value = course.entrenador;
            document.getElementById('modal-course-title').textContent = 'Editar Curso';
            
            const modal = document.getElementById('modal-course');
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
          }
        });
      });

      document.querySelectorAll('.btn-delete-course').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          if (confirm('¿Está seguro de eliminar este curso? Se eliminarán los certificados asociados.')) {
            await apiFetch(`/api/cursos/${id}`, { method: 'DELETE' });
            showToast('Curso eliminado correctamente');
            loadCourses();
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
  };

  document.getElementById('form-course').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('course-id').value;
    const body = {
      codigo_curso: document.getElementById('course-code').value.trim(),
      nombre: document.getElementById('course-name').value.trim(),
      duracion: document.getElementById('course-duration').value.trim(),
      categoria: document.getElementById('course-category').value.trim(),
      entrenador: document.getElementById('course-trainer').value.trim(),
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/cursos/${id}` : '/api/cursos';

    try {
      await apiFetch(url, {
        method,
        body: JSON.stringify(body)
      });
      showToast(id ? 'Curso actualizado correctamente' : 'Curso creado correctamente');
      closeModal('modal-course');
      loadCourses();
    } catch (err) {
      console.error(err);
    }
  });

  setupModalHandlers('modal-course', 'btn-new-course', () => {
    document.getElementById('form-course').reset();
    document.getElementById('course-id').value = '';
    document.getElementById('modal-course-title').textContent = 'Registrar Curso';
  });

  // ----------------------------------------------------
  // BUSINESS LOGIC: TAB: PARTICIPANTES
  // ----------------------------------------------------
  const loadParticipants = async () => {
    const listContainer = document.getElementById('participants-list');
    listContainer.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b;">Cargando...</td></tr>';
    
    try {
      const participants = await apiFetch('/api/participantes');
      if (!participants) return;

      const renderList = (items) => {
        if (items.length === 0) {
          listContainer.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b;">No hay alumnos registrados.</td></tr>';
          return;
        }

        listContainer.innerHTML = items.map(p => `
          <tr>
            <td><strong>${p.dni}</strong></td>
            <td>${p.nombres}</td>
            <td>${p.email || 'Sin correo'}</td>
            <td>${new Date(p.created_at).toLocaleDateString('es-ES')}</td>
            <td class="actions-cell">
              <button class="btn-icon btn-edit-participant" data-id="${p.id}" title="Editar"><i class="fa-solid fa-pen"></i></button>
              <button class="btn-icon btn-delete btn-delete-participant" data-id="${p.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
            </td>
          </tr>
        `).join('');

        // Listeners
        document.querySelectorAll('.btn-edit-participant').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const p = items.find(item => item.id == id);
            if (p) {
              document.getElementById('participant-id').value = p.id;
              document.getElementById('participant-dni').value = p.dni;
              document.getElementById('participant-name').value = p.nombres;
              document.getElementById('participant-email').value = p.email || '';
              document.getElementById('modal-participant-title').textContent = 'Editar Alumno';
              
              const modal = document.getElementById('modal-participant');
              modal.classList.add('is-open');
              modal.setAttribute('aria-hidden', 'false');
            }
          });
        });

        document.querySelectorAll('.btn-delete-participant').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            if (confirm('¿Está seguro de eliminar este alumno? Se borrarán sus matrículas y certificados.')) {
              await apiFetch(`/api/participantes/${id}`, { method: 'DELETE' });
              showToast('Alumno eliminado correctamente');
              loadParticipants();
            }
          });
        });
      };

      renderList(participants);

      // Filtering search bar
      const searchDni = document.getElementById('search-participant-dni');
      const searchName = document.getElementById('search-participant-name');
      const applyFilters = () => {
        const dniVal = searchDni.value.trim().toLowerCase();
        const nameVal = searchName.value.trim().toLowerCase();
        
        const filtered = participants.filter(p => {
          return p.dni.toLowerCase().includes(dniVal) && p.nombres.toLowerCase().includes(nameVal);
        });
        renderList(filtered);
      };
      
      searchDni.oninput = applyFilters;
      searchName.oninput = applyFilters;

    } catch (err) {
      console.error(err);
    }
  };

  document.getElementById('form-participant').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('participant-id').value;
    const body = {
      dni: document.getElementById('participant-dni').value.trim(),
      nombres: document.getElementById('participant-name').value.trim(),
      email: document.getElementById('participant-email').value.trim() || null
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/participantes/${id}` : '/api/participantes';

    try {
      await apiFetch(url, {
        method,
        body: JSON.stringify(body)
      });
      showToast(id ? 'Datos de alumno actualizados' : 'Alumno registrado correctamente');
      closeModal('modal-participant');
      loadParticipants();
    } catch (err) {
      console.error(err);
    }
  });

  setupModalHandlers('modal-participant', 'btn-new-participant', () => {
    document.getElementById('form-participant').reset();
    document.getElementById('participant-id').value = '';
    document.getElementById('modal-participant-title').textContent = 'Registrar Alumno';
  });

  // ----------------------------------------------------
  // BUSINESS LOGIC: TAB: MATRÍCULAS
  // ----------------------------------------------------
  const loadEnrollments = async () => {
    const listContainer = document.getElementById('enrollments-list');
    listContainer.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748b;">Cargando...</td></tr>';
    
    try {
      const enrollments = await apiFetch('/api/matriculas');
      if (!enrollments) return;

      if (enrollments.length === 0) {
        listContainer.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748b;">No hay matrículas registradas.</td></tr>';
        return;
      }

      listContainer.innerHTML = enrollments.map(m => `
        <tr>
          <td><strong>${m.alumno_nombre}</strong> (${m.alumno_dni})</td>
          <td>${m.curso_nombre}</td>
          <td>${new Date(m.created_at).toLocaleDateString('es-ES')}</td>
          <td>
            <button class="btn-icon btn-delete btn-delete-enrollment" data-id="${m.id}" title="Eliminar Matrícula"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `).join('');

      document.querySelectorAll('.btn-delete-enrollment').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          if (confirm('¿Está seguro de eliminar esta matrícula? Se eliminará cualquier certificado emitido bajo esta.')) {
            await apiFetch(`/api/matriculas/${id}`, { method: 'DELETE' });
            showToast('Matrícula eliminada correctamente');
            loadEnrollments();
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
  };

  setupModalHandlers('modal-enrollment', 'btn-new-enrollment', async () => {
    const pSelect = document.getElementById('enrollment-participant');
    const cSelect = document.getElementById('enrollment-course');
    
    pSelect.innerHTML = '<option value="">Cargando...</option>';
    cSelect.innerHTML = '<option value="">Cargando...</option>';

    try {
      const [participants, courses] = await Promise.all([
        apiFetch('/api/participantes'),
        apiFetch('/api/cursos')
      ]);

      if (participants && participants.length) {
        pSelect.innerHTML = '<option value="">-- Seleccionar Alumno --</option>' + 
          participants.map(p => `<option value="${p.id}">${p.nombres} (${p.dni})</option>`).join('');
      } else {
        pSelect.innerHTML = '<option value="">No hay alumnos registrados</option>';
      }

      if (courses && courses.length) {
        cSelect.innerHTML = '<option value="">-- Seleccionar Curso --</option>' + 
          courses.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
      } else {
        cSelect.innerHTML = '<option value="">No hay cursos registrados</option>';
      }
    } catch (e) {
      console.error(e);
    }
  });

  document.getElementById('form-enrollment').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      participante_id: parseInt(document.getElementById('enrollment-participant').value),
      curso_id: parseInt(document.getElementById('enrollment-course').value)
    };

    try {
      await apiFetch('/api/matriculas', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      showToast('Matrícula registrada con éxito');
      closeModal('modal-enrollment');
      loadEnrollments();
    } catch (err) {
      console.error(err);
    }
  });

  // ----------------------------------------------------
  // BUSINESS LOGIC: TAB: CERTIFICADOS
  // ----------------------------------------------------
  const loadCertificates = async () => {
    const listContainer = document.getElementById('certificates-list');
    listContainer.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #64748b;">Cargando...</td></tr>';
    
    try {
      const certs = await apiFetch('/api/certificados');
      if (!certs) return;

      const renderList = (items) => {
        if (items.length === 0) {
          listContainer.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #64748b;">No hay certificados emitidos.</td></tr>';
          return;
        }

        listContainer.innerHTML = items.map(c => {
          const isExpired = c.fecha_vencimiento && new Date(c.fecha_vencimiento) < new Date();
          const badgeClass = isExpired ? 'badge-expired' : 'badge-active';
          const badgeText = isExpired ? 'Vencido' : 'Vigente';

          return `
            <tr>
              <td><strong>${c.codigo}</strong></td>
              <td>${c.alumno_nombre} (${c.alumno_dni})</td>
              <td>${c.curso_nombre}</td>
              <td>${new Date(c.fecha_emision).toLocaleDateString('es-ES')}</td>
              <td>${c.fecha_vencimiento ? new Date(c.fecha_vencimiento).toLocaleDateString('es-ES') : 'N/A'}</td>
              <td><span class="badge-status ${badgeClass}">${badgeText}</span></td>
              <td class="actions-cell">
                <a href="${c.pdf_path}" target="_blank" class="btn-icon" title="Ver PDF"><i class="fa-solid fa-file-pdf" style="color: #ef4444;"></i></a>
                <button class="btn-icon btn-delete btn-delete-cert" data-id="${c.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          `;
        }).join('');

        document.querySelectorAll('.btn-delete-cert').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            if (confirm('¿Está seguro de revocar/eliminar este certificado? Se eliminará el archivo físico en el servidor.')) {
              await apiFetch(`/api/certificados/${id}`, { method: 'DELETE' });
              showToast('Certificado revocado/eliminado');
              loadCertificates();
            }
          });
        });
      };

      renderList(certs);

      // Search filters
      const searchBox = document.getElementById('search-cert-query');
      searchBox.oninput = () => {
        const query = searchBox.value.trim().toLowerCase();
        const filtered = certs.filter(c => {
          return c.codigo.toLowerCase().includes(query) || 
                 c.alumno_nombre.toLowerCase().includes(query) || 
                 c.alumno_dni.includes(query);
        });
        renderList(filtered);
      };

    } catch (err) {
      console.error(err);
    }
  };

  setupModalHandlers('modal-certificate', 'btn-new-certificate', async () => {
    // Populate select lists
    const matSelect = document.getElementById('cert-matricula');
    const sig1Select = document.getElementById('cert-signature-1');
    const sig2Select = document.getElementById('cert-signature-2');

    // Default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('cert-course-date').value = today;
    document.getElementById('cert-issue-date').value = today;

    matSelect.innerHTML = '<option value="">Cargando matrículas...</option>';
    sig1Select.innerHTML = '<option value="">Cargando firmas...</option>';
    sig2Select.innerHTML = '<option value="">Ninguna</option>';

    try {
      const [matriculas, signatures] = await Promise.all([
        apiFetch('/api/matriculas'),
        apiFetch('/api/firmas')
      ]);

      if (matriculas && matriculas.length) {
        // Only allow matriculas that don't have active certificates (optional validation, backend handles it too)
        matSelect.innerHTML = '<option value="">-- Selecciona una matrícula --</option>' + 
          matriculas.map(m => `<option value="${m.id}">${m.alumno_nombre} (${m.alumno_dni}) - ${m.curso_nombre}</option>`).join('');
      } else {
        matSelect.innerHTML = '<option value="">No hay matrículas activas registradas</option>';
      }

      if (signatures && signatures.length) {
        const sigOptions = signatures.map(s => `<option value="${s.id}">${s.nombre} (${s.cargo})</option>`).join('');
        sig1Select.innerHTML = '<option value="">-- Seleccionar Firma Principal --</option>' + sigOptions;
        sig2Select.innerHTML = '<option value="">Ninguna</option>' + sigOptions;
      } else {
        sig1Select.innerHTML = '<option value="">No hay firmas autorizadas cargadas</option>';
      }
    } catch (e) {
      console.error(e);
    }
  });

  document.getElementById('form-certificate').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      matricula_id: parseInt(document.getElementById('cert-matricula').value),
      firma_id_1: parseInt(document.getElementById('cert-signature-1').value),
      firma_id_2: document.getElementById('cert-signature-2').value ? parseInt(document.getElementById('cert-signature-2').value) : null,
      fecha_realizacion: document.getElementById('cert-course-date').value,
      fecha_emision: document.getElementById('cert-issue-date').value,
      vigencia_anos: parseInt(document.getElementById('cert-expiry-years').value)
    };

    try {
      const res = await apiFetch('/api/certificados', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      showToast('Certificado emitido exitosamente y PDF generado');
      closeModal('modal-certificate');
      loadCertificates();
    } catch (err) {
      console.error(err);
    }
  });

  // ----------------------------------------------------
  // BUSINESS LOGIC: TAB: FIRMAS
  // ----------------------------------------------------
  const loadSignatures = async () => {
    const listContainer = document.getElementById('signatures-list');
    listContainer.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b;">Cargando...</td></tr>';
    
    try {
      const signatures = await apiFetch('/api/firmas');
      if (!signatures) return;

      if (signatures.length === 0) {
        listContainer.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b;">No hay firmas registradas.</td></tr>';
        return;
      }

      listContainer.innerHTML = signatures.map(s => `
        <tr>
          <td><code>#${s.id}</code></td>
          <td><strong>${s.nombre}</strong></td>
          <td>${s.cargo}</td>
          <td>
            <a href="${s.firma_url}" target="_blank" style="color: var(--red); text-decoration: underline; font-size: 13px;">
              ${s.firma_url}
            </a>
          </td>
          <td>
            <button class="btn-icon btn-delete btn-delete-signature" data-id="${s.id}" title="Eliminar Firma"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `).join('');

      document.querySelectorAll('.btn-delete-signature').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          if (confirm('¿Está seguro de eliminar esta firma? Se desactivará del catálogo de emisión.')) {
            await apiFetch(`/api/firmas/${id}`, { method: 'DELETE' });
            showToast('Firma eliminada correctamente');
            loadSignatures();
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
  };

  setupModalHandlers('modal-signature', 'btn-new-signature', () => {
    document.getElementById('form-signature').reset();
  });

  document.getElementById('form-signature').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      nombre: document.getElementById('sig-name').value.trim(),
      cargo: document.getElementById('sig-role').value.trim(),
      firma_url: document.getElementById('sig-url').value.trim()
    };

    try {
      await apiFetch('/api/firmas', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      showToast('Firma agregada exitosamente');
      closeModal('modal-signature');
      loadSignatures();
    } catch (err) {
      console.error(err);
    }
  });

  // Initial load
  loadDashboardStats();
});
