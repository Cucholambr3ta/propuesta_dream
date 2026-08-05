<?php
/**
 * Dreamlike — config.php
 * driver "sqlite" (default): CERO instalacion, para correr una demo local
 * o mostrarle al cliente sin instalar MySQL — usa un archivo
 * db/dreamlike.sqlite creado automaticamente por db/seed.php.
 *
 * driver "mysql": para cPanel real. Cambiar "driver" a "mysql" y completar
 * host/nombre/usuario/password de la BD creada en cPanel > MySQL Databases
 * (cPanel antepone el usuario al nombre, ej. "usuario_dreamlike").
 *
 * No subir este archivo con credenciales reales a un repositorio publico.
 */

return [
  "db" => [
    "driver"   => "sqlite",
    "sqlite_archivo" => __DIR__ . "/../db/dreamlike.sqlite",

    // Solo se usan si driver = "mysql"
    "host"     => "localhost",
    "nombre"   => "dreamlike",
    "usuario"  => "root",
    "password" => "",
    "puerto"   => 3306,
  ],

  // Secreto compartido para validar peticiones del webhook de Defontana
  // (ver api/productos/webhook-defontana.php). Cambiar por un valor propio
  // largo y aleatorio antes de activar el webhook en produccion.
  "defontana_webhook_secreto" => "cambiar-este-secreto",

  // Credenciales de la API REST de Defontana, solo necesarias si se usa
  // el modo polling (ver api/productos/sync-defontana.php). Se completan
  // cuando el cliente confirme plan/acceso de API con Defontana.
  "defontana_api" => [
    "base_url" => "",
    "usuario"  => "",
    "password" => "",
  ],
];
