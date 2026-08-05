/* ==========================================================================
   Dreamlike — login.js
   Formulario de login simulado: cualquier email/password valido "entra".
   ========================================================================== */

(function () {
  "use strict";

  // Si viene de un flujo que pidio login (ej. "Solicitar cotizacion" desde
  // el carrito sin sesion), ?redirect= indica a donde volver tras entrar.
  // Los parametros adicionales (ej. accion=cotizar) se preservan intactos
  // para que la pagina destino sepa que retomar la accion pendiente.
  function destinoTrasLogin() {
    var params = new URLSearchParams(window.location.search);
    var redirect = params.get("redirect");
    if (!redirect) return "mi-cuenta.html";
    params.delete("redirect");
    var resto = params.toString();
    return redirect + (resto ? "?" + resto : "");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var destino = destinoTrasLogin();

    // Si ya hay sesion, saltar directo (respeta ?redirect= igual que un login nuevo)
    if (window.dlAuth && window.dlAuth.leerSesion()) {
      window.location.href = destino;
      return;
    }

    var form = document.getElementById("formLogin");
    var error = document.getElementById("errorLogin");
    if (!form) return;

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var email = document.getElementById("email").value.trim();

      if (!email || email.indexOf("@") === -1) {
        error.textContent = "Ingresa un correo valido para continuar.";
        error.classList.add("dl-auth__error--visible");
        return;
      }

      error.classList.remove("dl-auth__error--visible");
      window.dlAuth.iniciarSesion(email);
      window.location.href = destino;
    });
  });
})();
