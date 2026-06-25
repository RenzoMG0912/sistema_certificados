// Archivo: src/controllers/firmas.controller.js
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const mockDb = require('../config/mockDb');

function saveSignatureImage(firmaBase64) {
  const matches = firmaBase64.match(/^data:image\/([A-Za-z\-+]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    const error = new Error('Formato de imagen invalido. Debe ser base64 data URL.');
    error.statusCode = 400;
    throw error;
  }

  let ext = matches[1].toLowerCase();
  if (ext === 'jpeg') ext = 'jpg';
  if (ext !== 'png' && ext !== 'jpg') {
    const error = new Error('La imagen debe ser PNG o JPG.');
    error.statusCode = 400;
    throw error;
  }

  const buffer = Buffer.from(matches[2], 'base64');
  const filename = `firma_${Date.now()}.${ext}`;
  const targetDir = path.join(__dirname, '..', '..', 'assets', 'img', 'firmas');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(path.join(targetDir, filename), buffer);
  return `/assets/img/firmas/${filename}`;
}

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
    const { nombre, cargo, cip, firma_base64 } = req.body;

    try {
      if (!firma_base64) {
        return res.status(400).json({ success: false, message: 'Debe subir una imagen de firma PNG o JPG.' });
      }

      const firma_url = saveSignatureImage(firma_base64);
      const [result] = await db.query(
        'INSERT INTO firmas (nombre, cargo, firma_url, cip) VALUES (?, ?, ?, ?)',
        [nombre, cargo, firma_url, cip || null]
      );
      const [newRow] = await db.query('SELECT * FROM firmas WHERE id = ?', [result.insertId]);
      return res.status(201).json({ success: true, firma: newRow[0] });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }

      console.warn('[Mock DB] Creando firma autorizada en memoria temporal', error);
      const newFirma = {
        id: mockDb.firmas.length + 1,
        nombre,
        cargo,
        firma_url: firma_base64 ? saveSignatureImage(firma_base64) : '/assets/img/firmas/default.png',
        cip: cip || null
      };
      mockDb.firmas.push(newFirma);
      return res.status(201).json({ success: true, firma: newFirma });
    }
  },

  update: async (req, res, next) => {
    const { id } = req.params;
    const { nombre, cargo, cip, firma_base64 } = req.body;

    try {
      const [rows] = await db.query('SELECT * FROM firmas WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Firma no encontrada' });
      }

      const firma_url = firma_base64 ? saveSignatureImage(firma_base64) : rows[0].firma_url;
      await db.query(
        'UPDATE firmas SET nombre = ?, cargo = ?, firma_url = ?, cip = ? WHERE id = ?',
        [nombre, cargo, firma_url, cip || null, id]
      );

      const [updatedRow] = await db.query('SELECT * FROM firmas WHERE id = ?', [id]);
      return res.status(200).json({ success: true, firma: updatedRow[0] });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }

      console.warn('[Mock DB] Actualizando firma autorizada en memoria temporal', error);
      const index = mockDb.firmas.findIndex(f => f.id == id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Firma no encontrada' });
      }

      mockDb.firmas[index] = {
        ...mockDb.firmas[index],
        nombre,
        cargo,
        firma_url: firma_base64 ? saveSignatureImage(firma_base64) : mockDb.firmas[index].firma_url,
        cip: cip || null
      };

      return res.status(200).json({ success: true, firma: mockDb.firmas[index] });
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
