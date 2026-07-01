// Archivo: src/services/email.service.js
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

/**
 * Crea el transporter de Nodemailer usando las variables de entorno.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Puerto 465 = SSL directo (secure:true), Puerto 587 = STARTTLS (secure:false)
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !user || !pass) {
    console.warn('[SMTP Service] ⚠️ Credenciales SMTP no configuradas.');
    console.warn(`[SMTP Service] SMTP_HOST=${host || 'FALTA'}, SMTP_USER=${user || 'FALTA'}, SMTP_PASS=${pass ? 'OK' : 'FALTA'}`);
    return null;
  }

  console.log(`[SMTP Service] Configurando transporter → ${host}:${port} | secure=${secure} | user=${user}`);

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
      // Necesario para Gmail con STARTTLS
      ciphers: 'SSLv3'
    },
    // Timeouts para no quedar colgado si el servidor no responde
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000
  });
}

/**
 * Genera la plantilla de correo HTML premium para el certificado.
 */
function getHTMLTemplate(studentName, courseName, certCode, downloadUrl) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tu Certificado Digital de TEAM HSEC</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #334155;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          width: 100%;
          table-layout: fixed;
          background-color: #f8fafc;
          padding: 40px 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }
        .header {
          background-color: #1e293b;
          background-image: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          padding: 35px 20px;
          text-align: center;
          border-bottom: 4px solid #dc2626;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .header p {
          color: #94a3b8;
          margin: 5px 0 0 0;
          font-size: 14px;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin-top: 0;
          margin-bottom: 15px;
        }
        .intro-text {
          font-size: 16px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 25px;
        }
        .details-box {
          background-color: #f1f5f9;
          border-left: 4px solid #dc2626;
          padding: 20px;
          border-radius: 0 8px 8px 0;
          margin-bottom: 30px;
        }
        .details-row {
          margin-bottom: 10px;
          font-size: 15px;
        }
        .details-row:last-child {
          margin-bottom: 0;
        }
        .details-label {
          font-weight: 600;
          color: #1e293b;
          display: inline-block;
          width: 140px;
        }
        .details-value {
          color: #475569;
        }
        .btn-container {
          text-align: center;
          margin: 35px 0 10px 0;
        }
        .btn {
          background-color: #dc2626;
          color: #ffffff !important;
          text-decoration: none;
          padding: 14px 30px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          display: inline-block;
          transition: background-color 0.2s ease;
          box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);
        }
        .btn:hover {
          background-color: #b91c1c;
        }
        .footer {
          background-color: #f8fafc;
          padding: 25px 20px;
          text-align: center;
          font-size: 13px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        .footer p {
          margin: 5px 0;
        }
        .footer a {
          color: #dc2626;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>TEAM HSEC</h1>
            <p>Líderes en Capacitación y Entrenamiento de Alto Impacto</p>
          </div>
          <div class="content">
            <h2 class="greeting">¡Hola, ${studentName}!</h2>
            <p class="intro-text">
              Nos complace saludarte y felicitarte por haber culminado con éxito tu proceso de capacitación. Adjunto a este correo encontrarás tu <strong>Certificado Oficial en formato PDF</strong>.
            </p>
            
            <div class="details-box">
              <div class="details-row">
                <span class="details-label">Curso:</span>
                <span class="details-value">${courseName}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Código Oficial:</span>
                <span class="details-value"><strong>${certCode}</strong></span>
              </div>
              <div class="details-row">
                <span class="details-label">Estado:</span>
                <span class="details-value" style="color: #16a34a; font-weight: 600;">Emitido y Registrado</span>
              </div>
            </div>

            <p class="intro-text" style="font-size: 15px;">
              Este certificado cuenta con un código único correlativo y un código QR para su inmediata verificación por parte de empleadores o auditores a través de nuestro portal oficial de verificación.
            </p>
            
            ${downloadUrl ? `
            <div class="btn-container">
              <a href="${downloadUrl}" target="_blank" class="btn">Descargar desde el Portal</a>
            </div>
            ` : ''}
          </div>
          <div class="footer">
            <p><strong>TEAM HSEC S.A.C.</strong></p>
            <p>Este correo electrónico fue generado de forma automática por nuestro sistema de emisión.</p>
            <p>¿Tienes alguna consulta? Contáctanos a <a href="mailto:soporte@teamhsec.com">soporte@teamhsec.com</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Envía el certificado al correo electrónico del participante.
 * 
 * @param {Object} data Datos necesarios para construir el correo
 * @param {string} data.email Correo electrónico del alumno
 * @param {string} data.alumno_nombre Nombre completo del alumno
 * @param {string} data.curso_nombre Nombre del curso
 * @param {string} data.codigo Código correlativo del certificado
 * @param {string} [data.pdf_path] Ruta relativa del PDF para generar link de descarga alternativo
 * @param {string} absolutePdfPath Ruta absoluta en disco del PDF para adjuntar
 */
async function sendCertificateEmail(data, absolutePdfPath) {
  const { email, alumno_nombre, curso_nombre, codigo, pdf_path } = data;

  if (!email) {
    console.warn(`[SMTP Service] No se envió correo para el alumno '${alumno_nombre}' porque no tiene email registrado.`);
    return { success: false, message: 'El participante no tiene email registrado' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[SMTP Service] El servicio no está configurado. Omitiendo envío de correo.');
    return { success: false, message: 'SMTP no configurado en el servidor' };
  }

  try {
    // Validar existencia del archivo PDF
    if (!fs.existsSync(absolutePdfPath)) {
      throw new Error(`El archivo PDF no existe en la ruta especificada: ${absolutePdfPath}`);
    }

    const fromName = process.env.SMTP_FROM_NAME || 'TEAM HSEC';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const downloadUrl = pdf_path ? `${baseUrl}${pdf_path}` : '';
    const cleanPdfName = `Certificado_${codigo.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email.trim(),
      subject: `🎓 Tu Certificado Digital del curso: ${curso_nombre}`,
      html: getHTMLTemplate(alumno_nombre, curso_nombre, codigo, downloadUrl),
      attachments: [
        {
          filename: cleanPdfName,
          path: absolutePdfPath,
          contentType: 'application/pdf'
        }
      ]
    };

    console.log(`[SMTP Service] Enviando correo de certificado ${codigo} a ${email.trim()}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP Service] Correo enviado correctamente: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[SMTP Service] ❌ Error al enviar correo a ${email}:`);
    console.error(`  → Código de error: ${error.code || 'N/A'}`);
    console.error(`  → Mensaje: ${error.message}`);
    console.error(`  → Respuesta SMTP: ${error.response || 'N/A'}`);
    console.error(`  → Command: ${error.command || 'N/A'}`);
    return { success: false, error: error.message, code: error.code };
  }
}

module.exports = {
  sendCertificateEmail
};
