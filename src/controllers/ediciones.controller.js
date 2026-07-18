const db = require('../config/db');
const mockDb = require('../config/mockDb');

module.exports = {
  list: async (req, res, next) => {
    try {
      const query = `
        SELECT e.id, e.curso_id, e.codigo_edicion, e.fecha_inicio, e.fecha_fin, e.created_at,
               c.nombre AS curso_nombre, c.codigo_curso, c.duracion AS curso_duracion,
               c.categoria AS curso_categoria, c.entrenador AS curso_entrenador
        FROM ediciones e
        JOIN cursos c ON e.curso_id = c.id
        ORDER BY e.fecha_inicio DESC
      `;
      const [rows] = await db.query(query);
      return res.status(200).json(rows);
    } catch (error) {
      console.warn('[Mock DB] Retornando ediciones de prueba en memoria');
      const list = mockDb.ediciones.map(e => {
        const c = mockDb.cursos.find(cur => cur.id == e.curso_id);
        return {
          id: e.id,
          curso_id: e.curso_id,
          codigo_edicion: e.codigo_edicion,
          fecha_inicio: e.fecha_inicio,
          fecha_fin: e.fecha_fin,
          created_at: e.created_at,
          curso_nombre: c ? c.nombre : 'Curso Eliminado',
          codigo_curso: c ? c.codigo_curso : '',
          curso_duracion: c ? c.duracion : '',
          curso_categoria: c ? c.categoria : '',
          curso_entrenador: c ? c.entrenador : ''
        };
      });
      return res.status(200).json(list);
    }
  },

  get: async (req, res, next) => {
    const { id } = req.params;
    try {
      const query = `
        SELECT e.*, c.nombre AS curso_nombre, c.codigo_curso, c.duracion AS curso_duracion
        FROM ediciones e
        JOIN cursos c ON e.curso_id = c.id
        WHERE e.id = ?
      `;
      const [rows] = await db.query(query, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Edición no encontrada' });
      }
      return res.status(200).json(rows[0]);
    } catch (error) {
      const edicion = mockDb.ediciones.find(e => e.id == id);
      if (!edicion) {
        return res.status(404).json({ success: false, message: 'Edición no encontrada' });
      }
      const c = mockDb.cursos.find(cur => cur.id == edicion.curso_id);
      return res.status(200).json({ ...edicion, curso_nombre: c?.nombre, codigo_curso: c?.codigo_curso, curso_duracion: c?.duracion });
    }
  },

  getByCurso: async (req, res, next) => {
    const { curso_id } = req.params;
    try {
      const [rows] = await db.query(
        'SELECT * FROM ediciones WHERE curso_id = ? ORDER BY fecha_inicio DESC', [curso_id]
      );
      return res.status(200).json(rows);
    } catch (error) {
      const list = mockDb.ediciones.filter(e => e.curso_id == curso_id);
      return res.status(200).json(list);
    }
  },

  create: async (req, res, next) => {
    const { curso_id, codigo_edicion, fecha_inicio, fecha_fin } = req.body;
    try {
      const [check] = await db.query('SELECT id FROM ediciones WHERE codigo_edicion = ?', [codigo_edicion]);
      if (check.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe una edición con ese código' });
      }
      const [result] = await db.query(
        'INSERT INTO ediciones (curso_id, codigo_edicion, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?)',
        [curso_id, codigo_edicion, fecha_inicio, fecha_fin || null]
      );
      const [newRow] = await db.query('SELECT * FROM ediciones WHERE id = ?', [result.insertId]);
      return res.status(201).json({ success: true, edicion: newRow[0] });
    } catch (error) {
      const exists = mockDb.ediciones.some(e => e.codigo_edicion === codigo_edicion);
      if (exists) {
        return res.status(400).json({ success: false, message: 'Ya existe una edición con ese código' });
      }
      const newEdicion = {
        id: mockDb.ediciones.length + 1,
        curso_id,
        codigo_edicion,
        fecha_inicio,
        fecha_fin: fecha_fin || null,
        created_at: new Date().toISOString()
      };
      mockDb.ediciones.push(newEdicion);
      return res.status(201).json({ success: true, edicion: newEdicion });
    }
  },

  update: async (req, res, next) => {
    const { id } = req.params;
    const { curso_id, codigo_edicion, fecha_inicio, fecha_fin } = req.body;
    try {
      const [rows] = await db.query('SELECT id FROM ediciones WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Edición no encontrada' });
      }
      await db.query(
        'UPDATE ediciones SET curso_id = ?, codigo_edicion = ?, fecha_inicio = ?, fecha_fin = ? WHERE id = ?',
        [curso_id, codigo_edicion, fecha_inicio, fecha_fin || null, id]
      );
      const [updatedRow] = await db.query('SELECT * FROM ediciones WHERE id = ?', [id]);
      return res.status(200).json({ success: true, edicion: updatedRow[0] });
    } catch (error) {
      const index = mockDb.ediciones.findIndex(e => e.id == id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Edición no encontrada' });
      }
      mockDb.ediciones[index] = { ...mockDb.ediciones[index], curso_id, codigo_edicion, fecha_inicio, fecha_fin: fecha_fin || null };
      return res.status(200).json({ success: true, edicion: mockDb.ediciones[index] });
    }
  },

  delete: async (req, res, next) => {
    const { id } = req.params;
    try {
      const [rows] = await db.query('SELECT id FROM ediciones WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Edición no encontrada' });
      }
      await db.query('DELETE FROM ediciones WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Edición eliminada correctamente' });
    } catch (error) {
      const index = mockDb.ediciones.findIndex(e => e.id == id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Edición no encontrada' });
      }
      mockDb.ediciones.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Edición eliminada correctamente' });
    }
  }
};
