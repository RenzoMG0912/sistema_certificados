// Archivo: src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports = {
  login: async (req, res, next) => {
    const { email, password } = req.body;

    // BYPASS temporal solicitado: permite ingresar usando la contraseña "TeamHsec123" sin validar BD
    if (password === 'TeamHsec123') {
      const token = jwt.sign(
        {
          id: 1,
          nombre: 'Administrador HSEC',
          email: email || 'admin@teamhsec.com',
          rol: 'admin'
        },
        process.env.JWT_SECRET || 'teamhsec_secret_key_2026_super_secure_987123',
        { expiresIn: '8h' }
      );

      return res.status(200).json({
        success: true,
        message: 'Acceso temporal autorizado (Modo Bypass)',
        token,
        usuario: {
          id: 1,
          nombre: 'Administrador HSEC',
          email: email || 'admin@teamhsec.com',
          rol: 'admin'
        }
      });
    }

    try {
      // Intento normal de autenticación por base de datos
      const query = 'SELECT * FROM usuarios WHERE email = ?';
      const [rows] = await db.query(query, [email.trim().toLowerCase()]);

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'El correo electrónico o la contraseña son incorrectos.'
        });
      }

      const usuario = rows[0];

      // Verificar la contraseña cifrada
      const validPassword = bcrypt.compareSync(password, usuario.password);
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: 'El correo electrónico o la contraseña son incorrectos.'
        });
      }

      // Generar JWT
      const token = jwt.sign(
        {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.status(200).json({
        success: true,
        message: 'Acceso autorizado',
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.warn('Fallo de conexión a la Base de Datos. Use la contraseña bypass "TeamHsec123".');
      return res.status(500).json({
        success: false,
        message: 'Error de conexión a la base de datos. Para pruebas locales, use la contraseña bypass "TeamHsec123".'
      });
    }
  }
};
