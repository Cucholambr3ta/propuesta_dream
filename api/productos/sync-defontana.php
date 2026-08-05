<?php
/**
 * Modo POLLING: trae stock desde la API de Defontana y actualiza la BD
 * por SKU. Pensado para ejecutarse por CLI (cPanel > Cron Jobs), no desde
 * el navegador — por eso NO exige sesion admin de panel, en cambio exige
 * ejecutarse por linea de comandos o con el mismo secreto del webhook
 * como proteccion minima si se llama por HTTP (ej. cron externo).
 *
 * cPanel Cron Job de ejemplo (cada 15 min):
 *   php /home/USUARIO/public_html/api/productos/sync-defontana.php
 */

require __DIR__ . "/../db.php";
require __DIR__ . "/../auth.php";
require __DIR__ . "/../lib/productos.php";
require __DIR__ . "/../lib/defontana.php";

$esCLI = php_sapi_name() === "cli";

if (!$esCLI) {
  $config = require __DIR__ . "/../config.php";
  $secreto = $_GET["secreto"] ?? "";
  if (!hash_equals($config["defontana_webhook_secreto"], $secreto)) {
    dlErrorJSON("No autorizado", 401);
  }
}

$config = require __DIR__ . "/../config.php";

try {
  $stocksPorSku = dlDefontanaObtenerStocks($config["defontana_api"]);
} catch (Throwable $e) {
  $mensaje = "Error consultando Defontana: " . $e->getMessage();
  if ($esCLI) { fwrite(STDERR, $mensaje . "\n"); exit(1); }
  dlErrorJSON($mensaje, 502);
}

$pdo = dlConexion();
$actualizados = 0;
$noEncontrados = [];

foreach ($stocksPorSku as $sku => $stock) {
  if (dlActualizarStock($pdo, $sku, $stock)) {
    $actualizados++;
  } else {
    $noEncontrados[] = $sku;
  }
}

$resumen = [
  "actualizados" => $actualizados,
  "skuNoEncontrados" => $noEncontrados,
  "ejecutadoEn" => date("c"),
];

if ($esCLI) {
  echo json_encode($resumen, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
} else {
  dlRespuestaJSON($resumen);
}
