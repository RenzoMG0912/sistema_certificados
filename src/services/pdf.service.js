// Archivo: src/services/pdf.service.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const { generarQR } = require('./qr.service');

const ROOT_DIR = path.join(__dirname, '..', '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const PDF_ASSET_CACHE_DIR = path.join(ROOT_DIR, '.cache', 'pdf-assets');

const COLORS = {
  red: '#6B0015',      // Guindo oscuro
  redWine: '#8B0000',  // Rojo vino
  gold: '#C9A227',     // Dorado metálico
  blue: '#2d9be8',
  text: '#111111',
  muted: '#565b64',
  ivory: '#FDFBF7'     // Blanco marfil
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

async function resolvePdfImagePath(imagePath) {
  if (!imagePath || !fs.existsSync(imagePath)) return null;

  if (path.extname(imagePath).toLowerCase() !== '.webp') {
    return imagePath;
  }

  const stat = fs.statSync(imagePath);
  const cacheKey = crypto
    .createHash('sha1')
    .update(`${imagePath}:${stat.size}:${stat.mtimeMs}`)
    .digest('hex');
  const cachedPath = path.join(PDF_ASSET_CACHE_DIR, `${cacheKey}.png`);

  if (!fs.existsSync(cachedPath)) {
    fs.mkdirSync(PDF_ASSET_CACHE_DIR, { recursive: true });
    await sharp(imagePath).png().toFile(cachedPath);
  }

  return cachedPath;
}

async function tryImage(doc, imagePath, x, y, options) {
  try {
    const pdfImagePath = await resolvePdfImagePath(imagePath);
    if (pdfImagePath) {
      doc.image(pdfImagePath, x, y, options);
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
     .text('LIDERES EN TRAINING', x, y + width * 0.55, { width, align: 'center' });
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
  doc.polygon([x + size * 0.22, y + size * 0.55], [x + size * 0.43, y + size * 0.55], [x + size * 0.35, y + size * 1.65], [x + size * 0.1, y + size * 1.45]).fill(COLORS.red);
  doc.polygon([x + size * 0.57, y + size * 0.55], [x + size * 0.78, y + size * 0.55], [x + size * 0.9, y + size * 1.45], [x + size * 0.65, y + size * 1.65]).fill(COLORS.redWine);

  for (let i = 0; i < 32; i += 1) {
    const angle = (Math.PI * 2 * i) / 32;
    const inner = size * 0.34;
    const outer = i % 2 === 0 ? size * 0.47 : size * 0.41;
    doc.moveTo(centerX + Math.cos(angle) * inner, centerY + Math.sin(angle) * inner)
       .lineTo(centerX + Math.cos(angle + Math.PI / 32) * outer, centerY + Math.sin(angle + Math.PI / 32) * outer)
       .lineTo(centerX + Math.cos(angle + Math.PI / 16) * inner, centerY + Math.sin(angle + Math.PI / 16) * inner)
       .fill(COLORS.gold);
  }

  doc.circle(centerX, centerY, size * 0.27).fill('#ffffff');
  doc.fillColor(COLORS.red)
     .font('Helvetica-Bold')
     .fontSize(size * 0.15)
     .text(String(year), x, y + size * 0.43, { width: size, align: 'center' });
  doc.restore();
}

async function drawWatermark(doc, pageWidth, pageHeight) {
  const watermarkPath = assetPath('public', 'img', 'logo_teamhsec.webp');

  doc.save();
  doc.opacity(0.08);
  const size = 380;
  const x = pageWidth / 2 - size / 2;
  const y = pageHeight / 2 - size / 2;
  if (!(await tryImage(doc, watermarkPath, x, y, { width: size }))) {
    doc.font('Helvetica-Bold')
       .fontSize(210)
       .fillColor(COLORS.red)
       .text('RV', pageWidth / 2 - 145, 132, { width: 290, align: 'center' });
  }
  doc.restore();
}

function drawCornerOrnament(doc, x, y, dx, dy) {
  doc.save();
  doc.strokeColor(COLORS.gold).lineWidth(1);
  // Dibujar líneas L del borde
  doc.moveTo(x + dx * 16, y)
     .lineTo(x, y)
     .lineTo(x, y + dy * 16)
     .stroke();
  // Dibujar líneas L secundarias internas
  doc.moveTo(x + dx * 20, y + dy * 4)
     .lineTo(x + dx * 4, y + dy * 4)
     .lineTo(x + dx * 4, y + dy * 20)
     .stroke();
  // Pequeño cuadrado relleno en la esquina
  doc.rect(x + dx * 8 - (dx < 0 ? 4 : 0), y + dy * 8 - (dy < 0 ? 4 : 0), 4, 4)
     .fill(COLORS.gold);
  doc.restore();
}

function drawBorders(doc, width, height) {
  doc.save();
  doc.strokeColor(COLORS.gold).lineWidth(1.2);
  // Borde exterior
  doc.rect(20, 20, width - 40, height - 40).stroke();
  // Borde interior
  doc.rect(24, 24, width - 48, height - 48).stroke();
  doc.restore();

  // Ornamentos en las esquinas
  drawCornerOrnament(doc, 24, 24, 1, 1);        // Superior Izquierda
  drawCornerOrnament(doc, width - 24, 24, -1, 1); // Superior Derecha
  drawCornerOrnament(doc, width - 24, height - 24, -1, -1); // Inferior Derecha
}

function drawBottomLeftDecoration(doc, width, height) {
  // Capa 1: Rojo Vino (Fondo de la curva)
  doc.save();
  doc.fillColor(COLORS.redWine);
  doc.moveTo(0, height - 310);
  doc.quadraticCurveTo(90, height - 140, 350, height);
  doc.lineTo(0, height);
  doc.closePath();
  doc.fill();
  doc.restore();

  // Capa 2: Línea de realce dorado
  doc.save();
  doc.strokeColor(COLORS.gold).lineWidth(2);
  doc.moveTo(0, height - 300);
  doc.quadraticCurveTo(85, height - 130, 340, height);
  doc.stroke();
  doc.restore();

  // Capa 3: Guindo Oscuro (Capa principal superior)
  doc.save();
  doc.fillColor(COLORS.red);
  doc.moveTo(0, height - 280);
  doc.quadraticCurveTo(80, height - 120, 320, height);
  doc.lineTo(0, height);
  doc.closePath();
  doc.fill();
  doc.restore();

  // Capa 4: Línea dorada fina interior
  doc.save();
  doc.strokeColor(COLORS.gold).lineWidth(1.2);
  doc.moveTo(0, height - 270);
  doc.quadraticCurveTo(75, height - 115, 310, height);
  doc.stroke();
  doc.restore();
}

async function drawHeader(doc, pageWidth) {
  const logoRvPath = assetPath('public', 'img', 'logo_RV_azul.webp');
  const cipPath = assetPath('public', 'img', 'cip.webp');
  const rosettePath = assetPath('public', 'img', 'escarapela_2026.webp');

  // Cinta superior guinda central
  doc.save();
  doc.fillColor(COLORS.red);
  doc.polygon([220, 20], [pageWidth - 220, 20], [pageWidth - 240, 48], [240, 48]);
  doc.fill();

  doc.strokeColor(COLORS.gold).lineWidth(1.2);
  doc.polygon([220, 20], [pageWidth - 220, 20], [pageWidth - 240, 48], [240, 48]);
  doc.stroke();

  doc.fillColor('#ffffff')
     .font('Helvetica-Bold')
     .fontSize(9)
     .text('◆ TEAM HEALTH, SAFETY, ENVIRONMENT, AND COMMUNITY ◆', 240, 29, { width: pageWidth - 480, align: 'center' });
  doc.restore();

  // Logos de encabezado
  if (!(await tryImage(doc, cipPath, 55, 35, { width: 75 }))) {
    drawFallbackCip(doc, 55, 35, 75);
  }

  if (!(await tryImage(doc, logoRvPath, pageWidth - 145, 35, { width: 75 }))) {
    drawFallbackTeamLogo(doc, pageWidth - 145, 35, 75);
  }

  if (!(await tryImage(doc, rosettePath, pageWidth - 250, 0, { width: 75 }))) {
    drawFallbackRosette(doc, pageWidth - 250, 15, 75, 2026);
  }
}

function drawGoldDiamond(doc, x, y, size = 6) {
  doc.save();
  doc.fillColor(COLORS.gold);
  doc.polygon([x, y - size], [x + size, y], [x, y + size], [x - size, y]);
  doc.fill();
  doc.restore();
}

function drawCertificateText(doc, certificadoData, pageWidth) {
  const courseName = String(certificadoData.curso_nombre || 'Curso').toUpperCase();
  const studentName = String(certificadoData.alumno_nombres || 'Alumno').toUpperCase();
  const courseDate = formatCourseDate(certificadoData.fecha_realizacion || certificadoData.fecha_emision);
  const duration = normalizeDuration(certificadoData.curso_duracion);

  // Título "CERTIFICADO"
  doc.fillColor(COLORS.red)
     .font('Times-Bold')
     .fontSize(52)
     .text('CERTIFICADO', 0, 135, { width: pageWidth, align: 'center' });

  // Subtítulo "DE PARTICIPACIÓN"
  doc.fillColor(COLORS.gold)
     .font('Helvetica-Bold')
     .fontSize(16)
     .text('DE PARTICIPACIÓN', 0, 195, { width: pageWidth, align: 'center' });

  // Líneas decorativas doradas a los lados del subtítulo
  doc.save();
  doc.strokeColor(COLORS.gold).lineWidth(1.2);
  doc.moveTo(170, 201).lineTo(300, 201).stroke();
  doc.moveTo(pageWidth - 300, 201).lineTo(pageWidth - 170, 201).stroke();
  doc.restore();

  // Texto "OTORGADO A:"
  doc.fillColor(COLORS.muted)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('OTORGADO A:', 0, 230, { width: pageWidth, align: 'center' });

  // Nombre del Participante
  const nameFontSize = studentName.length > 34 ? 24 : 28;
  doc.fillColor('#1A1A1A')
     .font('Times-Bold')
     .fontSize(nameFontSize)
     .text(studentName, 105, 270, { width: pageWidth - 210, align: 'center' });

  // Divisor ornamental debajo del nombre
  doc.save();
  doc.strokeColor(COLORS.gold).lineWidth(0.8);
  doc.moveTo(340, 315).lineTo(pageWidth - 340, 315).stroke();
  drawGoldDiamond(doc, pageWidth / 2, 315, 5);
  doc.restore();

  // Texto descriptivo del curso
  const paragraphX = 100;
  const paragraphY = 335;
  const paragraphWidth = pageWidth - 200;

  doc.fillColor(COLORS.muted)
     .font('Helvetica')
     .fontSize(12.5)
     .text('Por haber participado y aprobado el curso de: ', paragraphX, paragraphY, {
       width: paragraphWidth,
       align: 'center',
       continued: true,
     })
     .font('Helvetica-Bold')
     .fillColor(COLORS.red)
     .text(`"${courseName}", `, { continued: true })
     .font('Helvetica')
     .fillColor(COLORS.muted)
     .text(`realizado el día ${courseDate}, con una duración de ${duration}.`, { continued: false });

  // Divisor ornamental debajo de la descripción
  doc.save();
  doc.strokeColor(COLORS.gold).lineWidth(0.8);
  doc.moveTo(360, 380).lineTo(pageWidth - 360, 380).stroke();
  drawGoldDiamond(doc, pageWidth / 2, 380, 5);
  doc.restore();
}

function drawIssueDate(doc, certificadoData, pageWidth) {
  const issueDate = formatIssueDate(certificadoData.fecha_emision);
  doc.fillColor(COLORS.muted)
     .font('Helvetica')
     .fontSize(10.5)
     .text(`Lima, ${issueDate}`, 0, 398, { width: pageWidth, align: 'center' });
}

async function drawSignature(doc, firma, x, y, defaults = {}) {
  const data = {
    nombre: firma?.nombre || defaults.nombre || 'Firma autorizada',
    cip: firma?.cip || defaults.cip || '',
    cargo: firma?.cargo || defaults.cargo || '',
    firma_url: firma?.firma_url,
  };

  const signaturePath = resolvePublicOrRootPath(data.firma_url);
  const imageDrawn =
    (await tryImage(doc, signaturePath, x + 34, y - 56, { width: 112, height: 50 })) ||
    trySvgPath(doc, signaturePath, x + 20, y - 62, 142, 52);

  if (!imageDrawn) {
    doc.fillColor('#2449a6')
       .font('Times-Italic')
       .fontSize(20)
       .text(data.nombre.split(' ').slice(1, 3).join(' ') || data.nombre, x, y - 35, { width: 180, align: 'center' });
  }

  doc.moveTo(x, y)
     .lineTo(x + 180, y)
     .lineWidth(0.8)
     .stroke('#B0B0B0');

  doc.fillColor('#1A1A1A')
     .font('Helvetica-Bold')
     .fontSize(9.5)
     .text(data.nombre, x - 15, y + 12, { width: 210, align: 'center' });

  if (data.cip) {
    doc.fillColor(COLORS.red)
       .font('Helvetica-Bold')
       .fontSize(9)
       .text(`CIP - ${data.cip}`, x - 15, y + 25, { width: 210, align: 'center' });

    doc.fillColor(COLORS.muted)
       .font('Helvetica')
       .fontSize(9)
       .text(data.cargo, x - 15, y + 38, { width: 210, align: 'center' });
  } else {
    doc.fillColor(COLORS.muted)
       .font('Helvetica')
       .fontSize(9)
       .text(data.cargo, x - 15, y + 25, { width: 210, align: 'center' });
  }
}

function drawBottomRibbon(doc, pageWidth, pageHeight) {
  const x = 160;
  const y = pageHeight - 38;
  const width = pageWidth - 320;
  const height = 22;

  doc.save();
  doc.fillColor(COLORS.red);
  doc.polygon([x, y], [x + width, y], [x + width - 10, y + height], [x + 10, y + height]);
  doc.fill();

  doc.strokeColor(COLORS.gold).lineWidth(1.2);
  doc.polygon([x, y], [x + width, y], [x + width - 10, y + height], [x + 10, y + height]);
  doc.stroke();

  doc.fillColor('#ffffff')
     .font('Helvetica-Bold')
     .fontSize(8.5)
     .text('◆ VIGENCIA: 01 AÑO DESDE LA FECHA DE EMISIÓN. ◆', x, y + 6, { width: width, align: 'center' });
  doc.restore();
}

async function drawQrSection(doc, certificadoData, pageWidth, pageHeight) {
  const qrX = 705;
  const qrY = 455;
  const qrSize = 65;

  // Texto arriba del QR
  doc.fillColor(COLORS.muted)
     .font('Helvetica')
     .fontSize(7.5)
     .text('Verifica la autenticidad\nescaneando el QR', qrX - 15, qrY - 24, { width: qrSize + 30, align: 'center' });

  // Imagen del QR
  try {
    const qrDataUrl = await generarQR(certificadoData.hash);
    const qrBuffer = Buffer.from(qrDataUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });
  } catch (error) {
    doc.font('Helvetica').fontSize(6).fillColor(COLORS.muted).text('QR no disponible', qrX, qrY + 20, { width: qrSize, align: 'center' });
  }

  // ID del certificado debajo del QR
  doc.fillColor('#1A1A1A')
     .font('Helvetica-Bold')
     .fontSize(8)
     .text(`ID: ${certificadoData.codigo}`, qrX - 25, qrY + qrSize + 6, { width: qrSize + 50, align: 'center' });
}

/**
 * Genera un archivo PDF de certificado en tamaño A4 horizontal y lo guarda en disco.
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
        size: 'A4',
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

      // 1. Fondo Blanco Marfil
      doc.rect(0, 0, width, height).fill(COLORS.ivory);

      // 2. Marca de Agua
      await drawWatermark(doc, width, height);

      // 3. Decoración de Curvas en la Esquina Inferior Izquierda
      drawBottomLeftDecoration(doc, width, height);

      // 4. Bordes dobles y Ornamentos de Esquinas
      drawBorders(doc, width, height);

      // 5. Encabezado (cinta superior y logos)
      await drawHeader(doc, width);

      // 6. Texto del Certificado (Título, Nombre, Curso, Divisores)
      drawCertificateText(doc, certificadoData, width);

      // 7. Fecha de Emisión (centrada)
      drawIssueDate(doc, certificadoData, width);

      // 8. Bloque Central de Validación (Logo de RV y Código de Registro)
      const smallLogoPath = assetPath('public', 'img', 'logo_RV_azul.webp');
      const logoWidth = 32;
      const logoX = width / 2 - logoWidth / 2;
      const logoY = 445;
      if (!(await tryImage(doc, smallLogoPath, logoX, logoY, { width: logoWidth }))) {
        doc.fillColor(COLORS.red).font('Helvetica-Bold').fontSize(14).text('RV', logoX, logoY, { width: logoWidth, align: 'center' });
      }
      doc.fillColor('#1A1A1A')
         .font('Helvetica-Bold')
         .fontSize(9.5)
         .text(certificadoData.codigo, 0, 482, { width: width, align: 'center' });

      // 9. Firmas Institucionales
      await drawSignature(doc, certificadoData.firma_1, 130, 485, {
        nombre: 'Ing. Angel G. Baldeon Icochea',
        cip: '86277',
        cargo: 'Gerente de Operaciones',
      });

      await drawSignature(doc, certificadoData.firma_2, 530, 485, {
        nombre: 'Ing. Gregorio A. Escajadillo Sarmiento',
        cip: '050142',
        cargo: 'Entrenador',
      });

      // 10. Sección de Validación QR (Derecha)
      await drawQrSection(doc, certificadoData, width, height);

      // 11. Barra de Vigencia Inferior (Cinta)
      drawBottomRibbon(doc, width, height);

      // 12. Hash de Seguridad (Esquina inferior izquierda)
      doc.fontSize(6)
         .fillColor('#7b7f86')
         .font('Helvetica')
         .text(`Hash SHA-256: ${certificadoData.hash}`, 35, height - 16, { width: 450 });

      doc.end();

    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generarCertificadoPDF,
};
