module.exports = (_err, _req, res, _next) => {
  res.status(500).json({ message: 'Error interno' });
};
