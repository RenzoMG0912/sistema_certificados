const router = require('express').Router();
const notificacionesController = require('../controllers/notificaciones.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const studentAuthMiddleware = require('../middlewares/studentAuth.middleware');

const setAdminContext = (req, res, next) => {
  req.usuario_tipo = 'admin';
  req.usuario_id = req.usuario?.id;
  next();
};

const setStudentContext = (req, res, next) => {
  req.usuario_tipo = 'alumno';
  req.usuario_id = req.estudiante?.id;
  next();
};

// Rutas para administradores
router.get('/admin', authMiddleware, setAdminContext, notificacionesController.list);
router.get('/admin/unread-count', authMiddleware, setAdminContext, notificacionesController.unreadCount);
router.put('/admin/:id/read', authMiddleware, setAdminContext, notificacionesController.markRead);
router.put('/admin/read-all', authMiddleware, setAdminContext, notificacionesController.markAllRead);

// Rutas para estudiantes
router.get('/student', studentAuthMiddleware, setStudentContext, notificacionesController.list);
router.get('/student/unread-count', studentAuthMiddleware, setStudentContext, notificacionesController.unreadCount);
router.put('/student/:id/read', studentAuthMiddleware, setStudentContext, notificacionesController.markRead);
router.put('/student/read-all', studentAuthMiddleware, setStudentContext, notificacionesController.markAllRead);

module.exports = router;
