const pool = require('../config/db');

/**
 * Crear un nuevo negocio con validación de categoría existente
 */
const crearNegocio = async (req, res) => {
  const { nombre, descripcion, id_categoria, ciudad, direccion, latitud, longitud } = req.body;
  const id_usuario = req.usuario.id;

  try {
    // Verificar si la categoría existe
    const existeCategoria = await pool.query(
      'SELECT id FROM public.categorias WHERE id = $1',
      [id_categoria]
    );

    if (existeCategoria.rows.length === 0) {
      return res.status(400).json({ error: 'La categoría seleccionada no existe' });
    }

    const resultado = await pool.query(
      `INSERT INTO core.negocios 
       (nombre, descripcion, id_categoria, ciudad, direccion, latitud, longitud, id_dueno, id_usuario_creacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [nombre, descripcion, id_categoria, ciudad, direccion, latitud, longitud, id_usuario, id_usuario]
    );
    // dentro de crearNegocio
    if (resultado.rows.length === 0) {
      return res.status(500).json({ error: 'Error al crear el negocio' });
    }
    await pool.query(
      'UPDATE auth.usuarios SET rol = $1 WHERE id = $2',
      ['dueño', id_usuario]
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

// controllers/negocioController.js
const listarNegociosPublicos = async (req, res) => {
  try {
    const { latitud, longitud, ciudad, id_categoria } = req.query;
    let query = `SELECT n.*, c.nombre AS categoria
                 FROM core.negocios n
                 JOIN public.categorias c ON c.id = n.id_categoria
                 WHERE n.estado = true`;
    const params = [];

    if (ciudad) {
      query += ' AND LOWER(n.ciudad) = LOWER($' + (params.length + 1) + ')';
      params.push(ciudad);
    }

    if (id_categoria) {
      query += ' AND n.id_categoria = $' + (params.length + 1);
      params.push(id_categoria);
    }

    // Ordenar por cercanía si hay lat/lon
    if (latitud && longitud) {
      query += ` ORDER BY 
        ((latitud - $${params.length + 1})^2 + (longitud - $${params.length + 2})^2) ASC`;
      params.push(latitud, longitud);
    } else {
      query += ' ORDER BY n.calificacion_promedio DESC';
    }

    const negocios = await pool.query(query, params);
    res.json(negocios.rows);
  } catch (error) {
    console.error('Error al listar negocios públicos:', error);
    res.status(500).json({ error: 'Error al listar negocios' });
  }
};



/**
 * Ver detalle de un negocio público
 */
const obtenerNegocioPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      `SELECT n.*, c.nombre AS categoria
       FROM core.negocios n
       JOIN public.categorias c ON n.id_categoria = c.id
       WHERE n.id = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Negocio no encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al obtener negocio por ID:', error);
    res.status(500).json({ error: 'Error al obtener negocio' });
  }
};



module.exports = {
  crearNegocio,
  listarMisNegocios,
  listarNegociosPublicos,
  obtenerNegocioPorId,
};
