// Archivo: src/services/pdf.service.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { generarQR } = require('./qr.service');

const ROOT_DIR = path.join(__dirname, '..', '..');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'assets', 'img', 'Formato_fondo.png');
const LOGO_TEAMHSEC = path.join(ROOT_DIR, 'public', 'img', 'logo_teamhsec.webp');
const LOGO_CIP = path.join(ROOT_DIR, 'public', 'img', 'cip.webp');
const PDF_ASSET_CACHE_DIR = path.join(ROOT_DIR, '.cache', 'pdf-assets');
let sharp = null;
try {
  sharp = require('sharp');
} catch (error) {
  sharp = null;
}

const PAGE = {
  width: 1491,
  height: 1055,
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
  for (const ext of ['.png', '.jpg', '.jpeg', '.webp', '.svg']) {
    const candidate = path.join(parsed.dir, `${parsed.name}${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }

  return direct;
}

async function resolvePdfImagePath(imagePath) {
  if (!imagePath || !fs.existsSync(imagePath)) return null;

  const ext = path.extname(imagePath).toLowerCase();
  if (ext !== '.webp') return imagePath;
  if (!sharp) return null;

  const stat = fs.statSync(imagePath);
  const cacheName = `${path.basename(imagePath, ext)}-${stat.size}-${Math.floor(stat.mtimeMs)}.png`;
  const cachedPath = path.join(PDF_ASSET_CACHE_DIR, cacheName);
  if (!fs.existsSync(cachedPath)) {
    fs.mkdirSync(PDF_ASSET_CACHE_DIR, { recursive: true });
    await sharp(imagePath).png().toFile(cachedPath);
  }
  return cachedPath;
}

async function tryImage(doc, imagePath, x, y, options) {
  try {
    const pdfImagePath = await resolvePdfImagePath(imagePath);
    if (!pdfImagePath) return false;
    doc.image(pdfImagePath, x, y, options);
    return true;
  } catch (error) {
    return false;
  }
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

  const nameSize = fitText(doc, studentName, 1080, 58, 38);
  doc.font('Times-Bold')
    .fontSize(nameSize)
    .fillColor(COLORS.wine)
    .text(studentName, 200, 425, { width: 1136, align: 'center' });

  drawCenteredLine(doc, [
    { text: 'Por haber participado y aprobado el curso de: ', font: 'Helvetica', color: COLORS.muted },
    { text: `"${courseName}",`, font: 'Helvetica-Bold', color: COLORS.red },
  ], 600, 22);

  doc.font('Helvetica')
    .fontSize(22)
    .fillColor(COLORS.muted)
    .text(`realizado el d\u00eda ${courseDate}, con una duraci\u00f3n de ${duration}.`, 260, 636, {
      width: 970,
      align: 'center',
    });

  doc.font('Helvetica')
    .fontSize(19)
    .fillColor(COLORS.muted)
    .text(`Lima, ${issueDate}`, 0, 724, { width: PAGE.width, align: 'center' });
}

function drawSignatureText(doc, block) {
  doc.fillColor(COLORS.muted)
    .font('Helvetica')
    .fontSize(18)
    .text(block.name, block.x, 830, { width: block.width, align: 'center' });

  if (block.cip) {
    doc.fillColor(COLORS.red)
      .font('Helvetica-Bold')
      .fontSize(17)
      .text(`CIP - ${block.cip}`, block.x, 856, { width: block.width, align: 'center' });
  }

  doc.fillColor(COLORS.muted)
    .font('Helvetica')
    .fontSize(17)
    .text(block.role, block.x, 882, { width: block.width, align: 'center' });
}

async function drawSignatureImage(doc, firmaUrl, x, y, width, height) {
  const signaturePath = resolvePublicOrRootPath(firmaUrl);
  if (await tryImage(doc, signaturePath, x, y, { width, height })) return;
  if (trySvgPath(doc, signaturePath, x, y, width, height, COLORS.red)) return;

  doc.fillColor(COLORS.red)
    .font('Times-Italic')
    .fontSize(34)
    .text('Firma', x, y + 22, { width, align: 'center' });
}

async function drawSignatures(doc, certificadoData) {
  const f1 = certificadoData.firma_1;
  const f2 = certificadoData.firma_2;

  if (f1) {
    await drawSignatureImage(doc, f1.firma_url, 395, 720, 220, 62);
    drawSignatureText(doc, {
      x: 295,
      width: 420,
      name: f1.nombre,
      cip: f1.cip,
      role: f1.cargo,
    });
  }

  if (f2) {
    await drawSignatureImage(doc, f2.firma_url, 902, 720, 220, 62);
    drawSignatureText(doc, {
      x: 802,
      width: 420,
      name: f2.nombre,
      cip: f2.cip,
      role: f2.cargo,
    });
  }
}

async function drawCertificateCode(doc, certificadoData) {
  // Removido a petición del usuario para dejar limpia la zona central inferior
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
  try {
    const qrDataUrl = await generarQR(certificadoData.hash);
    const qrBuffer = Buffer.from(qrDataUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    doc.image(qrBuffer, 1267, 767, { width: 116, height: 116 });
  } catch (error) {
    doc.font('Helvetica')
      .fontSize(13)
      .fillColor(COLORS.muted)
      .text('QR no disponible', 1260, 815, { width: 130, align: 'center' });
  }

  doc.fillColor('#111111')
    .font('Helvetica')
    .fontSize(14)
    .text(`ID: ${buildCertificateId(certificadoData)}`, 1175, 902, { width: 300, align: 'center' });

  doc.fillColor('#111111')
    .font('Helvetica-Bold')
    .fontSize(16)
    .text(certificadoData.codigo, 1175, 926, { width: 300, align: 'center' });
}

function drawGoldBorder(doc, width, height) {
  const borderColor = COLORS.gold;
  const borderWidth = 3;
  const cornerSize = 40;
  const margin = 25;

  doc.save();
  doc.lineWidth(borderWidth);
  doc.strokeColor(borderColor);

  // Main rectangle border
  doc.rect(margin, margin, width - margin * 2, height - margin * 2).stroke();

  // Inner thin line
  doc.lineWidth(1);
  doc.rect(margin + 8, margin + 8, width - (margin + 8) * 2, height - (margin + 8) * 2).stroke();

  // Corner decorations (L-shapes)
  doc.lineWidth(2.5);
  const corners = [
    { x: margin, y: margin, dx: cornerSize, dy: 0, dx2: 0, dy2: cornerSize },
    { x: width - margin, y: margin, dx: -cornerSize, dy: 0, dx2: 0, dy2: cornerSize },
    { x: margin, y: height - margin, dx: cornerSize, dy: 0, dx2: 0, dy2: -cornerSize },
    { x: width - margin, y: height - margin, dx: -cornerSize, dy: 0, dx2: 0, dy2: -cornerSize },
  ];

  for (const c of corners) {
    doc.moveTo(c.x, c.y).lineTo(c.x + c.dx, c.y + c.dy).stroke();
    doc.moveTo(c.x, c.y).lineTo(c.x + c.dx2, c.y + c.dy2).stroke();
  }

  doc.restore();
}

function drawGoldDivider(doc, y, width) {
  const centerX = width / 2;
  const lineHalf = 180;
  const diamondSize = 8;

  doc.save();
  doc.strokeColor(COLORS.gold);
  doc.lineWidth(1.5);

  // Left line
  doc.moveTo(centerX - lineHalf - diamondSize * 2, y).lineTo(centerX - diamondSize, y).stroke();

  // Right line
  doc.moveTo(centerX + diamondSize, y).lineTo(centerX + lineHalf + diamondSize * 2, y).stroke();

  // Center diamond
  doc.save();
  doc.translate(centerX, y);
  doc.rotate(45);
  doc.rect(-diamondSize / 2, -diamondSize / 2, diamondSize, diamondSize).fill(COLORS.gold);
  doc.restore();

  doc.restore();
}

function drawBackPage(doc, certificadoData, pageSize) {
  const width = pageSize[0];
  const height = pageSize[1];

  // White background
  doc.save();
  doc.rect(0, 0, width, height).fill('#ffffff');
  doc.restore();

  // Gold decorative border
  drawGoldBorder(doc, width, height);

  // Logos at top
  const logoSize = 70;
  const logoY = 50;
  tryImage(doc, LOGO_CIP, 60, logoY, { width: logoSize, height: logoSize });
  tryImage(doc, LOGO_TEAMHSEC, width - 60 - logoSize, logoY, { width: logoSize, height: logoSize });

  // Title
  doc.font('Times-Bold')
    .fontSize(36)
    .fillColor(COLORS.muted)
    .text('CONTENIDO DEL CURSO', 0, 145, { width, align: 'center' });

  // Gold divider below title
  drawGoldDivider(doc, 195, width);

  // Course name
  const courseName = String(certificadoData.curso_nombre || 'Curso').toUpperCase();
  doc.font('Times-Bold')
    .fontSize(26)
    .fillColor(COLORS.red)
    .text(`CURSO: ${courseName}`, 0, 220, { width, align: 'center' });

  // Company info
  doc.font('Helvetica')
    .fontSize(18)
    .fillColor(COLORS.muted)
    .text('EMPRESA \u2013 TEAM HSEC E.I.R.L.', 0, 265, { width, align: 'center' });

  // TEMARIO heading
  const temarioStartY = 320;
  doc.font('Times-Bold')
    .fontSize(22)
    .fillColor(COLORS.muted)
    .text('TEMARIO', 0, temarioStartY, { width, align: 'center' });

  // Temario items - centered, bold, blue
  const temario = certificadoData.curso_temario || '';
  const lines = temario.split('\n').filter(line => line.trim());

  let y = temarioStartY + 45;
  const lineHeight = 30;
  let itemCount = 0;

  for (const line of lines) {
    if (y > height - 80) break;

    itemCount++;
    const cleanLine = line.replace(/^\d+[\.\)\s]+/, '').trim();
    const text = `${itemCount}.    ${cleanLine}`;

    doc.font('Helvetica-Bold')
      .fontSize(17)
      .fillColor('#1a5276')
      .text(text, 0, y, { width, align: 'center', lineBreak: false });

    y += lineHeight;
  }

  // Gold divider near bottom
  drawGoldDivider(doc, height - 55, width);
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
  PAGE.width = templateSize.width;
  PAGE.height = templateSize.height;
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

      // === PÁGINA 1: FRENTE DEL CERTIFICADO ===
      doc.image(TEMPLATE_PATH, 0, 0, { width: templateSize.width, height: templateSize.height });

      drawVariableText(doc, certificadoData);
      await drawSignatures(doc, certificadoData);
      await drawQrSection(doc, certificadoData);

      // === PÁGINA 2: REVERSO CON TEMARIO ===
      if (certificadoData.curso_temario && certificadoData.curso_temario.trim()) {
        doc.addPage({
          size: pageSize,
          margin: 0,
        });

        drawBackPage(doc, certificadoData, pageSize);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generarCertificadoPDF,
};
