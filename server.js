// Archivo: server.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const apiRouter = require('./src/routes');
const errorMiddleware = require('./src/middlewares/error.middleware');

const app = express();
const port = process.env.PORT || 3000;

// Configurar Helmet con flexibilidades para CSP de recursos externos (Fonts, FontAwesome)
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rutas de páginas (sin extensión .html) — van ANTES que static para tener prioridad
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/certificados', (req, res) => res.sendFile(path.join(__dirname, 'public', 'certificados.html')));
app.get('/verificar', (req, res) => res.sendFile(path.join(__dirname, 'public', 'verificar.html')));
app.get('/admin/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'dashboard.html')));

app.get('/student/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'student', 'dashboard.html')));

// Enrutar recursos estáticos (assets, img, y compatibilidad con URLs .html antiguas)
app.use(express.static('public'));
app.use('/admin', express.static('admin'));
app.use('/student', express.static('student'));
app.use('/assets', express.static('assets'));
app.use('/components', express.static('components'));

// Rutas de la API
app.use('/api', apiRouter);

// Endpoint de verificación de salud
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'teamhsec' });
});

// Manejo global de errores (Debe ser el último middleware)
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
