// Archivo: src/services/pdf.service.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { generarQR } = require('./qr.service');

const ROOT_DIR = path.join(__dirname, '..', '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const COLORS = {
  red: '#b60008',
  darkRed: '#7a0006',
  gold: '#f0cc52',
  goldDark: '#d7a307',
  blue: '#2d9be8',
  text: '#111111',
  muted: '#565b64',
};

function assetPath(...parts) {
  return path.join(ROOT_DIR, ...parts);
}

function resolvePublicOrRootPath(urlPath) {
  if (!urlPath) return null;
  const clean = String(urlPath).replace(/^\/+/, '');
  const direct = assetPath(clean);
  if (fs.existsSync(direct)) return direct;

  const underPublic = path.join(PUBLIC_DIR, clean);
  if (fs.existsSync(underPublic)) return underPublic;

  const parsed = path.parse(direct);
  for (const ext of ['.png', '.jpg', '.jpeg', '.webp', '.svg']) {
    const candidate = path.join(parsed.dir, `${parsed.name}${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }

  return direct;
}

function tryImage(doc, imagePath, x, y, options) {
  try {
    if (imagePath && fs.existsSync(imagePath)) {
      doc.image(imagePath, x, y, options);
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

function trySvgPath(doc, svgPath, x, y, width, height, fill = '#2449a6') {
  try {
    if (!svgPath || path.extname(svgPath).toLowerCase() !== '.svg' || !fs.existsSync(svgPath)) {
      return false;
    }

    const svg = fs.readFileSync(svgPath, 'utf8');
    const viewBoxMatch = svg.match(/viewBox="([^"]+)"/i);
    const pathMatch = svg.match(/<path[\s\S]*?\sd="([^"]+)"/i);
    if (!viewBoxMatch || !pathMatch) return false;

    const [, , , vbWidth, vbHeight] = viewBoxMatch[1].split(/\s+/).map(Number);
    const scale = Math.min(width / vbWidth, height / vbHeight);
    const drawWidth = vbWidth * scale;
    const drawHeight = vbHeight * scale;

    doc.save();
    doc.translate(x + (width - drawWidth) / 2, y + (height - drawHeight) / 2);
    doc.scale(scale);
    doc.path(pathMatch[1]).fill(fill);
    doc.restore();
    return true;
  } catch (error) {
    return false;
  }
}

function getDateParts(value) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();
  const day = date.getDate();
  const month = date.toLocaleDateString('es-PE', { month: 'long' });
  const year = date.getFullYear();

  return {
    day,
    month: month.charAt(0).toUpperCase() + month.slice(1),
    year,
  };
}

function formatCourseDate(value) {
  const { day, month, year } = getDateParts(value);
  return `${day} de ${month} ${year}`;
}

function formatIssueDate(value) {
  const { day, month, year } = getDateParts(value);
  return `${day} de ${month} del ${year}`;
}

function normalizeDuration(duration) {
  const text = String(duration || '').trim();
  if (!text) return '0 horas';
  return text.replace(/\s+lectivas?$/i, '');
}

function drawFallbackTeamLogo(doc, x, y, width) {
  doc.save();
  doc.fillColor(COLORS.red)
     .font('Helvetica-Bold')
     .fontSize(width * 0.35)
     .text('RV', x, y, { width, align: 'center' });
  doc.fontSize(width * 0.095)
     .text('TEAM HSEC E.I.R.L.', x, y + width * 0.42, { width, align: 'center' });
  doc.font('Helvetica-Bold')
     .fontSize(width * 0.055)
     .fillColor('#444444')
     .text('LEADER IN TRAINING', x, y + width * 0.55, { width, align: 'center' });
  doc.restore();
}

function drawFallbackCip(doc, x, y, size) {
  const center = x + size / 2;
  doc.save();
  doc.circle(center, y + size / 2, size / 2).fillAndStroke('#f3c14b', '#793a2d');
  doc.circle(center, y + size / 2, size * 0.34).fillAndStroke('#a9271e', '#793a2d');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(size * 0.2)
     .text('CIP', x, y + size * 0.37, { width: size, align: 'center' });
  doc.fontSize(size * 0.08)
     .text('1962', x, y + size * 0.59, { width: size, align: 'center' });
  doc.restore();
}

function drawFallbackRosette(doc, x, y, size, year) {
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  doc.save();
  doc.polygon([x + size * 0.22, y + size * 0.55], [x + size * 0.43, y + size * 0.55], [x + size * 0.35, y + size * 1.65], [x + size * 0.1, y + size * 1.45]).fill(COLORS.blue);
  doc.polygon([x + size * 0.57, y + size * 0.55], [x + size * 0.78, y + size * 0.55], [x + size * 0.9, y + size * 1.45], [x + size * 0.65, y + size * 1.65]).fill('#1795dd');

  for (let i = 0; i < 32; i += 1) {
    const angle = (Math.PI * 2 * i) / 32;
    const inner = size * 0.34;
    const outer = i % 2 === 0 ? size * 0.47 : size * 0.41;
    doc.moveTo(centerX + Math.cos(angle) * inner, centerY + Math.sin(angle) * inner)
       .lineTo(centerX + Math.cos(angle + Math.PI / 32) * outer, centerY + Math.sin(angle + Math.PI / 32) * outer)
       .lineTo(centerX + Math.cos(angle + Math.PI / 16) * inner, centerY + Math.sin(angle + Math.PI / 16) * inner)
       .fill('#2fa8f2');
  }

  doc.circle(centerX, centerY, size * 0.27).fill('#ffffff');
  doc.fillColor(COLORS.blue)
     .font('Helvetica-Bold')
     .fontSize(size * 0.15)
     .text(String(year), x, y + size * 0.43, { width: size, align: 'center' });
  doc.restore();
}

function drawWatermark(doc, pageWidth, pageHeight) {
  const logoRvPath = assetPath('public', 'img', 'logo_RV_azul.webp');

  doc.save();
  doc.opacity(0.08);
  if (!tryImage(doc, logoRvPath, pageWidth / 2 - 150, 96, { width: 300 })) {
    doc.font('Helvetica-Bold')
       .fontSize(210)
       .fillColor(COLORS.red)
       .text('RV', pageWidth / 2 - 145, 132, { width: 290, align: 'center' });
  }
  doc.restore();
}

function drawHeader(doc, pageWidth) {
  const logoPath = assetPath('public', 'img', 'logo_teamhsec.webp');
  const cipPath = assetPath('public', 'img', 'cip.webp');
  const rosettePath = assetPath('public', 'img', 'escarapela_2026.webp');

  doc.save();
  doc.moveTo(2, 0)
     .lineTo(pageWidth - 108, 0)
     .lineTo(pageWidth - 108, 58)
     .bezierCurveTo(560, 48, 410, 70, 260, 65)
     .lineTo(2, 60)
     .closePath()
     .fill(COLORS.red);

  doc.fillColor('#ffffff')
     .font('Times-Bold')
     .fontSize(17)
     .text('Team Health, Safety, Environment, and Community', 160, 19, { width: 450, align: 'center' });

  if (!tryImage(doc, logoPath, pageWidth - 96, 4, { width: 76 })) {
    drawFallbackTeamLogo(doc, pageWidth - 102, 4, 86);
  }

  if (!tryImage(doc, cipPath, 42, 80, { width: 62 })) {
    drawFallbackCip(doc, 42, 80, 62);
  }

  if (!tryImage(doc, rosettePath, pageWidth - 98, 78, { width: 64 })) {
    drawFallbackRosette(doc, pageWidth - 104, 84, 76, 2026);
  }
  doc.restore();
}

function drawCertificateText(doc, certificadoData, pageWidth) {
  const courseName = String(certificadoData.curso_nombre || 'Curso').toUpperCase();
  const studentName = String(certificadoData.alumno_nombres || 'Alumno').toUpperCase();
  const courseDate = formatCourseDate(certificadoData.fecha_realizacion || certificadoData.fecha_emision);
  const duration = normalizeDuration(certificadoData.curso_duracion);

  doc.fillColor(COLORS.text)
     .font('Helvetica-Bold')
     .fontSize(55)
     .text('CERTIFICADO', 0, 126, { width: pageWidth, align: 'center' });

  doc.fontSize(18)
     .text('OTORGADO A:', 0, 224, { width: pageWidth, align: 'center' });

  doc.font('Helvetica-Bold')
     .fontSize(studentName.length > 34 ? 25 : 29)
     .text(studentName, 105, 278, { width: pageWidth - 210, align: 'center' });

  const paragraphX = 86;
  const paragraphY = 348;
  const paragraphWidth = pageWidth - 172;

  doc.fillColor(COLORS.muted)
     .font('Helvetica')
     .fontSize(16)
     .text('Por haber participado y aprobado el curso de: ', paragraphX, paragraphY, {
       width: paragraphWidth,
       align: 'center',
       continued: true,
     })
     .font('Helvetica-Bold')
     .text(`"${courseName}", `, { continued: true })
     .font('Helvetica')
     .text(`realizado el d\u00eda ${courseDate}, con una duraci\u00f3n de ${duration}.`, { continued: false });
}

function drawIssueDate(doc, certificadoData) {
  const issueDate = formatIssueDate(certificadoData.fecha_emision);
  doc.fillColor(COLORS.muted)
     .font('Helvetica')
     .fontSize(12)
     .text(`Lima, ${issueDate}`, 505, 438, { width: 215, align: 'right' });
}

function drawSignature(doc, firma, x, y, defaults = {}) {
  const data = {
    nombre: firma?.nombre || defaults.nombre || 'Firma autorizada',
    cip: firma?.cip || defaults.cip || '',
    cargo: firma?.cargo || defaults.cargo || '',
    firma_url: firma?.firma_url,
  };

  const signaturePath = resolvePublicOrRootPath(data.firma_url);
  const imageDrawn =
    tryImage(doc, signaturePath, x + 36, y - 52, { width: 112, height: 48 }) ||
    trySvgPath(doc, signaturePath, x + 20, y - 62, 142, 52);

  if (!imageDrawn) {
    doc.fillColor('#2449a6')
       .font('Courier-Oblique')
       .fontSize(20)
       .text(data.nombre.split(' ').slice(1, 3).join(' ') || data.nombre, x + 3, y - 45, { width: 178, align: 'center' });
  }

  doc.moveTo(x, y)
     .lineTo(x + 178, y)
     .dash(2, { space: 2 })
     .lineWidth(0.6)
     .stroke('#989898')
     .undash();

  doc.fillColor(COLORS.text)
     .font('Helvetica')
     .fontSize(10)
     .text(data.nombre, x - 16, y + 16, { width: 210, align: 'center' });

  if (data.cip) {
    doc.font('Helvetica-Bold')
       .fontSize(9)
       .text(`CIP - ${data.cip}`, x - 16, y + 31, { width: 210, align: 'center' });
    doc.font('Helvetica')
       .fontSize(10)
       .text(data.cargo, x - 16, y + 45, { width: 210, align: 'center' });
  } else {
    doc.font('Helvetica')
       .fontSize(10)
       .text(data.cargo, x - 16, y + 31, { width: 210, align: 'center' });
  }
}

function drawFooter(doc, certificadoData, pageWidth, pageHeight) {
  const logoRvPath = assetPath('public', 'img', 'logo_RV_azul.webp');
  const footerX = pageWidth - 112;
  const footerY = pageHeight - 110;

  if (!tryImage(doc, logoRvPath, footerX + 25, footerY, { width: 38 })) {
    doc.fillColor('#4d8fb8').font('Helvetica-Bold').fontSize(24).text('RV', footerX + 21, footerY + 4, { width: 48, align: 'center' });
  }

  doc.fillColor(COLORS.text)
     .font('Helvetica-Bold')
     .fontSize(14)
     .text(certificadoData.codigo, footerX, footerY + 50, { width: 94, align: 'center' });

  doc.font('Helvetica-Bold')
     .fontSize(6.8)
     .text('TEAM HSEC E.I.R.L.', footerX, footerY + 74, { width: 94, align: 'center' });

  doc.font('Helvetica')
     .fontSize(6.6)
     .text('RUC: 20615518721', footerX, footerY + 84, { width: 94, align: 'center' });

  doc.font('Helvetica')
     .fontSize(8.5)
     .fillColor(COLORS.muted)
     .text('Vigencia: 01 a\u00f1o desde la fecha de emisi\u00f3n.', pageWidth - 255, pageHeight - 34, { width: 220, align: 'right' });

  doc.fontSize(5.8)
     .fillColor('#7b7f86')
     .text(`Hash SHA-256: ${certificadoData.hash}`, 28, pageHeight - 18, { width: 470 });
}

async function drawQr(doc, certificadoData) {
  try {
    const qrDataUrl = await generarQR(certificadoData.hash);
    const qrBuffer = Buffer.from(qrDataUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    doc.image(qrBuffer, 690, 475, { width: 52, height: 52 });
  } catch (error) {
    doc.font('Helvetica').fontSize(6).fillColor(COLORS.muted).text('QR no disponible', 684, 492, { width: 64, align: 'center' });
  }
}

/**
 * Genera un archivo PDF de certificado y lo guarda en disco.
 * @param {object} certificadoData - Datos del certificado, estudiante, curso y firmas.
 * @param {string} savePath - Ruta de destino para el archivo PDF.
 * @returns {Promise<string>} Promesa que resuelve con la ruta del PDF guardado.
 */
async function generarCertificadoPDF(certificadoData, savePath) {
  const dir = path.dirname(savePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'letter',
        layout: 'landscape',
        margin: 0,
        info: {
          Title: `Certificado ${certificadoData.codigo}`,
          Author: 'TEAM HSEC E.I.R.L.',
        },
      });

      const writeStream = fs.createWriteStream(savePath);
      writeStream.on('finish', () => resolve(savePath));
      writeStream.on('error', (err) => reject(err));
      doc.on('error', (err) => reject(err));
      doc.pipe(writeStream);

      const { width, height } = doc.page;

      doc.rect(0, 0, width, height).fill('#ffffff');
      doc.rect(0, 0, 18, height).fill(COLORS.gold);
      doc.rect(5, 0, 3, height).fill('#fff2a6');
      doc.rect(width - 8, 0, 5, height).fill(COLORS.gold);
      doc.rect(22, 22, width - 44, height - 44).lineWidth(1.2).stroke(COLORS.goldDark);
      doc.rect(26, 26, width - 52, height - 52).lineWidth(0.8).stroke('#f7e4a0');

      drawHeader(doc, width);
      drawWatermark(doc, width, height);
      drawCertificateText(doc, certificadoData, width);
      drawIssueDate(doc, certificadoData);

      drawSignature(doc, certificadoData.firma_1, 100, 540, {
        nombre: 'Ing. Angel G. Baldeon Icochea',
        cip: '86277',
        cargo: 'Gerente de Operaciones',
      });

      drawSignature(doc, certificadoData.firma_2, 382, 540, {
        nombre: 'Ing. Gregorio A. Escajadillo Sarmiento',
        cip: '050142',
        cargo: 'Entrenador',
      });

      drawFooter(doc, certificadoData, width, height);
      await drawQr(doc, certificadoData);

      doc.end();

    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generarCertificadoPDF,
};
