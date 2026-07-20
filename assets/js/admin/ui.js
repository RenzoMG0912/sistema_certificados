import { el, showToast } from './utils.js';
import { loadDashboardStats } from './dashboard.js';
import { loadCourses } from './courses.js';
import { loadParticipants } from './participants.js';
import { loadEnrollments } from './enrollments.js';
import { loadCertificates } from './certificates.js';
import { loadSignatures } from './signatures.js';

const updatePageHeader = (tabId) => {
  const pageTitle = el('page-title');
  const pageSubtitle = el('page-subtitle');
  const breadcrumb = el('breadcrumb-section');
  const titles = {
    inicio: 'Resumen del Sistema',
    cursos: 'Gestión de Cursos',
    participantes: 'Gestión de Alumnos',
    matriculas: 'Gestión de Matrículas',
    certificados: 'Historial de Certificados',
    firmas: 'Firmas Autorizadas'
  };
  const subtitles = {
    inicio: 'Visualiza un resumen general de la actividad del sistema.',
    cursos: 'Administra el catálogo de cursos y entrenamientos registrados.',
    participantes: 'Administra la información y el estado de los alumnos del sistema.',
    matriculas: 'Registros oficiales de inscripción de alumnos activos en los cursos.',
    certificados: 'Consulta y administra los certificados emitidos.',
    firmas: 'Controla las firmas autorizadas para certificados.'
  };
  const crumbs = {
    inicio: 'Panel',
    cursos: 'Cursos',
    participantes: 'Alumnos',
    matriculas: 'Matrículas',
    certificados: 'Certificados',
    firmas: 'Firmas'
  };

  if (pageTitle) pageTitle.textContent = titles[tabId] || 'TEAM HSEC';
  if (pageSubtitle) pageSubtitle.textContent = subtitles[tabId] || '';
  if (breadcrumb) breadcrumb.textContent = crumbs[tabId] || 'Panel';
};

export const setActiveTab = (tabId) => {
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
    link.classList.toggle('active', link.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(section => {
    section.classList.toggle('active', section.id === `tab-${tabId}`);
  });
  updatePageHeader(tabId);

  // Toggle header action buttons based on active tab
  if (el('btn-new-course')) el('btn-new-course').classList.toggle('hidden', tabId !== 'cursos');
  if (el('btn-new-participant')) el('btn-new-participant').classList.toggle('hidden', tabId !== 'participantes');
  if (el('btn-new-enrollment')) el('btn-new-enrollment').classList.toggle('hidden', tabId !== 'matriculas');
  if (el('btn-new-certificate')) el('btn-new-certificate').classList.toggle('hidden', tabId !== 'certificados');
  if (el('btn-new-signature')) el('btn-new-signature').classList.toggle('hidden', tabId !== 'firmas');
};

export const loadCurrentSection = async (tabId) => {
  try {
    if (tabId === 'inicio') await loadDashboardStats();
    if (tabId === 'cursos') await loadCourses();
    if (tabId === 'participantes') await loadParticipants();
    if (tabId === 'matriculas') await loadEnrollments();
    if (tabId === 'certificados') await loadCertificates();
    if (tabId === 'firmas') await loadSignatures();
  } catch (error) {
    console.error(error);
    showToast(error.message || 'Error cargando información', 'error');
  }
};

export const initTabs = () => {
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const tabId = link.dataset.tab;
      setActiveTab(tabId);
      loadCurrentSection(tabId);
    });
  });
};
