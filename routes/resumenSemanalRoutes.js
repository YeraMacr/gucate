const express = require('express');

module.exports = (conexion) => {
  const router = express.Router();

  router.get('/resumen-semanal', (req, res) => {
    const hoy = new Date();
    const hace7dias = new Date(hoy);
    hace7dias.setDate(hoy.getDate() - 7);

    const fechaInicio = hace7dias.toISOString().split('T')[0];
    const fechaFin = hoy.toISOString().split('T')[0];

    const queryEntradas = `
      SELECT COALESCE(SUM(peso), 0) AS totalEntradas 
      FROM entradas 
      WHERE fecha BETWEEN ? AND ?
    `;

    const querySalidas = `
      SELECT COALESCE(SUM(peso), 0) AS totalSalidas 
      FROM salidas 
      WHERE fecha BETWEEN ? AND ?
    `;

    conexion.query(queryEntradas, [fechaInicio, fechaFin], (err1, result1) => {
      if (err1) {
        return res.json({ success: false, error: 'Error al consultar entradas', err1 });
      }

      conexion.query(querySalidas, [fechaInicio, fechaFin], (err2, result2) => {
        if (err2) {
          return res.json({ success: false, error: 'Error al consultar salidas', err2 });
        }

        const totalEntradas = result1[0].totalEntradas || 0;
        const totalSalidas = result2[0].totalSalidas || 0;
        const balance = totalEntradas - totalSalidas;

        res.json({
          success: true,
          totalEntradas,
          totalSalidas,
          balance
        });
      });
    });
  });

  return router;
};
