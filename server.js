const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

// 🔧 Cargar variables de entorno desde .env si no están cargadas
dotenv.config(); // Esto no daña en producción si Railway ya pasó las variables

console.log("🌍 Variables de entorno cargadas:");
console.log({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  PORT: process.env.PORT
});
// Inicializar app
const app = express();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// 📁 Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'templates')));
app.use(express.static(path.join(__dirname, 'static')));

// 🗃️ Conexión a base de datos
const conexion = require('./db');

// 🔐 Middleware de autenticación (si lo usas en rutas)
const autenticarToken = require('./middlewares/autenticarToken');

// 📦 Rutas API
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/entradaRoutes'));
app.use('/api', require('./routes/pedidoRoutes'));
app.use('/api', require('./routes/salidaRoutes'));
app.use('/api', require('./routes/reporteRoutes'));
app.use('/api', require('./routes/ingresoSemanalRoutes'));
app.use('/api', require('./routes/ventaRoutes'));
app.use('/api', require('./routes/tokenRoutes'));
app.use('/api', require('./routes/reporteSemanalRoutes'));

// 📄 Ruta raíz: login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'login.html'));
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
