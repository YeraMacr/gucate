const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

// Inicializar app y configuración
dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'templates')));
app.use(express.static(path.join(__dirname, 'static')));

// Base de datos y middleware de autenticación
const conexion = require('./db');
const autenticarToken = require('./middlewares/autenticarToken');

// Rutas importadas
const authRoutes = require('./routes/authRoutes');
const entradaRoutes = require('./routes/entradaRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const salidaRoutes = require('./routes/salidaRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const ingresoSemanalRoutes = require('./routes/ingresoSemanalRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const reporteSemanalRoutes = require('./routes/reporteSemanalRoutes'); // Asegúrate de tener este también

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'login.html'));
});

// Uso de rutas con prefijo /api
app.use('/api', authRoutes);
app.use('/api', entradaRoutes);
app.use('/api', pedidoRoutes);
app.use('/api', salidaRoutes);
app.use('/api', reporteRoutes);
app.use('/api', ingresoSemanalRoutes);
app.use('/api', ventaRoutes);
app.use('/api', tokenRoutes);
app.use('/api', reporteSemanalRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
