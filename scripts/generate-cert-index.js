const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'public', 'certificados');
const outputPath = path.join(baseDir, 'index.json');

const isPdf = (fileName) => fileName.toLowerCase().endsWith('.pdf');

const courses = fs
  .readdirSync(baseDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const courseDir = path.join(baseDir, entry.name);
    const files = fs
      .readdirSync(courseDir)
      .filter((fileName) => isPdf(fileName))
      .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

    return {
      name: entry.name,
      files,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

fs.writeFileSync(outputPath, JSON.stringify({ courses }, null, 2));
console.log(`Index generado en ${outputPath}`);
