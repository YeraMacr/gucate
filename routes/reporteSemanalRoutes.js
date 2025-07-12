// routes/reporteSemanalRoutes.js

const express = require('express');
const router = express.Router();
const conexion = require('../db');

router.get('/api/reporte-semanal', (req, res) => {
    const { numero_semana, año } = req.query;

    const query = `
        SELECT 
            ta.nombre_tipo as tipo_aguacate,
            COALESCE(SUM(i.peso_ingreso), 0) as total_ingreso,
            COALESCE(SUM(s.peso_salida), 0) as total_salidas,
            COALESCE(SUM(v.peso_venta), 0) as total_ventas,
            COALESCE(SUM(p.peso_perdida), 0) as total_perdidas,
            i.estado
        FROM tipo_aguacate ta
        LEFT JOIN ingreso_semanal i ON i.id_tipo = ta.id_tipo 
            AND i.numero_semana = ? AND i.año = ?
        LEFT JOIN salida s ON s.id_tipo = ta.id_tipo 
            AND s.numero_semana = ? AND s.año = ?
        LEFT JOIN venta v ON v.id_tipo = ta.id_tipo 
            AND v.numero_semana = ? AND v.año = ?
        LEFT JOIN perdida p ON p.id_tipo = ta.id_tipo 
            AND p.numero_semana = ? AND p.año = ?
        GROUP BY ta.id_tipo, ta.nombre_tipo, i.estado
    `;

    conexion.query(query, [numero_semana, año, numero_semana, año, numero_semana, año, numero_semana, año], (err, results) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: "Error al generar reporte semanal" 
            });
        }

        res.json({ 
            success: true, 
            reporte: results 
        });
    });
});

module.exports = router;
