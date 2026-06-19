const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT_DIR = path.join(__dirname, '..');
const PDF_ASSET_CACHE_DIR = path.join(ROOT_DIR, '.cache', 'pdf-assets');

async function test() {
  const doc = new PDFDocument();
  const rosettePath = path.join(ROOT_DIR, 'public', 'img', 'escarapela_2026.webp');

  console.log('Rosette path:', rosettePath);
  console.log('Exists:', fs.existsSync(rosettePath));

  try {
    const cacheKey = 'test_escarapela';
    const cachedPath = path.join(PDF_ASSET_CACHE_DIR, `${cacheKey}.png`);
    fs.mkdirSync(PDF_ASSET_CACHE_DIR, { recursive: true });
    await sharp(rosettePath).png().toFile(cachedPath);
    console.log('Converted PNG exists:', fs.existsSync(cachedPath));

    doc.image(cachedPath, 100, 100, { width: 75 });
    console.log('doc.image SUCCESS');
  } catch (err) {
    console.error('doc.image ERROR:', err);
  }
}

test();
