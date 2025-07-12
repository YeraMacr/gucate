const express = require('express');
const router = express.Router();
const conexion = require('../db');

// Registrar salida
router.post('/salidas', (req, res) => {
  const { destino, cantidadSalida, fechaSalida, id_usuario } = req.body;

  if (!destino || !cantidadSalida || !fechaSalida || !id_usuario) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son obligatorios'
    });
  }

  const query = `
    INSERT INTO salidas (destino, cantidadSalida, fechaSalida, id_usuario) 
    VALUES (?, ?, ?, ?)
  `;

  conexion.query(query, [destino, cantidadSalida, fechaSalida, id_usuario], (err, result) => {
    if (err) {
      console.error('Error al registrar salida:', err);
      return res.status(500).json({
        success: false,
        message: 'Error al registrar salida'
      });
    }

    res.json({
      success: true,
      message: 'Salida registrada correctamente'
    });
  });
});

module.exports = router;
