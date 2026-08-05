<?php
/**
 * Importa productos masivamente desde XML con formato:
 * <productos>
 *   <producto>
 *     <sku>...</sku><nombre>...</nombre><marca>...</marca><categoria>...</categoria>
 *     <precio>...</precio><stock>...</stock>
 *     <categoriaSlug>...</categoriaSlug> <!-- opcional -->
 *     <imagen>...</imagen> <!-- opcional -->
 *     <descripcion>...</descripcion> <!-- opcional -->
 *   </producto>
 *   ...
 * </productos>
 * Upsert por sku — nodos invalidos no abortan el resto del archivo.
 */

require __DIR__ . "/../db.php";
require __DIR__ . "/../auth.php";
require __DIR__ . "/../lib/productos.php";

dlExigirSesionAdmin();
if ($_SERVER["REQUEST_METHOD"] !== "POST") dlErrorJSON("Metodo no permitido", 405);

if (!isset($_FILES["archivo"]) || $_FILES["archivo"]["error"] !== UPLOAD_ERR_OK) {
  dlErrorJSON("No se recibio un archivo XML valido");
}

libxml_use_internal_errors(true);
$xml = simplexml_load_file($_FILES["archivo"]["tmp_name"]);

if ($xml === false) {
  dlErrorJSON("XML malformado o invalido");
}

$pdo = dlConexion();
$creados = 0;
$actualizados = 0;
$errores = [];
$indice = 0;

foreach ($xml->producto as $nodo) {
  $indice++;
  $p = [
    "sku" => trim((string) $nodo->sku),
    "nombre" => trim((string) $nodo->nombre),
    "marca" => trim((string) $nodo->marca),
    "categoria" => trim((string) $nodo->categoria),
    "categoriaSlug" => trim((string) $nodo->categoriaSlug),
    "precio" => trim((string) $nodo->precio),
    "stock" => trim((string) $nodo->stock),
    "imagen" => trim((string) $nodo->imagen),
    "descripcion" => trim((string) $nodo->descripcion),
  ];

  $erroresNodo = dlValidarProducto($p, true);
  if ($erroresNodo) {
    $errores[] = "Producto #$indice (sku " . ($p["sku"] ?: "?") . "): " . implode("; ", $erroresNodo);
    continue;
  }

  $estado = dlGuardarProducto($pdo, $p);
  if ($estado === "creado") $creados++; else $actualizados++;
}

dlRespuestaJSON([
  "creados" => $creados,
  "actualizados" => $actualizados,
  "errores" => $errores,
]);
