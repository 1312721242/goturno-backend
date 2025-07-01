const express = require('express');
const router = express.Router();
const negocioController = require('../controllers/negocioController');
console.log('Negocio Controller:', negocioController);
const reservaController = require('../controllers/reservaController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');


// Negocios
router.post('/negocios', verificarToken, verificarRol('dueño', 'superadmin'), negocioController.crearNegocio);
router.get('/mis-negocios', verificarToken, verificarRol('dueño', 'superadmin'), negocioController.listarMisNegocios);
// routes/negocioRoutes.js
router.get('/negocios', negocioController.listarNegociosPublicos); // ❗SIN verificarToken
router.get('/negocios/:id', negocioController.obtenerNegocioPorId);

// Reservas
router.post('/reservas', verificarToken, verificarRol('usuario'), reservaController.crearReserva);
router.get('/mis-reservas', verificarToken, verificarRol('usuario'), reservaController.listarMisReservas);
module.exports = router;
