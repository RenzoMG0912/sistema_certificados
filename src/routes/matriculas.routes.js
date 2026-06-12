// Archivo: src/routes/matriculas.routes.js
const router = require('express').Router();
const matriculasController = require('../controllers/matriculas.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Proteger todas las rutas de matrículas bajo JWT
router.use(authMiddleware);

router.get('/', matriculasController.list);
router.post('/', matriculasController.create);
router.delete('/:id', matriculasController.delete);

module.exports = router;
