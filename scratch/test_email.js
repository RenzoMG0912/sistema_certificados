// Archivo: scratch/test_email.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const path = require('path');
const fs = require('fs');
const emailService = require('../src/services/email.service');

async function testEmail() {
  console.log('--- Iniciando prueba de envío de correo ---');
  console.log('Variables configuradas:');
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`SMTP_FROM_NAME: ${process.env.SMTP_FROM_NAME}`);
  console.log(`SMTP_FROM_EMAIL: ${process.env.SMTP_FROM_EMAIL}`);
  console.log(`BASE_URL: ${process.env.BASE_URL}`);

  // Crear un archivo PDF temporal de prueba si no existe
  const dummyPdfPath = path.join(__dirname, 'dummy_test.pdf');
  fs.writeFileSync(dummyPdfPath, 'Dummy PDF content for testing');
  console.log(`Creado archivo temporal en: ${dummyPdfPath}`);

  // IMPORTANTE: Cambia este correo por uno real para tus pruebas locales
  const testRecipient = process.env.SMTP_USER || 'test@localhost.com';

  const mockData = {
    email: testRecipient,
    alumno_nombre: 'Participante de Pruebas HSEC',
    curso_nombre: 'Curso de Prueba Segura en Alturas',
    codigo: 'PE-9999-26',
    pdf_path: '/certificados/test/dummy_test.pdf'
  };

  console.log(`Enviando a: ${testRecipient}`);

  try {
    const result = await emailService.sendCertificateEmail(mockData, dummyPdfPath);
    console.log('Resultado del envío:', result);
  } catch (error) {
    console.error('Error durante la ejecución del test:', error);
  } finally {
    // Limpiar el archivo temporal
    if (fs.existsSync(dummyPdfPath)) {
      fs.unlinkSync(dummyPdfPath);
      console.log('Archivo temporal eliminado.');
    }
  }
}

testEmail();
