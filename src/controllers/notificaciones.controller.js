const db = require('../config/db');
const mockDb = require('../config/mockDb');

const TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

async function crearNotificacion({ usuario_tipo, usuario_id, titulo, mensaje, tipo = TYPES.INFO }) {
  try {
    await db.query(
      'INSERT INTO notificaciones (usuario_tipo, usuario_id, titulo, mensaje, tipo) VALUES (?, ?, ?, ?, ?)',
      [usuario_tipo, usuario_id, titulo, mensaje, tipo]
    );
  } catch (error) {
    console.warn('[Mock DB] Creando notificación en memoria');
    const notif = {
      id: mockDb.notificaciones.length + 1,
      usuario_tipo,
      usuario_id,
      titulo,
      mensaje,
      tipo,
      leida: 0,
      created_at: new Date().toISOString()
    };
    mockDb.notificaciones.push(notif);
  }
}

async function checkExpiringCertificates() {
  try {
    const [rows] = await db.query(`
      SELECT c.id, c.codigo, c.fecha_vencimiento, c.matricula_id,
             p.nombres AS alumno_nombre, p.id AS participante_id,
             cur.nombre AS curso_nombre
      FROM certificados c
      JOIN matriculas m ON c.matricula_id = m.id
      JOIN participantes p ON m.participante_id = p.id
      JOIN cursos cur ON m.curso_id = cur.id
      WHERE c.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND c.fecha_vencimiento < '2999-01-01'
    `);

    for (const cert of rows) {
      const existsQuery = await db.query(
        'SELECT id FROM notificaciones WHERE titulo = ? AND usuario_id = ? AND mensaje LIKE ?',
        ['Certificado próximo a vencer', 1, `%${cert.codigo}%`]
      );

      if (existsQuery[0].length === 0) {
        const dias = Math.ceil((new Date(cert.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24));
        await crearNotificacion({
          usuario_tipo: 'admin',
          usuario_id: 1,
          titulo: 'Certificado próximo a vencer',
          mensaje: `El certificado ${cert.codigo} de ${cert.alumno_nombre} (${cert.curso_nombre}) vence en ${dias} día(s).`,
          tipo: TYPES.WARNING
        });
        if (cert.participante_id) {
          await crearNotificacion({
            usuario_tipo: 'alumno',
            usuario_id: cert.participante_id,
            titulo: 'Certificado próximo a vencer',
            mensaje: `Tu certificado "${cert.curso_nombre}" (código: ${cert.codigo}) vence en ${dias} día(s).`,
            tipo: TYPES.WARNING
          });
        }
      }
    }
  } catch (error) {
    // Fallback mock
    const now = new Date();
    const in30 = new Date(now);
    in30.setDate(in30.getDate() + 30);

    for (const cert of mockDb.certificados) {
      if (!cert.fecha_vencimiento) continue;
      const venc = new Date(cert.fecha_vencimiento);
      if (venc > now && venc <= in30 && venc < new Date('2999-01-01')) {
        const exists = mockDb.notificaciones.some(
          n => n.titulo === 'Certificado próximo a vencer' && n.usuario_id === 1 && n.mensaje?.includes(cert.codigo)
        );
        if (!exists) {
          const dias = Math.ceil((venc - now) / (1000 * 60 * 60 * 24));
          mockDb.notificaciones.push({
            id: mockDb.notificaciones.length + 1,
            usuario_tipo: 'admin',
            usuario_id: 1,
            titulo: 'Certificado próximo a vencer',
            mensaje: `El certificado ${cert.codigo} de ${cert.alumno_nombre || 'Alumno'} vence en ${dias} día(s).`,
            tipo: TYPES.WARNING,
            leida: 0,
            created_at: now.toISOString()
          });
        }
      }
    }
  }
}

module.exports = {
  TYPES,
  crearNotificacion,
  checkExpiringCertificates,

  list: async (req, res, next) => {
    const { usuario_tipo, usuario_id } = req;
    try {
      const [rows] = await db.query(
        'SELECT * FROM notificaciones WHERE usuario_tipo = ? AND usuario_id = ? ORDER BY created_at DESC LIMIT 50',
        [usuario_tipo, usuario_id]
      );
      return res.status(200).json(rows);
    } catch (error) {
      const list = mockDb.notificaciones
        .filter(n => n.usuario_tipo === usuario_tipo && n.usuario_id == usuario_id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 50);
      return res.status(200).json(list);
    }
  },

  unreadCount: async (req, res, next) => {
    const { usuario_tipo, usuario_id } = req;
    try {
      const [rows] = await db.query(
        'SELECT COUNT(*) AS count FROM notificaciones WHERE usuario_tipo = ? AND usuario_id = ? AND leida = 0',
        [usuario_tipo, usuario_id]
      );
      return res.status(200).json({ count: parseInt(rows[0].count, 10) });
    } catch (error) {
      const count = mockDb.notificaciones.filter(
        n => n.usuario_tipo === usuario_tipo && n.usuario_id == usuario_id && n.leida === 0
      ).length;
      return res.status(200).json({ count });
    }
  },

  markRead: async (req, res, next) => {
    const { id } = req.params;
    const { usuario_tipo, usuario_id } = req;
    try {
      await db.query(
        'UPDATE notificaciones SET leida = 1 WHERE id = ? AND usuario_tipo = ? AND usuario_id = ?',
        [id, usuario_tipo, usuario_id]
      );
      return res.status(200).json({ success: true });
    } catch (error) {
      const notif = mockDb.notificaciones.find(
        n => n.id == id && n.usuario_tipo === usuario_tipo && n.usuario_id == usuario_id
      );
      if (notif) notif.leida = 1;
      return res.status(200).json({ success: true });
    }
  },

  markAllRead: async (req, res, next) => {
    const { usuario_tipo, usuario_id } = req;
    try {
      await db.query(
        'UPDATE notificaciones SET leida = 1 WHERE usuario_tipo = ? AND usuario_id = ? AND leida = 0',
        [usuario_tipo, usuario_id]
      );
      return res.status(200).json({ success: true });
    } catch (error) {
      mockDb.notificaciones
        .filter(n => n.usuario_tipo === usuario_tipo && n.usuario_id == usuario_id && n.leida === 0)
        .forEach(n => n.leida = 1);
      return res.status(200).json({ success: true });
    }
  }
};
