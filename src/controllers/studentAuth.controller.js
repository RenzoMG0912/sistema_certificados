// Archivo: src/controllers/studentAuth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const mockDb = require('../config/mockDb');

const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const TOKEN_ISSUER = process.env.JWT_ISSUER || 'teamhsec';
const STUDENT_AUDIENCE = 'teamhsec-student';

function getJwtSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    return null;
  }
  return process.env.JWT_SECRET;
}

module.exports = {
  login: async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Debe ingresar correo electronico y contrasena (DNI).'
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
      const query = 'SELECT id, nombres, dni, email, password FROM participantes WHERE email = ? LIMIT 1';
      const [rows] = await db.query(query, [email]);

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'El correo electronico o la contrasena son incorrectos.'
        });
      }

      const estudiante = rows[0];

      if (!estudiante.password) {
        return res.status(401).json({
          success: false,
          message: 'Su cuenta no tiene una contrasena configurada. Contacte al administrador.'
        });
      }

      const validPassword = await bcrypt.compare(password, estudiante.password);

      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: 'El correo electronico o la contrasena son incorrectos.'
        });
      }

      const payload = {
        id: estudiante.id,
        nombres: estudiante.nombres,
        email: estudiante.email,
        dni: estudiante.dni
      };

      const token = jwt.sign(payload, jwtSecret, {
        expiresIn: TOKEN_EXPIRES_IN,
        issuer: TOKEN_ISSUER,
        audience: STUDENT_AUDIENCE
      });

      return res.status(200).json({
        success: true,
        message: 'Acceso autorizado',
        token,
        estudiante: payload
      });
    } catch (error) {
      console.error('Error durante el inicio de sesion estudiantil:', error.message);

      // Fallback a mockDb
      const estudiante = mockDb.participantes.find(p => p.email === email);
      if (!estudiante) {
        return res.status(401).json({
          success: false,
          message: 'El correo electronico o la contrasena son incorrectos.'
        });
      }

      // En modo mock, validar que el password coincida con el DNI
      if (password !== estudiante.dni) {
        return res.status(401).json({
          success: false,
          message: 'El correo electronico o la contrasena son incorrectos.'
        });
      }

      const payload = {
        id: estudiante.id,
        nombres: estudiante.nombres,
        email: estudiante.email,
        dni: estudiante.dni
      };

      const token = jwt.sign(payload, jwtSecret, {
        expiresIn: TOKEN_EXPIRES_IN,
        issuer: TOKEN_ISSUER,
        audience: STUDENT_AUDIENCE
      });

      return res.status(200).json({
        success: true,
        message: 'Acceso autorizado (Modo Temporal)',
        token,
        estudiante: payload
      });
    }
  }
};
