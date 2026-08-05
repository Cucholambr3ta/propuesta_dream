<?php
/**
 * Importa productos masivamente desde un CSV. Columnas esperadas (header
 * obligatorio, en cualquier orden): sku,nombre,marca,categoria,precio,stock
 * Opcionales: categoriaSlug,imagen,descripcion
 * Upsert por sku — filas invalidas no abortan el resto del archivo.
 */

require __DIR__ . "/../db.php";
require __DIR__ . "/../auth.php";
require __DIR__ . "/../lib/productos.php";

dlExigirSesionAdmin();
if ($_SERVER["REQUEST_METHOD"] !== "POST") dlErrorJSON("Metodo no permitido", 405);

if (!isset($_FILES["archivo"]) || $_FILES["archivo"]["error"] !== UPLOAD_ERR_OK) {
  dlErrorJSON("No se recibio un archivo CSV valido");
}

$manejador = fopen($_FILES["archivo"]["tmp_name"], "r");
if (!$manejador) dlErrorJSON("No se pudo leer el archivo");

$header = fgetcsv($manejador);
if (!$header) dlErrorJSON("CSV vacio o sin encabezado");
$header = array_map("trim", $header);

$pdo = dlConexion();
$creados = 0;
$actualizados = 0;
$errores = [];
$fila = 1;

while (($cols = fgetcsv($manejador)) !== false) {
  $fila++;
  if (count($cols) === 1 && trim($cols[0]) === "") continue; // linea vacia

  $registro = @array_combine($header, $cols);
  if (!$registro) {
    $errores[] = "Fila $fila: numero de columnas no coincide con el encabezado";
    continue;
  }

  $p = [
    "sku" => isset($registro["sku"]) ? trim($registro["sku"]) : "",
    "nombre" => isset($registro["nombre"]) ? trim($registro["nombre"]) : "",
    "marca" => isset($registro["marca"]) ? trim($registro["marca"]) : "",
    "categoria" => isset($registro["categoria"]) ? trim($registro["categoria"]) : "",
    "categoriaSlug" => isset($registro["categoriaSlug"]) ? trim($registro["categoriaSlug"]) : "",
    "precio" => isset($registro["precio"]) ? trim($registro["precio"]) : "",
    "stock" => isset($registro["stock"]) ? trim($registro["stock"]) : "",
    "imagen" => isset($registro["imagen"]) ? trim($registro["imagen"]) : "",
    "descripcion" => isset($registro["descripcion"]) ? trim($registro["descripcion"]) : "",
  ];

  $erroresFila = dlValidarProducto($p, true);
  if ($erroresFila) {
    $errores[] = "Fila $fila (sku " . ($p["sku"] ?: "?") . "): " . implode("; ", $erroresFila);
    continue;
  }

  $estado = dlGuardarProducto($pdo, $p);
  if ($estado === "creado") $creados++; else $actualizados++;
}

fclose($manejador);

dlRespuestaJSON([
  "creados" => $creados,
  "actualizados" => $actualizados,
  "errores" => $errores,
]);
