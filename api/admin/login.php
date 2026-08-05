<?php
require __DIR__ . "/../db.php";
require __DIR__ . "/../auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") dlErrorJSON("Metodo no permitido", 405);

$body = json_decode(file_get_contents("php://input"), true);
$email = isset($body["email"]) ? trim($body["email"]) : "";
$password = isset($body["password"]) ? $body["password"] : "";

if ($email === "" || $password === "") dlErrorJSON("Email y password son requeridos");

$pdo = dlConexion();
$stmt = $pdo->prepare("SELECT id, email, nombre, password_hash FROM admin_usuarios WHERE email = ?");
$stmt->execute([$email]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, $admin["password_hash"])) {
  dlErrorJSON("Credenciales invalidas", 401);
}

dlIniciarSesionAdmin($admin);
dlRespuestaJSON(["email" => $admin["email"], "nombre" => $admin["nombre"]]);
