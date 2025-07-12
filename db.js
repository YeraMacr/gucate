const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT), 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

conexion.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar a MySQL:", err);
    return;
  }
  console.log('✅ Conectado a MySQL');
});

module.exports = conexion;
