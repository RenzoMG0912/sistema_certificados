// Archivo: src/config/mockDb.js
// Base de datos en memoria para pruebas locales sin conexión a MySQL activa

const cursos = [
  { id: 1, codigo_curso: 'respuesta-emergencias', nombre: 'Respuesta a emergencias', duracion: '2 horas', categoria: 'Seguridad', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento' },
  { id: 2, codigo_curso: 'trabajo-altura', nombre: 'Trabajo en altura y plataforma elevada', duracion: '4 horas', categoria: 'Seguridad', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento' },
  { id: 3, codigo_curso: 'equipos-moviles', nombre: 'Equipos móviles / Manejo de llantas', duracion: '2 horas', categoria: 'Operaciones', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento' },
  { id: 4, codigo_curso: 'aislamiento-bloqueo', nombre: 'Aislamiento y bloqueo (LOTO)', duracion: '3 horas', categoria: 'Seguridad', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento' },
  { id: 5, codigo_curso: 'seguridad-electrica', nombre: 'Seguridad eléctrica', duracion: '3 horas', categoria: 'Seguridad', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento' },
  { id: 6, codigo_curso: 'elevacion-izaje', nombre: 'Elevación / izaje de cargas', duracion: '2 horas', categoria: 'Operaciones', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento' },
  { id: 7, codigo_curso: 'incendio-explosion', nombre: 'Incendio y explosión', duracion: '2 horas', categoria: 'Seguridad', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento' },
  { id: 8, codigo_curso: 'herramientas-manuales', nombre: 'Herramientas manuales y de poder', duracion: '2 horas', categoria: 'Operaciones', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento' },
  { id: 9, codigo_curso: 'sustancias-quimicas', nombre: 'Sustancias químicas', duracion: '2 horas', categoria: 'Salud Ocupacional', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento' }
];

const participantes = [
  { id: 1, nombres: 'Usuario Demo', dni: '00000000', email: 'demo@teamhsec.local', created_at: new Date().toISOString() }
];

const firmas = [
  { id: 1, nombre: 'Ing. Angel G. Baldeon Icochea', cargo: 'Gerente de Operaciones', firma_url: '/assets/img/firmas/firma_gerente.png', cip: '86277' },
  { id: 2, nombre: 'Ing. Gregorio A. Escajadillo Sarmiento', cargo: 'Entrenador', firma_url: '/assets/img/firmas/firma_gregorio.png', cip: '050142' }
];

const matriculas = [
  { id: 1, participante_id: 1, curso_id: 1, alumno_nombre: 'Usuario Demo', alumno_dni: '00000000', curso_nombre: 'Respuesta a emergencias', created_at: new Date().toISOString() }
];

const certificados = [
  {
    id: 1,
    codigo: 'PE-0001-26',
    hash: 'demo_hash_value_1234567890',
    matricula_id: 1,
    firma_id_1: 1,
    firma_id_2: 2,
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_vencimiento: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    pdf_path: '/certificados/respuesta-emergencias/00000000_PE-0001-26.pdf',
    alumno_nombre: 'Usuario Demo',
    alumno_dni: '00000000',
    curso_nombre: 'Respuesta a emergencias',
    curso_duracion: '2 horas',
    curso_entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento',
    firma_nombre_1: 'Ing. Angel G. Baldeon Icochea',
    firma_cargo_1: 'Gerente de Operaciones',
    firma_nombre_2: 'Ing. Gregorio A. Escajadillo Sarmiento',
    firma_cargo_2: 'Entrenador',
    created_at: new Date().toISOString()
  }
];

const verificaciones = [];

module.exports = {
  cursos,
  participantes,
  firmas,
  matriculas,
  certificados,
  verificaciones
};
