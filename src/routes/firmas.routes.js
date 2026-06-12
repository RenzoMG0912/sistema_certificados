// Archivo: src/routes/firmas.routes.js
const router = require('express').Router();
const firmasController = require('../controllers/firmas.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Proteger todas las rutas de gestión de firmas autorizadas
router.use(authMiddleware);

router.get('/', firmasController.list);
router.post('/', firmasController.create);
router.delete('/:id', firmasController.delete);

module.exports = router;
