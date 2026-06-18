const path = require('path');
const { generarCertificadoPDF } = require('../src/services/pdf.service');

const pdfParams = {
  codigo: 'PE-0001-26',
  hash: 'demo_hash_value_1234567890',
  alumno_nombres: 'Usuario Demo',
  alumno_dni: '00000000',
  curso_nombre: 'Respuesta a emergencias',
  curso_duracion: '2 horas',
  fecha_emision: new Date().toISOString().split('T')[0],
  fecha_vencimiento: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
  firma_1: {
    nombre: 'Ing. Gregorio A. Escajadillo Sarmiento',
    cargo: 'Instructor HSEC',
    firma_url: '/assets/img/firmas/firma_gregorio.png'
  },
  firma_2: {
    nombre: 'Representante Legal',
    cargo: 'Gerente General',
    firma_url: '/assets/img/firmas/firma_gerente.png'
  }
};

const absoluteSavePath = path.join(
  'c:', 'Users', 'USER', 'Downloads', 'OFIMATICA', 'sistema_certificados', 'public', 'certificados', 'respuesta-emergencias', '00000000_PE-0001-26.pdf'
);

generarCertificadoPDF(pdfParams, absoluteSavePath)
  .then(() => {
    console.log('PDF de demostración generado con éxito en:', absoluteSavePath);
  })
  .catch((err) => {
    console.error('Error generando PDF de demostración:', err);
  });
