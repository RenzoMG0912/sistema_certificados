// Archivo: src/services/pdf.service.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { generarQR } = require('./qr.service');

/**
 * Genera un archivo PDF de certificado y lo guarda en disco.
 * @param {object} certificadoData - Datos del certificado, estudiante, curso y firmas
 * @param {string} savePath - Ruta de destino para el archivo PDF
 * @returns {Promise<string>} Promesa que resuelve con la ruta del PDF guardado
 */
async function generarCertificadoPDF(certificadoData, savePath) {
  // Asegurar que la carpeta de destino exista
  const dir = path.dirname(savePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'letter',
        layout: 'landscape',
        margins: { top: 40, bottom: 40, left: 40, right: 40 }
      });

      const writeStream = fs.createWriteStream(savePath);
      doc.pipe(writeStream);

      // --- Estética y Bordes ---
      // Borde exterior dorado
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(3)
         .stroke('#d7a307');

      // Borde interior rojo oscuro
      doc.rect(26, 26, doc.page.width - 52, doc.page.height - 52)
         .lineWidth(1.2)
         .stroke('#7a0006');

      // --- Encabezado ---
      // Logo principal TEAM HSEC (a la izquierda)
      const logoPath = path.join(__dirname, '..', '..', 'public', 'img', 'logo_teamhsec.webp');
      try {
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, 45, { width: 110 });
        } else {
          doc.font('Helvetica-Bold').fontSize(16).fillColor('#b3000a').text('TEAM HSEC', 50, 50);
        }
      } catch (e) {
        doc.font('Helvetica-Bold').fontSize(16).fillColor('#b3000a').text('TEAM HSEC', 50, 50);
      }

      // Logo del Colegio de Ingenieros (a la derecha)
      const cipPath = path.join(__dirname, '..', '..', 'public', 'img', 'cip.webp');
      try {
        if (fs.existsSync(cipPath)) {
          doc.image(cipPath, doc.page.width - 160, 45, { width: 110 });
        }
      } catch (e) {
        // Fallback silencioso si no existe
      }

      // --- Cuerpo del Certificado ---
      doc.font('Times-Bold')
         .fontSize(32)
         .fillColor('#b3000a')
         .text('CERTIFICADO DE CAPACITACIÓN', 0, 150, { align: 'center' });

      doc.font('Helvetica-Oblique')
         .fontSize(14)
         .fillColor('#5c6670')
         .text('Otorgado a:', 0, 195, { align: 'center' });

      // Nombre del Participante
      doc.font('Times-Bold')
         .fontSize(26)
         .fillColor('#111318')
         .text(certificadoData.alumno_nombres.toUpperCase(), 0, 222, { align: 'center' });

      // Línea de acentuación
      doc.moveTo(doc.page.width / 2 - 180, 255)
         .lineTo(doc.page.width / 2 + 180, 255)
         .lineWidth(1.5)
         .stroke('#d7a307');

      // Descripción del curso
      doc.font('Helvetica')
         .fontSize(13)
         .fillColor('#111318')
         .text('Por haber aprobado satisfactoriamente el curso de especialización profesional en:', 0, 272, { align: 'center' });

      doc.font('Times-Bold')
         .fontSize(19)
         .fillColor('#7a0006')
         .text(`"${certificadoData.curso_nombre}"`, 0, 302, { align: 'center' });

      // Datos complementarios
      const emissionDate = new Date(certificadoData.fecha_emision);
      const formattedDate = emissionDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      doc.font('Helvetica')
         .fontSize(11.5)
         .fillColor('#5c6670')
         .text(`Con una duración de ${certificadoData.curso_duracion} lectivas. Emitido el ${formattedDate}.`, 0, 340, { align: 'center' });

      // --- Firmas y QR ---
      const bottomY = 405;

      // Generar y posicionar código QR
      const qrDataUrl = await generarQR(certificadoData.hash);
      const qrBuffer = Buffer.from(qrDataUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      doc.image(qrBuffer, doc.page.width - 150, bottomY, { width: 90, height: 90 });

      // Función auxiliar para dibujar firma
      const drawSignature = (firma, x) => {
        if (!firma) return;

        // Intentar agregar imagen
        let imageDrawn = false;
        if (firma.firma_url) {
          const sigImagePath = path.join(__dirname, '..', '..', 'public', firma.firma_url);
          try {
            if (fs.existsSync(sigImagePath)) {
              doc.image(sigImagePath, x, bottomY - 30, { width: 120, height: 50 });
              imageDrawn = true;
            }
          } catch (e) {
            console.error('Error al pintar imagen de firma:', e);
          }
        }

        if (!imageDrawn) {
          // Si no hay imagen, simulamos la firma con texto manuscrito
          doc.font('Courier-Oblique')
             .fontSize(16)
             .fillColor('#5c6670')
             .text(firma.nombre, x, bottomY + 5, { width: 180, align: 'center' });
        }

        // Línea horizontal
        doc.moveTo(x, bottomY + 50)
           .lineTo(x + 180, bottomY + 50)
           .lineWidth(0.8)
           .stroke('#5c6670');

        // Nombres y cargos
        doc.font('Helvetica-Bold')
           .fontSize(9)
           .fillColor('#111318')
           .text(firma.nombre, x, bottomY + 56, { width: 180, align: 'center' });

        doc.font('Helvetica')
           .fontSize(8)
           .fillColor('#5c6670')
           .text(firma.cargo, x, bottomY + 68, { width: 180, align: 'center' });
      };

      // Firma 1 (Instructor HSEC)
      if (certificadoData.firma_1) {
        drawSignature(certificadoData.firma_1, 80);
      }

      // Firma 2 (Gerente/Representante HSEC)
      if (certificadoData.firma_2) {
        drawSignature(certificadoData.firma_2, 300);
      }

      // --- Textos de Auditoría (Footer) ---
      doc.font('Helvetica-Bold')
         .fontSize(9)
         .fillColor('#7a0006')
         .text(`Código de Verificación: ${certificadoData.codigo}`, 50, doc.page.height - 35);

      doc.font('Helvetica')
         .fontSize(7.5)
         .fillColor('#5c6670')
         .text(`Hash SHA-256: ${certificadoData.hash}`, 50, doc.page.height - 24);

      doc.end();

      writeStream.on('finish', () => resolve(savePath));
      writeStream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generarCertificadoPDF
};
