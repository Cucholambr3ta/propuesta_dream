<?php
/**
 * Sube la imagen de un producto. Recibe multipart/form-data con campos:
 * sku (string), imagen (archivo). Guarda en assets/img/productos/ con
 * nombre seguro basado en el SKU y devuelve la ruta relativa que hay que
 * guardar en la columna `imagen` del producto.
 */

require __DIR__ . "/../auth.php";

dlExigirSesionAdmin();
if ($_SERVER["REQUEST_METHOD"] !== "POST") dlErrorJSON("Metodo no permitido", 405);

$sku = isset($_POST["sku"]) ? trim($_POST["sku"]) : "";
if ($sku === "") dlErrorJSON("sku es requerido");
if (!preg_match('/^[A-Za-z0-9._-]+$/', $sku)) dlErrorJSON("sku contiene caracteres invalidos");

if (!isset($_FILES["imagen"]) || $_FILES["imagen"]["error"] !== UPLOAD_ERR_OK) {
  dlErrorJSON("No se recibio un archivo de imagen valido");
}

$archivo = $_FILES["imagen"];

$TAMANO_MAXIMO = 2 * 1024 * 1024; // 2MB
if ($archivo["size"] > $TAMANO_MAXIMO) dlErrorJSON("La imagen supera el tamaño maximo (2MB)");

$mime = mime_content_type($archivo["tmp_name"]);
$extensionesPermitidas = [
  "image/jpeg" => "jpg",
  "image/png"  => "png",
  "image/webp" => "webp",
  "image/svg+xml" => "svg",
];

if (!isset($extensionesPermitidas[$mime])) {
  dlErrorJSON("Formato de imagen no permitido (usar JPG, PNG, WEBP o SVG)");
}

$extension = $extensionesPermitidas[$mime];
$nombreArchivo = $sku . "." . $extension;
$carpetaDestino = __DIR__ . "/../../assets/img/productos/";
$rutaDestino = $carpetaDestino . $nombreArchivo;

if (!is_dir($carpetaDestino)) mkdir($carpetaDestino, 0755, true);

if (!move_uploaded_file($archivo["tmp_name"], $rutaDestino)) {
  dlErrorJSON("No se pudo guardar la imagen en el servidor", 500);
}

dlRespuestaJSON(["ruta" => "assets/img/productos/" . $nombreArchivo]);
