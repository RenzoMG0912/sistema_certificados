// Archivo: src/controllers/unifiedAuth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const mockDb = require('../config/mockDb');

const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const TOKEN_ISSUER = process.env.JWT_ISSUER || 'teamhsec';
const ADMIN_AUDIENCE = 'teamhsec-admin';
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
      // 1) Buscar primero en tabla usuarios (admin)
      const adminQuery = 'SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ? LIMIT 1';
      const [adminRows] = await db.query(adminQuery, [email]);

      if (adminRows.length > 0) {
        const usuario = adminRows[0];
        const validPassword = await bcrypt.compare(password, usuario.password);

        if (validPassword) {
          const payload = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
          };

          const token = jwt.sign(payload, jwtSecret, {
            expiresIn: TOKEN_EXPIRES_IN,
            issuer: TOKEN_ISSUER,
            audience: ADMIN_AUDIENCE
          });

          return res.status(200).json({
            success: true,
            message: 'Acceso autorizado',
            token,
            rol: 'admin',
            usuario: payload
          });
        }
      }

      // 2) Si no es admin, buscar en tabla participantes (estudiante)
      const studentQuery = 'SELECT id, nombres, dni, email, password FROM participantes WHERE email = ? LIMIT 1';
      const [studentRows] = await db.query(studentQuery, [email]);

      if (studentRows.length > 0) {
        const estudiante = studentRows[0];

        if (!estudiante.password) {
          return res.status(401).json({
            success: false,
            message: 'Su cuenta no tiene una contrasena configurada. Contacte al administrador.'
          });
        }

        const validPassword = await bcrypt.compare(password, estudiante.password);

        if (validPassword) {
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
            rol: 'estudiante',
            estudiante: payload
          });
        }
      }

      // 3) Ninguna credencial coincide
      return res.status(401).json({
        success: false,
        message: 'El correo electronico o la contrasena son incorrectos.'
      });

    } catch (error) {
      console.error('Error durante el inicio de sesion unificado:', error.message);

      // Fallback a mockDb si MySQL no esta disponible
      // Buscar admin en mock
      const mockAdmin = mockDb.usuarios
        ? mockDb.usuarios.find(u => u.email === email)
        : null;

      if (mockAdmin) {
        if (password === mockAdmin.password || await bcrypt.compare(password, mockAdmin.password)) {
          const payload = {
            id: mockAdmin.id,
            nombre: mockAdmin.nombre,
            email: mockAdmin.email,
            rol: mockAdmin.rol
          };

          const token = jwt.sign(payload, jwtSecret, {
            expiresIn: TOKEN_EXPIRES_IN,
            issuer: TOKEN_ISSUER,
            audience: ADMIN_AUDIENCE
          });

          return res.status(200).json({
            success: true,
            message: 'Acceso autorizado (Modo Temporal)',
            token,
            rol: 'admin',
            usuario: payload
          });
        }
      }

      // Buscar estudiante en mock
      const mockStudent = mockDb.participantes.find(p => p.email === email);

      if (mockStudent) {
        if (password === mockStudent.dni) {
          const payload = {
            id: mockStudent.id,
            nombres: mockStudent.nombres,
            email: mockStudent.email,
            dni: mockStudent.dni
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
            rol: 'estudiante',
            estudiante: payload
          });
        }
      }

      return res.status(401).json({
        success: false,
        message: 'El correo electronico o la contrasena son incorrectos.'
      });
    }
  }
};
