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

function drawStar(doc, cx, cy, spikes, outerRadius, innerRadius, fill = '#5C4008') {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  doc.save();
  doc.fillColor(fill);
  doc.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    doc.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    doc.lineTo(x, y);
    rot += step;
  }
  doc.lineTo(cx, cy - outerRadius);
  doc.closePath();
  doc.fill();
  doc.restore();
}

function drawRibbonAndMedal(doc, x, y, width, height, year) {
  const tailY = y + height;
  const cutY = tailY - 15;
  const midX = x + width / 2;

  doc.save();

  // 1. Draw ribbon shadow/backing border in gold
  doc.fillColor(COLORS.gold);
  doc.moveTo(x - 2, y)
     .lineTo(x + width + 2, y)
     .lineTo(x + width + 2, tailY + 1)
     .lineTo(midX, cutY - 1)
     .lineTo(x - 2, tailY + 1)
     .closePath()
     .fill();

  // 2. Draw red ribbon body
  doc.fillColor(COLORS.red);
  doc.moveTo(x, y)
     .lineTo(x + width, y)
     .lineTo(x + width, tailY)
     .lineTo(midX, cutY)
     .lineTo(x, tailY)
     .closePath()
     .fill();

  // 3. Shading overlay for 3D ribbon effect
  doc.fillColor('#000000').opacity(0.12);
  doc.moveTo(x, y)
     .lineTo(midX, y)
     .lineTo(midX, cutY)
     .lineTo(x, tailY)
     .closePath()
     .fill();
  doc.opacity(1.0);

  // 4. Draw Gold Medal centered at midX, centerY
  const centerY = y + 105;
  const outerRadius = 38;
  const innerRadius = 31;

  // Scalloped outer edge (ruffle pattern)
  doc.fillColor(COLORS.gold);
  const points = 36;
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI * i) / points;
    const r = i % 2 === 0 ? outerRadius : outerRadius - 3.5;
    const px = midX + Math.cos(angle) * r;
    const py = centerY + Math.sin(angle) * r;
    if (i === 0) {
      doc.moveTo(px, py);
    } else {
      doc.lineTo(px, py);
    }
  }
  doc.closePath().fill();

  // Outer gold ring stroke
  doc.strokeColor('#A88010').lineWidth(1.2);
  doc.circle(midX, centerY, innerRadius).stroke();

  // Inner gold circle fill
  doc.fillColor('#EBC864').circle(midX, centerY, innerRadius - 0.5).fill();

  // Dotted/beaded ring
  doc.save();
  doc.strokeColor('#A88010').lineWidth(0.8).dash(1.5, { space: 1.5 });
  doc.circle(midX, centerY, innerRadius - 4).stroke();
  doc.restore();

  // 3 stars arc above the year
  const starY = centerY - 10;
  drawStar(doc, midX, starY - 2, 5, 2.5, 1);
  drawStar(doc, midX - 7, starY, 5, 2, 0.8);
  drawStar(doc, midX + 7, starY, 5, 2, 0.8);

  // Year text in center
  doc.fillColor('#5C4008')
     .font('Times-Bold')
     .fontSize(13.5)
     .text(String(year), midX - 25, centerY - 4, { width: 50, align: 'center' });

  // Laurel wreath arc at the bottom
  doc.save();
  doc.strokeColor('#5C4008').lineWidth(1.0);
  doc.arc(midX - 2, centerY + 2, 14, Math.PI * 0.4, Math.PI * 0.9, false);
  doc.stroke();
  doc.arc(midX + 2, centerY + 2, 14, Math.PI * 0.1, Math.PI * 0.6, false);
  doc.stroke();
  doc.restore();

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

async function drawHeader(doc, pageWidth, certificadoData) {
  const logoTeamHsecPath = assetPath('public', 'img', 'logo_teamhsec.webp');
  const cipPath = assetPath('public', 'img', 'cip.webp');

  // Cinta superior guinda central con extremos swallowtail
  const pts = [
    [220, 20],
    [pageWidth - 220, 20],
    [pageWidth - 240, 34],
    [pageWidth - 220, 48],
    [220, 48],
    [240, 34]
  ];

  doc.save();
  doc.fillColor(COLORS.red);
  doc.polygon(...pts);
  doc.fill();

  doc.strokeColor(COLORS.gold).lineWidth(1.2);
  doc.polygon(...pts);
  doc.stroke();

  // Dibujar diamantes dorados flotantes externos en los extremos
  drawGoldDiamond(doc, 205, 34, 3.5);
  drawGoldDiamond(doc, pageWidth - 205, 34, 3.5);
  doc.restore();

  // Texto de la cinta superior
  const headerText = 'TEAM HEALTH, SAFETY, ENVIRONMENT, AND COMMUNITY';
  doc.save();
  doc.fillColor('#ffffff')
     .font('Helvetica-Bold')
     .fontSize(8.5)
     .text(headerText, 240, 29, { width: pageWidth - 480, align: 'center' });

  // Calcular la posición exacta de los diamantes dorados alrededor del texto
  const textWidth = doc.widthOfString(headerText);
  const textStartX = pageWidth / 2 - textWidth / 2;
  drawGoldDiamond(doc, textStartX - 10, 33, 4);
  drawGoldDiamond(doc, textStartX + textWidth + 10, 33, 4);
  doc.restore();

  // Logos de encabezado
  if (!(await tryImage(doc, cipPath, 55, 35, { width: 75 }))) {
    drawFallbackCip(doc, 55, 35, 75);
  }

  // Logo de TEAM HSEC (Rojo)
  if (!(await tryImage(doc, logoTeamHsecPath, pageWidth - 150, 28, { width: 90 }))) {
    drawFallbackTeamLogo(doc, pageWidth - 150, 28, 90);
  }

  // Dibujar Moño/Roseta y listón colgando a la derecha
  const issueYear = certificadoData.fecha_emision ? new Date(certificadoData.fecha_emision + 'T00:00:00').getFullYear() : 2026;
  drawRibbonAndMedal(doc, pageWidth - 98, 0, 54, 190, issueYear);
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

  // Texto descriptivo del curso (sin continued: true para evitar bug de alineación)
  const paragraphY = 334;
  
  const part1 = 'Por haber participado y aprobado el curso de: ';
  const part2 = `"${courseName}",`;
  const part3 = `realizado el día ${courseDate}, con una duración de ${duration}.`;

  // Calcular anchos para centrado manual
  doc.font('Helvetica').fontSize(12);
  const w1 = doc.widthOfString(part1);
  doc.font('Helvetica-Bold').fontSize(12);
  const w2 = doc.widthOfString(part2);

  const line1Width = w1 + w2;
  const line1StartX = pageWidth / 2 - line1Width / 2;

  // Dibujar Parte 1
  doc.font('Helvetica')
     .fillColor(COLORS.muted)
     .text(part1, line1StartX, paragraphY, { lineBreak: false });

  // Dibujar Parte 2 (Nombre del curso en negrita guinda)
  doc.font('Helvetica-Bold')
     .fillColor(COLORS.red)
     .text(part2, line1StartX + w1, paragraphY, { lineBreak: false });

  // Dibujar Línea 2
  doc.font('Helvetica')
     .fillColor(COLORS.muted)
     .text(part3, 0, paragraphY + 18, { width: pageWidth, align: 'center' });

  // Divisor ornamental debajo de la descripción
  doc.save();
  doc.strokeColor(COLORS.gold).lineWidth(0.8);
  doc.moveTo(360, 382).lineTo(pageWidth - 360, 382).stroke();
  drawGoldDiamond(doc, pageWidth / 2, 382, 5);
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

function drawGoldLeaf(doc, x, y, rotate) {
  doc.save();
  doc.translate(x, y);
  doc.rotate(rotate);
  doc.fillColor(COLORS.gold);
  doc.moveTo(0, 0);
  doc.quadraticCurveTo(4, -2.5, 8, 0);
  doc.quadraticCurveTo(4, 2.5, 0, 0);
  doc.closePath().fill();
  doc.restore();
}

function drawGoldLaurel(doc, x, y, isRight = false) {
  doc.save();
  const dir = isRight ? -1 : 1;

  // Dibujar el tallo de la rama
  doc.strokeColor(COLORS.gold).lineWidth(0.8);
  doc.moveTo(x, y);
  doc.quadraticCurveTo(x + 12 * dir, y - 2, x + 24 * dir, y - 5);
  doc.stroke();

  // Hojas a lo largo del tallo
  drawGoldLeaf(doc, x + 4 * dir, y - 1, (isRight ? 165 : 15));
  drawGoldLeaf(doc, x + 10 * dir, y - 3, (isRight ? 155 : 25));
  drawGoldLeaf(doc, x + 16 * dir, y - 4, (isRight ? 145 : 35));
  drawGoldLeaf(doc, x + 22 * dir, y - 5, (isRight ? 135 : 45));

  // Hojas al otro lado
  drawGoldLeaf(doc, x + 4 * dir, y + 1, (isRight ? 195 : -15));
  drawGoldLeaf(doc, x + 10 * dir, y + 3, (isRight ? 205 : -25));
  drawGoldLeaf(doc, x + 16 * dir, y + 4, (isRight ? 215 : -35));

  doc.restore();
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

  const msg = 'VIGENCIA: 01 AÑO DESDE LA FECHA DE EMISIÓN.';
  doc.fillColor('#ffffff')
     .font('Helvetica-Bold')
     .fontSize(8.5)
     .text(msg, x, y + 6, { width: width, align: 'center' });

  // Laurel dorado a los costados del texto
  const msgWidth = doc.widthOfString(msg);
  const textStartX = pageWidth / 2 - msgWidth / 2;
  drawGoldLaurel(doc, textStartX - 32, y + 11, false);
  drawGoldLaurel(doc, textStartX + msgWidth + 8, y + 11, true);

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

  // Generar el ID en formato extendido: HSEC-YYYY-MMDD-NUMYY
  let fullId = certificadoData.codigo;
  if (certificadoData.codigo && !certificadoData.codigo.startsWith('HSEC-')) {
    const parts = certificadoData.codigo.split('-');
    if (parts.length === 3 && parts[0] === 'PE') {
      const num = parts[1];
      const yrSuffix = parts[2];
      const date = new Date((certificadoData.fecha_realizacion || certificadoData.fecha_emision) + 'T00:00:00');
      const year = date.getFullYear() || new Date().getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const numInt = parseInt(num, 10);
      fullId = `HSEC-${year}-${month}${day}-${numInt}${yrSuffix}`;
    }
  }

  // ID del certificado debajo del QR
  doc.fillColor('#1A1A1A')
     .font('Helvetica-Bold')
     .fontSize(7.5)
     .text(`ID: ${fullId}`, qrX - 25, qrY + qrSize + 6, { width: qrSize + 50, align: 'center' });
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
      await drawHeader(doc, width, certificadoData);

      // 6. Texto del Certificado (Título, Nombre, Curso, Divisores)
      drawCertificateText(doc, certificadoData, width);

      // 7. Fecha de Emisión (centrada)
      drawIssueDate(doc, certificadoData, width);

      // 8. Bloque Central de Validación (Logo de HSEC y Código de Registro)
      const smallLogoPath = assetPath('public', 'img', 'logo_teamhsec.webp');
      const logoWidth = 36;
      const logoX = width / 2 - logoWidth / 2;
      const logoY = 443;
      if (!(await tryImage(doc, smallLogoPath, logoX, logoY, { width: logoWidth }))) {
        doc.fillColor(COLORS.red).font('Helvetica-Bold').fontSize(12).text('HSEC', logoX, logoY, { width: logoWidth, align: 'center' });
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
