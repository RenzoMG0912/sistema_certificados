// Archivo: src/services/pdf.service.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { generarQR } = require('./qr.service');

const ROOT_DIR = path.join(__dirname, '..', '..');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'assets', 'img', 'Formato_fondo.png');

const PAGE = {
  width: 1672,
  height: 941,
};

const COLORS = {
  wine: '#3d0008',
  red: '#690010',
  muted: '#222222',
  gold: '#b78622',
};

function assetPath(...parts) {
  return path.join(ROOT_DIR, ...parts);
}

function readPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function resolvePublicOrRootPath(urlPath) {
  if (!urlPath) return null;
  const clean = String(urlPath).replace(/^\/+/, '');
  const direct = assetPath(clean);
  if (fs.existsSync(direct)) return direct;

  const underPublic = assetPath('public', clean);
  if (fs.existsSync(underPublic)) return underPublic;

  const parsed = path.parse(direct);
  for (const ext of ['.svg', '.png', '.jpg', '.jpeg']) {
    const candidate = path.join(parsed.dir, `${parsed.name}${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }

  return direct;
}

function getDateParts(value) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();
  const month = date.toLocaleDateString('es-PE', { month: 'long' });

  return {
    day: date.getDate(),
    month: month.charAt(0).toUpperCase() + month.slice(1),
    year: date.getFullYear(),
  };
}

function formatCourseDate(value) {
  const { day, month, year } = getDateParts(value);
  return `${day} de ${month} de ${year}`;
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

function fitText(doc, text, maxWidth, initialSize, minSize, font = 'Times-Bold') {
  let size = initialSize;
  doc.font(font).fontSize(size);
  while (size > minSize && doc.widthOfString(text) > maxWidth) {
    size -= 1;
    doc.fontSize(size);
  }
  return size;
}

function trySvgPath(doc, svgPath, x, y, width, height, fill = COLORS.red) {
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

function drawCenteredLine(doc, segments, y, fontSize) {
  const totalWidth = segments.reduce((sum, segment) => {
    doc.font(segment.font).fontSize(fontSize);
    return sum + doc.widthOfString(segment.text);
  }, 0);

  let x = PAGE.width / 2 - totalWidth / 2;
  for (const segment of segments) {
    doc.font(segment.font)
       .fontSize(fontSize)
       .fillColor(segment.color)
       .text(segment.text, x, y, { lineBreak: false });
    x += doc.widthOfString(segment.text);
  }
}

function drawVariableText(doc, certificadoData) {
  const studentName = String(certificadoData.alumno_nombres || 'Alumno').toUpperCase();
  const courseName = String(certificadoData.curso_nombre || 'Curso').toUpperCase();
  const courseDate = formatCourseDate(certificadoData.fecha_realizacion || certificadoData.fecha_emision);
  const issueDate = formatIssueDate(certificadoData.fecha_emision);
  const duration = normalizeDuration(certificadoData.curso_duracion);

  const nameSize = fitText(doc, studentName, 1060, 66, 42);
  doc.font('Times-Bold')
     .fontSize(nameSize)
     .fillColor(COLORS.wine)
     .text(studentName, 270, 462, { width: 1132, align: 'center' });

  drawCenteredLine(doc, [
    { text: 'Por haber participado y aprobado el curso de: ', font: 'Helvetica', color: COLORS.muted },
    { text: `"${courseName}",`, font: 'Helvetica-Bold', color: COLORS.red },
  ], 580, 25);

  doc.font('Helvetica')
     .fontSize(25)
     .fillColor(COLORS.muted)
     .text(`realizado el d\u00eda ${courseDate}, con una duraci\u00f3n de ${duration}.`, 300, 622, {
       width: 1072,
       align: 'center',
     });

  doc.font('Helvetica')
     .fontSize(22)
     .fillColor(COLORS.muted)
     .text(`Lima, ${issueDate}`, 0, 700, { width: PAGE.width, align: 'center' });
}

function drawSignatureText(doc, block) {
  doc.fillColor(COLORS.muted)
     .font('Helvetica')
     .fontSize(22)
     .text(block.name, block.x, 814, { width: block.width, align: 'center' });

  doc.fillColor(COLORS.red)
     .font('Helvetica-Bold')
     .fontSize(20)
     .text(`CIP - ${block.cip}`, block.x, 846, { width: block.width, align: 'center' });

  doc.fillColor(COLORS.muted)
     .font('Helvetica')
     .fontSize(20)
     .text(block.role, block.x, 878, { width: block.width, align: 'center' });
}

function drawSignatureImage(doc, firmaUrl, x, y, width, height) {
  const signaturePath = resolvePublicOrRootPath(firmaUrl);
  if (trySvgPath(doc, signaturePath, x, y, width, height, COLORS.red)) return;

  doc.fillColor(COLORS.red)
     .font('Times-Italic')
     .fontSize(34)
     .text('Firma', x, y + 22, { width, align: 'center' });
}

function drawSignatures(doc) {
  drawSignatureImage(doc, '/assets/img/firmas/firma_gerente.svg', 430, 710, 230, 70);
  drawSignatureImage(doc, '/assets/img/firmas/firma_gregorio.svg', 976, 710, 230, 70);

  drawSignatureText(doc, {
    x: 365,
    width: 360,
    name: 'Ing. Angel G. Baldeon Icochea',
    cip: '86277',
    role: 'Gerente de Operaciones',
  });

  drawSignatureText(doc, {
    x: 900,
    width: 420,
    name: 'Ing. Gregorio A. Escajadillo Sarmiento',
    cip: '050142',
    role: 'Entrenador',
  });
}

function drawCertificateCode(doc, certificadoData) {
  doc.fillColor(COLORS.red)
     .font('Helvetica-Bold')
     .fontSize(54)
     .text('RV', 780, 786, { width: 110, align: 'center' });

  doc.fillColor('#111111')
     .font('Helvetica-Bold')
     .fontSize(23)
     .text(certificadoData.codigo, 742, 843, { width: 185, align: 'center' });
}

function buildCertificateId(certificadoData) {
  const code = String(certificadoData.codigo || '');
  const parts = code.split('-');
  if (parts.length !== 3 || parts[0] !== 'PE') return code;

  const date = new Date(`${certificadoData.fecha_realizacion || certificadoData.fecha_emision}T00:00:00`);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const number = parseInt(parts[1], 10);

  return `HSEC-${year}-${month}${day}-${number}${parts[2]}`;
}

async function drawQrSection(doc, certificadoData) {
  doc.fillColor(COLORS.muted)
     .font('Helvetica')
     .fontSize(16)
     .text('Verifica la autenticidad', 1300, 695, { width: 250, align: 'center' })
     .text('escaneando el QR', 1300, 724, { width: 250, align: 'center' });

  try {
    const qrDataUrl = await generarQR(certificadoData.hash);
    const qrBuffer = Buffer.from(qrDataUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    doc.image(qrBuffer, 1328, 756, { width: 132, height: 132 });
  } catch (error) {
    doc.font('Helvetica')
       .fontSize(13)
       .fillColor(COLORS.muted)
       .text('QR no disponible', 1326, 812, { width: 136, align: 'center' });
  }

  doc.fillColor('#111111')
     .font('Helvetica')
     .fontSize(17)
     .text(`ID: ${buildCertificateId(certificadoData)}`, 1262, 906, { width: 310, align: 'center' });
}

/**
 * Genera un archivo PDF de certificado usando assets/img/Formato_fondo.png como plantilla.
 * @param {object} certificadoData - Datos del certificado, estudiante, curso y firmas.
 * @param {string} savePath - Ruta de destino para el archivo PDF.
 * @returns {Promise<string>} Promesa que resuelve con la ruta del PDF guardado.
 */
async function generarCertificadoPDF(certificadoData, savePath) {
  const dir = path.dirname(savePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`No se encontr\u00f3 la plantilla del certificado: ${TEMPLATE_PATH}`);
  }

  const templateSize = readPngSize(TEMPLATE_PATH);
  const pageSize = [templateSize.width, templateSize.height];

  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: pageSize,
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

      doc.image(TEMPLATE_PATH, 0, 0, { width: templateSize.width, height: templateSize.height });

      drawVariableText(doc, certificadoData);
      drawSignatures(doc);
      drawCertificateCode(doc, certificadoData);
      await drawQrSection(doc, certificadoData);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generarCertificadoPDF,
};
