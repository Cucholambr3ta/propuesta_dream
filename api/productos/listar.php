<?php
require __DIR__ . "/../db.php";
require __DIR__ . "/../auth.php";

dlExigirSesionAdmin();

$pdo = dlConexion();
$filas = $pdo->query("SELECT * FROM productos ORDER BY actualizado_en DESC")->fetchAll();

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
    "specs" => json_decode($f["specs"], true),
    "actualizadoEn" => $f["actualizado_en"],
  ];
}, $filas);

dlRespuestaJSON($productos);
