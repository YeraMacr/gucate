const mysql = require('mysql2');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const cors = require('cors');

// Cargar variables del archivo .env
dotenv.config();

const app = express();

// Configuración de CORS
app.use(cors());

function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: "Token no proporcionado" });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = Buffer.from(token, 'base64').toString('ascii');
    const [userId, timestamp] = decoded.split('-');

    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return res.status(401).json({ success: false, message: 'Token expirado' });
    }

    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }
}


// Middleware para parsear JSON
app.use(bodyParser.json());

// Conectar a MySQL
const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

conexion.connect((err) => {
  if (err) {
    console.error("Error al conectar a MySQL:", err);
    return;
  }
  console.log('¡Conectado a MySQL!');
});

// Servir archivos estáticos desde "Proyecto"
app.use(express.static(path.join(__dirname, 'templates')));
app.use(express.static(path.join(__dirname, 'static')));


// Rutas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'Registro.html'));
});

// Registro de usuario
app.post('/api/registro', (req, res) => {
  const { nombre, telefono, contraseña } = req.body;
  if (!nombre || !telefono || !contraseña) {
    return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
  }

  const query = 'INSERT INTO usuarios (nombre, telefono, contraseña) VALUES (?, ?, ?)';
  conexion.query(query, [nombre, telefono, contraseña], (err, result) => {
    if (err) {
      console.error('Error al insertar usuario:', err);
      return res.status(500).json({ success: false, message: 'Error al registrar el usuario', error: err });
    }

    res.json({ success: true, message: 'Usuario registrado con éxito' });
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { nombre, contraseña } = req.body;

  if (!nombre || !contraseña) {
    return res.status(400).json({ success: false, message: 'Nombre y contraseña son obligatorios' });
  }

  const query = 'SELECT * FROM usuarios WHERE nombre = ? AND contraseña = ?';
  conexion.query(query, [nombre, contraseña], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error del servidor' });
    }

    if (results.length > 0) {
      // Crear un token simple (en producción deberías usar JWT)
      const token = Buffer.from(results[0].id + '-' + Date.now()).toString('base64');
      res.json({ 
        success: true, 
        usuario: results[0],
        token: token
      });
    } else {
      res.json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  });
});

// Ingresar pedido 
app.post('/api/pedidos', (req, res) => {
  const { cliente, cantidad, fechaPedido } = req.body;

  const query = 'INSERT INTO pedidos (cliente, cantidad, fechaPedido) VALUES (?, ?, ?)';
  conexion.query(query, [cliente, cantidad, fechaPedido], (err, result) => {
    if (err) {
      console.error('Error al ingresar pedido:', err);
      return res.status(500).json({ success: false, message: 'Error al ingresar pedido' });
    }

    res.json({ success: true, message: 'Pedido ingresado correctamente' });
  });
});

// Registrar salida
app.post('/api/salidas', (req, res) => {
  const { destino, cantidadSalida, fechaSalida, id_usuario } = req.body;
  const query = 'INSERT INTO salidas (destino, cantidadSalida, fechaSalida, id_usuario) VALUES (?, ?, ?, ?)';
  conexion.query(query, [destino, cantidadSalida, fechaSalida, id_usuario], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al registrar salida' });
    res.json({ success: true, message: 'Salida registrada correctamente' });
  });
});

// Ruta para generar el reporte diario
app.get('/api/reporte', (req, res) => {
  const today = new Date().toISOString().split('T')[0]; 
  console.log('Fecha de hoy:', today); // Verifica si la fecha es correcta

  const queryPedidos = 'SELECT cliente AS nombre, cantidad, fechaPedido AS fecha FROM pedidos WHERE fechaPedido = ?';
  const querySalidas = 'SELECT destino AS nombre, cantidadSalida AS cantidad, fechaSalida AS fecha FROM salidas WHERE fechaSalida = ?';

  conexion.query(queryPedidos, [today], (err, pedidos) => {
    if (err) {
      console.error('Error al consultar pedidos:', err);
      return res.status(500).json({ success: false, message: 'Error al generar el reporte' });
    }

    conexion.query(querySalidas, [today], (err, salidas) => {
      if (err) {
        console.error('Error al consultar salidas:', err);
        return res.status(500).json({ success: false, message: 'Error al generar el reporte' });
      }

      const reporte = [];

      pedidos.forEach(pedido => {
        reporte.push({
          fecha: pedido.fecha,
          pedido: `${pedido.nombre} - ${pedido.cantidad} KG`,
          salida: '-'
        });
      });

      salidas.forEach(salida => {
        reporte.push({
          fecha: salida.fecha,
          pedido: '-',
          salida: `${salida.nombre} - ${salida.cantidad} KG`
        });
      });

      // Opcional: ordenar por fecha
      reporte.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      res.json({ success: true, reporte });
    });
  });
});

// Cambiar contraseña
app.post('/api/cambiar-contraseña', (req, res) => {
  const { nombre, contraseñaActual, nuevaContraseña } = req.body;

  if (!nombre || !contraseñaActual || !nuevaContraseña) {
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
  }

  // Verificar si el usuario existe y la contraseña actual es correcta
  const queryVerificarUsuario = 'SELECT * FROM usuarios WHERE nombre = ? AND contraseña = ?';
  conexion.query(queryVerificarUsuario, [nombre, contraseñaActual], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al verificar usuario' });
    }

    if (results.length === 0) {
      return res.status(400).json({ success: false, message: 'La contraseña actual es incorrecta' });
    }

    // Actualizar la contraseña
    const queryActualizarContraseña = 'UPDATE usuarios SET contraseña = ? WHERE nombre = ?';
    conexion.query(queryActualizarContraseña, [nuevaContraseña, nombre], (err, result) => {
      if (err) {
        console.error('Error al actualizar la contraseña:', err);
        return res.status(500).json({ success: false, message: 'Error al cambiar la contraseña' });
      }

      res.json({ success: true, message: 'Contraseña cambiada con éxito' });
    });
  });
});

// Registrar entrada de aguacates
app.post('/api/entradas', (req, res) => {
    const { tipo_aguacate, peso, proveedor, fecha } = req.body;
    
    // Verificar que todos los campos obligatorios estén presentes
    if (!tipo_aguacate || !peso || !proveedor || !fecha) {
        return res.status(400).json({ 
            success: false, 
            message: "Todos los campos son obligatorios: tipo_aguacate, peso, proveedor y fecha"
        });
    }

    // Verificar autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ 
            success: false, 
            message: "Se requiere autenticación"
        });
    }

    try {
        // Obtener el token y decodificar el id del usuario
        const token = authHeader.split(' ')[1];
        const decoded = Buffer.from(token, 'base64').toString('ascii');
        const [userId] = decoded.split('-');

        const query = `INSERT INTO ingreso (tipo_aguacate, peso, proveedor, fecha) VALUES (?, ?, ?, ?)`;
        const values = [tipo_aguacate, peso, proveedor, fecha];
        
        console.log('Query a ejecutar:', query);
        console.log('Valores:', values);

        conexion.query(query, values, (err, result) => {
            if (err) {
                console.error('Error al registrar entrada:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error al registrar la entrada',
                    error: err.message 
                });
            }

            console.log('Entrada registrada:', result);
            res.json({ 
                success: true, 
                message: 'Entrada registrada correctamente',
                data: result
            });
        });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al procesar la solicitud',
            error: error.message
        });
    }
});

// Obtener todas las entradas
app.get('/api/entradas', (req, res) => {
    // Verificar autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ 
            success: false, 
            message: "Se requiere autenticación"
        });
    }

    try {
        // Obtener el token y decodificar el id del usuario
        const token = authHeader.split(' ')[1];
        const decoded = Buffer.from(token, 'base64').toString('ascii');
        const [userId] = decoded.split('-');

        const query = 'SELECT i.*, u.nombre as nombre_usuario FROM ingreso i JOIN usuarios u ON i.id_usuario = u.id WHERE i.id_usuario = ? ORDER BY i.fecha DESC';
        conexion.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Error al obtener entradas:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error al obtener las entradas',
                    error: err.message
                });
            }

            console.log('Entradas obtenidas:', results);

            // Mapear los resultados para mantener consistencia con el frontend
            const entradas = results.map(ingreso => ({
                id: ingreso.id,
                tipoAguacate: ingreso.tipo_aguacate,
                peso: ingreso.peso,
                proveedor: ingreso.proveedor,
                fecha: ingreso.fecha,
                usuario: ingreso.nombre_usuario
            }));

            res.json({ success: true, entradas });
        });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al procesar la solicitud',
            error: error.message
        });
    }
});

// Verificar token
app.post('/api/verificar-token', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.json({ success: false, message: 'No se proporcionó token' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.json({ success: false, message: 'Token inválido' });
    }

    // Decodificar el token (en producción usar JWT)
    try {
        const decoded = Buffer.from(token, 'base64').toString('ascii');
        const [userId, timestamp] = decoded.split('-');
        
        // Verificar si el token no es muy antiguo (24 horas)
        const tokenAge = Date.now() - parseInt(timestamp);
        if (tokenAge > 24 * 60 * 60 * 1000) {
            return res.json({ success: false, message: 'Token expirado' });
        }

        // Verificar si el usuario existe
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

// Función auxiliar para obtener el número de semana
function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Lista de tipos de aguacate permitidos
const TIPOS_AGUACATE_PERMITIDOS = ['Criollo', 'Chokei', 'Semil', 'Papelillo'];

// Registrar ingreso semanal
app.post('/api/ingreso-semanal', (req, res) => {
    const { tipo_aguacate, peso_ingreso, proveedor, fecha_ingreso } = req.body;
    
    if (!tipo_aguacate || !peso_ingreso || !proveedor || !fecha_ingreso) {
        return res.status(400).json({ 
            success: false, 
            message: "Todos los campos son obligatorios" 
        });
    }

    // Validar que el tipo de aguacate sea uno de los permitidos
    if (!TIPOS_AGUACATE_PERMITIDOS.includes(tipo_aguacate)) {
        return res.status(400).json({ 
            success: false, 
            message: "Tipo de aguacate no válido. Los tipos permitidos son: Criollo, Chokei, Semil y Papelillo" 
        });
    }

    const fecha = new Date(fecha_ingreso);
    const numero_semana = getWeekNumber(fecha);
    const año = fecha.getFullYear();

    // Verificar si el tipo de aguacate es válido
    const queryTipo = 'SELECT id_tipo FROM tipo_aguacate WHERE nombre_tipo = ?';
    conexion.query(queryTipo, [tipo_aguacate], (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Tipo de aguacate no válido" 
            });
        }

        const id_tipo = results[0].id_tipo;

        // Verificar si ya existe un ingreso abierto para esta semana
        const queryVerificar = `
            SELECT id_ingreso, peso_ingreso 
            FROM ingreso_semanal 
            WHERE id_tipo = ? 
            AND numero_semana = ? 
            AND año = ? 
            AND estado = 'abierto'
        `;

        conexion.query(queryVerificar, [id_tipo, numero_semana, año], (err, results) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: "Error al verificar ingreso existente" 
                });
            }

            if (results.length > 0) {
                // Actualizar ingreso existente
                const queryActualizar = `
                    UPDATE ingreso_semanal 
                    SET peso_ingreso = peso_ingreso + ? 
                    WHERE id_ingreso = ?
                `;
                conexion.query(queryActualizar, [peso_ingreso, results[0].id_ingreso], (err) => {
                    if (err) {
                        return res.status(500).json({ 
                            success: false, 
                            message: "Error al actualizar ingreso" 
                        });
                    }
                    res.json({ 
                        success: true, 
                        message: "Ingreso actualizado correctamente" 
                    });
                });
            } else {
                // Crear nuevo ingreso
                const queryInsertar = `
                    INSERT INTO ingreso_semanal 
                    (id_tipo, peso_ingreso, proveedor, fecha_ingreso, numero_semana, año) 
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                conexion.query(queryInsertar, 
                    [id_tipo, peso_ingreso, proveedor, fecha_ingreso, numero_semana, año], 
                    (err) => {
                        if (err) {
                            return res.status(500).json({ 
                                success: false, 
                                message: "Error al registrar ingreso" 
                            });
                        }
                        res.json({ 
                            success: true, 
                            message: "Ingreso registrado correctamente" 
                        });
                    }
                );
            }
        });
    });
});

// Cerrar ingreso semanal
app.post('/api/cerrar-ingreso-semanal', (req, res) => {
    const { tipo_aguacate, numero_semana, año } = req.body;

    // Validar que el tipo de aguacate sea uno de los permitidos
    if (!TIPOS_AGUACATE_PERMITIDOS.includes(tipo_aguacate)) {
        return res.status(400).json({ 
            success: false, 
            message: "Tipo de aguacate no válido. Los tipos permitidos son: Criollo, Chokei, Semil y Papelillo" 
        });
    }

    const queryTipo = 'SELECT id_tipo FROM tipo_aguacate WHERE nombre_tipo = ?';
    conexion.query(queryTipo, [tipo_aguacate], (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Tipo de aguacate no válido" 
            });
        }

        const id_tipo = results[0].id_tipo;

        // Obtener total de salidas y ventas
        const queryTotales = `
            SELECT 
                COALESCE(SUM(s.peso_salida), 0) as total_salidas,
                COALESCE(SUM(v.peso_venta), 0) as total_ventas,
                COALESCE(SUM(p.peso_perdida), 0) as total_perdidas
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

        conexion.query(queryTotales, [id_tipo, numero_semana, año], (err, results) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: "Error al calcular totales" 
                });
            }

            const totales = results[0];
            const queryCerrar = `
                UPDATE ingreso_semanal 
                SET estado = 'cerrado' 
                WHERE id_tipo = ? AND numero_semana = ? AND año = ?
            `;

            conexion.query(queryCerrar, [id_tipo, numero_semana, año], (err) => {
                if (err) {
                    return res.status(500).json({ 
                        success: false, 
                        message: "Error al cerrar ingreso" 
                    });
                }

                res.json({ 
                    success: true, 
                    message: "Ingreso cerrado correctamente",
                    totales: totales
                });
            });
        });
    });
});

// Obtener reporte semanal
app.get('/api/reporte-semanal', (req, res) => {
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
                message: "Error al generar reporte" 
            });
        }

        res.json({ 
            success: true, 
            reporte: results 
        });
    });
});

// Registrar venta
app.post('/api/venta', (req, res) => {
    const { tipo_aguacate, peso_venta, precio_venta, fecha_venta } = req.body;

    if (!tipo_aguacate || !peso_venta || !precio_venta || !fecha_venta) {
        return res.status(400).json({ 
            success: false, 
            message: "Todos los campos son obligatorios" 
        });
    }

    // Validar que el tipo de aguacate sea uno de los permitidos
    if (!TIPOS_AGUACATE_PERMITIDOS.includes(tipo_aguacate)) {
        return res.status(400).json({ 
            success: false, 
            message: "Tipo de aguacate no válido. Los tipos permitidos son: Criollo, Chokei, Semil y Papelillo" 
        });
    }

    const fecha = new Date(fecha_venta);
    const numero_semana = getWeekNumber(fecha);
    const año = fecha.getFullYear();

    // Verificar si el tipo de aguacate es válido
    const queryTipo = 'SELECT id_tipo FROM tipo_aguacate WHERE nombre_tipo = ?';
    conexion.query(queryTipo, [tipo_aguacate], (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Tipo de aguacate no válido" 
            });
        }

        const id_tipo = results[0].id_tipo;

        // Verificar si hay suficiente stock disponible
        const queryStock = `
            SELECT 
                COALESCE(SUM(i.peso_ingreso), 0) - 
                COALESCE(SUM(s.peso_salida), 0) - 
                COALESCE(SUM(v.peso_venta), 0) - 
                COALESCE(SUM(p.peso_perdida), 0) as stock_disponible
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
                return res.status(500).json({ 
                    success: false, 
                    message: "Error al verificar stock" 
                });
            }

            const stock_disponible = results[0]?.stock_disponible || 0;
            if (stock_disponible < peso_venta) {
                return res.status(400).json({ 
                    success: false, 
                    message: "No hay suficiente stock disponible" 
                });
            }

            // Registrar la venta
            const queryInsertar = `
                INSERT INTO venta 
                (id_tipo, peso_venta, precio_venta, fecha_venta, numero_semana, año) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            conexion.query(queryInsertar, 
                [id_tipo, peso_venta, precio_venta, fecha_venta, numero_semana, año], 
                (err) => {
                    if (err) {
                        return res.status(500).json({ 
                            success: false, 
                            message: "Error al registrar venta" 
                        });
                    }
                    res.json({ 
                        success: true, 
                        message: "Venta registrada correctamente" 
                    });
                }
            );
        });
    });
});

// Iniciar servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
