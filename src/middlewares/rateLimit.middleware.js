// Archivo: src/middlewares/rateLimit.middleware.js
const rateLimit = require('express-rate-limit');

/**
 * Limitador de tasa para endpoints públicos de verificación (anti-spam)
 * Permite un máximo de 30 consultas cada 10 minutos por IP.
 */
const verificarLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 30, // límite de 30 peticiones por ventana de tiempo
  message: {
    success: false,
    message: 'Demasiadas solicitudes de verificación desde esta IP. Por favor, intente nuevamente en 10 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Limitador general para el inicio de sesión
 * Permite un máximo de 10 intentos cada 5 minutos por IP.
 */
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // límite de 10 peticiones
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en 5 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  verificarLimiter,
  loginLimiter
};
