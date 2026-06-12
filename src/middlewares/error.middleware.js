// Archivo: src/middlewares/error.middleware.js

/**
 * Middleware de manejo global de errores para las rutas express
 */
module.exports = (err, req, res, next) => {
  console.error('Error no controlado en la API:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Ocurrió un error interno en el servidor.';
  
  res.status(status).json({
    success: false,
    message
  });
};
