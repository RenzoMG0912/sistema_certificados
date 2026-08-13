// Archivo: scripts/import-certificados.js
// Importa certificados PDF ya generados (carpeta de origen) al sistema:
//  1. Copia los PDFs a public/certificados/<curso> con el nombre <DNI>_<codigo>.pdf
//  2. Lee el codigo (PE-XXXX-YY), fechas y curso desde el texto del PDF
//  3. Obtiene el DNI del participante desde el mapa scripts/dni-map.json
//  4. Genera scripts/import.sql (INSERTs idempotentes) y, si se usa --exec,
//     los ejecuta directamente contra la BD configurada en .env
//
// Uso:
//   node scripts/import-certificados.js                       # genera SQL + copia PDFs
//   node scripts/import-certificados.js --dry-run             # solo análiza, no escribe
//   node scripts/import-certificados.js --exec                # además ejecuta contra la BD
//   node scripts/import-certificados.js --source "C:/ruta/certificados"
//   node scripts/import-certificados.js --map scripts/dni-map.json
//   node scripts/import-certificados.js --no-copy             # no copia PDFs a public/
//   node scripts/import-certificados.js --out scripts/import.sql

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pdfParse = require('pdf-parse');

const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_CERTS = path.join(ROOT_DIR, 'public', 'certificados');

const args = process.argv.slice(2);
const argValue = (name, def) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};

const SOURCE_DIR = argValue('--source', 'C:/Users/USER/Downloads/OFIMATICA/certificados');
const MAP_FILE = argValue('--map', path.join(__dirname, 'dni-map.json'));
const OUT_SQL = argValue('--out', path.join(__dirname, 'import.sql'));
const DRY_RUN = args.includes('--dry-run');
const DO_EXEC = args.includes('--exec');
const DO_COPY = !args.includes('--no-copy');

const MONTHS = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10,
  noviembre: 11, diciembre: 12,
};

function normalize(str) {
  return String(str || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .replace(/-/g, ' ')
    .trim();
}

function pad4(n) {
  return String(n).padStart(4, '0');
}

function addYears(dateStr, years) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setFullYear(d.getFullYear() + years);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseSpanishDate(day, monthName, year) {
  const m = MONTHS[String(monthName || '').toLowerCase().trim()];
  if (!m || !year) return null;
  return `${year}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function extractPdfData(text) {
  const data = {};

  const codeMatch = text.match(/PE-\s*(\d+)\s*-\s*(\d+)/i);
  if (codeMatch) {
    const num = parseInt(codeMatch[1], 10);
    const yr = codeMatch[2];
    data.codigo = `PE-${num}-${yr}`;
    data.codigoPadded = `PE-${pad4(num)}-${yr}`;
  }

  const MONTHS_ALT = 'enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre';

  const emitMatch = text.match(
    new RegExp(`Lima,?\\s*(\\d{1,2})\\s*de\\s*(${MONTHS_ALT})\\s*del?\\s*(20\\d{2})`, 'i')
  );
  if (emitMatch) {
    data.fecha_emision = parseSpanishDate(emitMatch[1], emitMatch[2], emitMatch[3]);
  }

  const realizMatch = text.match(
    new RegExp(`d[ií]a\\s*(\\d{1,2})\\s*de\\s*(${MONTHS_ALT})\\s*(20\\d{2})`, 'i')
  );
  if (realizMatch) {
    data.fecha_realizacion = parseSpanishDate(realizMatch[1], realizMatch[2], realizMatch[3]);
  }

  const cursoMatch = text.match(/curso\s*de:\s*["\u201c]([^"\u201d]+)["\u201d]/is);
  if (cursoMatch) {
    data.curso_nombre = cursoMatch[1].trim();
  }

  return data;
}

function loadDniMap() {
  if (!fs.existsSync(MAP_FILE)) {
    console.warn(`Advertencia: no existe ${MAP_FILE}. Crea un archivo dentro de scripts/ a partir de dni-map.template.json`);
    return {};
  }
  const raw = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
  const map = {};
  for (const [name, dni] of Object.entries(raw)) {
    if (dni && String(dni).trim()) map[normalize(name)] = String(dni).trim();
  }
  return map;
}

function hashCert(codigo, dni, fechaEmision) {
  return crypto.createHash('sha256').update(`${codigo}-${dni}-${fechaEmision}-IMPORT`).digest('hex');
}

function collectCourses() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`No existe la carpeta de origen: ${SOURCE_DIR}`);
    process.exit(1);
  }
  return fs
    .readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

function collectPdfs(courseDir) {
  return fs
    .readdirSync(courseDir)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

function resolveDni(filenameBase, pdfName, dniMap) {
  // Archivos de prueba estilo 123123123_PE-2-26.pdf -> DNI en el prefijo del nombre
  const testMatch = filenameBase.match(/^(\d{6,8})(?:_|_PE-)/);
  if (testMatch) return testMatch[1];

  const candidates = [filenameBase, pdfName].filter(Boolean).map(normalize);
  for (const nickname of candidates) {
    if (dniMap[nickname]) return dniMap[nickname];
  }

  return '';
}

async function buildModel() {
  const dniMap = loadDniMap();
  const courses = collectCourses();
  const model = [];
  const warnings = [];
  const testFiles = [];

  for (const course of courses) {
    const courseDir = path.join(SOURCE_DIR, course);
    const pdfs = collectPdfs(courseDir);

    for (const pdf of pdfs) {
      const filenameBase = path.basename(pdf, '.pdf');
      const parsed = await pdfParse(fs.readFileSync(path.join(courseDir, pdf)));
      const pdfData = extractPdfData(parsed.text);

      const pdfName = parsed.text.match(/^\s*([A-ZÀ-Ý][A-ZÀ-Ý ]{2,})\s*$/m);
      const dni = resolveDni(filenameBase, pdfName ? pdfName[1] : null, dniMap);

      const isTest = /^\d{6,8}_/.test(filenameBase);
      if (isTest) testFiles.push(pdf);

      if (!dni) {
        warnings.push(`Sin DNI: ${course}/${pdf} (agrega "${filenameBase}" en ${MAP_FILE})`);
        continue;
      }

      const codigo = pdfData.codigo || filenameBase.replace(/^\d+_/, '');
      if (!/^PE-\d+-\d+$/i.test(codigo)) {
        warnings.push(`Código no detectado: ${course}/${pdf}`);
        continue;
      }

      const fechaRealizacion = pdfData.fecha_realizacion || '2026-06-01';
      const fechaEmision = pdfData.fecha_emision || fechaRealizacion;
      const codigoEdicion = `${course}-${fechaRealizacion}`;

      model.push({
        course,
        pdf,
        filenameBase,
        pdfTextName: pdfName ? pdfName[1] : null,
        dni,
        codigo,
        codigoPadded: pdfData.codigoPadded || codigo,
        fecha_realizacion: fechaRealizacion,
        fecha_emision: fechaEmision,
        fecha_vencimiento: addYears(fechaEmision, 1),
        codigo_edicion: codigoEdicion,
        curso_nombre: pdfData.curso_nombre || null,
        hash: hashCert(codigo, dni, fechaEmision),
      });
    }
  }

  return { model, warnings, testFiles };
}

function sqlEscape(v) {
  return `'${String(v).replace(/'/g, "''")}'`;
}

function generateSql(model, edicionSeq) {
  const lines = [];
  lines.push('-- Archivo generado: scripts/import-certificados.js');
  lines.push('-- Importa participantes, ediciones, matriculas y certificados de PDFs ya emitidos.');
  lines.push('-- Idempotente: usar INSERT IGNORE / bases de datos que ya tengan los registros.');
  lines.push('-- Ejecutar contra la BD de producción (Vercel), ejemplo:');
  lines.push('--   mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < scripts/import.sql');
  lines.push('');

  const seenEdicion = new Set();

  const addEdicion = (ed) => {
    if (seenEdicion.has(ed.codigo_edicion)) return;
    seenEdicion.add(ed.codigo_edicion);
    lines.push('');
    lines.push(`-- EDICION ${ed.course} (${ed.fecha_realizacion})`);
    lines.push(`INSERT IGNORE INTO ediciones (curso_id, codigo_edicion, fecha_inicio, fecha_fin)`);
    lines.push(`SELECT cur.id, '${ed.codigo_edicion}', '${ed.fecha_realizacion}', NULL`);
    lines.push(`FROM cursos cur WHERE cur.codigo_curso = ${sqlEscape(ed.course)};`);
    edicionSeq[ed.codigo_edicion] = ed;
  };

  for (const ed of model) addEdicion(ed);

  lines.push('');
  lines.push('-- PARTICIPANTES');
  const seenPart = new Set();
  for (const ed of model) {
    if (seenPart.has(ed.dni)) continue;
    seenPart.add(ed.dni);
    const nombres = ed.filenameBase;
    lines.push(`INSERT IGNORE INTO participantes (nombres, dni) VALUES (${sqlEscape(nombres)}, '${ed.dni}');`);
  }

  lines.push('');
  lines.push('-- MATRICULAS + CERTIFICADOS');
  for (const ed of model) {
    lines.push('');
    lines.push(`-- ${ed.course}/${ed.pdf} (${ed.codigo})`);
    lines.push(`INSERT IGNORE INTO matriculas (participante_id, edicion_id)`);
    lines.push(`SELECT p.id, e.id FROM participantes p, ediciones e`);
    lines.push(`WHERE p.dni = '${ed.dni}' AND e.codigo_edicion = '${ed.codigo_edicion}';`);
    lines.push('');
    lines.push(`INSERT IGNORE INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)`);
    lines.push(`SELECT '${ed.codigo}', '${ed.hash}', m.id,`);
    lines.push(`  (SELECT id FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1),`);
    lines.push(`  (SELECT id FROM firmas WHERE cargo LIKE '%Entrenador%' LIMIT 1),`);
    lines.push(`  '${ed.fecha_emision}', '${ed.fecha_vencimiento}', '/certificados/${ed.course}/${ed.dni}_${ed.codigo}.pdf'`);
    lines.push(`FROM matriculas m`);
    lines.push(`JOIN participantes p ON m.participante_id = p.id`);
    lines.push(`JOIN ediciones e ON m.edicion_id = e.id`);
    lines.push(`WHERE p.dni = '${ed.dni}' AND e.codigo_edicion = '${ed.codigo_edicion}';`);
  }

  return lines.join('\n') + '\n';
}

function copyPdfs(model) {
  if (!DO_COPY) return 0;
  let copied = 0;
  for (const ed of model) {
    const destDir = path.join(PUBLIC_CERTS, ed.course);
    fs.mkdirSync(destDir, { recursive: true });
    const src = path.join(SOURCE_DIR, ed.course, ed.pdf);
    const dest = path.join(destDir, `${ed.dni}_${ed.codigo}.pdf`);
    fs.copyFileSync(src, dest);
    copied++;
  }
  const indexPath = path.join(PUBLIC_CERTS, 'index.json');
  const courses = fs
    .readdirSync(PUBLIC_CERTS, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const dir = path.join(PUBLIC_CERTS, e.name);
      return {
        name: e.name,
        files: fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.pdf')).sort(),
      };
    })
    .filter((c) => c.files.length > 0);
  fs.writeFileSync(indexPath, JSON.stringify({ courses }, null, 2));
  return copied;
}

async function execSql(sql) {
  const mysql = require('mysql2/promise');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    multipleStatements: true,
  });
  try {
    console.log('Ejecutando SQL contra la BD...');
    const result = await conn.query(sql);
    console.log('Importación ejecutada correctamente against la BD.');
    return result;
  } finally {
    await conn.end();
  }
}

async function main() {
  const edicionSeq = {};
  const { model, warnings, testFiles } = await buildModel();

  console.log('='.repeat(60));
  console.log('ANÁLISIS DE CERTIFICADOS A IMPORTAR');
  console.log('='.repeat(60));
  console.log(`Curso(s) detectados: ${new Set(model.map((m) => m.course)).size}`);
  console.log(`Certificados procesados: ${model.length}`);
  if (testFiles.length) {
    console.log(`\n[Info] Se omitieron ${testFiles.length} PDF(s) marcados de prueba (prefijo DNI_ en el nombre):`);
    for (const f of testFiles) console.log(`   - ${f}`);
  }

  if (warnings.length) {
    console.log('\n[Advertencias]');
    for (const w of warnings) console.log(`   ! ${w}`);
  }

  if (model.length === 0) {
    console.error('\nNo hay certificados para importar. Revisa las advertencias (faltan DNI).');
    process.exit(1);
  }

  console.log('\nDetalle por certificado:');
  for (const ed of model) {
    console.log(
      `   ${ed.course.padEnd(22)} | ${ed.dni} | ${ed.codigo.padEnd(10)} | ${ed.fecha_emision} → ${ed.fecha_vencimiento} | ${ed.filenameBase}`
    );
  }

  const sql = generateSql(model, edicionSeq);
  if (DO_EXEC) {
    await execSql(sql);
    return;
  }

  if (!DRY_RUN) {
    fs.writeFileSync(OUT_SQL, sql);
    console.log(`\nSQL generado en: ${OUT_SQL}`);
    const copied = copyPdfs(model);
    if (DO_COPY) console.log(`PDFs copiados a: ${PUBLIC_CERTS} (${copied} archivos)`);
  } else {
    console.log(`\n[DRY-RUN] No se escribieron archivos. Total certificados: ${model.length}`);
  }

  console.log('\nSiguiente paso: completa el mapa de DNI y ejecuta el SQL en tu BD remota.');
  console.log(`Para ejecutar contra la BD: node scripts/import-certificados.js --exec`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});