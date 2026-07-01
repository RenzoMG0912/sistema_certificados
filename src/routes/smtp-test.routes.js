// Archivo: src/routes/smtp-test.routes.js
// RUTA DE DIAGNÓSTICO SMTP — Solo para admin autenticado
const router = require('express').Router();
const nodemailer = require('nodemailer');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

// GET /api/smtp-test/status → Verifica la configuración SMTP
router.get('/status', async (req, res) => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '465');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const baseUrl = process.env.BASE_URL;

  const config = {
    SMTP_HOST: host || '⚠️ NO CONFIGURADO',
    SMTP_PORT: port,
    SMTP_USER: user || '⚠️ NO CONFIGURADO',
    SMTP_PASS: pass ? `✅ Configurado (${pass.length} caracteres)` : '⚠️ NO CONFIGURADO',
    SMTP_SECURE: secure,
    BASE_URL: baseUrl || '⚠️ NO CONFIGURADO',
    NODE_ENV: process.env.NODE_ENV || 'development'
  };

  if (!host || !user || !pass) {
    return res.json({
      success: false,
      status: 'ERROR_CONFIGURACION',
      message: 'Faltan variables de entorno SMTP en el servidor',
      config
    });
  }

  // Intentar verificar la conexión SMTP
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  });

  try {
    await transporter.verify();
    return res.json({
      success: true,
      status: 'CONEXION_OK',
      message: '✅ Conexión SMTP verificada correctamente. El servidor acepta conexiones.',
      config
    });
  } catch (error) {
    return res.json({
      success: false,
      status: 'ERROR_CONEXION',
      message: `❌ Fallo al conectar al servidor SMTP: ${error.message}`,
      error: {
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
        address: error.address,
        port: error.port,
        message: error.message
      },
      config
    });
  }
});

// POST /api/smtp-test/send → Envía un correo de prueba
router.post('/send', async (req, res) => {
  const { to } = req.body;
  if (!to) {
    return res.status(400).json({ success: false, message: 'Proporciona un email destino en el campo "to"' });
  }

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '465');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const fromName = process.env.SMTP_FROM_NAME || 'TEAM HSEC';
  const fromEmail = process.env.SMTP_FROM_EMAIL || user;

  if (!host || !user || !pass) {
    return res.json({
      success: false,
      message: 'SMTP no configurado en el servidor. Revisa las variables de entorno.'
    });
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000
  });

  try {
    // Paso 1: verificar conexión
    await transporter.verify();

    // Paso 2: enviar correo de prueba
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: to.trim(),
      subject: `[PRUEBA SMTP] TEAM HSEC - ${new Date().toLocaleString('es-PE')}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:24px;background:#f8fafc;border-radius:8px;">
          <h2 style="color:#1e293b;">✅ Prueba de correo SMTP - TEAM HSEC</h2>
          <p>Este correo fue enviado desde el sistema de certificados para verificar la configuración SMTP.</p>
          <hr style="border-color:#e2e8f0;">
          <p><strong>Servidor SMTP:</strong> ${host}:${port}</p>
          <p><strong>Usuario:</strong> ${user}</p>
          <p><strong>Seguro (SSL):</strong> ${secure ? 'Sí' : 'No'}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr style="border-color:#e2e8f0;">
          <p style="color:#64748b;font-size:13px;">Si recibes este correo, la configuración SMTP está funcionando correctamente.</p>
        </div>
      `
    });

    return res.json({
      success: true,
      message: `✅ Correo de prueba enviado a ${to}`,
      messageId: info.messageId,
      response: info.response,
      envelope: info.envelope
    });

  } catch (error) {
    return res.json({
      success: false,
      message: `❌ Error al enviar correo de prueba: ${error.message}`,
      error: {
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
        address: error.address,
        port: error.port,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join('\n')
      }
    });
  }
});

module.exports = router;
