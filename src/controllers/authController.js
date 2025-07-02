const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

/**
 * Registro de un nuevo usuario
 */
const registrarUsuario = async (req, res) => {
  const {
    nombre,
    correo,
    contrasena,
    telefono,
    ciudad,
    direccion,
    direccion_referencia,
    latitud,
    longitud
  } = req.body;

  try {
    if (!correo || !contrasena || !nombre) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const existe = await pool.query('SELECT * FROM auth.usuarios WHERE correo = $1', [correo]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    // Insertar usuario
    const nuevo = await pool.query(
      `INSERT INTO auth.usuarios 
        (nombre, correo, contrasena, telefono, ciudad, direccion, direccion_referencia, latitud, longitud) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id, nombre, correo`,
      [nombre, correo, hash, telefono, ciudad, direccion, direccion_referencia, latitud, longitud]
    );

    const nuevoUsuario = nuevo.rows[0];

    // Insertar configuración por defecto
    await pool.query(
      `INSERT INTO auth.configuraciones_usuario 
        (id_usuario, notificaciones, publicidad, filtrar_por_ciudad, ver_destacados, usar_ubicacion, modo_oscuro)
       VALUES ($1, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE)`,
      [nuevoUsuario.id]
    );

    res.status(201).json({ mensaje: 'Usuario registrado', usuario: nuevoUsuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};


/**
 * Login de usuario
 */
// const loginUsuario = async (req, res) => {
//   const { correo, contrasena } = req.body;

//   try {
//     if (!correo || !contrasena) {
//       return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
//     }

//     const resultado = await pool.query('SELECT * FROM auth.usuarios WHERE correo = $1', [correo]);
//     if (resultado.rows.length === 0) {
//       return res.status(401).json({ error: 'Credenciales inválidas' });
//     }

//     const usuario = resultado.rows[0];

//     const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
//     if (!esValida) {
//       return res.status(401).json({ error: 'Credenciales inválidas' });
//     }

//     const token = jwt.sign(
//       { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.TOKEN_EXPIRES_IN }
//     );

//     res.json({
//       mensaje: 'Login exitoso',
//       token,
//       usuario: {
//         id: usuario.id,
//         nombre: usuario.nombre,
//         correo: usuario.correo,
//         rol: usuario.rol,
//         foto: usuario.foto // <-- aquí la añadimos
//       }
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error en el login' });
//   }
// };
 // Dentro del loginUsuario
const loginUsuario = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    const resultado = await pool.query('SELECT * FROM auth.usuarios WHERE correo = $1', [correo]);
    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = resultado.rows[0];

    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Obtener configuraciones
    const configResult = await pool.query(
      'SELECT notificaciones, publicidad, filtrar_por_ciudad, ver_destacados, usar_ubicacion, modo_oscuro FROM auth.configuraciones_usuario WHERE id_usuario = $1',
      [usuario.id]
    );

    const configuraciones = configResult.rows[0];

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRES_IN }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        foto: usuario.foto,
        configuraciones // 👈 añadimos aquí
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el login' });
  }
};

/**
 * Obtener perfil del usuario autenticado
 */
const obtenerPerfil = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const resultado = await pool.query(
      'SELECT id, nombre, correo, rol, telefono, ciudad, direccion, direccion_referencia, latitud, longitud, foto FROM auth.usuarios WHERE id = $1',
      [decoded.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ usuario: resultado.rows[0] });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil del usuario' });
  }
};


/**
 * Logout de usuario (opcional: solo informativo si se maneja en frontend)
 */
const logoutUsuario = (req, res) => {
  // Este método solo es útil si estás manejando tokens en una lista negra o borrando del almacenamiento local
  res.json({ mensaje: 'Sesión cerrada correctamente' });
};



module.exports = {
  registrarUsuario,
  loginUsuario,
  logoutUsuario,
  obtenerPerfil
};
