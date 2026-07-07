// Archivo: src/routes/index.js
const router = require('express').Router();
const db = require('../config/db');
const mockDb = require('../config/mockDb');
const authMiddleware = require('../middlewares/auth.middleware');

// Importar enrutadores específicos
const authRoutes = require('./auth.routes');
const cursosRoutes = require('./cursos.routes');
const participantesRoutes = require('./participantes.routes');
const matriculasRoutes = require('./matriculas.routes');
const certificadosRoutes = require('./certificados.routes');
const verificarRoutes = require('./verificar.routes');
const firmasRoutes = require('./firmas.routes');
const smtpTestRoutes = require('./smtp-test.routes');
const studentAuthRoutes = require('./studentAuth.routes');
const studentRoutes = require('./student.routes');
const unifiedAuthRoutes = require('./unifiedAuth.routes');
const notificacionesRoutes = require('./notificaciones.routes');

// Vincular rutas a la API
router.use('/auth', authRoutes);
router.use('/unified-auth', unifiedAuthRoutes);
router.use('/cursos', cursosRoutes);
router.use('/participantes', participantesRoutes);
router.use('/matriculas', matriculasRoutes);
router.use('/certificados', certificadosRoutes);
router.use('/verificar', verificarRoutes);
router.use('/firmas', firmasRoutes);
router.use('/smtp-test', smtpTestRoutes);
router.use('/notificaciones', notificacionesRoutes);
router.use('/student/auth', studentAuthRoutes);
router.use('/student', studentRoutes);

const { checkExpiringCertificates } = require('../controllers/notificaciones.controller');

// Ruta adicional: Estadísticas del Dashboard Administrativo
router.get('/admin/dashboard', authMiddleware, async (req, res, next) => {
  checkExpiringCertificates().catch(() => {});
  try {
    const [pRows] = await db.query('SELECT COUNT(*) AS count FROM participantes');
    const [cRows] = await db.query('SELECT COUNT(*) AS count FROM cursos');
    const [certRows] = await db.query('SELECT COUNT(*) AS count FROM certificados');

    const recentQuery = `
      SELECT c.id, c.codigo, c.fecha_emision, c.fecha_vencimiento, c.pdf_path,
             p.nombres AS alumno_nombre, p.dni AS alumno_dni,
             cur.nombre AS curso_nombre
      FROM certificados c
      JOIN matriculas m ON c.matricula_id = m.id
      JOIN participantes p ON m.participante_id = p.id
      JOIN cursos cur ON m.curso_id = cur.id
      ORDER BY c.id DESC
      LIMIT 5
    `;
    const [recentRows] = await db.query(recentQuery);

    return res.status(200).json({
      totalParticipantes: parseInt(pRows[0].count, 10),
      totalCursos: parseInt(cRows[0].count, 10),
      totalCertificados: parseInt(certRows[0].count, 10),
      recientes: recentRows
    });
  } catch (error) {
    console.warn('[Mock DB] Fallback de estadísticas de dashboard administrativas');
    
    // Retornar métricas desde los arreglos en memoria
    const recentList = mockDb.certificados.map(c => {
      return {
        id: c.id,
        codigo: c.codigo,
        fecha_emision: c.fecha_emision,
        fecha_vencimiento: c.fecha_vencimiento,
        pdf_path: c.pdf_path,
        alumno_nombre: c.alumno_nombre || 'Alumno',
        alumno_dni: c.alumno_dni || '00000000',
        curso_nombre: c.curso_nombre || 'Curso'
      };
    }).reverse().slice(0, 5);

    return res.status(200).json({
      totalParticipantes: mockDb.participantes.length,
      totalCursos: mockDb.cursos.length,
      totalCertificados: mockDb.certificados.length,
      recientes: recentList
    });
  }
});

module.exports = router;
