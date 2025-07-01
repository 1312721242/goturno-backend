const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Ruta solo para superadmin
router.get('/negocios', verificarToken, verificarRol('superadmin'), (req, res) => {
  res.json({ mensaje: 'Ruta solo para superadministradores' });
});

// Ruta para superadmin o dueño
router.post('/publicidad', verificarToken, verificarRol('superadmin', 'dueño'), (req, res) => {
  res.json({ mensaje: 'Puedes gestionar publicidad' });
});

module.exports = router;
