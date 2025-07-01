const pool = require('../config/db');

/**
 * Crear un nuevo negocio
 */
const crearNegocio = async (req, res) => {
  const { nombre, descripcion, categoria, ciudad, direccion, latitud, longitud } = req.body;
  const id_usuario = req.usuario.id;

  try {
    const resultado = await pool.query(
      `INSERT INTO core.negocios 
       (nombre, descripcion, categoria, ciudad, direccion, latitud, longitud, id_dueno, id_usuario_creacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [nombre, descripcion, categoria, ciudad, direccion, latitud, longitud, id_usuario, id_usuario]
    );
    res.status(201).json({ mensaje: 'Negocio creado exitosamente', negocio: resultado.rows[0] });
  } catch (error) {
    console.error('Error al crear negocio:', error);
    res.status(500).json({ error: 'Error al crear negocio' });
  }
};

/**
 * Listar negocios registrados por el dueño logueado
 */
const listarMisNegocios = async (req, res) => {
  const id_usuario = req.usuario.id;

  try {
    const negocios = await pool.query(
      'SELECT * FROM core.negocios WHERE id_dueno = $1',
      [id_usuario]
    );
    res.json(negocios.rows);
  } catch (error) {
    console.error('Error al listar negocios:', error);
    res.status(500).json({ error: 'Error al listar negocios' });
  }
};

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
  crearNegocio,
  listarMisNegocios,
  crearReserva,
  listarMisReservas
};
