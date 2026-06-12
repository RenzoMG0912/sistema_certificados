// Archivo: src/controllers/participantes.controller.js
const db = require('../config/db');
const mockDb = require('../config/mockDb');

module.exports = {
  list: async (req, res, next) => {
    try {
      const [rows] = await db.query('SELECT * FROM participantes ORDER BY nombres ASC');
      return res.status(200).json(rows);
    } catch (error) {
      console.warn('[Mock DB] Retornando participantes de prueba en memoria');
      return res.status(200).json(mockDb.participantes);
    }
  },

  get: async (req, res, next) => {
    const { id } = req.params;
    try {
      const [rows] = await db.query('SELECT * FROM participantes WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
      }
      return res.status(200).json(rows[0]);
    } catch (error) {
      console.warn('[Mock DB] Retornando participante por ID en memoria');
      const p = mockDb.participantes.find(item => item.id == id);
      if (!p) {
        return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
      }
      return res.status(200).json(p);
    }
  },

  create: async (req, res, next) => {
    const { nombres, dni, email } = req.body;
    try {
      const [check] = await db.query('SELECT id FROM participantes WHERE dni = ?', [dni]);
      if (check.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe un alumno registrado con este DNI' });
      }

      const query = `
        INSERT INTO participantes (nombres, dni, email)
        VALUES (?, ?, ?)
      `;
      const [result] = await db.query(query, [nombres, dni, email]);
      const [newRow] = await db.query('SELECT * FROM participantes WHERE id = ?', [result.insertId]);
      return res.status(201).json({ success: true, participante: newRow[0] });
    } catch (error) {
      console.warn('[Mock DB] Creando participante en memoria temporal');
      const exists = mockDb.participantes.some(p => p.dni === dni);
      if (exists) {
        return res.status(400).json({ success: false, message: 'Ya existe un alumno registrado con este DNI' });
      }
      const newP = {
        id: mockDb.participantes.length + 1,
        nombres,
        dni,
        email,
        created_at: new Date().toISOString()
      };
      mockDb.participantes.push(newP);
      return res.status(201).json({ success: true, participante: newP });
    }
  },

  update: async (req, res, next) => {
    const { id } = req.params;
    const { nombres, dni, email } = req.body;
    try {
      const [check] = await db.query('SELECT id FROM participantes WHERE dni = ? AND id <> ?', [dni, id]);
      if (check.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe otro alumno registrado con este DNI' });
      }

      const query = `
        UPDATE participantes
        SET nombres = ?, dni = ?, email = ?
        WHERE id = ?
      `;
      await db.query(query, [nombres, dni, email, id]);
      const [updatedRow] = await db.query('SELECT * FROM participantes WHERE id = ?', [id]);
      return res.status(200).json({ success: true, participante: updatedRow[0] });
    } catch (error) {
      console.warn('[Mock DB] Actualizando participante en memoria temporal');
      const index = mockDb.participantes.findIndex(p => p.id == id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
      }
      const exists = mockDb.participantes.some(p => p.dni === dni && p.id != id);
      if (exists) {
        return res.status(400).json({ success: false, message: 'Ya existe otro alumno registrado con este DNI' });
      }
      mockDb.participantes[index] = {
        ...mockDb.participantes[index],
        nombres,
        dni,
        email
      };
      return res.status(200).json({ success: true, participante: mockDb.participantes[index] });
    }
  },

  delete: async (req, res, next) => {
    const { id } = req.params;
    try {
      const [participant] = await db.query('SELECT id FROM participantes WHERE id = ?', [id]);
      if (participant.length === 0) {
        return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
      }
      await db.query('DELETE FROM participantes WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Alumno eliminado correctamente' });
    } catch (error) {
      console.warn('[Mock DB] Eliminando participante en memoria temporal');
      const index = mockDb.participantes.findIndex(p => p.id == id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
      }
      mockDb.participantes.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Alumno eliminado correctamente' });
    }
  }
};
