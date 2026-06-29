const router = require('express').Router();
const matriculasController = require('../controllers/matriculas.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', matriculasController.list);
router.get('/grouped', matriculasController.listGrouped);
router.get('/by-course/:curso_id', matriculasController.getByCourse);
router.post('/', matriculasController.create);
router.post('/bulk', matriculasController.bulkCreate);
router.delete('/:id', matriculasController.delete);

module.exports = router;
