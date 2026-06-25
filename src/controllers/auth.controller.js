// Archivo: src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const TOKEN_ISSUER = process.env.JWT_ISSUER || 'teamhsec';
const TOKEN_AUDIENCE = process.env.JWT_AUDIENCE || 'teamhsec-admin';

function getJwtSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    return null;
  }

  return process.env.JWT_SECRET;
}

function buildUserPayload(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol
  };
}

module.exports = {
  login: async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Debe ingresar correo electronico y contrasena.'
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
      const query = 'SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ? LIMIT 1';
      const [rows] = await db.query(query, [email]);

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'El correo electronico o la contrasena son incorrectos.'
        });
      }

      const usuario = rows[0];
      const validPassword = await bcrypt.compare(password, usuario.password);

      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: 'El correo electronico o la contrasena son incorrectos.'
        });
      }

      const payload = buildUserPayload(usuario);
      const token = jwt.sign(payload, jwtSecret, {
        expiresIn: TOKEN_EXPIRES_IN,
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE
      });

      return res.status(200).json({
        success: true,
        message: 'Acceso autorizado',
        token,
        usuario: payload
      });
    } catch (error) {
      console.error('Error durante el inicio de sesion:', error.message);
      return res.status(500).json({
        success: false,
        message: 'No se pudo iniciar sesion en este momento.'
      });
    }
  }
};
