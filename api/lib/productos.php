<?php
/**
 * Dreamlike — lib/productos.php
 * Validacion y upsert de producto compartidos por crear.php, actualizar.php,
 * los importadores (CSV/XML) y la sincronizacion con Defontana — un solo
 * lugar que decide que es un producto valido y como se guarda.
 */

/** Valida un array asociativo de producto. Devuelve lista de errores (vacia si es valido). */
function dlValidarProducto($p, $esNuevo) {
  $errores = [];
  if (empty($p["sku"])) $errores[] = "sku es requerido";
  if (empty($p["nombre"])) $errores[] = "nombre es requerido";
  if (empty($p["marca"])) $errores[] = "marca es requerido";
  if (empty($p["categoria"])) $errores[] = "categoria es requerido";
  if (!isset($p["precio"]) || !is_numeric($p["precio"]) || $p["precio"] < 0) $errores[] = "precio debe ser un numero >= 0";
  if (!isset($p["stock"]) || !is_numeric($p["stock"]) || $p["stock"] < 0) $errores[] = "stock debe ser un numero >= 0";
  return $errores;
}

function dlSlugify($texto) {
  $texto = strtolower(trim($texto));
  $texto = str_replace(["á","é","í","ó","ú","ñ"], ["a","e","i","o","u","n"], $texto);
  $texto = preg_replace("/[^a-z0-9]+/", "-", $texto);
  return trim($texto, "-");
}

/**
 * Crea o actualiza un producto por SKU (upsert). $p puede traer:
 * sku, nombre, marca, categoria, categoriaSlug (opcional, se genera de categoria),
 * precio, stock, imagen (opcional), descripcion (opcional), specs (opcional, array).
 * Devuelve "creado" o "actualizado".
 */
function dlGuardarProducto(PDO $pdo, $p) {
  $categoriaSlug = !empty($p["categoriaSlug"]) ? $p["categoriaSlug"] : dlSlugify($p["categoria"]);
  $imagen = !empty($p["imagen"]) ? $p["imagen"] : "assets/img/productos/placeholder.svg";
  $specs = isset($p["specs"]) && is_array($p["specs"]) ? json_encode($p["specs"], JSON_UNESCAPED_UNICODE) : "{}";

  $valores = [
    ":sku" => $p["sku"],
    ":nombre" => $p["nombre"],
    ":marca" => $p["marca"],
    ":categoria" => $p["categoria"],
    ":categoria_slug" => $categoriaSlug,
    ":precio" => (int) $p["precio"],
    ":stock" => (int) $p["stock"],
    ":imagen" => $imagen,
    ":descripcion" => isset($p["descripcion"]) ? $p["descripcion"] : "",
    ":specs" => $specs,
  ];

  // UPDATE-o-INSERT explicito en vez de "ON DUPLICATE KEY"/"ON CONFLICT" —
  // esa sintaxis difiere entre MySQL y SQLite, esto funciona igual en ambos.
  $existe = $pdo->prepare("SELECT id FROM productos WHERE sku = ?");
  $existe->execute([$p["sku"]]);
  $esNuevo = !$existe->fetch();

  if ($esNuevo) {
    $stmt = $pdo->prepare(
      "INSERT INTO productos (sku, nombre, marca, categoria, categoria_slug, precio, stock, imagen, descripcion, specs)
       VALUES (:sku, :nombre, :marca, :categoria, :categoria_slug, :precio, :stock, :imagen, :descripcion, :specs)"
    );
  } else {
    $stmt = $pdo->prepare(
      "UPDATE productos SET
         nombre = :nombre, marca = :marca, categoria = :categoria, categoria_slug = :categoria_slug,
         precio = :precio, stock = :stock, imagen = :imagen, descripcion = :descripcion, specs = :specs,
         actualizado_en = CURRENT_TIMESTAMP
       WHERE sku = :sku"
    );
  }

  $stmt->execute($valores);
  return $esNuevo ? "creado" : "actualizado";
}

/** Solo actualiza el stock de un SKU existente. Devuelve false si el SKU no existe. */
function dlActualizarStock(PDO $pdo, $sku, $stock) {
  $stmt = $pdo->prepare("UPDATE productos SET stock = ? WHERE sku = ?");
  $stmt->execute([(int) $stock, $sku]);
  return $stmt->rowCount() > 0;
}
