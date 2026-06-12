// Archivo: src/routes/auth.routes.js
const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { loginLimiter } = require('../middlewares/rateLimit.middleware');

// Iniciar sesión
router.post('/login', loginLimiter, authController.login);

module.exports = router;
