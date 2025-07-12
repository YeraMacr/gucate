const express = require('express');
const router = express.Router();
const conexion = require('../db');

// Reporte diario de pedidos y salidas
router.get('/reporte', (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const queryPedidos = `
    SELECT cliente AS nombre, cantidad, fechaPedido AS fecha 
    FROM pedidos 
    WHERE fechaPedido = ?
  `;
  const querySalidas = `
    SELECT destino AS nombre, cantidadSalida AS cantidad, fechaSalida AS fecha 
    FROM salidas 
    WHERE fechaSalida = ?
  `;

  conexion.query(queryPedidos, [today], (err, pedidos) => {
    if (err) {
      console.error('Error al consultar pedidos:', err);
      return res.status(500).json({ success: false, message: 'Error al generar el reporte' });
    }

    conexion.query(querySalidas, [today], (err, salidas) => {
      if (err) {
        console.error('Error al consultar salidas:', err);
        return res.status(500).json({ success: false, message: 'Error al generar el reporte' });
      }

      const reporte = [];

      pedidos.forEach(pedido => {
        reporte.push({
          fecha: pedido.fecha,
          pedido: `${pedido.nombre} - ${pedido.cantidad} KG`,
          salida: '-'
        });
      });

      salidas.forEach(salida => {
        reporte.push({
          fecha: salida.fecha,
          pedido: '-',
          salida: `${salida.nombre} - ${salida.cantidad} KG`
        });
      });

      reporte.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      res.json({ success: true, reporte });
    });
  });
});

module.exports = router;
