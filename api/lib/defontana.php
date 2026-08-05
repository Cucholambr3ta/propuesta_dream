<?php
/**
 * Dreamlike — lib/defontana.php
 * Cliente minimo de la API REST de Defontana, usado solo para traer stock
 * actualizado por SKU. No crea/edita productos en Defontana (de solo
 * lectura hacia nuestro lado) — el ERP sigue siendo la fuente de verdad
 * del stock, este sitio solo refleja lo que Defontana reporta.
 *
 * Defontana expone su API REST con autenticacion por token (login previo
 * con usuario/password de integracion, ver portal de Defontana > API).
 * El endpoint exacto de inventario varia segun el modulo contratado —
 * ajustar dlDefontanaObtenerStocks() con la URL real una vez el cliente
 * confirme el acceso/documentacion de su cuenta.
 */

function dlDefontanaObtenerStocks(array $configApi) {
  if (empty($configApi["base_url"])) {
    throw new RuntimeException("api/config.php: defontana_api.base_url no esta configurado");
  }

  // 1. Login: intercambia usuario/password de integracion por un token de sesion.
  $tokenUrl = rtrim($configApi["base_url"], "/") . "/api/login";
  $tokenResp = dlDefontanaPost($tokenUrl, [
    "usuario" => $configApi["usuario"],
    "password" => $configApi["password"],
  ]);
  $token = $tokenResp["token"] ?? null;
  if (!$token) throw new RuntimeException("Defontana: login no devolvio token");

  // 2. Consulta de stock por producto — endpoint de ejemplo, confirmar con
  //    la documentacion real de la cuenta Defontana del cliente.
  $stockUrl = rtrim($configApi["base_url"], "/") . "/api/inventario/stock";
  $stockResp = dlDefontanaGet($stockUrl, $token);

  // Formato esperado de vuelta: lista de { "codigoProducto": "...", "stockDisponible": N }
  // Se normaliza a { sku => stock } para que sync-defontana.php la consuma simple.
  $mapa = [];
  foreach (($stockResp["items"] ?? []) as $item) {
    if (isset($item["codigoProducto"])) {
      $mapa[$item["codigoProducto"]] = (int) ($item["stockDisponible"] ?? 0);
    }
  }
  return $mapa;
}

function dlDefontanaPost($url, $body) {
  return dlDefontanaLlamar($url, "POST", $body);
}

function dlDefontanaGet($url, $token) {
  return dlDefontanaLlamar($url, "GET", null, $token);
}

function dlDefontanaLlamar($url, $metodo, $body = null, $token = null) {
  $ch = curl_init($url);
  $headers = ["Content-Type: application/json"];
  if ($token) $headers[] = "Authorization: Bearer " . $token;

  curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST => $metodo,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_POSTFIELDS => $body !== null ? json_encode($body) : null,
  ]);

  $respuesta = curl_exec($ch);
  $codigo = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $errorCurl = curl_error($ch);
  curl_close($ch);

  if ($respuesta === false) throw new RuntimeException("Defontana: error de conexion — $errorCurl");
  if ($codigo >= 400) throw new RuntimeException("Defontana: respondio HTTP $codigo — $respuesta");

  $data = json_decode($respuesta, true);
  if ($data === null) throw new RuntimeException("Defontana: respuesta no es JSON valido");

  return $data;
}
