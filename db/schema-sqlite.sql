-- ==========================================================================
-- Dreamlike — schema-sqlite.sql
-- Version SQLite del schema, solo para DEMO/pruebas locales sin instalar
-- nada: un archivo db/dreamlike.sqlite, cero servicio de BD corriendo.
-- Para produccion real en cPanel usar db/schema.sql (MySQL/MariaDB).
-- No requiere importarse a mano — db/seed.php lo aplica automaticamente
-- si detecta que falta la tabla.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku VARCHAR(64) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  categoria_slug VARCHAR(100) NOT NULL,
  precio INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  imagen VARCHAR(255) NOT NULL DEFAULT 'assets/img/productos/placeholder.svg',
  descripcion TEXT,
  specs TEXT, -- JSON serializado a texto (SQLite no tiene tipo JSON nativo)
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
