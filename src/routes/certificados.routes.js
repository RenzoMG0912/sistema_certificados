// Archivo: src/routes/certificados.routes.js
const router = require('express').Router();
const certificadosController = require('../controllers/certificados.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Proteger todas las rutas administrativas de certificados
router.use(authMiddleware);

router.get('/', certificadosController.list);
router.post('/', certificadosController.create);
router.post('/bulk-generate', certificadosController.bulkGenerate);
router.post('/:id/send', certificadosController.send);
router.delete('/:id', certificadosController.delete);

module.exports = router;
