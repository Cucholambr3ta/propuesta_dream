<?php
require __DIR__ . "/../db.php";
require __DIR__ . "/../auth.php";
require __DIR__ . "/../lib/productos.php";

dlExigirSesionAdmin();
if ($_SERVER["REQUEST_METHOD"] !== "POST") dlErrorJSON("Metodo no permitido", 405);

$p = json_decode(file_get_contents("php://input"), true);
if (!$p || empty($p["sku"])) dlErrorJSON("sku es requerido");

$pdo = dlConexion();

$existe = $pdo->prepare("SELECT * FROM productos WHERE sku = ?");
$existe->execute([$p["sku"]]);
$actual = $existe->fetch();
if (!$actual) dlErrorJSON("No existe un producto con ese SKU", 404);

// Actualizacion parcial: solo-stock (usado por el editor inline de la tabla)
// vs formulario completo. Se rellenan los campos no enviados con los actuales.
$merge = [
  "sku" => $p["sku"],
  "nombre" => isset($p["nombre"]) ? $p["nombre"] : $actual["nombre"],
  "marca" => isset($p["marca"]) ? $p["marca"] : $actual["marca"],
  "categoria" => isset($p["categoria"]) ? $p["categoria"] : $actual["categoria"],
  "categoriaSlug" => isset($p["categoriaSlug"]) ? $p["categoriaSlug"] : $actual["categoria_slug"],
  "precio" => isset($p["precio"]) ? $p["precio"] : $actual["precio"],
  "stock" => isset($p["stock"]) ? $p["stock"] : $actual["stock"],
  "imagen" => isset($p["imagen"]) ? $p["imagen"] : $actual["imagen"],
  "descripcion" => isset($p["descripcion"]) ? $p["descripcion"] : $actual["descripcion"],
  "specs" => isset($p["specs"]) ? $p["specs"] : json_decode($actual["specs"], true),
];

$errores = dlValidarProducto($merge, false);
if ($errores) dlErrorJSON(implode("; ", $errores));

dlGuardarProducto($pdo, $merge);
dlRespuestaJSON(["sku" => $p["sku"], "estado" => "actualizado"]);
