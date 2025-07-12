// routes/ventaRoutes.js
const express = require('express');
const router = express.Router();
const conexion = require('../db');
const autenticarToken = require('../middlewares/autenticarToken');

// Tipos de aguacate permitidos
const TIPOS_AGUACATE_PERMITIDOS = ['Criollo', 'Chokei', 'Semil', 'Papelillo'];

// Función para obtener número de semana
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Registrar venta
router.post('/venta', autenticarToken, (req, res) => {
  const { tipo_aguacate, peso_venta, precio_venta, fecha_venta } = req.body;

  if (!tipo_aguacate || !peso_venta || !precio_venta || !fecha_venta) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos son obligatorios"
    });
  }

  if (!TIPOS_AGUACATE_PERMITIDOS.includes(tipo_aguacate)) {
    return res.status(400).json({
      success: false,
      message: "Tipo de aguacate no válido. Permitidos: Criollo, Chokei, Semil, Papelillo"
    });
  }

  const fecha = new Date(fecha_venta);
  const numero_semana = getWeekNumber(fecha);
  const año = fecha.getFullYear();

  const queryTipo = 'SELECT id_tipo FROM tipo_aguacate WHERE nombre_tipo = ?';
  conexion.query(queryTipo, [tipo_aguacate], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ success: false, message: "Tipo de aguacate no válido" });
    }

    const id_tipo = results[0].id_tipo;

    const queryStock = `
      SELECT 
        COALESCE(SUM(i.peso_ingreso), 0) -
        COALESCE(SUM(s.peso_salida), 0) -
        COALESCE(SUM(v.peso_venta), 0) -
        COALESCE(SUM(p.peso_perdida), 0) AS stock_disponible
      FROM ingreso_semanal i
      LEFT JOIN salida s ON s.id_tipo = i.id_tipo 
        AND s.numero_semana = i.numero_semana AND s.año = i.año
      LEFT JOIN venta v ON v.id_tipo = i.id_tipo 
        AND v.numero_semana = i.numero_semana AND v.año = i.año
      LEFT JOIN perdida p ON p.id_tipo = i.id_tipo 
        AND p.numero_semana = i.numero_semana AND p.año = i.año
      WHERE i.id_tipo = ? AND i.numero_semana = ? AND i.año = ?
      GROUP BY i.id_ingreso
    `;

    conexion.query(queryStock, [id_tipo, numero_semana, año], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error al verificar stock" });
      }

      const stock_disponible = results[0]?.stock_disponible || 0;
      if (stock_disponible < peso_venta) {
        return res.status(400).json({ success: false, message: "No hay suficiente stock disponible" });
      }

      const queryInsertar = `
        INSERT INTO venta 
        (id_tipo, peso_venta, precio_venta, fecha_venta, numero_semana, año) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      conexion.query(queryInsertar, [id_tipo, peso_venta, precio_venta, fecha_venta, numero_semana, año], (err) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Error al registrar venta" });
        }
        res.json({ success: true, message: "Venta registrada correctamente" });
      });
    });
  });
});

module.exports = router;
