const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas organizadas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/core', require('./routes/coreRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/configuraciones', require('./routes/configuraciones'));

app.listen(port, () => {
  console.log(`Servidor GoTurno activo en http://localhost:${port}`);
});
