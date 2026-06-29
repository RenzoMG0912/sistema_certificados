// Archivo: assets/js/admin.js

const showToast = (message, type = 'success') => {
  const container = document.getElementById('toast-container');
  if (!container) return;
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

const closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }
};

const apiFetch = async (url, options = {}) => {
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(url, options);
    if (response.status === 401 || response.status === 403) {
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

const checkSession = async () => {
  try {
    const res = await apiFetch('/api/admin/dashboard');
    if (res) return true;
    return false;
  } catch (err) {
    return false;
  }
};

const resetModalForm = (modal) => {
  const form = modal.querySelector('form');
  if (form) {
    form.reset();
    const hiddenId = form.querySelector('input[type="hidden"][id$="-id"]');
    if (hiddenId) hiddenId.value = '';
  }
};

const setupModalHandlers = (modalId, openButtonId, onOpen = () => {}) => {
  const modal = document.getElementById(modalId);
  if (!modal) return;
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
      resetModalForm(modal);
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    });
  });
};

const sidebarLinks = document.querySelectorAll('.sidebar-menu li a');
const tabContents = document.querySelectorAll('.tab-content');
const pageTitle = document.getElementById('page-title');

const switchTab = (tabId) => {
  sidebarLinks.forEach(link => link.classList.toggle('active', link.dataset.tab === tabId));
  tabContents.forEach(content => content.classList.toggle('active', content.id === `tab-${tabId}`));

  const titles = {
    inicio: 'Resumen del Sistema',
    cursos: 'Gestión de Cursos',
    participantes: 'Gestión de Alumnos',
    matriculas: 'Gestión de Matrículas',
    certificados: 'Historial de Certificados',
    firmas: 'Firmas Autorizadas'
  };
  pageTitle.textContent = titles[tabId] || 'TEAM HSEC';

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

const loadDashboardStats = async () => {
  try {
    const stats = await apiFetch('/api/admin/dashboard');
    if (!stats) return;

    document.getElementById('stat-participantes').textContent = stats.totalParticipantes || 0;
    document.getElementById('stat-cursos').textContent = stats.totalCursos || 0;
    document.getElementById('stat-certificados').textContent = stats.totalCertificados || 0;

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
          document.getElementById('modal-course-title').textContent = 'Editar Curso';

          await populateCourseTrainerSelect(course.entrenador, course.firma_id);

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

const populateCourseTrainerSelect = async (selectedName = null, selectedFirmaId = null) => {
  const select = document.getElementById('course-trainer');
  const firmaSelect = document.getElementById('course-firma-id');
  if (!select) return;
  try {
    const firmas = await apiFetch('/api/firmas');
    if (firmas && firmas.length) {
      select.innerHTML = '<option value="">-- Seleccionar Firmante --</option>' +
        firmas.map(f => `<option value="${f.nombre}" ${f.nombre === selectedName ? 'selected' : ''}>${f.nombre} (${f.cargo})</option>`).join('');

      if (firmaSelect) {
        firmaSelect.innerHTML = '<option value="">-- Seleccionar firma --</option>' +
          firmas.map(f => `<option value="${f.id}" ${f.id == selectedFirmaId ? 'selected' : ''}>${f.nombre} (${f.cargo})</option>`).join('');
      }

      if (firmas.length === 0) {
        select.innerHTML = '<option value="">No hay firmas registradas</option>';
        if (firmaSelect) firmaSelect.innerHTML = '<option value="">No hay firmas registradas</option>';
      }
    } else {
      select.innerHTML = '<option value="">No hay firmas registradas</option>';
      if (firmaSelect) firmaSelect.innerHTML = '<option value="">No hay firmas registradas</option>';
    }
  } catch (e) {
    console.error(e);
    select.innerHTML = '<option value="">Error al cargar firmantes</option>';
    if (firmaSelect) firmaSelect.innerHTML = '<option value="">Error al cargar firmas</option>';
  }
};

document.getElementById('form-course').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('course-id').value;
  const firmaId = document.getElementById('course-firma-id')?.value;
  const body = {
    codigo_curso: document.getElementById('course-code').value.trim(),
    nombre: document.getElementById('course-name').value.trim(),
    duracion: document.getElementById('course-duration').value.trim(),
    categoria: document.getElementById('course-category').value.trim(),
    entrenador: document.getElementById('course-trainer').value.trim(),
    firma_id: firmaId ? parseInt(firmaId) : null
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

setupModalHandlers('modal-course', 'btn-new-course', async () => {
  document.getElementById('form-course').reset();
  document.getElementById('course-id').value = '';
  document.getElementById('modal-course-title').textContent = 'Registrar Curso';
  await populateCourseTrainerSelect();
});

const loadParticipants = async () => {
  const listContainer = document.getElementById('participants-list');
  listContainer.innerHTML = '<tr><td colspan="10" style="text-align: center; color: #64748b;">Cargando...</td></tr>';

  try {
    const participants = await apiFetch('/api/participantes');
    if (!participants) return;

    const renderList = (items) => {
      if (items.length === 0) {
        listContainer.innerHTML = '<tr><td colspan="10" style="text-align: center; color: #64748b;">No hay alumnos registrados.</td></tr>';
        return;
      }

      listContainer.innerHTML = items.map(p => {
        const indClass = p.induccion === 'APTO' ? 'badge-active' : (p.induccion === 'NO APTO' ? 'badge-expired' : 'bg-amber-100 text-amber-700');
        const exClass = p.examen_medico === 'APTO' ? 'badge-active' : (p.examen_medico === 'NO APTO' ? 'badge-expired' : 'bg-amber-100 text-amber-700');

        return `
          <tr>
            <td><strong>${p.dni}</strong></td>
            <td>${p.nombres}</td>
            <td>${p.cargo || 'N/A'}</td>
            <td>${p.telefono || 'N/A'}</td>
            <td>${p.procedencia || 'N/A'}</td>
            <td><span class="badge-status ${indClass}">${p.induccion || 'N/A'}</span></td>
            <td><span class="badge-status ${exClass}">${p.examen_medico || 'N/A'}</span></td>
            <td>${p.email || 'Sin correo'}</td>
            <td>${new Date(p.created_at).toLocaleDateString('es-ES')}</td>
            <td class="actions-cell">
              <button class="btn-icon btn-edit-participant" data-id="${p.id}" title="Editar"><i class="fa-solid fa-pen"></i></button>
              <button class="btn-icon btn-delete btn-delete-participant" data-id="${p.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
            </td>
          </tr>
        `;
      }).join('');

      document.querySelectorAll('.btn-edit-participant').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const p = items.find(item => item.id == id);
          if (p) {
            document.getElementById('participant-id').value = p.id;
            document.getElementById('participant-dni').value = p.dni;
            document.getElementById('participant-name').value = p.nombres;
            document.getElementById('participant-cargo').value = p.cargo || '';
            document.getElementById('participant-telefono').value = p.telefono || '';
            document.getElementById('participant-procedencia').value = p.procedencia || '';
            document.getElementById('participant-induccion').value = p.induccion || 'APTO';
            document.getElementById('participant-examen-medico').value = p.examen_medico || 'APTO';
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
    cargo: document.getElementById('participant-cargo').value.trim(),
    telefono: document.getElementById('participant-telefono').value.trim(),
    procedencia: document.getElementById('participant-procedencia').value.trim(),
    induccion: document.getElementById('participant-induccion').value,
    examen_medico: document.getElementById('participant-examen-medico').value,
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
  document.getElementById('participant-cargo').value = '';
  document.getElementById('participant-telefono').value = '';
  document.getElementById('participant-procedencia').value = '';
  document.getElementById('participant-induccion').value = 'APTO';
  document.getElementById('participant-examen-medico').value = 'APTO';
  document.getElementById('modal-participant-title').textContent = 'Registrar Alumno';
});

const loadEnrollments = async () => {
  const listContainer = document.getElementById('enrollments-list');
  listContainer.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748b;">Cargando...</td></tr>';

  try {
    const grouped = await apiFetch('/api/matriculas/grouped');
    if (!grouped) return;

    if (grouped.length === 0) {
      listContainer.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748b;">No hay matrículas registradas.</td></tr>';
      return;
    }

    const allCerts = await apiFetch('/api/certificados').catch(() => []);

    listContainer.innerHTML = grouped.map(g => {
      const studentList = g.enrollments.map(e =>
        `<span class="inline-block bg-slate-100 text-slate-700 rounded-md px-2.5 py-1 text-xs font-medium">${e.alumno_nombre} (${e.alumno_dni})</span>`
      ).join(' ');

        const hasCertForAny = g.enrollments.some(e =>
          allCerts.some(c => c.matricula_id == e.id)
        );

        const courseInfo = [];
        if (g.curso_entrenador) courseInfo.push(`<span class="text-xs text-on-surface-variant block">Entrenador: ${g.curso_entrenador}</span>`);
        if (g.curso_duracion) courseInfo.push(`<span class="text-xs text-on-surface-variant block">Duración: ${g.curso_duracion}</span>`);
        if (g.fecha_inicio) courseInfo.push(`<span class="text-xs text-on-surface-variant block">Inicio: ${new Date(g.fecha_inicio).toLocaleDateString('es-ES')}</span>`);
        if (g.fecha_fin) courseInfo.push(`<span class="text-xs text-on-surface-variant block">Fin: ${new Date(g.fecha_fin).toLocaleDateString('es-ES')}</span>`);

        return `
          <tr>
            <td>
              <strong>${g.curso_nombre}</strong>
              ${courseInfo.join('')}
            </td>
            <td style="min-width:280px;"><div class="flex flex-wrap gap-1.5">${studentList}</div></td>
            <td><span class="badge-status badge-active">${g.enrollments.length}</span></td>
            <td class="actions-cell">
              <button class="btn-icon btn-edit-enrollment" data-curso-id="${g.curso_id}" title="Editar Matrícula (agregar/quitar alumnos)"><i class="fa-solid fa-pen"></i></button>
              <button class="btn-icon btn-generate-cert-enrollment" data-curso-id="${g.curso_id}" data-curso-nombre="${g.curso_nombre}" title="Generar Certificados Pendientes"><i class="fa-solid fa-file-circle-plus" style="color:#2563eb;"></i></button>
              <button class="btn-icon btn-delete btn-delete-enrollment-group" data-curso-id="${g.curso_id}" title="Eliminar todas las matrículas de este curso"><i class="fa-solid fa-trash"></i></button>
            </td>
          </tr>
        `;
      }).join('');

      document.querySelectorAll('.btn-edit-enrollment').forEach(btn => {
        btn.addEventListener('click', () => openEditEnrollmentModal(btn.dataset.cursoId));
      });

      document.querySelectorAll('.btn-generate-cert-enrollment').forEach(btn => {
        btn.addEventListener('click', async () => {
          const cursoId = btn.dataset.cursoId;
          const cursoNombre = btn.dataset.cursoNombre;
          if (confirm(`¿Generar certificados para TODOS los alumnos pendientes del curso "${cursoNombre}"?\n\nSe usarán: Firma Gerente + Firma del Entrenador.`)) {
            try {
              const result = await apiFetch('/api/certificados/bulk-generate', {
                method: 'POST',
                body: JSON.stringify({ curso_id: parseInt(cursoId) })
              });
              showToast(result.message || 'Certificados generados correctamente');
              loadEnrollments();
            } catch (err) {
              console.error(err);
            }
          }
        });
      });

      document.querySelectorAll('.btn-delete-enrollment-group').forEach(btn => {
        btn.addEventListener('click', async () => {
          const cursoId = btn.dataset.cursoId;
          if (confirm('¿Eliminar TODAS las matrículas de este curso? Los certificados existentes no se eliminarán.')) {
            const enrollments = grouped.find(g => g.curso_id == cursoId);
            if (enrollments) {
              for (const e of enrollments.enrollments) {
                await apiFetch(`/api/matriculas/${e.id}`, { method: 'DELETE' }).catch(() => {});
              }
              showToast('Matrículas eliminadas');
              loadEnrollments();
            }
          }
        });
      });

    } catch (err) {
      console.error(err);
    }
  };

  const openEditEnrollmentModal = async (cursoId) => {
    const modal = document.getElementById('modal-enrollment-edit');
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');

    const cursoIdEl = document.getElementById('enrollment-edit-curso-id');
    const currentList = document.getElementById('enrollment-current-list');
    const addContainer = document.getElementById('enrollment-add-participants-container');

    if (cursoIdEl) cursoIdEl.value = cursoId;
    currentList.innerHTML = '<p class="text-sm text-slate-400">Cargando...</p>';
    addContainer.innerHTML = '<p class="text-sm text-slate-400">Cargando...</p>';

    try {
      const [enrollments, allParticipants] = await Promise.all([
        apiFetch(`/api/matriculas/by-course/${cursoId}`),
        apiFetch('/api/participantes')
      ]);

      const enrolledIds = enrollments.map(e => e.participante_id);

      if (enrollments.length === 0) {
        currentList.innerHTML = '<p class="text-sm text-slate-400">No hay alumnos matriculados en este curso.</p>';
      } else {
        currentList.innerHTML = enrollments.map(e => `
          <div class="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
            <span class="text-sm"><strong>${e.alumno_nombre}</strong> (${e.alumno_dni})</span>
            <button class="btn-icon btn-delete-enrollment" data-id="${e.id}" title="Quitar" style="width:26px;height:26px;">
              <i class="fa-solid fa-xmark" style="font-size:14px;"></i>
            </button>
          </div>
        `).join('');

        document.querySelectorAll('#enrollment-current-list .btn-delete-enrollment').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            if (confirm('¿Quitar este alumno del curso?')) {
              await apiFetch(`/api/matriculas/${id}`, { method: 'DELETE' });
              showToast('Alumno removido');
              openEditEnrollmentModal(cursoId);
            }
          });
        });
      }

      const available = allParticipants.filter(p => !enrolledIds.includes(p.id));
      if (available.length === 0) {
        addContainer.innerHTML = '<p class="text-sm text-slate-400">Todos los alumnos ya están matriculados en este curso.</p>';
      } else {
        addContainer.innerHTML = available.map(p => `
          <label class="flex items-center gap-2.5 py-1.5 px-2 hover:bg-white rounded-lg cursor-pointer">
            <input type="checkbox" class="enrollment-add-checkbox" value="${p.id}" style="accent-color:#e60000;">
            <span class="text-sm">${p.nombres} (${p.dni})</span>
          </label>
        `).join('');
      }
    } catch (e) {
      console.error(e);
      currentList.innerHTML = '<p class="text-sm text-red-500">Error al cargar datos.</p>';
      addContainer.innerHTML = '';
    }
  };

  document.getElementById('btn-enrollment-add-selected').addEventListener('click', async () => {
    const cursoId = document.getElementById('enrollment-edit-curso-id').value;
    if (!cursoId) return;
    const checkboxes = document.querySelectorAll('#enrollment-add-participants-container .enrollment-add-checkbox:checked');
    const participante_ids = Array.from(checkboxes).map(cb => parseInt(cb.value));

    if (participante_ids.length === 0) {
      showToast('Selecciona al menos un alumno para agregar', 'error');
      return;
    }

    try {
      await apiFetch('/api/matriculas/bulk', {
        method: 'POST',
        body: JSON.stringify({ curso_id: parseInt(cursoId), participante_ids })
      });
      showToast(`${participante_ids.length} alumno(s) agregado(s) al curso`);
      closeModal('modal-enrollment-edit');
      loadEnrollments();
    } catch (err) {
      console.error(err);
    }
  });

  (() => {
    const editModal = document.getElementById('modal-enrollment-edit');
    if (editModal) {
      editModal.querySelectorAll('[data-modal-close]').forEach(el => {
        el.addEventListener('click', () => {
          resetModalForm(editModal);
          editModal.classList.remove('is-open');
          editModal.setAttribute('aria-hidden', 'true');
        });
      });
    }
  })();

  const openGenerateCertificates = (cursoId, cursoNombre) => {
    const certModal = document.getElementById('modal-certificate');
    if (!certModal) return;
    certModal.classList.add('is-open');
    certModal.setAttribute('aria-hidden', 'false');

    const modalTitle = document.getElementById('modal-certificate-title');
    if (modalTitle) {
      modalTitle.textContent = `Generar Certificado - ${cursoNombre}`;
    }

    const today = new Date().toISOString().split('T')[0];
    const courseDate = document.getElementById('cert-course-date');
    const issueDate = document.getElementById('cert-issue-date');
    if (courseDate) courseDate.value = today;
    if (issueDate) issueDate.value = today;

    const matSelect = document.getElementById('cert-matricula');
    if (matSelect) {
      matSelect.innerHTML = '<option value="">Cargando matrículas de este curso...</option>';
    }

    const sig1Select = document.getElementById('cert-signature-1');
    const sig2Select = document.getElementById('cert-signature-2');
    if (sig1Select) sig1Select.innerHTML = '<option value="">Cargando firmas...</option>';
    if (sig2Select) sig2Select.innerHTML = '<option value="">Ninguna</option>';

    Promise.all([
      apiFetch(`/api/matriculas/by-course/${cursoId}`),
      apiFetch('/api/firmas'),
      apiFetch('/api/certificados')
    ]).then(([enrollments, signatures, certs]) => {
      if (!matSelect) return;
      const certMatriculaIds = new Set((certs || []).map(c => c.matricula_id));
      const available = enrollments.filter(e => !certMatriculaIds.has(e.id));

      if (available.length === 0) {
        matSelect.innerHTML = '<option value="">Todos los alumnos ya tienen certificado</option>';
      } else {
        matSelect.innerHTML = '<option value="">-- Selecciona una matrícula --</option>' +
          available.map(e => `<option value="${e.id}">${e.alumno_nombre} (${e.alumno_dni})</option>`).join('');
      }

      if (sig1Select && signatures && signatures.length) {
        sig1Select.innerHTML = '<option value="">-- Seleccionar firma --</option>' +
          signatures.map(s => `<option value="${s.id}">${s.nombre} (${s.cargo})</option>`).join('');
      }
      if (sig2Select && signatures && signatures.length) {
        sig2Select.innerHTML = '<option value="">Ninguna</option>' +
          signatures.map(s => `<option value="${s.id}">${s.nombre} (${s.cargo})</option>`).join('');
      }
    }).catch(err => {
      console.error(err);
      showToast('Error al cargar datos para certificado', 'error');
    });
  };

  const loadCertificates = async () => {
    const listContainer = document.getElementById('certificates-list');
    if (!listContainer) return;

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

  document.getElementById('form-enrollment').addEventListener('submit', async (e) => {
    e.preventDefault();
    const curso_id = parseInt(document.getElementById('enrollment-course').value);
    const checkboxes = document.querySelectorAll('#enrollment-participants-container .enrollment-participant-checkbox:checked');
    const participante_ids = Array.from(checkboxes).map(cb => parseInt(cb.value));
    const fecha_inicio = document.getElementById('enrollment-fecha-inicio').value || null;
    const fecha_fin = document.getElementById('enrollment-fecha-fin').value || null;

    if (!curso_id) {
      showToast('Debes seleccionar un curso', 'error');
      return;
    }
    if (participante_ids.length === 0) {
      showToast('Debes seleccionar al menos un alumno', 'error');
      return;
    }

    try {
      await apiFetch('/api/matriculas/bulk', {
        method: 'POST',
        body: JSON.stringify({ curso_id, participante_ids, fecha_inicio, fecha_fin })
      });
      showToast(`${participante_ids.length} matrícula(s) registrada(s) con éxito`);
      closeModal('modal-enrollment');
      loadEnrollments();
    } catch (err) {
      console.error(err);
    }
  });

  document.getElementById('enrollment-course').addEventListener('change', async function () {
    const cursoId = parseInt(this.value);
    const container = document.getElementById('enrollment-participants-container');
    const detailsEl = document.getElementById('enrollment-course-details');

    if (!cursoId || !container) {
      if (container) container.innerHTML = '<p class="text-sm text-slate-400 text-center py-4">Selecciona un curso para ver los alumnos disponibles.</p>';
      if (detailsEl) detailsEl.classList.add('hidden');
      return;
    }

    container.innerHTML = '<p class="text-sm text-slate-400 text-center py-4">Cargando alumnos...</p>';

    try {
      const [course, enrollments, allParticipants] = await Promise.all([
        apiFetch(`/api/cursos/${cursoId}`),
        apiFetch(`/api/matriculas/by-course/${cursoId}`),
        apiFetch('/api/participantes')
      ]);

      if (detailsEl && course) {
        document.getElementById('enrollment-course-name').textContent = course.nombre || '';
        document.getElementById('enrollment-course-code').textContent = course.codigo_curso || '';
        document.getElementById('enrollment-course-duration').textContent = course.duracion || '';
        document.getElementById('enrollment-course-category').textContent = course.categoria || 'N/A';
        document.getElementById('enrollment-course-trainer').textContent = course.entrenador || 'N/A';
        detailsEl.classList.remove('hidden');
      }

      const enrolledIds = enrollments.map(e => e.participante_id);
      const available = allParticipants.filter(p => !enrolledIds.includes(p.id));

      if (available.length === 0) {
        container.innerHTML = '<p class="text-sm text-slate-400 text-center py-4">Todos los alumnos ya están matriculados en este curso.</p>';
        return;
      }

      container.innerHTML = available.map(p => `
        <label class="flex items-center gap-2.5 py-1.5 px-2 hover:bg-white rounded-lg cursor-pointer">
          <input type="checkbox" class="enrollment-participant-checkbox" value="${p.id}" style="accent-color:#e60000;">
          <span class="text-sm">${p.nombres} (${p.dni})${p.cargo ? ' - ' + p.cargo : ''}</span>
        </label>
      `).join('');

      const countLabel = document.createElement('div');
      countLabel.className = 'text-xs text-on-surface-variant mt-1';
      countLabel.id = 'enrollment-count';
      container.appendChild(countLabel);

      container.addEventListener('change', () => {
        const checked = container.querySelectorAll('.enrollment-participant-checkbox:checked').length;
        const countEl = document.getElementById('enrollment-count');
        if (countEl) countEl.textContent = `${checked} alumno(s) seleccionado(s)`;
      });
    } catch (e) {
      console.error(e);
      container.innerHTML = '<p class="text-sm text-red-500 text-center py-4">Error al cargar datos.</p>';
    }
  });

  const loadSignatures = async () => {
    const listContainer = document.getElementById('signatures-list');
    if (!listContainer) return;
    listContainer.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b;">Cargando...</td></tr>';

    try {
      const firmas = await apiFetch('/api/firmas');
      if (!firmas) return;

      if (firmas.length === 0) {
        listContainer.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b;">No hay firmas registradas.</td></tr>';
        return;
      }

      listContainer.innerHTML = firmas.map(f => `
        <tr>
          <td>${f.id}</td>
          <td><strong>${f.nombre}</strong></td>
          <td>${f.cargo}</td>
          <td>${f.cip || 'N/A'}</td>
          <td class="actions-cell">
            <button class="btn-icon btn-edit-signature" data-id="${f.id}" title="Editar"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-icon btn-delete btn-delete-signature" data-id="${f.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `).join('');

      document.querySelectorAll('.btn-edit-signature').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const f = firmas.find(item => item.id == id);
          if (f) {
            document.getElementById('sig-id').value = f.id;
            document.getElementById('sig-name').value = f.nombre;
            document.getElementById('sig-role').value = f.cargo;
            document.getElementById('sig-cip').value = f.cip || '';
            document.getElementById('modal-signature-title').textContent = 'Editar Firma';
            const modal = document.getElementById('modal-signature');
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
          }
        });
      });

      document.querySelectorAll('.btn-delete-signature').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          if (confirm('¿Está seguro de eliminar esta firma?')) {
            await apiFetch(`/api/firmas/${id}`, { method: 'DELETE' });
            showToast('Firma eliminada correctamente');
            loadSignatures();
          }
        });
      });
    } catch (err) {
      console.error(err);
      listContainer.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b;">Error al cargar firmas.</td></tr>';
    }
  };

  document.getElementById('form-signature').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('sig-id').value;
    const nombre = document.getElementById('sig-name').value.trim();
    const cargo = document.getElementById('sig-role').value.trim();
    const cip = document.getElementById('sig-cip').value.trim();
    const fileInput = document.getElementById('sig-file');

    if (!id && (!fileInput.files || fileInput.files.length === 0)) {
      showToast('Debe subir una imagen de firma PNG o JPG.', 'error');
      return;
    }

    const body = {
      nombre,
      cargo,
      cip: cip || null
    };

    const submitForm = async (payload) => {
      try {
        await apiFetch(id ? `/api/firmas/${id}` : '/api/firmas', {
          method: id ? 'PUT' : 'POST',
          body: JSON.stringify(payload)
        });
        showToast(id ? 'Firma actualizada correctamente' : 'Firma agregada exitosamente');
        closeModal('modal-signature');
        loadSignatures();
      } catch (err) {
        console.error(err);
      }
    };

    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        body.firma_base64 = reader.result;
        await submitForm(body);
      };
      reader.onerror = () => {
        showToast('Error al leer el archivo de imagen.', 'error');
      };
      reader.readAsDataURL(file);
    } else {
      await submitForm(body);
    }
  });

  setupModalHandlers('modal-enrollment', 'btn-new-enrollment', async () => {
    document.getElementById('form-enrollment')?.reset();
    const detailsEl = document.getElementById('enrollment-course-details');
    if (detailsEl) detailsEl.classList.add('hidden');
    const container = document.getElementById('enrollment-participants-container');
    if (container) container.innerHTML = '<p class="text-sm text-slate-400 text-center py-4">Selecciona un curso para ver los alumnos disponibles.</p>';
    const select = document.getElementById('enrollment-course');
    if (!select) return;
    select.innerHTML = '<option value="">Cargando...</option>';
    try {
      const courses = await apiFetch('/api/cursos');
      select.innerHTML = courses && courses.length
        ? '<option value="">-- Seleccionar Curso --</option>' + courses.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')
        : '<option value="">No hay cursos registrados</option>';
    } catch (e) {
      console.error(e);
      select.innerHTML = '<option value="">Error al cargar cursos</option>';
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

  setupModalHandlers('modal-certificate', 'btn-new-certificate', () => {
    document.getElementById('form-certificate')?.reset();
  });

  setupModalHandlers('modal-signature', 'btn-new-signature', () => {
    document.getElementById('form-signature')?.reset();
    document.getElementById('sig-id').value = '';
    document.getElementById('modal-signature-title').textContent = 'Agregar Firma Autorizada';
  });

  document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login.html';
  });

  (async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/admin/login.html';
      return;
    }

    const userDisplay = document.getElementById('user-display');
    if (userDisplay) {
      try {
        const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
        userDisplay.textContent = user.nombre || user.email || 'Admin';
      } catch (e) {
        userDisplay.textContent = 'Admin';
      }
    }

    const valid = await checkSession();
    if (!valid) {
      window.location.href = '/admin/login.html';
    } else {
      loadDashboardStats();
    }
  })();