const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  solicitarRecuperacion,
  verificarToken: verificarTokenRecuperacion,
  cambiarContrasena,
} = require('../controllers/recuperacionController');
const { logoutUsuario } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Registro, login y logout
router.post('/register', authController.registrarUsuario);
router.post('/login', authController.loginUsuario);
router.post('/logout', verificarToken, logoutUsuario);

// Recuperación de contraseña
router.post('/recuperar', solicitarRecuperacion);
router.get('/recuperar/:token', verificarTokenRecuperacion);
router.post('/recuperar/:token', cambiarContrasena);

// Ruta para obtener el perfil
router.get('/perfil', authController.obtenerPerfil); // Puedes usar `verificarToken` si deseas


module.exports = router;
