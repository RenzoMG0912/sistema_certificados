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

  // Buscamos el último código emitido en el año actual
  const query = `
    SELECT codigo 
    FROM certificados 
    WHERE codigo LIKE ? 
    ORDER BY id DESC 
    LIMIT 1
  `;
  const pattern = `PE-%-${yearSuffix}`;

  try {
    const [rows] = await db.query(query, [pattern]);
    let nextNum = 1;

    if (rows && rows.length > 0) {
      const lastCode = rows[0].codigo; // ej: "PE-0005-26"
      const parts = lastCode.split('-');
      if (parts.length === 3) {
        const lastNum = parseInt(parts[1], 10);
        if (!isNaN(lastNum)) {
          nextNum = lastNum + 1;
        }
      }
    }

    // Formatear el número correlativo rellenando con ceros a la izquierda (4 dígitos)
    const formattedNum = String(nextNum).padStart(4, '0');
    return `PE-${formattedNum}-${yearSuffix}`;
  } catch (error) {
    console.error('Error al generar el código correlativo:', error);
    throw new Error('No se pudo generar el código secuencial del certificado.');
  }
}

module.exports = {
  generarCodigoCertificado
};
