// Archivo: src/controllers/verificar.controller.js
const db = require('../config/db');
const mockDb = require('../config/mockDb');

// Función helper para registrar auditoría de verificación
async function registrarVerificacion(certId, req) {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Desconocido';
    
    const query = `
      INSERT INTO verificaciones (certificado_id, ip_address, user_agent)
      VALUES (?, ?, ?)
    `;
    await db.query(query, [certId, ip, userAgent]);
  } catch (error) {
    console.warn('[Mock DB] No se pudo registrar la auditoría en la base de datos MySQL (Bypass activo).');
  }
}

function normalizeSearchCodigo(codigo) {
  if (!codigo) return '';
  let clean = codigo.trim().toUpperCase();

  if (clean.startsWith('HSEC-')) {
    const parts = clean.split('-');
    // HSEC-2026-0519-98626 (4 parts)
    if (parts.length === 4) {
      const lastPart = parts[3]; // e.g. "98626"
      if (lastPart.length >= 3) {
        const yrSuffix = lastPart.slice(-2); // "26"
        const num = lastPart.slice(0, -2); // "986"
        return `PE-${num}-${yrSuffix}`;
      }
    }
    // HSEC-2026-0519-986-26 (5 parts)
    if (parts.length === 5) {
      const num = parts[3];
      const yrSuffix = parts[4];
      return `PE-${num}-${yrSuffix}`;
    }
  }
  return clean;
}

module.exports = {
  verificarPorHash: async (req, res, next) => {
    const { hash } = req.params;

    try {
      const query = `
        SELECT c.id, c.codigo, c.hash, c.fecha_emision, c.fecha_vencimiento, c.pdf_path,
               p.nombres AS alumno_nombre, p.dni AS alumno_dni,
               cur.nombre AS curso_nombre, cur.duracion AS curso_duracion, cur.entrenador AS curso_entrenador,
               f1.nombre AS firma_nombre_1, f1.cargo AS firma_cargo_1,
               f2.nombre AS firma_nombre_2, f2.cargo AS firma_cargo_2
        FROM certificados c
        JOIN matriculas m ON c.matricula_id = m.id
        JOIN participantes p ON m.participante_id = p.id
        JOIN cursos cur ON m.curso_id = cur.id
        LEFT JOIN firmas f1 ON c.firma_id_1 = f1.id
        LEFT JOIN firmas f2 ON c.firma_id_2 = f2.id
        WHERE c.hash = ?
      `;
      const [rows] = await db.query(query, [hash]);

      if (rows.length === 0) {
        return res.status(404).json({
          valid: false,
          message: 'Certificado no válido o no registrado en nuestro sistema.'
        });
      }

      const certificado = rows[0];

      // Registrar auditoría
      await registrarVerificacion(certificado.id, req);

      return res.status(200).json({
        valid: true,
        certificado
      });
    } catch (error) {
      console.warn('[Mock DB] Buscando certificado por hash en la memoria temporal');
      const cert = mockDb.certificados.find(c => c.hash === hash);
      if (!cert) {
        return res.status(404).json({
          valid: false,
          message: 'Certificado no válido o no registrado en nuestro sistema.'
        });
      }
      return res.status(200).json({
        valid: true,
        certificado: cert
      });
    }
  },

  verificarManual: async (req, res, next) => {
    const { codigo, dni } = req.body;

    try {
      const cleanCodigo = codigo.trim();
      const normalized = normalizeSearchCodigo(cleanCodigo);
      const codigos = [cleanCodigo];
      if (normalized && normalized !== cleanCodigo) {
        codigos.push(normalized);
      }

      for (const cod of [...codigos]) {
        const parts = cod.split('-');
        if (parts.length === 3) {
          const prefix = parts[0];
          const num = parseInt(parts[1], 10);
          const yr = parts[2];
          if (!isNaN(num)) {
            codigos.push(`${prefix}-${num}-${yr}`);
            codigos.push(`${prefix}-${String(num).padStart(4, '0')}-${yr}`);
          }
        }
      }

      const uniqueCodigos = [...new Set(codigos)];

      const query = `
        SELECT c.id, c.codigo, c.hash, c.fecha_emision, c.fecha_vencimiento, c.pdf_path,
               p.nombres AS alumno_nombre, p.dni AS alumno_dni,
               cur.nombre AS curso_nombre, cur.duracion AS curso_duracion, cur.entrenador AS curso_entrenador,
               f1.nombre AS firma_nombre_1, f1.cargo AS firma_cargo_1,
               f2.nombre AS firma_nombre_2, f2.cargo AS firma_cargo_2
        FROM certificados c
        JOIN matriculas m ON c.matricula_id = m.id
        JOIN participantes p ON m.participante_id = p.id
        JOIN cursos cur ON m.curso_id = cur.id
        LEFT JOIN firmas f1 ON c.firma_id_1 = f1.id
        LEFT JOIN firmas f2 ON c.firma_id_2 = f2.id
        WHERE c.codigo IN (?) AND p.dni = ?
      `;
      const [rows] = await db.query(query, [uniqueCodigos, dni.trim()]);

      if (rows.length === 0) {
        return res.status(404).json({
          valid: false,
          message: 'Certificado no encontrado. Por favor verifique el código y DNI ingresados.'
        });
      }

      const certificado = rows[0];

      // Registrar auditoría
      await registrarVerificacion(certificado.id, req);

      return res.status(200).json({
        valid: true,
        certificado
      });
    } catch (error) {
      console.warn('[Mock DB] Buscando certificado manual en la memoria temporal');
      const cleanCodigo = codigo.trim();
      const normalized = normalizeSearchCodigo(cleanCodigo);
      const codigos = [cleanCodigo];
      if (normalized && normalized !== cleanCodigo) {
        codigos.push(normalized);
      }

      for (const cod of [...codigos]) {
        const parts = cod.split('-');
        if (parts.length === 3) {
          const prefix = parts[0];
          const num = parseInt(parts[1], 10);
          const yr = parts[2];
          if (!isNaN(num)) {
            codigos.push(`${prefix}-${num}-${yr}`);
            codigos.push(`${prefix}-${String(num).padStart(4, '0')}-${yr}`);
          }
        }
      }

      const uniqueCodigos = [...new Set(codigos)];

      const cert = mockDb.certificados.find(c => 
        uniqueCodigos.includes(c.codigo.trim()) && c.alumno_dni.trim() === dni.trim()
      );

      if (!cert) {
        return res.status(404).json({
          valid: false,
          message: 'Certificado no encontrado. Por favor verifique el código y DNI ingresados.'
        });
      }
      return res.status(200).json({
        valid: true,
        certificado: cert
      });
    }
  }
};
