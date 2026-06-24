const sharp = require('sharp');
const path = require('path');

const imagePath = path.join(__dirname, '..', 'assets', 'img', 'Formato_fondo.png');

async function analyze() {
  const image = sharp(imagePath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const channels = info.channels;
  const y = 800; // row of the signature lines

  console.log(`Scanning row ${y} horizontally...`);
  let lineSegments = [];
  let inLine = false;
  let lineStart = 0;

  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx+1];
    const b = data[idx+2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    const darkness = 255 - luminance;

    if (darkness > 10.0) { // significant darkness
      if (!inLine) {
        inLine = true;
        lineStart = x;
      }
    } else {
      if (inLine) {
        inLine = false;
        lineSegments.push({ start: lineStart, end: x - 1 });
      }
    }
  }
  if (inLine) {
    lineSegments.push({ start: lineStart, end: width - 1 });
  }

  console.log('Detected line segments on row 800:');
  lineSegments.forEach((seg, i) => {
    console.log(`Segment ${i + 1}: x = ${seg.start} to ${seg.end} | Width: ${seg.end - seg.start + 1} | Center: ${(seg.start + seg.end) / 2}`);
  });
}

analyze().catch(err => console.error(err));
