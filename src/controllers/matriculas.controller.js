const db = require('../config/db');
const mockDb = require('../config/mockDb');
const { crearNotificacion, TYPES } = require('./notificaciones.controller');

module.exports = {
  list: async (req, res, next) => {
    try {
      const query = `
        SELECT m.id, m.participante_id, m.edicion_id, m.created_at,
               p.nombres AS alumno_nombre, p.dni AS alumno_dni,
               c.nombre AS curso_nombre, e.codigo_edicion, e.fecha_inicio, e.fecha_fin
        FROM matriculas m
        JOIN participantes p ON m.participante_id = p.id
        JOIN ediciones e ON m.edicion_id = e.id
        JOIN cursos c ON e.curso_id = c.id
        ORDER BY m.id DESC
      `;
      const [rows] = await db.query(query);
      return res.status(200).json(rows);
    } catch (error) {
      console.warn('[Mock DB] Retornando listado de matrículas en memoria');
      const list = mockDb.matriculas.map(m => {
        const p = mockDb.participantes.find(item => item.id == m.participante_id);
        const e = mockDb.ediciones.find(ed => ed.id == m.edicion_id);
        const c = e ? mockDb.cursos.find(cur => cur.id == e.curso_id) : null;
        return {
          id: m.id,
          participante_id: m.participante_id,
          edicion_id: m.edicion_id,
          alumno_nombre: p ? p.nombres : 'Alumno Eliminado',
          alumno_dni: p ? p.dni : '00000000',
          curso_nombre: c ? c.nombre : 'Curso Eliminado',
          codigo_edicion: e ? e.codigo_edicion : '',
          fecha_inicio: e ? e.fecha_inicio : null,
          fecha_fin: e ? e.fecha_fin : null,
          created_at: m.created_at || new Date().toISOString()
        };
      }).reverse();
      return res.status(200).json(list);
    }
  },

  listGrouped: async (req, res, next) => {
    try {
      const query = `
        SELECT m.id, m.participante_id, m.edicion_id, m.created_at,
               p.nombres AS alumno_nombre, p.dni AS alumno_dni,
               c.id AS curso_id_ref, c.nombre AS curso_nombre,
               c.duracion AS curso_duracion, c.entrenador AS curso_entrenador,
               c.categoria AS curso_categoria, c.codigo_curso AS curso_codigo,
               e.codigo_edicion, e.fecha_inicio, e.fecha_fin
        FROM matriculas m
        JOIN participantes p ON m.participante_id = p.id
        JOIN ediciones e ON m.edicion_id = e.id
        JOIN cursos c ON e.curso_id = c.id
        ORDER BY c.nombre ASC, p.nombres ASC
      `;
      const [rows] = await db.query(query);

      const grouped = {};
      rows.forEach(r => {
        const key = r.curso_id_ref;
        if (!grouped[key]) {
          grouped[key] = {
            curso_id: key,
            curso_nombre: r.curso_nombre,
            curso_duracion: r.curso_duracion,
            curso_entrenador: r.curso_entrenador,
            curso_categoria: r.curso_categoria,
            curso_codigo: r.curso_codigo,
            enrollments: []
          };
        }
        grouped[key].enrollments.push({
          id: r.id,
          participante_id: r.participante_id,
          edicion_id: r.edicion_id,
          alumno_nombre: r.alumno_nombre,
          alumno_dni: r.alumno_dni,
          codigo_edicion: r.codigo_edicion,
          fecha_inicio: r.fecha_inicio,
          fecha_fin: r.fecha_fin,
          created_at: r.created_at
        });
      });

      return res.status(200).json(Object.values(grouped));
    } catch (error) {
      console.warn('[Mock DB] Retornando matrículas agrupadas en memoria');
      const grouped = {};
      mockDb.matriculas.forEach(m => {
        const p = mockDb.participantes.find(item => item.id == m.participante_id);
        const e = mockDb.ediciones.find(ed => ed.id == m.edicion_id);
        const c = e ? mockDb.cursos.find(cur => cur.id == e.curso_id) : null;
        const key = e ? e.curso_id : '0';
        if (!grouped[key]) {
          grouped[key] = {
            curso_id: key,
            curso_nombre: c ? c.nombre : 'Curso Eliminado',
            curso_duracion: c ? c.duracion : null,
            curso_entrenador: c ? c.entrenador : null,
            curso_categoria: c ? c.categoria : null,
            curso_codigo: c ? c.codigo_curso : null,
            enrollments: []
          };
        }
        grouped[key].enrollments.push({
          id: m.id,
          participante_id: m.participante_id,
          edicion_id: m.edicion_id,
          alumno_nombre: p ? p.nombres : 'Alumno Eliminado',
          alumno_dni: p ? p.dni : '00000000',
          codigo_edicion: e ? e.codigo_edicion : '',
          fecha_inicio: e ? e.fecha_inicio : null,
          fecha_fin: e ? e.fecha_fin : null,
          created_at: m.created_at || new Date().toISOString()
        });
      });
      return res.status(200).json(Object.values(grouped));
    }
  },

  getByEdicion: async (req, res, next) => {
    const { edicion_id } = req.params;
    try {
      const query = `
        SELECT m.id, m.participante_id, m.edicion_id, m.created_at,
               p.nombres AS alumno_nombre, p.dni AS alumno_dni
        FROM matriculas m
        JOIN participantes p ON m.participante_id = p.id
        WHERE m.edicion_id = ?
        ORDER BY p.nombres ASC
      `;
      const [rows] = await db.query(query, [edicion_id]);
      return res.status(200).json(rows);
    } catch (error) {
      const list = mockDb.matriculas
        .filter(m => m.edicion_id == edicion_id)
        .map(m => {
          const p = mockDb.participantes.find(item => item.id == m.participante_id);
          return {
            id: m.id,
            participante_id: m.participante_id,
            edicion_id: m.edicion_id,
            alumno_nombre: p ? p.nombres : 'Alumno Eliminado',
            alumno_dni: p ? p.dni : '00000000',
            created_at: m.created_at || new Date().toISOString()
          };
        });
      return res.status(200).json(list);
    }
  },

  getByCourse: async (req, res, next) => {
    const { curso_id } = req.params;
    try {
      const query = `
        SELECT m.id, m.participante_id, m.edicion_id, m.created_at,
               p.nombres AS alumno_nombre, p.dni AS alumno_dni,
               e.codigo_edicion, e.fecha_inicio, e.fecha_fin
        FROM matriculas m
        JOIN participantes p ON m.participante_id = p.id
        JOIN ediciones e ON m.edicion_id = e.id
        WHERE e.curso_id = ?
        ORDER BY p.nombres ASC
      `;
      const [rows] = await db.query(query, [curso_id]);
      return res.status(200).json(rows);
    } catch (error) {
      const list = mockDb.matriculas
        .filter(m => {
          const e = mockDb.ediciones.find(ed => ed.id == m.edicion_id);
          return e && e.curso_id == curso_id;
        })
        .map(m => {
          const p = mockDb.participantes.find(item => item.id == m.participante_id);
          const e = mockDb.ediciones.find(ed => ed.id == m.edicion_id);
          return {
            id: m.id,
            participante_id: m.participante_id,
            edicion_id: m.edicion_id,
            alumno_nombre: p ? p.nombres : 'Alumno Eliminado',
            alumno_dni: p ? p.dni : '00000000',
            codigo_edicion: e ? e.codigo_edicion : '',
            fecha_inicio: e ? e.fecha_inicio : null,
            fecha_fin: e ? e.fecha_fin : null,
            created_at: m.created_at || new Date().toISOString()
          };
        });
      return res.status(200).json(list);
    }
  },

  create: async (req, res, next) => {
    const { participante_id, edicion_id } = req.body;
    try {
      const [check] = await db.query(
        'SELECT id FROM matriculas WHERE participante_id = ? AND edicion_id = ?',
        [participante_id, edicion_id]
      );
      if (check.length > 0) {
        return res.status(400).json({ success: false, message: 'El alumno ya se encuentra matriculado en esta edición' });
      }

      const [result] = await db.query(
        'INSERT INTO matriculas (participante_id, edicion_id) VALUES (?, ?)',
        [participante_id, edicion_id]
      );
      const [newRow] = await db.query('SELECT * FROM matriculas WHERE id = ?', [result.insertId]);

      const [edicionRows] = await db.query(`
        SELECT c.nombre FROM ediciones e JOIN cursos c ON e.curso_id = c.id WHERE e.id = ?
      `, [edicion_id]);
      const [participanteRows] = await db.query('SELECT nombres, id FROM participantes WHERE id = ?', [participante_id]);
      const cursoNombre = edicionRows[0]?.nombre || 'Curso';
      const alumnoNombre = participanteRows[0]?.nombres || 'Alumno';

      await crearNotificacion({ usuario_tipo: 'alumno', usuario_id: participante_id, titulo: 'Nueva matrícula', mensaje: `Has sido matriculado en "${cursoNombre}".`, tipo: TYPES.SUCCESS });
      await crearNotificacion({ usuario_tipo: 'admin', usuario_id: 1, titulo: 'Nueva matrícula', mensaje: `${alumnoNombre} fue matriculado en "${cursoNombre}".`, tipo: TYPES.INFO });

      return res.status(201).json({ success: true, matricula: newRow[0] });
    } catch (error) {
      console.warn('[Mock DB] Creando matrícula en memoria temporal');
      const exists = mockDb.matriculas.some(m => m.participante_id == participante_id && m.edicion_id == edicion_id);
      if (exists) {
        return res.status(400).json({ success: false, message: 'El alumno ya se encuentra matriculado en esta edición' });
      }

      const newM = {
        id: mockDb.matriculas.length + 1,
        participante_id,
        edicion_id,
        created_at: new Date().toISOString()
      };
      mockDb.matriculas.push(newM);

      const e = mockDb.ediciones.find(ed => ed.id == edicion_id);
      const c = e ? mockDb.cursos.find(cur => cur.id == e.curso_id) : null;
      const participanteMock = mockDb.participantes.find(p => p.id == participante_id);
      const cursoNombre = c?.nombre || 'Curso';
      const alumnoNombre = participanteMock?.nombres || 'Alumno';

      mockDb.notificaciones.push({ id: mockDb.notificaciones.length + 1, usuario_tipo: 'alumno', usuario_id: participante_id, titulo: 'Nueva matrícula', mensaje: `Has sido matriculado en "${cursoNombre}".`, tipo: TYPES.SUCCESS, leida: 0, created_at: new Date().toISOString() });
      mockDb.notificaciones.push({ id: mockDb.notificaciones.length + 1, usuario_tipo: 'admin', usuario_id: 1, titulo: 'Nueva matrícula', mensaje: `${alumnoNombre} fue matriculado en "${cursoNombre}".`, tipo: TYPES.INFO, leida: 0, created_at: new Date().toISOString() });

      return res.status(201).json({ success: true, matricula: newM });
    }
  },

  bulkCreate: async (req, res, next) => {
    const { edicion_id, participante_ids } = req.body;
    if (!edicion_id || !participante_ids || !Array.isArray(participante_ids) || participante_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Debe especificar una edición y al menos un alumno' });
    }

    try {
      const inserted = [];
      const [edicionInfo] = await db.query(`
        SELECT c.nombre FROM ediciones e JOIN cursos c ON e.curso_id = c.id WHERE e.id = ?
      `, [edicion_id]);
      const cursoNombre = edicionInfo[0]?.nombre || 'Curso';

      for (const pid of participante_ids) {
        const [check] = await db.query(
          'SELECT id FROM matriculas WHERE participante_id = ? AND edicion_id = ?',
          [pid, edicion_id]
        );
        if (check.length === 0) {
          const [result] = await db.query(
            'INSERT INTO matriculas (participante_id, edicion_id) VALUES (?, ?)',
            [pid, edicion_id]
          );
          inserted.push({ id: result.insertId, participante_id: pid, edicion_id });

          const [pRows] = await db.query('SELECT nombres FROM participantes WHERE id = ?', [pid]);
          const alumnoNombre = pRows[0]?.nombres || 'Alumno';
          await crearNotificacion({ usuario_tipo: 'alumno', usuario_id: pid, titulo: 'Nueva matrícula', mensaje: `Has sido matriculado en "${cursoNombre}".`, tipo: TYPES.SUCCESS });
          await crearNotificacion({ usuario_tipo: 'admin', usuario_id: 1, titulo: 'Nueva matrícula', mensaje: `${alumnoNombre} fue matriculado en "${cursoNombre}".`, tipo: TYPES.INFO });
        }
      }
      return res.status(201).json({ success: true, message: `${inserted.length} matrícula(s) creada(s)`, matriculas: inserted });
    } catch (error) {
      console.warn('[Mock DB] Creando matrículas masivas en memoria temporal');
      const inserted = [];
      const e = mockDb.ediciones.find(ed => ed.id == edicion_id);
      const c = e ? mockDb.cursos.find(cur => cur.id == e.curso_id) : null;
      const cursoNombre = c?.nombre || 'Curso';

      for (const pid of participante_ids) {
        const exists = mockDb.matriculas.some(m => m.participante_id == pid && m.edicion_id == edicion_id);
        if (!exists) {
          const newM = {
            id: mockDb.matriculas.length + 1,
            participante_id: pid,
            edicion_id,
            created_at: new Date().toISOString()
          };
          mockDb.matriculas.push(newM);
          inserted.push(newM);

          const participanteMock = mockDb.participantes.find(p => p.id == pid);
          const alumnoNombre = participanteMock?.nombres || 'Alumno';
          mockDb.notificaciones.push({ id: mockDb.notificaciones.length + 1, usuario_tipo: 'alumno', usuario_id: pid, titulo: 'Nueva matrícula', mensaje: `Has sido matriculado en "${cursoNombre}".`, tipo: TYPES.SUCCESS, leida: 0, created_at: new Date().toISOString() });
          mockDb.notificaciones.push({ id: mockDb.notificaciones.length + 1, usuario_tipo: 'admin', usuario_id: 1, titulo: 'Nueva matrícula', mensaje: `${alumnoNombre} fue matriculado en "${cursoNombre}".`, tipo: TYPES.INFO, leida: 0, created_at: new Date().toISOString() });
        }
      }
      return res.status(201).json({ success: true, message: `${inserted.length} matrícula(s) creada(s)`, matriculas: inserted });
    }
  },

  delete: async (req, res, next) => {
    const { id } = req.params;
    try {
      const [enrollment] = await db.query('SELECT id FROM matriculas WHERE id = ?', [id]);
      if (enrollment.length === 0) {
        return res.status(404).json({ success: false, message: 'Matrícula no encontrada' });
      }
      await db.query('DELETE FROM matriculas WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Matrícula eliminada correctamente' });
    } catch (error) {
      const index = mockDb.matriculas.findIndex(m => m.id == id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Matrícula no encontrada' });
      }
      mockDb.matriculas.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Matrícula eliminada correctamente' });
    }
  },

  deleteByEdicion: async (req, res, next) => {
    const { edicion_id } = req.params;
    try {
      const [enrollments] = await db.query('SELECT id FROM matriculas WHERE edicion_id = ?', [edicion_id]);
      if (enrollments.length === 0) {
        return res.status(404).json({ success: false, message: 'No hay alumnos matriculados en esta edición' });
      }
      await db.query('DELETE FROM matriculas WHERE edicion_id = ?', [edicion_id]);
      return res.status(200).json({ success: true, message: 'Todas las matrículas de esta edición han sido eliminadas' });
    } catch (error) {
      const matIds = new Set(mockDb.matriculas.filter(m => m.edicion_id == edicion_id).map(m => m.id));
      if (matIds.size === 0) {
        return res.status(404).json({ success: false, message: 'No hay alumnos matriculados en esta edición' });
      }
      mockDb.matriculas = mockDb.matriculas.filter(m => !matIds.has(m.id));
      mockDb.certificados = mockDb.certificados.filter(c => !matIds.has(c.matricula_id));
      return res.status(200).json({ success: true, message: 'Todas las matrículas de esta edición han sido eliminadas' });
    }
  }
};
