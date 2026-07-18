// Archivo: src/routes/student.routes.js
const router = require('express').Router();
const db = require('../config/db');
const mockDb = require('../config/mockDb');
const studentAuthMiddleware = require('../middlewares/studentAuth.middleware');

// Proteger todas las rutas estudiantiles
router.use(studentAuthMiddleware);

// Perfil del estudiante
router.get('/profile', async (req, res) => {
  const { id } = req.estudiante;
  try {
    const [rows] = await db.query(
      'SELECT id, nombres, dni, email, cargo, telefono, procedencia, induccion, examen_medico, created_at FROM participantes WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    const p = mockDb.participantes.find(item => item.id == id);
    if (!p) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }
    const { password, ...profile } = p;
    return res.status(200).json(profile);
  }
});

// Estadísticas del estudiante
router.get('/stats', async (req, res) => {
  const { id } = req.estudiante;
  try {
    const [matriculas] = await db.query(
      'SELECT COUNT(*) AS count FROM matriculas WHERE participante_id = ?', [id]
    );
    const [certificados] = await db.query(
      `SELECT COUNT(*) AS count FROM certificados c
       JOIN matriculas m ON c.matricula_id = m.id
       WHERE m.participante_id = ?`, [id]
    );

    // Promedio de cursos completados (certificados / matriculas * 100)
    const totalMatriculas = parseInt(matriculas[0].count, 10);
    const totalCertificados = parseInt(certificados[0].count, 10);
    const porcentajeCompletado = totalMatriculas > 0
      ? Math.round((totalCertificados / totalMatriculas) * 100)
      : 0;

    return res.status(200).json({
      totalCursos: totalMatriculas,
      totalCertificados,
      porcentajeCompletado
    });
  } catch (error) {
    const mats = mockDb.matriculas.filter(m => m.participante_id == id);
    const certs = mockDb.certificados.filter(c =>
      mats.some(m => m.id == c.matricula_id)
    );
    return res.status(200).json({
      totalCursos: mats.length,
      totalCertificados: certs.length,
      porcentajeCompletado: mats.length > 0 ? Math.round((certs.length / mats.length) * 100) : 0
    });
  }
});

// Cursos matriculados del estudiante
router.get('/courses', async (req, res) => {
  const { id } = req.estudiante;
  try {
    const query = `
      SELECT m.id AS matricula_id, e.fecha_inicio, e.fecha_fin,
             c.id AS curso_id, c.codigo_curso, c.nombre AS curso_nombre,
             c.duracion, c.categoria, c.entrenador,
             CASE WHEN cert.id IS NOT NULL THEN 1 ELSE 0 END AS tiene_certificado,
             cert.codigo AS certificado_codigo, cert.fecha_emision AS certificado_fecha
      FROM matriculas m
      JOIN ediciones e ON m.edicion_id = e.id
      JOIN cursos c ON e.curso_id = c.id
      LEFT JOIN certificados cert ON cert.matricula_id = m.id
      WHERE m.participante_id = ?
      ORDER BY e.fecha_inicio DESC
    `;
    const [rows] = await db.query(query, [id]);
    return res.status(200).json(rows);
  } catch (error) {
    const mats = mockDb.matriculas.filter(m => m.participante_id == id);
    const result = mats.map(m => {
      const e = mockDb.ediciones.find(ed => ed.id == m.edicion_id);
      const c = e ? mockDb.cursos.find(cur => cur.id == e.curso_id) : null;
      const cert = mockDb.certificados.find(cert => cert.matricula_id == m.id);
      return {
        matricula_id: m.id,
        fecha_inicio: e ? e.fecha_inicio : null,
        fecha_fin: e ? e.fecha_fin : null,
        curso_id: e ? e.curso_id : null,
        codigo_curso: c ? c.codigo_curso : '',
        curso_nombre: c ? c.nombre : 'Curso Eliminado',
        duracion: c ? c.duracion : '',
        categoria: c ? c.categoria : '',
        entrenador: c ? c.entrenador : '',
        tiene_certificado: cert ? 1 : 0,
        certificado_codigo: cert ? cert.codigo : null,
        certificado_fecha: cert ? cert.fecha_emision : null
      };
    });
    return res.status(200).json(result);
  }
});

// Certificados del estudiante
router.get('/certificates', async (req, res) => {
  const { id } = req.estudiante;
  try {
    const query = `
      SELECT cert.id, cert.codigo, cert.hash, cert.fecha_emision, cert.fecha_vencimiento,
             cert.pdf_path,
             c.nombre AS curso_nombre, c.duracion AS curso_duracion,
             c.codigo_curso
      FROM certificados cert
      JOIN matriculas m ON cert.matricula_id = m.id
      JOIN ediciones e ON m.edicion_id = e.id
      JOIN cursos c ON e.curso_id = c.id
      WHERE m.participante_id = ?
      ORDER BY cert.fecha_emision DESC
    `;
    const [rows] = await db.query(query, [id]);
    return res.status(200).json(rows);
  } catch (error) {
    const mats = mockDb.matriculas.filter(m => m.participante_id == id);
    const certs = mockDb.certificados
      .filter(c => mats.some(m => m.id == c.matricula_id))
      .map(c => {
        const mat = mockDb.matriculas.find(m => m.id == c.matricula_id);
        const ed = mat ? mockDb.ediciones.find(e => e.id == mat.edicion_id) : null;
        const curso = mat && ed ? mockDb.cursos.find(cur => cur.id == ed.curso_id) : null;
        return {
          id: c.id,
          codigo: c.codigo,
          hash: c.hash,
          fecha_emision: c.fecha_emision,
          fecha_vencimiento: c.fecha_vencimiento,
          pdf_path: c.pdf_path,
          curso_nombre: c.curso_nombre || (curso ? curso.nombre : ''),
          curso_duracion: c.curso_duracion || (curso ? curso.duracion : ''),
          codigo_curso: curso ? curso.codigo_curso : ''
        };
      })
      .reverse();
    return res.status(200).json(certs);
  }
});

module.exports = router;
