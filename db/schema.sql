-- ==========================================================================
-- Dreamlike — schema.sql
-- Importar via phpMyAdmin (cPanel > MySQL Databases > phpMyAdmin) o CLI:
--   mysql -u USUARIO -p NOMBRE_BD < db/schema.sql
-- ==========================================================================

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(64) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  categoria_slug VARCHAR(100) NOT NULL,
  precio INT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  imagen VARCHAR(255) NOT NULL DEFAULT 'assets/img/productos/placeholder.svg',
  descripcion TEXT,
  specs JSON,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
