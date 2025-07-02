const pool = require('../config/db');

const obtenerPublicidadActiva2 = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, titulo, imagen_url, link FROM public.publicidad WHERE estado = true ORDER BY created_at DESC LIMIT 5'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener publicidad:', error);
    res.status(500).json({ mensaje: 'Error al obtener publicidad' });
  }
};

// controlador para GET /public/publicidad
const obtenerPublicidadActiva = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, titulo, imagen_url, link FROM public.publicidad WHERE estado = true ORDER BY created_at DESC LIMIT 5'
    );

    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;

    const publicidades = result.rows.map((pub) => ({
      ...pub,
      imagen_url: pub.imagen_url?.startsWith('http')
        ? pub.imagen_url
        : baseUrl + pub.imagen_url,
    }));

    res.json(publicidades);
  } catch (error) {
    console.error('Error al obtener publicidad:', error);
    res.status(500).json({ mensaje: 'Error al obtener publicidad' });
  }
};

module.exports = {
  obtenerPublicidadActiva
};



module.exports = { obtenerPublicidadActiva };
