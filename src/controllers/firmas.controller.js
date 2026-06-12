// Archivo: src/controllers/firmas.controller.js
const db = require('../config/db');
const mockDb = require('../config/mockDb');

module.exports = {
  list: async (req, res, next) => {
    try {
      const [rows] = await db.query('SELECT * FROM firmas ORDER BY id ASC');
      return res.status(200).json(rows);
    } catch (error) {
      console.warn('[Mock DB] Retornando firmas de prueba en memoria');
      return res.status(200).json(mockDb.firmas);
    }
  },

  create: async (req, res, next) => {
    const { nombre, cargo, firma_url } = req.body;
    try {
      const query = `
        INSERT INTO firmas (nombre, cargo, firma_url)
        VALUES (?, ?, ?)
      `;
      const [result] = await db.query(query, [nombre, cargo, firma_url]);
      const [newRow] = await db.query('SELECT * FROM firmas WHERE id = ?', [result.insertId]);
      return res.status(201).json({ success: true, firma: newRow[0] });
    } catch (error) {
      console.warn('[Mock DB] Creando firma autorizada en memoria temporal');
      const newFirma = {
        id: mockDb.firmas.length + 1,
        nombre,
        cargo,
        firma_url
      };
      mockDb.firmas.push(newFirma);
      return res.status(201).json({ success: true, firma: newFirma });
    }
  },

  delete: async (req, res, next) => {
    const { id } = req.params;
    try {
      const [firma] = await db.query('SELECT id FROM firmas WHERE id = ?', [id]);
      if (firma.length === 0) {
        return res.status(404).json({ success: false, message: 'Firma no encontrada' });
      }
      await db.query('DELETE FROM firmas WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Firma eliminada correctamente' });
    } catch (error) {
      console.warn('[Mock DB] Eliminando firma en memoria temporal');
      const index = mockDb.firmas.findIndex(f => f.id == id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Firma no encontrada' });
      }
      mockDb.firmas.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Firma eliminada correctamente' });
    }
  }
};
