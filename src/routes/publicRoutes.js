const express = require('express');
const router = express.Router();
const { obtenerPublicidadActiva } = require('../controllers/publicidadController');

//obtener publicidad
router.get('/publicidad', obtenerPublicidadActiva);

// const path = require('path');
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta placeholder
router.get('/', (req, res) => {
  res.send('Ruta activa');
});

module.exports = router;
