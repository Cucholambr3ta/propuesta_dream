<?php
require __DIR__ . "/../db.php";
require __DIR__ . "/../auth.php";

dlExigirSesionAdmin();
if ($_SERVER["REQUEST_METHOD"] !== "POST") dlErrorJSON("Metodo no permitido", 405);

$body = json_decode(file_get_contents("php://input"), true);
$sku = isset($body["sku"]) ? $body["sku"] : "";
if ($sku === "") dlErrorJSON("sku es requerido");

$pdo = dlConexion();
$stmt = $pdo->prepare("DELETE FROM productos WHERE sku = ?");
$stmt->execute([$sku]);

if ($stmt->rowCount() === 0) dlErrorJSON("No existe un producto con ese SKU", 404);

dlRespuestaJSON(["sku" => $sku, "estado" => "eliminado"]);
