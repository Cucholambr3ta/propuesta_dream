<?php
require __DIR__ . "/../auth.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") dlErrorJSON("Metodo no permitido", 405);

dlCerrarSesionAdmin();
dlRespuestaJSON(["cerrada" => true]);
