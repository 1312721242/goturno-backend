const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    // Verificar si el token ya fue invalidado
    const invalido = await pool.query('SELECT * FROM auth.tokens_invalidos WHERE token = $1', [token]);
    if (invalido.rows.length > 0) {
      return res.status(401).json({ error: 'Token inválido. Por favor inicia sesión de nuevo.' });
    }

    // Verificar si el token es válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();

  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
      const rolUsuario = req.usuario?.rol;
  
      if (!rolesPermitidos.includes(rolUsuario)) {
        return res.status(403).json({ error: 'Acceso denegado: rol no autorizado' });
      }
  
      next();
    };
  };
  

module.exports = { verificarToken, verificarRol };
