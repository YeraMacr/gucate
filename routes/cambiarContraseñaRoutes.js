const express = require('express');
const router = express.Router();
const conexion = require('../db');

// Cambiar contraseña
router.post('/cambiar-contraseña', (req, res) => {
  const { nombre, contraseñaActual, nuevaContraseña } = req.body;

  if (!nombre || !contraseñaActual || !nuevaContraseña) {
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
  }

  const queryVerificar = 'SELECT * FROM usuarios WHERE nombre = ? AND contraseña = ?';
  conexion.query(queryVerificar, [nombre, contraseñaActual], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al verificar usuario' });
    }

    if (results.length === 0) {
      return res.status(400).json({ success: false, message: 'La contraseña actual es incorrecta' });
    }

    const queryActualizar = 'UPDATE usuarios SET contraseña = ? WHERE nombre = ?';
    conexion.query(queryActualizar, [nuevaContraseña, nombre], (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al cambiar la contraseña' });
      }

      res.json({ success: true, message: 'Contraseña cambiada con éxito' });
    });
  });
});

module.exports = router;
