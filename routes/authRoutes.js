const express = require('express');
const router = express.Router();
const conexion = require('../db');
const autenticarToken = require('../middlewares/autenticarToken');

// Registro de usuario
router.post('/registro', (req, res) => {
  const { nombre, telefono, contraseña } = req.body;
  if (!nombre || !telefono || !contraseña)
    return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });

  const query = 'INSERT INTO usuarios (nombre, telefono, contraseña) VALUES (?, ?, ?)';
  conexion.query(query, [nombre, telefono, contraseña], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al registrar el usuario' });
    res.json({ success: true, message: 'Usuario registrado con éxito' });
  });
});

// Login
router.post('/login', (req, res) => {
  const { nombre, contraseña } = req.body;
  if (!nombre || !contraseña)
    return res.status(400).json({ success: false, message: 'Nombre y contraseña son obligatorios' });

  const query = 'SELECT * FROM usuarios WHERE nombre = ? AND contraseña = ?';
  conexion.query(query, [nombre, contraseña], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error del servidor' });
    if (results.length > 0) {
      const token = Buffer.from(results[0].id + '-' + Date.now()).toString('base64');
      res.json({ success: true, usuario: results[0], token });
    } else {
      res.json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  });
});

// Verificar token
router.post('/verificar-token', autenticarToken, (req, res) => {
  const userId = req.userId;
  const query = 'SELECT * FROM usuarios WHERE id = ?';
  conexion.query(query, [userId], (err, results) => {
    if (err || results.length === 0)
      return res.json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, usuario: results[0] });
  });
});

module.exports = router;
