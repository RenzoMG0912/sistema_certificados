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
    let { nombre, cargo, firma_url, cip, firma_base64 } = req.body;
    try {
      if (firma_base64) {
        const fs = require('fs');
        const path = require('path');
        const matches = firma_base64.match(/^data:image\/([A-Za-z\-+]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return res.status(400).json({ success: false, message: 'Formato de imagen inválido. Debe ser base64 data URL.' });
        }
        let ext = matches[1].toLowerCase();
        if (ext === 'jpeg') ext = 'jpg';
        if (ext !== 'png' && ext !== 'jpg' && ext !== 'gif') {
          return res.status(400).json({ success: false, message: 'La imagen debe ser PNG o JPG.' });
        }
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `firma_${Date.now()}.${ext}`;
        const targetDir = path.join(__dirname, '..', '..', 'assets', 'img', 'firmas');
        
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        const absolutePath = path.join(targetDir, filename);
        fs.writeFileSync(absolutePath, buffer);
        firma_url = `/assets/img/firmas/${filename}`;
      }

      const query = `
        INSERT INTO firmas (nombre, cargo, firma_url, cip)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await db.query(query, [nombre, cargo, firma_url, cip || null]);
      const [newRow] = await db.query('SELECT * FROM firmas WHERE id = ?', [result.insertId]);
      return res.status(201).json({ success: true, firma: newRow[0] });
    } catch (error) {
      console.warn('[Mock DB] Creando firma autorizada en memoria temporal', error);
      const newFirma = {
        id: mockDb.firmas.length + 1,
        nombre,
        cargo,
        firma_url: firma_url || '/assets/img/firmas/default.png',
        cip: cip || null
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
