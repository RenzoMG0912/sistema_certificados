// Archivo: src/routes/unifiedAuth.routes.js
const router = require('express').Router();
const unifiedAuthController = require('../controllers/unifiedAuth.controller');
const { loginLimiter } = require('../middlewares/rateLimit.middleware');

// Login unificado (admin + estudiante)
router.post('/login', loginLimiter, unifiedAuthController.login);

module.exports = router;
