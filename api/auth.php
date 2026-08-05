<?php
/**
 * Dreamlike — auth.php
 * Sesion PHP real del panel admin (reemplaza el localStorage simulado
 * que usaba el prototipo). Cookie de sesion de servidor, no un token
 * que el cliente pueda fabricar.
 */

function dlIniciarSesionPHP() {
  if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
  }
}

function dlSesionAdminActual() {
  dlIniciarSesionPHP();
  return isset($_SESSION["admin"]) ? $_SESSION["admin"] : null;
}

function dlIniciarSesionAdmin($admin) {
  dlIniciarSesionPHP();
  session_regenerate_id(true);
  $_SESSION["admin"] = [
    "id"     => $admin["id"],
    "email"  => $admin["email"],
    "nombre" => $admin["nombre"],
  ];
}

function dlCerrarSesionAdmin() {
  dlIniciarSesionPHP();
  $_SESSION = [];
  if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), "", time() - 42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
  }
  session_destroy();
}

/** Responde 401 JSON y termina la ejecucion si no hay sesion admin activa. */
function dlExigirSesionAdmin() {
  $sesion = dlSesionAdminActual();
  if (!$sesion) {
    http_response_code(401);
    header("Content-Type: application/json");
    echo json_encode(["ok" => false, "error" => "Sesion admin requerida"]);
    exit;
  }
  return $sesion;
}

function dlRespuestaJSON($data, $codigo = 200) {
  http_response_code($codigo);
  header("Content-Type: application/json; charset=utf-8");
  echo json_encode(["ok" => true, "data" => $data], JSON_UNESCAPED_UNICODE);
  exit;
}

function dlErrorJSON($mensaje, $codigo = 400) {
  http_response_code($codigo);
  header("Content-Type: application/json; charset=utf-8");
  echo json_encode(["ok" => false, "error" => $mensaje], JSON_UNESCAPED_UNICODE);
  exit;
}
