// Archivo: src/routes/cursos.routes.js
const router = require('express').Router();
const cursosController = require('../controllers/cursos.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rutas Públicas
router.get('/', cursosController.list);
router.get('/:id', cursosController.get);

// Rutas Protegidas (Solo Administradores)
router.post('/', authMiddleware, cursosController.create);
router.put('/:id', authMiddleware, cursosController.update);
router.delete('/:id', authMiddleware, cursosController.delete);

module.exports = router;
