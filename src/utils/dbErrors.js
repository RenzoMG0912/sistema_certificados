// Archivo: src/utils/dbErrors.js
// Utilidades para distinguir errores de conexión a la base de datos
// de errores SQL reales (que NO deben ocultarse con el modo mock).

const CONNECTION_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ECONNRESET',
  'ECONNABORTED',
  'ENOTFOUND',
  'EPIPE',
  'PROTOCOL_CONNECTION_LOST',
  'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
  'HANDSHAKE_ERROR',
  'ER_ACCESS_DENIED_ERROR',
  'ER_BAD_DB_ERROR',
  'ER_CON_COUNT_ERROR',
  'ER_MAX_USER_CONNECTIONS',
  'ER_SERVER_SHUTDOWN',
  'ER_ABORTING_CONNECTION'
]);

function isConnectionError(err) {
  if (!err) return false;

  if (typeof err.code === 'string') {
    if (CONNECTION_ERROR_CODES.has(err.code)) return true;
    // Los errores SQL reales (ER_*) no deben caer en modo mock
    if (err.code.startsWith('ER_')) return false;
  }

  // mysql2/promise lanza AggregateError cuando el pool no puede conectar
  if (err.name === 'AggregateError' && Array.isArray(err.errors)) {
    return err.errors.some(e => isConnectionError(e));
  }

  return false;
}

module.exports = { isConnectionError };