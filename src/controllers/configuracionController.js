const pool = require('../config/db');
const jwt = require('jsonwebtoken');

/**
 * Obtener configuraciones del usuario autenticado
 */
const obtenerConfiguracion = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const resultado = await pool.query(
      `SELECT notificaciones, publicidad, filtrar_por_ciudad, ver_destacados, usar_ubicacion, modo_oscuro
       FROM auth.configuraciones_usuario
       WHERE id_usuario = $1`,
      [decoded.id]
    );

    if (resultado.rowCount === 0) {
      // Si no hay registro, se devuelven todos los valores como true por defecto
      return res.json({
        notificaciones: true,
        publicidad: true,
        filtrar_por_ciudad: true,
        ver_destacados: true,
        usar_ubicacion: true,
        modo_oscuro: false
      });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

/**
 * Actualizar configuraciones del usuario autenticado
 */
const actualizarConfiguracion = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { notificaciones, publicidad, filtrar_por_ciudad, ver_destacados, usar_ubicacion, modo_oscuro } = req.body;

    const existe = await pool.query(
      'SELECT id_usuario FROM auth.configuraciones_usuario WHERE id_usuario = $1',
      [decoded.id]
    );

    if (existe.rowCount > 0) {
      // UPDATE
      await pool.query(
        `UPDATE auth.configuraciones_usuario
         SET notificaciones = $1, publicidad = $2, filtrar_por_ciudad = $3,
             ver_destacados = $4, usar_ubicacion = $5, modo_oscuro = $6
         WHERE id_usuario = $7`,
        [notificaciones, publicidad, filtrar_por_ciudad, ver_destacados, usar_ubicacion, modo_oscuro, decoded.id]
      );
    } else {
      // INSERT
      await pool.query(
        `INSERT INTO auth.configuraciones_usuario (
           id_usuario, notificaciones, publicidad, filtrar_por_ciudad, ver_destacados, usar_ubicacion, modo_oscuro
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [decoded.id, notificaciones, publicidad, filtrar_por_ciudad, ver_destacados, usar_ubicacion, modo_oscuro]
      );
    }

    res.json({ mensaje: 'Configuraciones actualizadas correctamente' });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
};

module.exports = {
  obtenerConfiguracion,
  actualizarConfiguracion
};
