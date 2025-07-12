const express = require('express');
const router = express.Router();
const conexion = require('../db');
const autenticarToken = require('../middlewares/autenticarToken');

// Registrar entrada de aguacates
router.post('/entradas', autenticarToken, (req, res) => {
  const { tipo_aguacate, peso, proveedor, fecha } = req.body;

  if (!tipo_aguacate || !peso || !proveedor || !fecha) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos son obligatorios: tipo_aguacate, peso, proveedor y fecha"
    });
  }

  const userId = req.userId;

  const query = `
    INSERT INTO ingreso (tipo_aguacate, peso, proveedor, fecha, id_usuario)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [tipo_aguacate, peso, proveedor, fecha, userId];

  conexion.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al registrar entrada:', err);
      return res.status(500).json({
        success: false,
        message: 'Error al registrar la entrada',
        error: err.message
      });
    }

    res.json({
      success: true,
      message: 'Entrada registrada correctamente',
      data: result
    });
  });
});

// Obtener todas las entradas por usuario autenticado
router.get('/entradas', autenticarToken, (req, res) => {
  const userId = req.userId;

  const query = `
    SELECT i.*, u.nombre as nombre_usuario
    FROM ingreso i
    JOIN usuarios u ON i.id_usuario = u.id
    WHERE i.id_usuario = ?
    ORDER BY i.fecha DESC
  `;

  conexion.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener las entradas',
        error: err.message
      });
    }

    const entradas = results.map(ingreso => ({
      id: ingreso.id,
      tipoAguacate: ingreso.tipo_aguacate,
      peso: ingreso.peso,
      proveedor: ingreso.proveedor,
      fecha: ingreso.fecha,
      usuario: ingreso.nombre_usuario
    }));

    res.json({ success: true, entradas });
  });
});

module.exports = router;
