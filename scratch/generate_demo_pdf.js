const path = require('path');
const { generarCertificadoPDF } = require('../src/services/pdf.service');

const pdfParams = {
  codigo: 'PE-986-26',
  hash: '98626f8d22f183955db37996c568fead6a5f78db',
  alumno_nombres: 'JAVIER BALDEÓN LUIS JHONATAN',
  alumno_dni: '99999999',
  curso_nombre: 'ELEVACIÓN / IZAJE DE CARGA',
  curso_duracion: '2 horas',
  fecha_emision: '2026-05-21',
  fecha_realizacion: '2026-05-19',
  fecha_vencimiento: '2027-05-21',
  firma_1: {
    nombre: 'Ing. Angel G. Baldeon Icochea',
    cargo: 'Gerente de Operaciones',
    cip: '86277',
    firma_url: '/assets/img/firmas/firma_gerente.png'
  },
  firma_2: {
    nombre: 'Ing. Gregorio A. Escajadillo Sarmiento',
    cargo: 'Entrenador',
    cip: '050142',
    firma_url: '/assets/img/firmas/firma_gregorio.png'
  }
};

const absoluteSavePath = path.join(
  'c:', 'Users', 'USER', 'Downloads', 'OFIMATICA', 'sistema_certificados', 'public', 'certificados', 'elevacion-izaje', '99999999_PE-986-26.pdf'
);

generarCertificadoPDF(pdfParams, absoluteSavePath)
  .then(() => {
    console.log('PDF de demostración generado con éxito en:', absoluteSavePath);
  })
  .catch((err) => {
    console.error('Error generando PDF de demostración:', err);
  });

