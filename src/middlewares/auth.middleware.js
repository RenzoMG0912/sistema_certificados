// Archivo: src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

const TOKEN_ISSUER = process.env.JWT_ISSUER || 'teamhsec';
const TOKEN_AUDIENCE = process.env.JWT_AUDIENCE || 'teamhsec-admin';

function getJwtSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    return null;
  }

  return process.env.JWT_SECRET;
}

/**
 * Middleware para validar el token JWT y proteger rutas privadas
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. No se proporciono un token de seguridad.'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. El formato del token es invalido.'
    });
  }

  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    return res.status(500).json({
      success: false,
      message: 'La autenticacion no esta configurada correctamente.'
    });
  }

  try {
    const decoded = jwt.verify(parts[1], jwtSecret, {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE
    });
    req.usuario = decoded;
    next();
  } catch (error) {
    console.error('Error al verificar JWT:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Token invalido o expirado. Por favor, inicie sesion nuevamente.'
    });
  }
};
