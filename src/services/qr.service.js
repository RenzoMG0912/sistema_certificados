// Archivo: src/services/qr.service.js
const QRCode = require('qrcode');

/**
 * Genera un código QR en formato Data URL con el enlace de verificación pública.
 * @param {string} hash - Hash SHA-256 del certificado
 * @returns {Promise<string>} Data URL en base64 de la imagen del código QR
 */
async function generarQR(hash) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/verificar.html?h=${hash}`;

  try {
    const dataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 250,
      color: {
        dark: '#111318',  // Var --ink
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (error) {
    console.error('Error generando el código QR:', error);
    throw new Error('No se pudo generar la imagen del código QR.');
  }
}

module.exports = {
  generarQR
};
