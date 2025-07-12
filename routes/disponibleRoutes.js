const express = require('express');
const router = express.Router();

module.exports = (conexion) => {
    router.get('/disponible/:tipo', (req, res) => {
        const tipo = req.params.tipo;

        const queryEntradas = `SELECT SUM(peso) AS totalEntradas FROM entradas WHERE tipoAguacate = ?`;
        const querySalidas = `SELECT SUM(peso_venta) AS totalSalidas FROM ventas WHERE tipo_aguacate = ?`;

        conexion.query(queryEntradas, [tipo], (err, entradasResult) => {
            if (err) return res.json({ success: false, message: 'Error en entradas' });

            conexion.query(querySalidas, [tipo], (err2, salidasResult) => {
                if (err2) return res.json({ success: false, message: 'Error en salidas' });

                const entradas = entradasResult[0].totalEntradas || 0;
                const salidas = salidasResult[0].totalSalidas || 0;

                const disponible = entradas - salidas;

                res.json({ success: true, disponible });
            });
        });
    });

    return router;
};
