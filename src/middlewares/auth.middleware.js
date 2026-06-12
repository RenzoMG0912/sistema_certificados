// Archivo: src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware para validar el token JWT y proteger rutas privadas
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. No se proporcionó un token de seguridad.'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. El formato del token es inválido (debe ser Bearer).'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Guardar datos decodificados en el objeto de request
    next();
  } catch (error) {
    console.error('Error al verificar JWT:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Token inválido o expirado. Por favor, inicie sesión nuevamente.'
    });
  }
};
