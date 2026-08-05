<?php
/**
 * Dreamlike — db.php
 * Conexion PDO compartida por todos los endpoints de api/. Soporta dos
 * drivers segun api/config.php ("db"."driver"):
 *   - "sqlite" (demo, sin instalar nada): archivo db/dreamlike.sqlite.
 *   - "mysql" (cPanel/produccion real): host/usuario/password de la BD.
 */

function dlEsSQLite() {
  $config = require __DIR__ . "/config.php";
  return ($config["db"]["driver"] ?? "sqlite") === "sqlite";
}

function dlConexion() {
  static $pdo = null;
  if ($pdo !== null) return $pdo;

  $config = require __DIR__ . "/config.php";
  $db = $config["db"];
  $driver = $db["driver"] ?? "sqlite";

  try {
    if ($driver === "sqlite") {
      $archivo = $db["sqlite_archivo"];
      $existiaAntes = file_exists($archivo);
      $pdo = new PDO("sqlite:" . $archivo);
      $pdo->exec("PRAGMA foreign_keys = ON");
      if (!$existiaAntes) {
        $schema = file_get_contents(__DIR__ . "/../db/schema-sqlite.sql");
        $pdo->exec($schema);
      }
    } else {
      $dsn = "mysql:host=" . $db["host"] . ";port=" . $db["puerto"] . ";dbname=" . $db["nombre"] . ";charset=utf8mb4";
      $pdo = new PDO($dsn, $db["usuario"], $db["password"]);
    }

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
  } catch (PDOException $e) {
    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode(["ok" => false, "error" => "No se pudo conectar a la base de datos: " . $e->getMessage()]);
    exit;
  }

  return $pdo;
}
