const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

// 🔧 Cargar variables de entorno desde .env
dotenv.config();

console.log("🌍 Variables de entorno cargadas:");
console.log({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  PORT: process.env.PORT
});

const app = express();

// ✅ Middlewares globales
app.use(cors());
app.use(bodyParser.json());

// 📁 Archivos estáticos
app.use(express.static(path.join(__dirname, 'templates')));
app.use(express.static(path.join(__dirname, 'static')));

// 🗃️ Conexión a base de datos
const conexion = require('./db');

// 🔐 Middleware de autenticación (si se usa en rutas)
const autenticarToken = require('./middlewares/autenticarToken');

// 📦 Rutas de la API
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/entradaRoutes'));
app.use('/api', require('./routes/pedidoRoutes'));
app.use('/api', require('./routes/salidaRoutes'));
app.use('/api', require('./routes/reporteRoutes'));
app.use('/api', require('./routes/ingresoSemanalRoutes'));
app.use('/api', require('./routes/ventaRoutes'));
app.use('/api', require('./routes/reporteSemanalRoutes'));

// ✅ CORREGIDO: Rutas que necesitan conexión (como tokenRoutes)
const tokenRoutes = require('./routes/tokenRoutes')(conexion);
app.use('/api', tokenRoutes);

// 📄 Ruta raíz: login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'login.html'));
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
