// Archivo: src/controllers/certificados.controller.js
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const mockDb = require('../config/mockDb');
const { generarHash } = require('../services/hash.service');
const { generarCodigoCertificado } = require('../services/codigo.service');
const { generarCertificadoPDF } = require('../services/pdf.service');
const emailService = require('../services/email.service');


// Función helper para sincronizar el index.json estático con los PDFs en disco
function syncIndexStatic() {
  const baseDir = path.join(__dirname, '..', '..', 'public', 'certificados');
  const outputPath = path.join(baseDir, 'index.json');
  
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const isPdf = (fileName) => fileName.toLowerCase().endsWith('.pdf');

  try {
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
      .filter(c => c.files.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

    fs.writeFileSync(outputPath, JSON.stringify({ courses }, null, 2));
    console.log(`[Index Sync] Catálogo index.json de MySQL/Mock actualizado correctamente.`);
  } catch (err) {
    console.error('[Index Sync] Fallo al sincronizar index.json:', err);
  }
}

module.exports = {
  list: async (req, res, next) => {
    try {
      const query = `
        SELECT c.id, c.codigo, c.hash, c.fecha_emision, c.fecha_vencimiento, c.pdf_path,
               p.nombres AS alumno_nombre, p.dni AS alumno_dni, p.email AS alumno_email,
               cur.nombre AS curso_nombre
        FROM certificados c
        JOIN matriculas m ON c.matricula_id = m.id
        JOIN participantes p ON m.participante_id = p.id
        JOIN cursos cur ON m.curso_id = cur.id
        ORDER BY c.id DESC
      `;
      const [rows] = await db.query(query);
      return res.status(200).json(rows);
    } catch (error) {
      console.warn('[Mock DB] Retornando certificados de prueba en memoria');
      // Asegurarse de retornar datos consolidados en memoria
      const list = mockDb.certificados.map(c => {
        return {
          id: c.id,
          codigo: c.codigo,
          hash: c.hash,
          fecha_emision: c.fecha_emision,
          fecha_vencimiento: c.fecha_vencimiento,
          pdf_path: c.pdf_path,
          alumno_nombre: c.alumno_nombre || 'Alumno',
          alumno_dni: c.alumno_dni || '00000000',
          alumno_email: c.alumno_email || '',
          curso_nombre: c.curso_nombre || 'Curso'
        };
      }).reverse();
      return res.status(200).json(list);
    }
  },

  create: async (req, res, next) => {
    const { matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_realizacion, vigencia_anos } = req.body;

    try {
      // 1. Validar matrícula y obtener datos del alumno y del curso en MySQL
      const matQuery = `
        SELECT m.id, p.nombres AS alumno_nombres, p.dni AS alumno_dni, p.email AS alumno_email,
               c.nombre AS curso_nombre, c.duracion AS curso_duracion, 
               c.entrenador AS curso_entrenador, c.codigo_curso, c.temario AS curso_temario
        FROM matriculas m
        JOIN participantes p ON m.participante_id = p.id
        JOIN cursos c ON m.curso_id = c.id
        WHERE m.id = ?
      `;
      const [matRows] = await db.query(matQuery, [matricula_id]);
      if (matRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Matrícula no encontrada' });
      }
      
      const matData = matRows[0];

      // Validar si ya existe un certificado emitido para esta matrícula en MySQL
      const [certRows] = await db.query('SELECT id FROM certificados WHERE matricula_id = ?', [matricula_id]);
      if (certRows.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya se ha emitido un certificado para esta matrícula' });
      }

      // 2. Obtener firmas en MySQL
      const [sig1Rows] = await db.query('SELECT * FROM firmas WHERE id = ?', [firma_id_1]);
      if (sig1Rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Firma principal no encontrada' });
      }
      const firma1 = sig1Rows[0];

      let firma2 = null;
      if (firma_id_2) {
        const [sig2Rows] = await db.query('SELECT * FROM firmas WHERE id = ?', [firma_id_2]);
        if (sig2Rows.length > 0) {
          firma2 = sig2Rows[0];
        }
      }

      // 3. Generar Código y Hash únicos
      const codigo = await generarCodigoCertificado();
      const hashInput = `${codigo}-${matData.alumno_dni}-${matricula_id}-${fecha_emision}-${Math.random()}`;
      const hash = generarHash(hashInput);

      // 4. Calcular fecha de vencimiento
      const dateIssued = new Date(fecha_emision);
      let dateExpiry;
      if (vigencia_anos === 0) {
        dateExpiry = new Date('2999-12-31');
      } else {
        dateExpiry = new Date(dateIssued);
        dateExpiry.setFullYear(dateExpiry.getFullYear() + vigencia_anos);
      }

      const formattedIssueDate = dateIssued.toISOString().split('T')[0];
      const formattedExpiryDate = dateExpiry.toISOString().split('T')[0];

      // 5. Configurar la ruta de guardado del PDF
      const cleanCourseFolder = matData.codigo_curso.replace(/[^a-zA-Z0-9-_]/g, '_');
      const pdfFileName = `${matData.alumno_dni}_${codigo}.pdf`;
      const relativePdfPath = `/certificados/${cleanCourseFolder}/${pdfFileName}`;
      
      const absoluteSavePath = path.join(
        __dirname, '..', '..', 'public', 'certificados', cleanCourseFolder, pdfFileName
      );

      // 6. Generar el archivo PDF físico
      const pdfParams = {
        codigo,
        hash,
        alumno_nombres: matData.alumno_nombres,
        alumno_dni: matData.alumno_dni,
        curso_nombre: matData.curso_nombre,
        curso_duracion: matData.curso_duracion,
        curso_temario: matData.curso_temario,
        fecha_realizacion: fecha_realizacion || formattedIssueDate,
        fecha_emision: formattedIssueDate,
        fecha_vencimiento: vigencia_anos === 0 ? null : formattedExpiryDate,
        firma_1: {
          nombre: firma1.nombre,
          cargo: firma1.cargo,
          firma_url: firma1.firma_url,
          cip: firma1.cip
        },
        firma_2: firma2 ? {
          nombre: firma2.nombre,
          cargo: firma2.cargo,
          firma_url: firma2.firma_url,
          cip: firma2.cip
        } : null
      };

      await generarCertificadoPDF(pdfParams, absoluteSavePath);

      // 7. Insertar el registro en la base de datos MySQL
      const insertQuery = `
        INSERT INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [insertResult] = await db.query(insertQuery, [
        codigo,
        hash,
        matricula_id,
        firma_id_1,
        firma_id_2 || null,
        formattedIssueDate,
        formattedExpiryDate,
        relativePdfPath
      ]);

      const [newCertRows] = await db.query('SELECT * FROM certificados WHERE id = ?', [insertResult.insertId]);

      // Sincronizar catálogo estático
      syncIndexStatic();

      // Enviar correo electrónico de forma síncrona para reportar el estado del envío
      let emailMessage = '';
      try {
        const emailResult = await emailService.sendCertificateEmail({
          email: matData.alumno_email,
          alumno_nombre: matData.alumno_nombres,
          curso_nombre: matData.curso_nombre,
          codigo: codigo,
          pdf_path: relativePdfPath
        }, absoluteSavePath);
        
        if (emailResult.success) {
          emailMessage = ' y enviado por correo al participante';
        } else {
          emailMessage = ` (El correo no se envió: ${emailResult.message || 'Sin configurar'})`;
        }
      } catch (err) {
        console.error('[Email Error] Error al enviar correo de certificado:', err);
        emailMessage = ' (Error al enviar el correo)';
      }

      return res.status(201).json({
        success: true,
        message: `Certificado emitido con éxito${emailMessage}`,
        certificado: newCertRows[0]
      });

    } catch (error) {
      console.warn('[Mock DB] Generando certificado y PDF en memoria temporal por fallo de conexión a BD');
      
      // Simular lógica en memoria
      const matricula = mockDb.matriculas.find(m => m.id == matricula_id);
      if (!matricula) {
        return res.status(404).json({ success: false, message: 'Matrícula no encontrada' });
      }

      const alumno = mockDb.participantes.find(p => p.id == matricula.participante_id);
      const curso = mockDb.cursos.find(c => c.id == matricula.curso_id);
      
      if (!alumno || !curso) {
        return res.status(404).json({ success: false, message: 'Alumno o curso no encontrado' });
      }

      // Validar duplicado en memoria
      const certExists = mockDb.certificados.some(c => c.matricula_id == matricula_id);
      if (certExists) {
        return res.status(400).json({ success: false, message: 'Ya se ha emitido un certificado para esta matrícula' });
      }

      const f1 = mockDb.firmas.find(s => s.id == firma_id_1);
      if (!f1) {
        return res.status(404).json({ success: false, message: 'Firma principal no encontrada' });
      }

      const f2 = mockDb.firmas.find(s => s.id == firma_id_2) || null;

      // Calcular correlativo en memoria
      const yearSuffix = String(new Date().getFullYear()).slice(-2);
      const pattern = new RegExp(`^PE-\\d{4}-${yearSuffix}$`);
      const yearCerts = mockDb.certificados
        .filter(c => pattern.test(c.codigo))
        .map(c => parseInt(c.codigo.split('-')[1], 10))
        .sort((a,b) => b-a);
      const nextNum = yearCerts.length > 0 ? yearCerts[0] + 1 : 1;
      const codigo = `PE-${nextNum}-${yearSuffix}`;

      // Hash
      const hash = generarHash(`${codigo}-${alumno.dni}-${matricula_id}-${fecha_emision}-${Math.random()}`);

      // Expiración
      const dateIssued = new Date(fecha_emision);
      let dateExpiry;
      if (vigencia_anos === 0) {
        dateExpiry = new Date('2999-12-31');
      } else {
        dateExpiry = new Date(dateIssued);
        dateExpiry.setFullYear(dateExpiry.getFullYear() + vigencia_anos);
      }

      const formattedIssue = dateIssued.toISOString().split('T')[0];
      const formattedExpiry = dateExpiry.toISOString().split('T')[0];

      // PDF
      const cleanCourseFolder = curso.codigo_curso.replace(/[^a-zA-Z0-9-_]/g, '_');
      const pdfFileName = `${alumno.dni}_${codigo}.pdf`;
      const relativePdfPath = `/certificados/${cleanCourseFolder}/${pdfFileName}`;
      const absoluteSavePath = path.join(__dirname, '..', '..', 'public', 'certificados', cleanCourseFolder, pdfFileName);

      try {
        const pdfParams = {
          codigo,
          hash,
          alumno_nombres: alumno.nombres,
          alumno_dni: alumno.dni,
          curso_nombre: curso.nombre,
          curso_duracion: curso.duracion,
          curso_temario: curso.temario || null,
          fecha_realizacion: fecha_realizacion || formattedIssue,
          fecha_emision: formattedIssue,
          fecha_vencimiento: vigencia_anos === 0 ? null : formattedExpiry,
          firma_1: { nombre: f1.nombre, cargo: f1.cargo, firma_url: f1.firma_url, cip: f1.cip },
          firma_2: f2 ? { nombre: f2.nombre, cargo: f2.cargo, firma_url: f2.firma_url, cip: f2.cip } : null
        };
        await generarCertificadoPDF(pdfParams, absoluteSavePath);
      } catch (pdfErr) {
        console.error('Error generando archivo PDF en modo bypass:', pdfErr);
      }

      // Guardar objeto en memoria
      const mockCert = {
        id: mockDb.certificados.length + 1,
        codigo,
        hash,
        matricula_id,
        firma_id_1,
        firma_id_2,
        fecha_emision: formattedIssue,
        fecha_vencimiento: formattedExpiry,
        pdf_path: relativePdfPath,
        alumno_nombre: alumno.nombres,
        alumno_dni: alumno.dni,
        curso_nombre: curso.nombre,
        curso_duracion: curso.duracion,
        curso_entrenador: curso.entrenador,
        firma_nombre_1: f1.nombre,
        firma_cargo_1: f1.cargo,
        firma_nombre_2: f2 ? f2.nombre : null,
        firma_cargo_2: f2 ? f2.cargo : null,
        created_at: new Date().toISOString()
      };
      mockDb.certificados.push(mockCert);

      // Sincronizar index.json
      syncIndexStatic();

      // Enviar correo electrónico de forma síncrona (Modo Temporal)
      let emailMessage = '';
      try {
        const emailResult = await emailService.sendCertificateEmail({
          email: alumno.email,
          alumno_nombre: alumno.nombres,
          curso_nombre: curso.nombre,
          codigo: codigo,
          pdf_path: relativePdfPath
        }, absoluteSavePath);
        
        if (emailResult.success) {
          emailMessage = ' y enviado por correo';
        } else {
          emailMessage = ` (Correo no enviado: ${emailResult.message || 'Sin configurar'})`;
        }
      } catch (err) {
        console.error('[Email Mock Error] Error al enviar correo de certificado:', err);
        emailMessage = ' (Error al enviar el correo)';
      }

      return res.status(201).json({
        success: true,
        message: `Certificado emitido con éxito${emailMessage} (Modo Temporal)`,
        certificado: mockCert
      });
    }
  },

  bulkGenerate: async (req, res, next) => {
    const { curso_id } = req.body;
    if (!curso_id) {
      return res.status(400).json({ success: false, message: 'curso_id es requerido' });
    }

    try {
      // 1. Find all pending enrollments (no certificate yet) for this curso
      const pendQuery = `
        SELECT m.id AS matricula_id, m.fecha_inicio,
               p.nombres AS alumno_nombres, p.dni AS alumno_dni, p.email AS alumno_email,
               c.nombre AS curso_nombre, c.duracion AS curso_duracion,
               c.entrenador AS curso_entrenador, c.codigo_curso, c.firma_id AS curso_firma_id,
               c.temario AS curso_temario
        FROM matriculas m
        JOIN participantes p ON m.participante_id = p.id
        JOIN cursos c ON m.curso_id = c.id
        LEFT JOIN certificados cert ON cert.matricula_id = m.id
        WHERE m.curso_id = ? AND cert.id IS NULL
      `;
      const [pendRows] = await db.query(pendQuery, [curso_id]);

      if (pendRows.length === 0) {
        return res.status(200).json({ success: true, message: 'No hay alumnos pendientes por certificar', count: 0 });
      }

      // 2. Auto-select firma_1: find Gerente
      const [gerenteRows] = await db.query("SELECT * FROM firmas WHERE cargo LIKE '%Gerente%' LIMIT 1");
      if (gerenteRows.length === 0) {
        return res.status(404).json({ success: false, message: 'No se encontró una firma de Gerente' });
      }
      const firma1 = gerenteRows[0];

      // 3. Get firma_2 from curso
      const [cursoRows] = await db.query('SELECT * FROM cursos WHERE id = ?', [curso_id]);
      if (cursoRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Curso no encontrado' });
      }
      const curso = cursoRows[0];

      let firma2 = null;
      if (curso.firma_id) {
        const [sig2Rows] = await db.query('SELECT * FROM firmas WHERE id = ?', [curso.firma_id]);
        if (sig2Rows.length > 0) {
          firma2 = sig2Rows[0];
        }
      }

      // 4. Generate certificates for each pending enrollment
      const results = [];
      const emailPromises = [];
      for (const row of pendRows) {
        const fecha_emision = new Date().toISOString().split('T')[0];
        const fecha_realizacion = row.fecha_inicio ? new Date(row.fecha_inicio).toISOString().split('T')[0] : fecha_emision;
        const vigencia_anos = 2;

        const codigo = await generarCodigoCertificado();
        const hashInput = `${codigo}-${row.alumno_dni}-${row.matricula_id}-${fecha_emision}-${Math.random()}`;
        const hash = generarHash(hashInput);

        const dateIssued = new Date(fecha_emision);
        const dateExpiry = new Date(dateIssued);
        dateExpiry.setFullYear(dateExpiry.getFullYear() + vigencia_anos);
        const formattedExpiry = dateExpiry.toISOString().split('T')[0];

        const cleanCourseFolder = row.codigo_curso.replace(/[^a-zA-Z0-9-_]/g, '_');
        const pdfFileName = `${row.alumno_dni}_${codigo}.pdf`;
        const relativePdfPath = `/certificados/${cleanCourseFolder}/${pdfFileName}`;
        const absoluteSavePath = path.join(__dirname, '..', '..', 'public', 'certificados', cleanCourseFolder, pdfFileName);

        const pdfParams = {
          codigo,
          hash,
          alumno_nombres: row.alumno_nombres,
          alumno_dni: row.alumno_dni,
          curso_nombre: row.curso_nombre,
          curso_duracion: row.curso_duracion,
          curso_temario: row.curso_temario || null,
          fecha_realizacion,
          fecha_emision,
          fecha_vencimiento: formattedExpiry,
          firma_1: { nombre: firma1.nombre, cargo: firma1.cargo, firma_url: firma1.firma_url, cip: firma1.cip },
          firma_2: firma2 ? { nombre: firma2.nombre, cargo: firma2.cargo, firma_url: firma2.firma_url, cip: firma2.cip } : null
        };

        await generarCertificadoPDF(pdfParams, absoluteSavePath);

        const [insertResult] = await db.query(
          `INSERT INTO certificados (codigo, hash, matricula_id, firma_id_1, firma_id_2, fecha_emision, fecha_vencimiento, pdf_path)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [codigo, hash, row.matricula_id, firma1.id, firma2 ? firma2.id : null, fecha_emision, formattedExpiry, relativePdfPath]
        );

        results.push({ matricula_id: row.matricula_id, certificado_id: insertResult.insertId, codigo });

        // Guardamos la promesa del correo para esperarla al final
        emailPromises.push(
          emailService.sendCertificateEmail({
            email: row.alumno_email,
            alumno_nombre: row.alumno_nombres,
            curso_nombre: row.curso_nombre,
            codigo: codigo,
            pdf_path: relativePdfPath
          }, absoluteSavePath).then(res => ({ success: res.success }))
        );
      }

      // Esperar a que se completen todos los envíos
      const emailStatuses = await Promise.all(emailPromises);
      const sentCount = emailStatuses.filter(s => s.success).length;

      syncIndexStatic();

      return res.status(201).json({
        success: true,
        message: `${results.length} certificado(s) generado(s) con éxito e intentado enviar por correo. Se enviaron ${sentCount} con éxito.`,
        count: results.length,
        certificados: results
      });

    } catch (error) {
      console.warn('[Mock DB] Generación masiva en memoria temporal');

      const pendMatriculas = mockDb.matriculas.filter(m => m.curso_id == curso_id);
      let pendientes = [];
      for (const m of pendMatriculas) {
        const exists = mockDb.certificados.some(c => c.matricula_id == m.id);
        if (!exists) pendientes.push(m);
      }

      if (pendientes.length === 0) {
        return res.status(200).json({ success: true, message: 'No hay alumnos pendientes por certificar', count: 0 });
      }

      const gerente = mockDb.firmas.find(f => f.cargo && f.cargo.toLowerCase().includes('gerente'));
      if (!gerente) {
        return res.status(404).json({ success: false, message: 'No se encontró una firma de Gerente' });
      }

      const curso = mockDb.cursos.find(c => c.id == curso_id);
      if (!curso) {
        return res.status(404).json({ success: false, message: 'Curso no encontrado' });
      }

      const f2 = curso.firma_id ? mockDb.firmas.find(f => f.id == curso.firma_id) : null;

      const results = [];
      const emailPromises = [];
      for (const mat of pendientes) {
        const alumno = mockDb.participantes.find(p => p.id == mat.participante_id);
        if (!alumno) continue;

        const fecha_emision = new Date().toISOString().split('T')[0];
        const fecha_realizacion = mat.fecha_inicio ? new Date(mat.fecha_inicio).toISOString().split('T')[0] : fecha_emision;
        const vigencia_anos = 2;

        const yearSuffix = String(new Date().getFullYear()).slice(-2);
        const pattern = new RegExp(`^PE-\\d{4}-${yearSuffix}$`);
        const yearCerts = mockDb.certificados
          .filter(c => pattern.test(c.codigo))
          .map(c => parseInt(c.codigo.split('-')[1], 10))
          .sort((a,b) => b-a);
        const nextNum = yearCerts.length > 0 ? yearCerts[0] + 1 : 1;
        const codigo = `PE-${nextNum}-${yearSuffix}`;

        const hash = generarHash(`${codigo}-${alumno.dni}-${mat.id}-${fecha_emision}-${Math.random()}`);

        const dateIssued = new Date(fecha_emision);
        const dateExpiry = new Date(dateIssued);
        dateExpiry.setFullYear(dateExpiry.getFullYear() + vigencia_anos);
        const formattedExpiry = dateExpiry.toISOString().split('T')[0];

        const cleanCourseFolder = curso.codigo_curso.replace(/[^a-zA-Z0-9-_]/g, '_');
        const pdfFileName = `${alumno.dni}_${codigo}.pdf`;
        const relativePdfPath = `/certificados/${cleanCourseFolder}/${pdfFileName}`;
        const absoluteSavePath = path.join(__dirname, '..', '..', 'public', 'certificados', cleanCourseFolder, pdfFileName);

        const pdfParams = {
          codigo, hash,
          alumno_nombres: alumno.nombres,
          alumno_dni: alumno.dni,
          curso_nombre: curso.nombre,
          curso_duracion: curso.duracion,
          curso_temario: curso.temario || null,
          fecha_realizacion, fecha_emision,
          fecha_vencimiento: formattedExpiry,
          firma_1: { nombre: gerente.nombre, cargo: gerente.cargo, firma_url: gerente.firma_url, cip: gerente.cip },
          firma_2: f2 ? { nombre: f2.nombre, cargo: f2.cargo, firma_url: f2.firma_url, cip: f2.cip } : null
        };

        try {
          await generarCertificadoPDF(pdfParams, absoluteSavePath);
        } catch (pdfErr) {
          console.error('Error generando PDF en bulk:', pdfErr);
        }

        const mockCert = {
          id: mockDb.certificados.length + 1,
          codigo, hash,
          matricula_id: mat.id,
          firma_id_1: gerente.id,
          firma_id_2: f2 ? f2.id : null,
          fecha_emision, fecha_vencimiento: formattedExpiry,
          pdf_path: relativePdfPath,
          alumno_nombre: alumno.nombres,
          alumno_dni: alumno.dni,
          curso_nombre: curso.nombre,
          curso_duracion: curso.duracion,
          curso_entrenador: curso.entrenador,
          firma_nombre_1: gerente.nombre,
          firma_cargo_1: gerente.cargo,
          firma_nombre_2: f2 ? f2.nombre : null,
          firma_cargo_2: f2 ? f2.cargo : null,
          created_at: new Date().toISOString()
        };
        mockDb.certificados.push(mockCert);

        results.push({ matricula_id: mat.id, certificado_id: mockCert.id, codigo });

        // Guardamos la promesa del correo para esperarla al final
        emailPromises.push(
          emailService.sendCertificateEmail({
            email: alumno.email,
            alumno_nombre: alumno.nombres,
            curso_nombre: curso.nombre,
            codigo: codigo,
            pdf_path: relativePdfPath
          }, absoluteSavePath).then(res => ({ success: res.success }))
        );
      }

      // Esperar a que se completen todos los envíos
      const emailStatuses = await Promise.all(emailPromises);
      const sentCount = emailStatuses.filter(s => s.success).length;

      syncIndexStatic();

      return res.status(201).json({
        success: true,
        message: `${results.length} certificado(s) generado(s) con éxito (Modo Temporal). Se enviaron ${sentCount} correos con éxito.`,
        count: results.length,
        certificados: results
      });
    }
  },

  send: async (req, res, next) => {
    const { id } = req.params;

    try {
      const query = `
        SELECT cert.codigo, cert.pdf_path,
               p.nombres AS alumno_nombre, p.dni AS alumno_dni, p.email AS alumno_email,
               c.nombre AS curso_nombre
        FROM certificados cert
        JOIN matriculas m ON cert.matricula_id = m.id
        JOIN participantes p ON m.participante_id = p.id
        JOIN cursos c ON m.curso_id = c.id
        WHERE cert.id = ?
      `;
      const [rows] = await db.query(query, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Certificado no encontrado' });
      }

      const cert = rows[0];
      if (!cert.alumno_email) {
        return res.status(400).json({ success: false, message: 'El participante no tiene correo registrado' });
      }

      if (!cert.pdf_path) {
        return res.status(400).json({ success: false, message: 'El certificado no tiene archivo PDF asociado' });
      }

      const absolutePdfPath = path.join(__dirname, '..', '..', 'public', cert.pdf_path);
      if (!fs.existsSync(absolutePdfPath)) {
        return res.status(404).json({ success: false, message: 'El archivo PDF no se encuentra en el servidor' });
      }

      const emailResult = await emailService.sendCertificateEmail({
        email: cert.alumno_email,
        alumno_nombre: cert.alumno_nombre,
        curso_nombre: cert.curso_nombre,
        codigo: cert.codigo,
        pdf_path: cert.pdf_path
      }, absolutePdfPath);

      if (emailResult.success) {
        return res.status(200).json({ success: true, message: `Certificado enviado a ${cert.alumno_email}` });
      } else {
        return res.status(500).json({ success: false, message: emailResult.message || 'Error al enviar el correo' });
      }
    } catch (error) {
      console.error('[Send Certificate] Error:', error);
      next(error);
    }
  },

  delete: async (req, res, next) => {
    const { id } = req.params;

    try {
      const [certRows] = await db.query('SELECT pdf_path FROM certificados WHERE id = ?', [id]);
      if (certRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Certificado no encontrado' });
      }

      const pdfPath = certRows[0].pdf_path;
      await db.query('DELETE FROM certificados WHERE id = ?', [id]);

      if (pdfPath) {
        const absolutePdfPath = path.join(__dirname, '..', '..', 'public', pdfPath);
        if (fs.existsSync(absolutePdfPath)) {
          fs.unlinkSync(absolutePdfPath);
        }
      }

      syncIndexStatic();
      return res.status(200).json({ success: true, message: 'Certificado revocado y eliminado con éxito.' });
    } catch (error) {
      console.warn('[Mock DB] Eliminando certificado de la memoria temporal');
      const index = mockDb.certificados.findIndex(c => c.id == id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Certificado no encontrado' });
      }

      const pdfPath = mockDb.certificados[index].pdf_path;
      mockDb.certificados.splice(index, 1);

      if (pdfPath) {
        const absolutePdfPath = path.join(__dirname, '..', '..', 'public', pdfPath);
        if (fs.existsSync(absolutePdfPath)) {
          fs.unlinkSync(absolutePdfPath);
        }
      }

      syncIndexStatic();
      return res.status(200).json({ success: true, message: 'Certificado revocado y eliminado con éxito (Modo Temporal).' });
    }
  }
};
