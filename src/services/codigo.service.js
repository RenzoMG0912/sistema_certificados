// Archivo: src/services/codigo.service.js
const db = require('../config/db');

/**
 * Genera el siguiente código correlativo de certificado en formato PE-XXXX-YY
 * consultando la base de datos para el año en curso.
 * @returns {Promise<string>} Código del certificado en formato PE-XXXX-YY
 */
async function generarCodigoCertificado() {
  const currentYear = new Date().getFullYear();
  const yearSuffix = String(currentYear).slice(-2); // ej: "26" para 2026

  // Buscamos todos los códigos emitidos en el año actual
  // (no usamos ORDER BY id DESC: tras importaciones, el id no refleja el número del código)
  const query = `
    SELECT codigo 
    FROM certificados 
    WHERE codigo LIKE ?
  `;
  const pattern = `PE-%-${yearSuffix}`;

  try {
    const [rows] = await db.query(query, [pattern]);
    let nextNum = 1;

    for (const row of rows || []) {
      const parts = row.codigo.split('-');
      if (parts.length === 3) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num >= nextNum) {
          nextNum = num + 1;
        }
      }
    }

    // Seguridad adicional: si el código calculado ya existe en la BD (duplicados
    // raros o importaciones desordenadas), incrementar hasta encontrar uno libre.
    let codigo = `PE-${nextNum}-${yearSuffix}`;
    while (await codigoExiste(codigo)) {
      nextNum += 1;
      codigo = `PE-${nextNum}-${yearSuffix}`;
    }

    return codigo;
  } catch (error) {
    console.error('Error al generar el código correlativo:', error);
    throw new Error('No se pudo generar el código secuencial del certificado.');
  }
}

async function codigoExiste(codigo) {
  const [rows] = await db.query('SELECT id FROM certificados WHERE codigo = ? LIMIT 1', [codigo]);
  return rows.length > 0;
}

module.exports = {
  generarCodigoCertificado
};
