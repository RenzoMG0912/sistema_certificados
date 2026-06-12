// Archivo: src/services/hash.service.js
const crypto = require('crypto');

/**
 * Genera un hash SHA-256 único a partir de un input provisto
 * @param {string} input - Datos base para generar el hash
 * @returns {string} Hash SHA-256 en formato hexadecimal (64 caracteres)
 */
function generarHash(input) {
  return crypto.createHash('sha256').update(String(input)).digest('hex');
}

module.exports = {
  generarHash
};
