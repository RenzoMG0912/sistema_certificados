// Archivo: src/middlewares/validate.middleware.js
const { validationResult } = require('express-validator');

/**
 * Middleware para procesar y responder con errores de validación de express-validator
 */
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de solicitud inválidos',
      errors: errors.array().map(err => ({
        campo: err.path || err.param,
        mensaje: err.msg
      }))
    });
  }
  next();
};
