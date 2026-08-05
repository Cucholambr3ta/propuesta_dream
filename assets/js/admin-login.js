/* ==========================================================================
   Dreamlike — admin-login.js
   Login real del panel admin contra api/admin/login.php (sesion PHP,
   password_hash/password_verify en el servidor — ver db/admin_usuarios).
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    fetch("../api/admin/sesion.php")
      .then(function (res) { if (res.ok) window.location.href = "index.html"; })
      .catch(function () {});

    var form = document.getElementById("formLoginAdmin");
    var error = document.getElementById("errorLogin");
    if (!form) return;

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var email = document.getElementById("email").value.trim();
      var password = document.getElementById("password").value;

      if (!email || email.indexOf("@") === -1 || !password) {
        error.textContent = "Ingresa un correo y contrasena validos.";
        error.classList.add("dl-auth__error--visible");
        return;
      }

      var boton = form.querySelector("button[type=submit]");
      boton.disabled = true;

      fetch("../api/admin/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
      })
        .then(function (res) {
          return res.json().then(function (body) {
            if (!res.ok || !body.ok) throw new Error(body.error || "No se pudo iniciar sesion");
            return body;
          });
        })
        .then(function () { window.location.href = "index.html"; })
        .catch(function (err) {
          error.textContent = err.message;
          error.classList.add("dl-auth__error--visible");
        })
        .finally(function () { boton.disabled = false; });
    });
  });
})();
