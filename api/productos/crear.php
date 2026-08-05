<?php
require __DIR__ . "/../db.php";
require __DIR__ . "/../auth.php";
require __DIR__ . "/../lib/productos.php";

dlExigirSesionAdmin();
if ($_SERVER["REQUEST_METHOD"] !== "POST") dlErrorJSON("Metodo no permitido", 405);

$p = json_decode(file_get_contents("php://input"), true);
if (!$p) dlErrorJSON("Body invalido");

$errores = dlValidarProducto($p, true);
if ($errores) dlErrorJSON(implode("; ", $errores));

$pdo = dlConexion();

$existe = $pdo->prepare("SELECT id FROM productos WHERE sku = ?");
$existe->execute([$p["sku"]]);
if ($existe->fetch()) dlErrorJSON("Ya existe un producto con ese SKU", 409);

dlGuardarProducto($pdo, $p);
dlRespuestaJSON(["sku" => $p["sku"], "estado" => "creado"], 201);
