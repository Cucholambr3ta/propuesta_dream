/* ==========================================================================
   Dreamlike — admin-comun.js
   Guard de sesion admin (real, via api/admin/sesion.php) + pintado de
   sidebar. Compartido por admin/index.html, admin/productos.html,
   admin/pedidos.html.
   ========================================================================== */

(function () {
  "use strict";

  function iniciales(nombre) {
    var partes = nombre.trim().split(/\s+/);
    var ini = partes[0].charAt(0);
    if (partes.length > 1) ini += partes[partes.length - 1].charAt(0);
    return ini.toUpperCase();
  }

  function pintarSidebar(sesion) {
    var nombreEl = document.getElementById("sidebarNombre");
    var emailEl = document.getElementById("sidebarEmail");
    var avatarEl = document.getElementById("avatarIniciales");
    if (nombreEl) nombreEl.textContent = sesion.nombre;
    if (emailEl) emailEl.textContent = sesion.email;
    if (avatarEl) avatarEl.textContent = iniciales(sesion.nombre);
  }

  function initCerrarSesion() {
    var btn = document.getElementById("btnCerrarSesion");
    if (!btn) return;
    btn.addEventListener("click", function () {
      fetch("../api/admin/logout.php", { method: "POST" })
        .finally(function () { window.location.href = "login.html"; });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fetch("../api/admin/sesion.php")
      .then(function (res) {
        if (!res.ok) throw new Error("sin sesion");
        return res.json();
      })
      .then(function (body) {
        var sesion = body.data;
        pintarSidebar(sesion);
        initCerrarSesion();
        window.dlAdminSesion = sesion; // disponible para scripts especificos de cada pagina
      })
      .catch(function () {
        window.location.href = "login.html";
      });
  });
})();
