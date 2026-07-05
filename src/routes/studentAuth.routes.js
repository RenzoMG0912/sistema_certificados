// Archivo: src/routes/studentAuth.routes.js
const router = require('express').Router();
const studentAuthController = require('../controllers/studentAuth.controller');
const { loginLimiter } = require('../middlewares/rateLimit.middleware');

// Iniciar sesión estudiantil
router.post('/login', loginLimiter, studentAuthController.login);

module.exports = router;
