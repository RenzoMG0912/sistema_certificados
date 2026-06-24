const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagePath = path.join(__dirname, '..', 'assets', 'img', 'Formato_fondo.png');

async function analyze() {
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  const { width, height } = metadata;
  console.log(`Image size: ${width}x${height}`);

  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  console.log(`Buffer info: channels=${info.channels}, size=${data.length}`);

  const rowDarkness = [];
  const startX = 350; // narrow further to avoid any left/right elements
  const endX = width - 350;
  const scanWidth = endX - startX;
  const channels = info.channels;
  
  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = startX; x < endX; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];
      
      const y_val = 0.299 * r + 0.587 * g + 0.114 * b;
      const darkness = 255 - y_val;
      rowSum += darkness;
    }
    rowDarkness.push(rowSum / scanWidth);
  }

  console.log('\n--- Darkness Profile (every 10 rows) ---');
  for (let y = 0; y < height; y += 10) {
    let bar = '';
    const val = rowDarkness[y];
    const barLength = Math.min(60, Math.floor(val * 4));
    bar = '#'.repeat(barLength);
    console.log(`${y.toString().padStart(4)}: ${val.toFixed(2).padStart(6)} ${bar}`);
  }
}

analyze().catch(err => console.error(err));
