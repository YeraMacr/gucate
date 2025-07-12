const express = require('express');
const router = express.Router();

module.exports = (conexion) => {
  const TIPOS_AGUACATE_PERMITIDOS = ['Criollo', 'Chokei', 'Semil', 'Papelillo'];

  function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  // Registrar ingreso semanal
  router.post('/api/ingreso-semanal', (req, res) => {
    const { tipo_aguacate, peso_ingreso, proveedor, fecha_ingreso } = req.body;

    if (!tipo_aguacate || !peso_ingreso || !proveedor || !fecha_ingreso) {
      return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
    }

    if (!TIPOS_AGUACATE_PERMITIDOS.includes(tipo_aguacate)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de aguacate no válido. Los tipos permitidos son: Criollo, Chokei, Semil y Papelillo"
      });
    }

    const fecha = new Date(fecha_ingreso);
    const numero_semana = getWeekNumber(fecha);
    const año = fecha.getFullYear();

    const queryTipo = 'SELECT id_tipo FROM tipo_aguacate WHERE nombre_tipo = ?';
    conexion.query(queryTipo, [tipo_aguacate], (err, results) => {
      if (err || results.length === 0) {
        return res.status(400).json({ success: false, message: "Tipo de aguacate no válido" });
      }

      const id_tipo = results[0].id_tipo;

      const queryVerificar = `
        SELECT id_ingreso FROM ingreso_semanal 
        WHERE id_tipo = ? AND numero_semana = ? AND año = ? AND estado = 'abierto'
      `;

      conexion.query(queryVerificar, [id_tipo, numero_semana, año], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Error al verificar ingreso existente" });

        if (results.length > 0) {
          const queryActualizar = `
            UPDATE ingreso_semanal 
            SET peso_ingreso = peso_ingreso + ? 
            WHERE id_ingreso = ?
          `;
          conexion.query(queryActualizar, [peso_ingreso, results[0].id_ingreso], (err) => {
            if (err) return res.status(500).json({ success: false, message: "Error al actualizar ingreso" });
            res.json({ success: true, message: "Ingreso actualizado correctamente" });
          });
        } else {
          const queryInsertar = `
            INSERT INTO ingreso_semanal 
            (id_tipo, peso_ingreso, proveedor, fecha_ingreso, numero_semana, año) 
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          conexion.query(queryInsertar,
            [id_tipo, peso_ingreso, proveedor, fecha_ingreso, numero_semana, año],
            (err) => {
              if (err) return res.status(500).json({ success: false, message: "Error al registrar ingreso" });
              res.json({ success: true, message: "Ingreso registrado correctamente" });
            }
          );
        }
      });
    });
  });

  // Cerrar ingreso semanal
  router.post('/api/cerrar-ingreso-semanal', (req, res) => {
    const { tipo_aguacate, numero_semana, año } = req.body;

    if (!TIPOS_AGUACATE_PERMITIDOS.includes(tipo_aguacate)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de aguacate no válido. Los tipos permitidos son: Criollo, Chokei, Semil y Papelillo"
      });
    }

    const queryTipo = 'SELECT id_tipo FROM tipo_aguacate WHERE nombre_tipo = ?';
    conexion.query(queryTipo, [tipo_aguacate], (err, results) => {
      if (err || results.length === 0) {
        return res.status(400).json({ success: false, message: "Tipo de aguacate no válido" });
      }

      const id_tipo = results[0].id_tipo;

      const queryTotales = `
        SELECT 
          COALESCE(SUM(s.peso_salida), 0) as total_salidas,
          COALESCE(SUM(v.peso_venta), 0) as total_ventas,
          COALESCE(SUM(p.peso_perdida), 0) as total_perdidas
        FROM ingreso_semanal i
        LEFT JOIN salida s ON s.id_tipo = i.id_tipo AND s.numero_semana = i.numero_semana AND s.año = i.año
        LEFT JOIN venta v ON v.id_tipo = i.id_tipo AND v.numero_semana = i.numero_semana AND v.año = i.año
        LEFT JOIN perdida p ON p.id_tipo = i.id_tipo AND p.numero_semana = i.numero_semana AND p.año = i.año
        WHERE i.id_tipo = ? AND i.numero_semana = ? AND i.año = ?
        GROUP BY i.id_ingreso
      `;

      conexion.query(queryTotales, [id_tipo, numero_semana, año], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Error al calcular totales" });

        const totales = results[0];
        const queryCerrar = `
          UPDATE ingreso_semanal 
          SET estado = 'cerrado' 
          WHERE id_tipo = ? AND numero_semana = ? AND año = ?
        `;

        conexion.query(queryCerrar, [id_tipo, numero_semana, año], (err) => {
          if (err) return res.status(500).json({ success: false, message: "Error al cerrar ingreso" });

          res.json({
            success: true,
            message: "Ingreso cerrado correctamente",
            totales: totales
          });
        });
      });
    });
  });

  return router;
};
