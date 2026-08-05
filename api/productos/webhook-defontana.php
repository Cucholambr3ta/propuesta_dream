<?php
/**
 * Modo WEBHOOK: si el plan/configuracion de Defontana permite notificar
 * cambios de stock en tiempo real via HTTP POST, apuntar esa notificacion
 * a esta URL (ej. https://tusitio.cl/api/productos/webhook-defontana.php).
 *
 * Body esperado (ajustar segun el formato real que documente Defontana):
 *   { "secreto": "...", "items": [ { "sku": "...", "stock": N }, ... ] }
 * o un solo item:
 *   { "secreto": "...", "sku": "...", "stock": N }
 *
 * El "secreto" debe coincidir con defontana_webhook_secreto de config.php —
 * sin eso, cualquiera que adivine la URL podria alterar stock del sitio.
 */

require __DIR__ . "/../db.php";
require __DIR__ . "/../auth.php";
require __DIR__ . "/../lib/productos.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") dlErrorJSON("Metodo no permitido", 405);

$config = require __DIR__ . "/../config.php";
$body = json_decode(file_get_contents("php://input"), true);

$secreto = $body["secreto"] ?? "";
if (!hash_equals($config["defontana_webhook_secreto"], $secreto)) {
  dlErrorJSON("No autorizado", 401);
}

$items = [];
if (isset($body["items"]) && is_array($body["items"])) {
  $items = $body["items"];
} elseif (isset($body["sku"])) {
  $items = [["sku" => $body["sku"], "stock" => $body["stock"] ?? 0]];
} else {
  dlErrorJSON("Body sin sku/items");
}

$pdo = dlConexion();
$actualizados = 0;
$noEncontrados = [];

foreach ($items as $item) {
  $sku = $item["sku"] ?? "";
  $stock = $item["stock"] ?? null;
  if ($sku === "" || $stock === null) continue;

  if (dlActualizarStock($pdo, $sku, $stock)) {
    $actualizados++;
  } else {
    $noEncontrados[] = $sku;
  }
}

dlRespuestaJSON([
  "actualizados" => $actualizados,
  "skuNoEncontrados" => $noEncontrados,
]);
