const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const ROOT_DIR = path.join(__dirname, '..');
const file = path.join(ROOT_DIR, 'public', 'img', 'escarapela_2026.webp');

console.log('File exists:', fs.existsSync(file));
if (fs.existsSync(file)) {
  console.log('File size:', fs.statSync(file).size);
  sharp(file)
    .png()
    .toBuffer()
    .then(() => console.log('Sharp conversion SUCCESS'))
    .catch(err => console.error('Sharp conversion ERROR:', err));
}
