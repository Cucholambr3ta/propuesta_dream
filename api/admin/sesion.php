<?php
require __DIR__ . "/../auth.php";

$sesion = dlSesionAdminActual();
if (!$sesion) dlErrorJSON("Sin sesion", 401);

dlRespuestaJSON($sesion);
