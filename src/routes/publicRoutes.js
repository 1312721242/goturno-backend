const express = require('express');
const router = express.Router();

// Ruta placeholder
router.get('/', (req, res) => {
  res.send('Ruta activa');
});

module.exports = router;
