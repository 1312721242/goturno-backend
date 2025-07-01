const pool = require('../config/db');

/**
 * Crear una reserva como usuario final
 */
const crearReserva = async (req, res) => {
  const { id_trabajador, id_servicio, fecha, hora } = req.body;
  const id_usuario = req.usuario.id;

  try {
    const nueva = await pool.query(
      `INSERT INTO core.reservas 
       (id_usuario, id_trabajador, id_servicio, fecha, hora, estado, id_usuario_creacion)
       VALUES ($1, $2, $3, $4, $5, 'pendiente', $1)
       RETURNING *`,
      [id_usuario, id_trabajador, id_servicio, fecha, hora]
    );
    res.status(201).json({ mensaje: 'Reserva realizada con éxito', reserva: nueva.rows[0] });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
};

/**
 * Ver el historial de reservas del usuario
 */
const listarMisReservas = async (req, res) => {
  const id_usuario = req.usuario.id;

  try {
    const resultado = await pool.query(
      `SELECT r.*, s.nombre AS servicio, n.nombre AS negocio
       FROM core.reservas r
       JOIN core.servicios s ON s.id = r.id_servicio
       JOIN core.negocios n ON n.id = s.id_negocio
       WHERE r.id_usuario = $1
       ORDER BY r.fecha DESC, r.hora DESC`,
      [id_usuario]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al listar reservas:', error);
    res.status(500).json({ error: 'Error al listar reservas' });
  }
};

module.exports = {
  crearReserva,
  listarMisReservas
};
