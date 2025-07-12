-- Tabla de entradas de aguacates
CREATE TABLE IF NOT EXISTS entradas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipoAguacate VARCHAR(50) NOT NULL,
    peso DECIMAL(10,2) NOT NULL,
    proveedor VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tipos de aguacate
CREATE TABLE IF NOT EXISTS tipo_aguacate (
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL UNIQUE
);

-- Insertar los tipos de aguacate permitidos
INSERT INTO tipo_aguacate (nombre_tipo) VALUES 
('Criollo'),
('Chokei'),
('Semil'),
('Papelillo');

-- Tabla de ingresos de aguacates
CREATE TABLE IF NOT EXISTS ingreso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_aguacate VARCHAR(50),
    peso DECIMAL(10,2),
    proveedor VARCHAR(100),
    fecha DATE,
    id_usuario INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

-- Tabla de ingresos semanales
CREATE TABLE IF NOT EXISTS ingreso_semanal (
    id_ingreso INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo INT NOT NULL,
    peso_ingreso DECIMAL(10,2) NOT NULL,
    proveedor VARCHAR(100) NOT NULL,
    fecha_ingreso DATE NOT NULL,
    numero_semana INT NOT NULL,
    año INT NOT NULL,
    estado ENUM('abierto', 'cerrado') DEFAULT 'abierto',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tipo) REFERENCES tipo_aguacate(id_tipo)
);

-- Tabla de salidas
CREATE TABLE IF NOT EXISTS salida (
    id_salida INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo INT NOT NULL,
    peso_salida DECIMAL(10,2) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    fecha_salida DATE NOT NULL,
    numero_semana INT NOT NULL,
    año INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tipo) REFERENCES tipo_aguacate(id_tipo)
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS venta (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo INT NOT NULL,
    peso_venta DECIMAL(10,2) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    fecha_venta DATE NOT NULL,
    numero_semana INT NOT NULL,
    año INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tipo) REFERENCES tipo_aguacate(id_tipo)
);

-- Tabla de pérdidas
CREATE TABLE IF NOT EXISTS perdida (
    id_perdida INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo INT NOT NULL,
    peso_perdida DECIMAL(10,2) NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    fecha_perdida DATE NOT NULL,
    numero_semana INT NOT NULL,
    año INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tipo) REFERENCES tipo_aguacate(id_tipo)
); 