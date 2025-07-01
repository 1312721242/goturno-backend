const crypto = require('crypto');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const nodemailer = require('nodemailer');
require('dotenv').config();

// 1. Solicitar recuperación
const solicitarRecuperacion = async (req, res) => {
  const { correo } = req.body;

  if (!correo || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
    return res.status(400).json({ error: 'Correo inválido' });
  }

  try {
    const resultado = await pool.query('SELECT * FROM auth.usuarios WHERE correo = $1', [correo]);
    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: 'No existe una cuenta con ese correo' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await pool.query(
      'INSERT INTO auth.recuperaciones (correo, token, fecha_expiracion) VALUES ($1, $2, $3)',
      [correo, token, expiracion]
    );

    const enlace = `${process.env.FRONTEND_URL}/recuperar/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CORREO_EMISOR,
        pass: process.env.CLAVE_CORREO,
      },
    });

    await transporter.sendMail({
      from: `"GoTurno" <${process.env.CORREO_EMISOR}>`,
      to: correo,
      subject: 'Recuperación de contraseña',
      html: `<p>Solicitaste recuperar tu contraseña. Haz clic en el siguiente enlace:</p>
             <a href="${enlace}">${enlace}</a><p>Este enlace expirará en 15 minutos.</p>`,
    });

    res.json({ mensaje: 'Correo de recuperación enviado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

// 2. Verificar token de recuperación
const verificarToken = async (req, res) => {
  const { token } = req.params;

  try {
    const resultado = await pool.query(
      'SELECT * FROM auth.recuperaciones WHERE token = $1 AND utilizado = false AND fecha_expiracion > NOW()',
      [token]
    );

    if (resultado.rowCount === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    res.json({ mensaje: 'Token válido', correo: resultado.rows[0].correo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al verificar el token' });
  }
};

// 3. Cambiar contraseña usando token
const cambiarContrasena = async (req, res) => {
  const { token } = req.params;
  const { nueva } = req.body;

  if (!nueva || nueva.length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const resultado = await pool.query(
      'SELECT * FROM auth.recuperaciones WHERE token = $1 AND utilizado = false AND fecha_expiracion > NOW()',
      [token]
    );

    if (resultado.rowCount === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const correo = resultado.rows[0].correo;
    const hash = await bcrypt.hash(nueva, 10);

    // Actualizar contraseña
    await pool.query('UPDATE auth.usuarios SET contrasena = $1 WHERE correo = $2', [hash, correo]);

    // Marcar token como usado
    await pool.query('UPDATE auth.recuperaciones SET utilizado = true WHERE token = $1', [token]);

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
};

module.exports = {
    solicitarRecuperacion,
    verificarToken,
    cambiarContrasena,
  };
