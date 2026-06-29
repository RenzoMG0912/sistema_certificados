// Archivo: src/controllers/cursos.controller.js
const db = require('../config/db');
const mockDb = require('../config/mockDb');

module.exports = {
  list: async (req, res, next) => {
    try {
      const [rows] = await db.query('SELECT * FROM cursos ORDER BY id ASC');
      return res.status(200).json(rows);
    } catch (error) {
      console.warn('[Mock DB] Retornando listado de cursos de prueba en memoria');
      return res.status(200).json(mockDb.cursos);
    }
  },

  get: async (req, res, next) => {
    const { id } = req.params;
    try {
      const [rows] = await db.query('SELECT * FROM cursos WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Curso no encontrado' });
      }
      return res.status(200).json(rows[0]);
    } catch (error) {
      console.warn('[Mock DB] Retornando curso de prueba por ID');
      const curso = mockDb.cursos.find(c => c.id == id);
      if (!curso) {
        return res.status(404).json({ success: false, message: 'Curso no encontrado' });
      }
      return res.status(200).json(curso);
    }
  },

  create: async (req, res, next) => {
    const { codigo_curso, nombre, duracion, categoria, entrenador, firma_id } = req.body;
    try {
      const [check] = await db.query('SELECT id FROM cursos WHERE codigo_curso = ?', [codigo_curso]);
      if (check.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe un curso registrado con ese código' });
      }

      const query = `
        INSERT INTO cursos (codigo_curso, nombre, duracion, categoria, entrenador, firma_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(query, [codigo_curso, nombre, duracion, categoria, entrenador, firma_id || null]);
      const [newRow] = await db.query('SELECT * FROM cursos WHERE id = ?', [result.insertId]);
      return res.status(201).json({ success: true, curso: newRow[0] });
    } catch (error) {
      console.warn('[Mock DB] Creando curso en memoria temporal');
      const exists = mockDb.cursos.some(c => c.codigo_curso === codigo_curso);
      if (exists) {
        return res.status(400).json({ success: false, message: 'Ya existe un curso registrado con ese código' });
      }
      const newCurso = {
        id: mockDb.cursos.length + 1,
        codigo_curso,
        nombre,
        duracion,
        categoria,
        entrenador,
        firma_id: firma_id || null
      };
      mockDb.cursos.push(newCurso);
      return res.status(201).json({ success: true, curso: newCurso });
    }
  },

  update: async (req, res, next) => {
    const { id } = req.params;
    const { codigo_curso, nombre, duracion, categoria, entrenador, firma_id } = req.body;
    try {
      const [check] = await db.query('SELECT id FROM cursos WHERE codigo_curso = ? AND id <> ?', [codigo_curso, id]);
      if (check.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe otro curso registrado con ese código' });
      }

      const query = `
        UPDATE cursos
        SET codigo_curso = ?, nombre = ?, duracion = ?, categoria = ?, entrenador = ?, firma_id = ?
        WHERE id = ?
      `;
      await db.query(query, [codigo_curso, nombre, duracion, categoria, entrenador, firma_id || null, id]);
      const [updatedRow] = await db.query('SELECT * FROM cursos WHERE id = ?', [id]);
      return res.status(200).json({ success: true, curso: updatedRow[0] });
    } catch (error) {
      console.warn('[Mock DB] Actualizando curso en memoria temporal');
      const index = mockDb.cursos.findIndex(c => c.id == id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Curso no encontrado' });
      }
      const exists = mockDb.cursos.some(c => c.codigo_curso === codigo_curso && c.id != id);
      if (exists) {
        return res.status(400).json({ success: false, message: 'Ya existe otro curso registrado con ese código' });
      }
      mockDb.cursos[index] = {
        ...mockDb.cursos[index],
        codigo_curso,
        nombre,
        duracion,
        categoria,
        entrenador,
        firma_id: firma_id || null
      };
      return res.status(200).json({ success: true, curso: mockDb.cursos[index] });
    }
  },

  delete: async (req, res, next) => {
    const { id } = req.params;
    try {
      const [course] = await db.query('SELECT id FROM cursos WHERE id = ?', [id]);
      if (course.length === 0) {
        return res.status(404).json({ success: false, message: 'Curso no encontrado' });
      }
      await db.query('DELETE FROM cursos WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Curso eliminado correctamente' });
    } catch (error) {
      console.warn('[Mock DB] Eliminando curso en memoria temporal');
      const index = mockDb.cursos.findIndex(c => c.id == id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Curso no encontrado' });
      }
      mockDb.cursos.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Curso eliminado correctamente' });
    }
  }
};
