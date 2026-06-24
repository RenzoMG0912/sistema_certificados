const sharp = require('sharp');
const path = require('path');

const imagePath = path.join(__dirname, '..', 'assets', 'img', 'Formato_fondo.png');

async function analyze() {
  const image = sharp(imagePath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // Let's scan the region x in [1200, 1500], y in [700, 950]
  // We want to print any grid of lines. Let's find the rows/cols that are dark.
  console.log('Scanning bottom-right quadrant for QR box border lines...');
  
  let darkCoords = [];
  for (let y = 700; y < 950; y++) {
    for (let x = 1200; x < 1500; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      const darkness = 255 - luminance;
      
      if (darkness > 30.0) { // quite dark (like black lines)
        darkCoords.push({ x, y });
      }
    }
  }

  // Find bounding box of dark pixels in this region
  if (darkCoords.length === 0) {
    console.log('No dark pixels found in the scanned area.');
    return;
  }

  let minX = Math.min(...darkCoords.map(p => p.x));
  let maxX = Math.max(...darkCoords.map(p => p.x));
  let minY = Math.min(...darkCoords.map(p => p.y));
  let maxY = Math.max(...darkCoords.map(p => p.y));

  console.log(`Dark pixels bounds:`);
  console.log(`X: ${minX} to ${maxX} (width: ${maxX - minX + 1})`);
  console.log(`Y: ${minY} to ${maxY} (height: ${maxY - minY + 1})`);

  // Let's find the vertical lines (frequent X values) and horizontal lines (frequent Y values)
  const xCount = {};
  const yCount = {};
  darkCoords.forEach(p => {
    xCount[p.x] = (xCount[p.x] || 0) + 1;
    yCount[p.y] = (yCount[p.y] || 0) + 1;
  });

  const sortedX = Object.entries(xCount).sort((a,b) => b[1] - a[1]).slice(0, 10);
  const sortedY = Object.entries(yCount).sort((a,b) => b[1] - a[1]).slice(0, 10);

  console.log('\nTop dark vertical coordinates (X):');
  sortedX.forEach(e => console.log(`x = ${e[0]} (count: ${e[1]})`));

  console.log('\nTop dark horizontal coordinates (Y):');
  sortedY.forEach(e => console.log(`y = ${e[0]} (count: ${e[1]})`));
}

analyze().catch(err => console.error(err));
