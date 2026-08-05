<?php
/**
 * Dreamlike — seed.php
 * Ejecutar UNA sola vez, para poblar la BD con el catalogo actual
 * (assets/data/productos.json) y crear el primer usuario admin.
 *
 * Driver "sqlite" (default en config.php, demo sin instalar nada): las
 * tablas se crean solas la primera vez que corre (ver api/db.php) — no
 * hace falta importar ningun schema a mano.
 * Driver "mysql" (cPanel real): importar antes db/schema.sql via
 * phpMyAdmin (ver README).
 *
 * Uso local:   php db/seed.php
 * Uso cPanel:  subir y abrir en el navegador (ej. https://tusitio.cl/db/seed.php),
 *              luego BORRAR el archivo o restringir el acceso — no debe quedar
 *              publico, permite recrear el admin con password conocida.
 */

require __DIR__ . "/../api/db.php";
require __DIR__ . "/../api/lib/productos.php";

$pdo = dlConexion();

// --- Productos -------------------------------------------------------------

$rutaJson = __DIR__ . "/../assets/data/productos.json";
$productos = json_decode(file_get_contents($rutaJson), true);

$insertados = 0;
foreach ($productos as $p) {
  dlGuardarProducto($pdo, [
    "sku" => $p["sku"],
    "nombre" => $p["nombre"],
    "marca" => $p["marca"],
    "categoria" => $p["categoria"],
    "categoriaSlug" => $p["categoriaSlug"],
    "precio" => $p["precio"],
    "stock" => $p["stock"],
    "imagen" => $p["imagen"],
    "descripcion" => isset($p["descripcion"]) ? $p["descripcion"] : "",
    "specs" => isset($p["specs"]) ? $p["specs"] : [],
  ]);
  $insertados++;
}

echo "Productos sembrados: $insertados\n";

// --- Admin por defecto -------------------------------------------------------

$emailAdmin = "admin@dreamlike.cl";
$passwordAdmin = "Dreamlike2026"; // password fija para demo al cliente — CAMBIAR antes de produccion real

$existe = $pdo->prepare("SELECT id FROM admin_usuarios WHERE email = ?");
$existe->execute([$emailAdmin]);

if ($existe->fetch()) {
  echo "Usuario admin ya existe ($emailAdmin), no se modifica.\n";
} else {
  $hash = password_hash($passwordAdmin, PASSWORD_DEFAULT);
  $pdo->prepare("INSERT INTO admin_usuarios (email, password_hash, nombre) VALUES (?, ?, ?)")
      ->execute([$emailAdmin, $hash, "Administrador Dreamlike"]);

  echo "Usuario admin creado:\n";
  echo "  email:    $emailAdmin\n";
  echo "  password: $passwordAdmin\n";
  echo "  (password fija para demo — cambiarla en admin_usuarios antes de exponer el sitio en produccion real.)\n";
}
