// Archivo: src/routes/participantes.routes.js
const router = require('express').Router();
const participantesController = require('../controllers/participantes.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas las rutas de participantes requieren autenticación JWT
router.use(authMiddleware);

router.get('/', participantesController.list);
router.get('/:id', participantesController.get);
router.post('/', participantesController.create);
router.put('/:id', participantesController.update);
router.delete('/:id', participantesController.delete);

module.exports = router;
