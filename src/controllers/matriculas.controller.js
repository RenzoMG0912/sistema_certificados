const db = require('../config/db');
const mockDb = require('../config/mockDb');

module.exports = {
  list: async (req, res, next) => {
    try {
      const query = `
        SELECT m.id, m.participante_id, m.curso_id, m.fecha_inicio, m.fecha_fin, m.created_at,
               p.nombres AS alumno_nombre, p.dni AS alumno_dni,
               c.nombre AS curso_nombre
        FROM matriculas m
        JOIN participantes p ON m.participante_id = p.id
        JOIN cursos c ON m.curso_id = c.id
        ORDER BY m.id DESC
      `;
      const [rows] = await db.query(query);
      return res.status(200).json(rows);
    } catch (error) {
      console.warn('[Mock DB] Retornando listado de matrículas en memoria');
      const list = mockDb.matriculas.map(m => {
        const p = mockDb.participantes.find(item => item.id == m.participante_id);
        const c = mockDb.cursos.find(item => item.id == m.curso_id);
        return {
          id: m.id,
          participante_id: m.participante_id,
          curso_id: m.curso_id,
          alumno_nombre: p ? p.nombres : 'Alumno Eliminado',
          alumno_dni: p ? p.dni : '00000000',
          curso_nombre: c ? c.nombre : 'Curso Eliminado',
          fecha_inicio: m.fecha_inicio || null,
          fecha_fin: m.fecha_fin || null,
          created_at: m.created_at || new Date().toISOString()
        };
      }).reverse();
      return res.status(200).json(list);
    }
  },

  listGrouped: async (req, res, next) => {
    try {
      const query = `
        SELECT m.id, m.participante_id, m.curso_id, m.fecha_inicio, m.fecha_fin, m.created_at,
               p.nombres AS alumno_nombre, p.dni AS alumno_dni,
               c.nombre AS curso_nombre, c.id AS curso_id_ref,
               c.duracion AS curso_duracion, c.entrenador AS curso_entrenador,
               c.categoria AS curso_categoria, c.codigo_curso AS curso_codigo
        FROM matriculas m
        JOIN participantes p ON m.participante_id = p.id
        JOIN cursos c ON m.curso_id = c.id
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
            fecha_inicio: r.fecha_inicio,
            fecha_fin: r.fecha_fin,
            enrollments: []
          };
        }
        grouped[key].enrollments.push({
          id: r.id,
          participante_id: r.participante_id,
          alumno_nombre: r.alumno_nombre,
          alumno_dni: r.alumno_dni,
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
        const c = mockDb.cursos.find(item => item.id == m.curso_id);
        const key = m.curso_id;
        if (!grouped[key]) {
          grouped[key] = {
            curso_id: key,
            curso_nombre: c ? c.nombre : 'Curso Eliminado',
            curso_duracion: c ? c.duracion : null,
            curso_entrenador: c ? c.entrenador : null,
            curso_categoria: c ? c.categoria : null,
            curso_codigo: c ? c.codigo_curso : null,
            fecha_inicio: m.fecha_inicio || null,
            fecha_fin: m.fecha_fin || null,
            enrollments: []
          };
        }
        grouped[key].enrollments.push({
          id: m.id,
          participante_id: m.participante_id,
          alumno_nombre: p ? p.nombres : 'Alumno Eliminado',
          alumno_dni: p ? p.dni : '00000000',
          fecha_inicio: m.fecha_inicio || null,
          fecha_fin: m.fecha_fin || null,
          created_at: m.created_at || new Date().toISOString()
        });
      });
      return res.status(200).json(Object.values(grouped));
    }
  },

  getByCourse: async (req, res, next) => {
    const { curso_id } = req.params;
    try {
      const query = `
        SELECT m.id, m.participante_id, m.curso_id, m.fecha_inicio, m.fecha_fin, m.created_at,
               p.nombres AS alumno_nombre, p.dni AS alumno_dni
        FROM matriculas m
        JOIN participantes p ON m.participante_id = p.id
        WHERE m.curso_id = ?
        ORDER BY p.nombres ASC
      `;
      const [rows] = await db.query(query, [curso_id]);
      return res.status(200).json(rows);
    } catch (error) {
      console.warn('[Mock DB] Retornando matrículas por curso en memoria');
      const list = mockDb.matriculas
        .filter(m => m.curso_id == curso_id)
        .map(m => {
          const p = mockDb.participantes.find(item => item.id == m.participante_id);
          return {
            id: m.id,
            participante_id: m.participante_id,
            curso_id: m.curso_id,
            alumno_nombre: p ? p.nombres : 'Alumno Eliminado',
            alumno_dni: p ? p.dni : '00000000',
            fecha_inicio: m.fecha_inicio || null,
            fecha_fin: m.fecha_fin || null,
            created_at: m.created_at || new Date().toISOString()
          };
        });
      return res.status(200).json(list);
    }
  },

  create: async (req, res, next) => {
    const { participante_id, curso_id, fecha_inicio, fecha_fin } = req.body;
    try {
      const [check] = await db.query(
        'SELECT id FROM matriculas WHERE participante_id = ? AND curso_id = ?',
        [participante_id, curso_id]
      );
      if (check.length > 0) {
        return res.status(400).json({ success: false, message: 'El alumno ya se encuentra matriculado en este curso' });
      }

      const query = `
        INSERT INTO matriculas (participante_id, curso_id, fecha_inicio, fecha_fin)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await db.query(query, [participante_id, curso_id, fecha_inicio || null, fecha_fin || null]);
      const [newRow] = await db.query('SELECT * FROM matriculas WHERE id = ?', [result.insertId]);
      return res.status(201).json({ success: true, matricula: newRow[0] });
    } catch (error) {
      console.warn('[Mock DB] Creando matrícula en memoria temporal');
      const exists = mockDb.matriculas.some(m => m.participante_id == participante_id && m.curso_id == curso_id);
      if (exists) {
        return res.status(400).json({ success: false, message: 'El alumno ya se encuentra matriculado en este curso' });
      }

      const newM = {
        id: mockDb.matriculas.length + 1,
        participante_id,
        curso_id,
        fecha_inicio: fecha_inicio || null,
        fecha_fin: fecha_fin || null,
        created_at: new Date().toISOString()
      };
      mockDb.matriculas.push(newM);
      return res.status(201).json({ success: true, matricula: newM });
    }
  },

  bulkCreate: async (req, res, next) => {
    const { curso_id, participante_ids, fecha_inicio, fecha_fin } = req.body;
    if (!curso_id || !participante_ids || !Array.isArray(participante_ids) || participante_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Debe especificar un curso y al menos un alumno' });
    }

    try {
      const inserted = [];
      for (const pid of participante_ids) {
        const [check] = await db.query(
          'SELECT id FROM matriculas WHERE participante_id = ? AND curso_id = ?',
          [pid, curso_id]
        );
        if (check.length === 0) {
          const [result] = await db.query(
            'INSERT INTO matriculas (participante_id, curso_id, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?)',
            [pid, curso_id, fecha_inicio || null, fecha_fin || null]
          );
          inserted.push({ id: result.insertId, participante_id: pid, curso_id, fecha_inicio, fecha_fin });
        }
      }
      return res.status(201).json({ success: true, message: `${inserted.length} matrícula(s) creada(s)`, matriculas: inserted });
    } catch (error) {
      console.warn('[Mock DB] Creando matrículas masivas en memoria temporal');
      const inserted = [];
      for (const pid of participante_ids) {
        const exists = mockDb.matriculas.some(m => m.participante_id == pid && m.curso_id == curso_id);
        if (!exists) {
          const newM = {
            id: mockDb.matriculas.length + 1,
            participante_id: pid,
            curso_id,
            fecha_inicio: fecha_inicio || null,
            fecha_fin: fecha_fin || null,
            created_at: new Date().toISOString()
          };
          mockDb.matriculas.push(newM);
          inserted.push(newM);
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
      console.warn('[Mock DB] Eliminando matrícula en memoria temporal');
      const index = mockDb.matriculas.findIndex(m => m.id == id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Matrícula no encontrada' });
      }
      mockDb.matriculas.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Matrícula eliminada correctamente' });
    }
  }
};
