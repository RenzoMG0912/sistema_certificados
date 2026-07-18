const router = require('express').Router();
const edicionesController = require('../controllers/ediciones.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', edicionesController.list);
router.get('/:id', edicionesController.get);
router.get('/by-curso/:curso_id', edicionesController.getByCurso);
router.post('/', edicionesController.create);
router.put('/:id', edicionesController.update);
router.delete('/:id', edicionesController.delete);

module.exports = router;
