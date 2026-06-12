// Archivo: src/config/db.js
const mysql = require('mysql2/promise');

// Crear el pool de conexiones a la base de datos MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'teamhsec',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true // Conserva el formato de fecha (YYYY-MM-DD) como string en lugar de castearlo a Date objeto
});

module.exports = pool;
