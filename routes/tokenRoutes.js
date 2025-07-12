const express = require('express');
const router = express.Router();

module.exports = (conexion) => {
  router.post('/api/verificar-token', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.json({ success: false, message: 'No se proporcionó token' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.json({ success: false, message: 'Token inválido' });
    }

    try {
      const decoded = Buffer.from(token, 'base64').toString('ascii');
      const [userId, timestamp] = decoded.split('-');

      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return res.json({ success: false, message: 'Token expirado' });
      }

      const query = 'SELECT * FROM usuarios WHERE id = ?';
      conexion.query(query, [userId], (err, results) => {
        if (err || results.length === 0) {
          return res.json({ success: false, message: 'Usuario no encontrado' });
        }
        res.json({ success: true, usuario: results[0] });
      });
    } catch (error) {
      res.json({ success: false, message: 'Token inválido' });
    }
  });

  return router;
};
