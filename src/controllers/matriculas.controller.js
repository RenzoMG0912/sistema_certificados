// Archivo: src/controllers/matriculas.controller.js
const db = require('../config/db');
const mockDb = require('../config/mockDb');

module.exports = {
  list: async (req, res, next) => {
    try {
      const query = `
        SELECT m.id, m.participante_id, m.curso_id, m.created_at,
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
      // Resolver los nombres y DNI a partir de los arrays en memoria
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
          created_at: m.created_at || new Date().toISOString()
        };
      }).reverse(); // Más recientes primero
      return res.status(200).json(list);
    }
  },

  create: async (req, res, next) => {
    const { participante_id, curso_id } = req.body;
    try {
      const [check] = await db.query(
        'SELECT id FROM matriculas WHERE participante_id = ? AND curso_id = ?',
        [participante_id, curso_id]
      );
      if (check.length > 0) {
        return res.status(400).json({ success: false, message: 'El alumno ya se encuentra matriculado en este curso' });
      }

      const query = `
        INSERT INTO matriculas (participante_id, curso_id)
        VALUES (?, ?)
      `;
      const [result] = await db.query(query, [participante_id, curso_id]);
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
        created_at: new Date().toISOString()
      };
      mockDb.matriculas.push(newM);
      return res.status(201).json({ success: true, matricula: newM });
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
