// Archivo: src/config/mockDb.js
// Base de datos en memoria para pruebas locales sin conexión a MySQL activa

const cursos = [
  { id: 1, codigo_curso: 'respuesta-emergencias', nombre: 'Respuesta a emergencias', duracion: '2 horas', categoria: 'Seguridad', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento', firma_id: 2, temario: '1. Introducción a la respuesta a emergencias\n2. Tipos de emergencias mineras\n3. Plan de emergencia\n4. Evacuación y procedimientos\n5. Primeros auxilios\n6. Simulacros' },
  { id: 2, codigo_curso: 'trabajo-altura', nombre: 'Trabajo en altura y plataforma elevada', duracion: '4 horas', categoria: 'Seguridad', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento', firma_id: 2, temario: '1. Normativa de trabajo en altura\n2. Equipos de protección contra caídas\n3. Inspección de equipos\n4. Anclajes y sistemas de detención\n5. Uso de plataformas elevadas' },
  { id: 3, codigo_curso: 'equipos-moviles', nombre: 'Equipos móviles / Manejo de llantas', duracion: '2 horas', categoria: 'Operaciones', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento', firma_id: 2, temario: '1. Clasificación de equipos móviles\n2. Operación segura\n3. Mantenimiento preventivo\n4. Cambio de llantas\n5. Riesgos y prevención' },
  { id: 4, codigo_curso: 'aislamiento-bloqueo', nombre: 'Aislamiento y bloqueo (LOTO)', duracion: '3 horas', categoria: 'Seguridad', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento', firma_id: 2, temario: '1. Conceptos de LOTO\n2. Procedimiento de aislamiento\n3. Dispositivos de bloqueo\n4. Verificación de energía cero\n5. Retirada de candados' },
  { id: 5, codigo_curso: 'seguridad-electrica', nombre: 'Seguridad eléctrica', duracion: '3 horas', categoria: 'Seguridad', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento', firma_id: 2, temario: '1. Riesgos eléctricos\n2. Normativa eléctrica\n3. EPP dieléctrico\n4. Bloqueo y etiquetado\n5. Trabajo seguro con energía' },
  { id: 6, codigo_curso: 'elevacion-izaje', nombre: 'Elevación / izaje de cargas', duracion: '2 horas', categoria: 'Operaciones', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento', firma_id: 2, temario: '1. Conceptos de izaje\n2. Eslingas y accesorios\n3. Carga y descarga\n4. Señalización\n5. Riesgos en izaje' },
  { id: 7, codigo_curso: 'incendio-explosion', nombre: 'Incendio y explosión', duracion: '2 horas', categoria: 'Seguridad', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento', firma_id: 2, temario: '1. Triangleo del fuego\n2. Agentes extintores\n3. Uso de extintores\n4. Evacuación por incendio\n5. Simulacros de incendio' },
  { id: 8, codigo_curso: 'herramientas-manuales', nombre: 'Herramientas manuales y de poder', duracion: '2 horas', categoria: 'Operaciones', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento', firma_id: 2, temario: '1. Clasificación de herramientas\n2. Uso correcto\n3. Inspección y mantenimiento\n4. EPP para herramientas\n5. Riesgos y prevención' },
  { id: 9, codigo_curso: 'sustancias-quimicas', nombre: 'Sustancias químicas', duracion: '2 horas', categoria: 'Salud Ocupacional', entrenador: 'Ing. Gregorio A. Escajadillo Sarmiento', firma_id: 2, temario: '1. Introducción\n2. Normativa aplicable\n3. Definición de Materiales Peligrosos\n4. Accidentes con Materiales Peligrosos\n5. Incidente con Materiales Peligrosos\n6. Niveles de Entrenamiento\n7. Sistema de Reconocimiento\n8. Clasificación de Materiales Peligrosos\n9. Rombo NFP 704\n10. Comportamiento de Sustancias Peligrosas\n11. Placa DOT\n12. Comunidad Europea\n13. Ficha de Datos de Seguridad (FDS9)\n14. Uso de Guía GRE' }
];

const participantes = [
  { id: 1, nombres: 'Usuario Demo', dni: '00000000', email: 'demo@teamhsec.local', cargo: 'ING. SUPERVISOR', telefono: '964680064', procedencia: 'HUANCAYO', induccion: 'APTO', examen_medico: 'APTO', created_at: new Date().toISOString() }
];

const firmas = [
  { id: 1, nombre: 'Ing. Angel G. Baldeon Icochea', cargo: 'Gerente de Operaciones', firma_url: '/assets/img/firmas/firma_gerente.png', cip: '86277' },
  { id: 2, nombre: 'Ing. Gregorio A. Escajadillo Sarmiento', cargo: 'Entrenador', firma_url: '/assets/img/firmas/firma_gregorio.png', cip: '050142' }
];

const matriculas = [
  { id: 1, participante_id: 1, curso_id: 1, alumno_nombre: 'Usuario Demo', alumno_dni: '00000000', curso_nombre: 'Respuesta a emergencias', fecha_inicio: null, fecha_fin: null, created_at: new Date().toISOString() }
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

const usuarios = [
  { id: 1, nombre: 'Administrador', email: 'admin@teamhsec.com', password: 'Admin123!', rol: 'admin' }
];

const verificaciones = [];

const notificaciones = [];

module.exports = {
  usuarios,
  cursos,
  participantes,
  firmas,
  matriculas,
  certificados,
  verificaciones,
  notificaciones
};
