const express = require('express');
const router = express.Router();
const {
  obtenerConfiguracion,
  actualizarConfiguracion
} = require('../controllers/configuracionController');

const { verificarToken } = require('../middlewares/authMiddleware');

// Obtener configuración del usuario autenticado
router.get('/', verificarToken, obtenerConfiguracion);

// Actualizar configuración del usuario autenticado
router.put('/', verificarToken, actualizarConfiguracion);

module.exports = router;
