const express = require('express');
const router = express.Router();
const conexion = require('../db');

// Registrar pedido
router.post('/pedidos', (req, res) => {
  const { cliente, cantidad, fechaPedido } = req.body;

  if (!cliente || !cantidad || !fechaPedido) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos son obligatorios: cliente, cantidad, fechaPedido"
    });
  }

  const query = 'INSERT INTO pedidos (cliente, cantidad, fechaPedido) VALUES (?, ?, ?)';
  conexion.query(query, [cliente, cantidad, fechaPedido], (err, result) => {
    if (err) {
      console.error('Error al ingresar pedido:', err);
      return res.status(500).json({
        success: false,
        message: 'Error al ingresar pedido'
      });
    }

    res.json({
      success: true,
      message: 'Pedido ingresado correctamente'
    });
  });
});

module.exports = router;
