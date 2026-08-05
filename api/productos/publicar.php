<?php
/**
 * Sincroniza la BD hacia el catalogo estatico que consume la tienda publica:
 * assets/data/productos.json + assets/js/productos-fallback.js (mismo
 * formato que el script Python del README, escrito aqui en PHP para no
 * depender de tener Python en el hosting).
 *
 * Deliberadamente manual (boton "Publicar catalogo" en el panel), no
 * automatico en cada guardado — asi el admin controla cuando los cambios
 * de la BD quedan visibles en la tienda.
 */

require __DIR__ . "/../db.php";
require __DIR__ . "/../auth.php";

dlExigirSesionAdmin();
if ($_SERVER["REQUEST_METHOD"] !== "POST") dlErrorJSON("Metodo no permitido", 405);

$pdo = dlConexion();
$filas = $pdo->query("SELECT * FROM productos ORDER BY id ASC")->fetchAll();

$productos = array_map(function ($f) {
  return [
    "sku" => $f["sku"],
    "nombre" => $f["nombre"],
    "marca" => $f["marca"],
    "categoria" => $f["categoria"],
    "categoriaSlug" => $f["categoria_slug"],
    "precio" => (int) $f["precio"],
    "stock" => (int) $f["stock"],
    "imagen" => $f["imagen"],
    "descripcion" => $f["descripcion"],
    "specs" => json_decode($f["specs"], true) ?: new stdClass(),
  ];
}, $filas);

$json = json_encode($productos, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

$rutaJson = __DIR__ . "/../../assets/data/productos.json";
if (file_put_contents($rutaJson, $json) === false) {
  dlErrorJSON("No se pudo escribir productos.json (revisar permisos de escritura)", 500);
}

$rutaFallback = __DIR__ . "/../../assets/js/productos-fallback.js";
$fallbackJS = "window.DL_PRODUCTOS_FALLBACK = " . $json . ";\n";
if (file_put_contents($rutaFallback, $fallbackJS) === false) {
  dlErrorJSON("productos.json se escribio pero fallo el fallback JS (revisar permisos)", 500);
}

dlRespuestaJSON([
  "productos" => count($productos),
  "publicadoEn" => date("c"),
]);
