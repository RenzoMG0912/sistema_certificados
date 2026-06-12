// Archivo: src/routes/verificar.routes.js
const router = require('express').Router();
const verificarController = require('../controllers/verificar.controller');
const { verificarLimiter } = require('../middlewares/rateLimit.middleware');

// Validar por código + DNI de alumno (Búsqueda manual)
router.post('/', verificarLimiter, verificarController.verificarManual);

// Validar por hash SHA-256 (Escaneo de código QR)
router.get('/:hash', verificarLimiter, verificarController.verificarPorHash);

module.exports = router;
