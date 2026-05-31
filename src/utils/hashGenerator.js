const crypto = require('crypto');

function generateHash(input) {
  return crypto.createHash('sha256').update(String(input)).digest('hex');
}

module.exports = generateHash;
