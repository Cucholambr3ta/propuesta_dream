/* ==========================================================================
   Dreamlike — auth-modal.js
   Modal de login/registro (panel lateral desde la derecha), mismo patron que
   el drawer de carrito (carrito-drawer.js): creado dinamicamente, appendeado
   a <body>, reusa .dl-overlay compartido con el drawer de carrito y el panel
   mobile. Login y registro simulados (window.dlAuth.iniciarSesion) — mismo
   nivel de "auth falsa" que el resto del sitio, sin backend de usuarios.

   Expone window.dlAuthModal.abrir(callback) para que otros flujos (header,
   "Solicitar cotizacion") lo abran y encadenen una accion pendiente que se
   dispara justo despues de loguear, sin navegar de pagina.
   ========================================================================== */

(function () {
  "use strict";

  var refs = null; // { modal, overlay } una vez construido
  var callbackPendiente = null;

  function construirModal() {
    var modal = document.createElement("div");
    modal.className = "dl-auth-modal";
    modal.id = "authModal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML =
      '<div class="dl-auth-modal__cabecera">' +
        '<img src="assets/img/logo-oscuro.svg" alt="Dreamlike Electricidad">' +
        '<button class="dl-auth-modal__cerrar" id="btnCerrarAuthModal" aria-label="Cerrar" type="button">' +
          '<svg class="dl-ico" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        "</button>" +
      "</div>" +
      '<div class="dl-auth-modal__tabs">' +
        '<button class="dl-auth-modal__tab dl-auth-modal__tab--activo" id="tabAcceder" type="button">Acceder</button>' +
        '<button class="dl-auth-modal__tab" id="tabRegistrarte" type="button">Regístrate</button>' +
      "</div>" +
      '<div class="dl-auth-modal__cuerpo">' +
        '<form class="dl-auth-modal__form dl-auth-modal__form--activo" id="formAccederModal" novalidate>' +
          '<div class="dl-campo dl-auth-modal__campo">' +
            '<label class="dl-sr" for="modalEmail">Nombre de usuario o correo electronico</label>' +
            '<div class="dl-auth-modal__control">' +
              '<svg class="dl-ico" aria-hidden="true" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c0-3.1 2.5-5 5.5-5s5.5 1.9 5.5 5"/><path d="M17 9v6M14 12h6"/></svg>' +
              '<input type="email" id="modalEmail" placeholder="Nombre de usuario / Correo electrónico" required>' +
              '<span class="dl-auth-modal__requerido" aria-hidden="true">*</span>' +
            '</div>' +
          "</div>" +
          '<div class="dl-campo dl-auth-modal__campo">' +
            '<label class="dl-sr" for="modalPassword">Contrasena</label>' +
            '<div class="dl-auth-modal__control">' +
              '<svg class="dl-ico" aria-hidden="true" viewBox="0 0 24 24"><path d="M7 14V9a5 5 0 0 1 10 0v1"/><rect x="4" y="10" width="11" height="8" rx="2" transform="rotate(-45 9.5 14)"/></svg>' +
              '<input type="password" id="modalPassword" placeholder="Contraseña" required minlength="1">' +
              '<button class="dl-auth-modal__ver-password" id="btnVerPassword" type="button" aria-label="Mostrar contraseña" aria-pressed="false">' +
                '<svg class="dl-ico" aria-hidden="true" viewBox="0 0 24 24"><path d="M2.5 12s3.3-5 9.5-5 9.5 5 9.5 5-3.3 5-9.5 5-9.5-5-9.5-5Z"/><circle cx="12" cy="12" r="2.5"/></svg>' +
              '</button>' +
              '<span class="dl-auth-modal__requerido" aria-hidden="true">*</span>' +
            '</div>' +
          "</div>" +
          '<div class="dl-auth-modal__extra">' +
            '<label class="dl-auth-modal__recordarme">' +
              '<input type="checkbox" id="modalRecordarme">' +
              "<span>Recuerdame</span>" +
            "</label>" +
            '<a class="dl-auth-modal__olvido" href="login.html">Has olvidado tu contrasena?</a>' +
          "</div>" +
          '<p class="dl-auth__error" id="errorAccederModal"></p>' +
          '<button type="submit" class="dl-btn dl-btn--primario dl-btn--bloque">Acceder</button>' +
        "</form>" +
        '<form class="dl-auth-modal__form" id="formRegistrarteModal" novalidate>' +
          '<div class="dl-campo">' +
            '<label for="modalNombre">Nombre</label>' +
            '<input type="text" id="modalNombre" placeholder="Tu nombre" required>' +
          "</div>" +
          '<div class="dl-campo">' +
            '<label for="modalApellido">Apellido</label>' +
            '<input type="text" id="modalApellido" placeholder="Tu apellido" required>' +
          "</div>" +
          '<div class="dl-campo">' +
            '<label for="modalRegEmail">Correo electronico</label>' +
            '<input type="email" id="modalRegEmail" placeholder="tu@correo.cl" required>' +
          "</div>" +
          '<div class="dl-campo">' +
            '<label for="modalRegPassword">Contrasena</label>' +
            '<input type="password" id="modalRegPassword" placeholder="••••••••" required minlength="1">' +
          "</div>" +
          '<div class="dl-campo">' +
            '<label for="modalRegConfirmar">Confirmar contrasena</label>' +
            '<input type="password" id="modalRegConfirmar" placeholder="••••••••" required minlength="1">' +
          "</div>" +
          '<label class="dl-auth-modal__checkbox">' +
            '<input type="checkbox" id="modalTerminos" required>' +
            "<span>Acepto los Terminos de Servicio y Privacidad</span>" +
          "</label>" +
          '<p class="dl-auth__error" id="errorRegistrarteModal"></p>' +
          '<button type="submit" class="dl-btn dl-btn--primario dl-btn--bloque">Regístrate</button>' +
        "</form>" +
      "</div>";

    var overlay = document.getElementById("overlayMenu") || document.createElement("div");
    if (!overlay.id) {
      overlay.className = "dl-overlay";
      overlay.id = "overlayMenu";
      overlay.hidden = true;
      document.body.appendChild(overlay);
    }

    document.body.appendChild(modal);
    var resultado = { modal: modal, overlay: overlay };

    document.getElementById("tabAcceder").addEventListener("click", function () { cambiarTab("acceder"); });
    document.getElementById("tabRegistrarte").addEventListener("click", function () { cambiarTab("registrarte"); });
    document.getElementById("btnCerrarAuthModal").addEventListener("click", cerrar);
    document.getElementById("btnVerPassword").addEventListener("click", alternarPassword);
    overlay.addEventListener("click", function () {
      if (modal.classList.contains("dl-auth-modal--abierto")) cerrar();
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && modal.classList.contains("dl-auth-modal--abierto")) cerrar();
    });
    initFormAcceder();
    initFormRegistrarte();

    return resultado;
  }

  function mostrarError(id, mensaje) {
    var el = document.getElementById(id);
    el.textContent = mensaje;
    el.classList.add("dl-auth__error--visible");
  }
  function ocultarError(id) {
    document.getElementById(id).classList.remove("dl-auth__error--visible");
  }

  function cambiarTab(tab) {
    var esAcceder = tab === "acceder";
    document.getElementById("tabAcceder").classList.toggle("dl-auth-modal__tab--activo", esAcceder);
    document.getElementById("tabRegistrarte").classList.toggle("dl-auth-modal__tab--activo", !esAcceder);
    document.getElementById("formAccederModal").classList.toggle("dl-auth-modal__form--activo", esAcceder);
    document.getElementById("formRegistrarteModal").classList.toggle("dl-auth-modal__form--activo", !esAcceder);
  }

  function alternarPassword() {
    var input = document.getElementById("modalPassword");
    var boton = document.getElementById("btnVerPassword");
    var mostrar = input.type === "password";
    input.type = mostrar ? "text" : "password";
    boton.setAttribute("aria-pressed", String(mostrar));
    boton.setAttribute("aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña");
  }

  function sesionIniciada() {
    if (window.dlAuth && window.dlAuth.pintarHeaderCuenta) window.dlAuth.pintarHeaderCuenta();
    // Capturar el callback ANTES de cerrar() — cerrar() limpia
    // callbackPendiente a null, así que llamarlo primero lo perdería.
    var cb = callbackPendiente;
    cerrar();
    if (cb) cb();
  }

  function initFormAcceder() {
    document.getElementById("formAccederModal").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var email = document.getElementById("modalEmail").value.trim();
      if (!email || email.indexOf("@") === -1) {
        mostrarError("errorAccederModal", "Ingresa un correo valido para continuar.");
        return;
      }
      ocultarError("errorAccederModal");
      window.dlAuth.iniciarSesion(email);
      sesionIniciada();
    });
  }

  function initFormRegistrarte() {
    document.getElementById("formRegistrarteModal").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var nombre = document.getElementById("modalNombre").value.trim();
      var apellido = document.getElementById("modalApellido").value.trim();
      var email = document.getElementById("modalRegEmail").value.trim();
      var password = document.getElementById("modalRegPassword").value;
      var confirmar = document.getElementById("modalRegConfirmar").value;
      var terminos = document.getElementById("modalTerminos").checked;

      if (!nombre || !apellido) {
        mostrarError("errorRegistrarteModal", "Ingresa tu nombre y apellido.");
        return;
      }
      if (!email || email.indexOf("@") === -1) {
        mostrarError("errorRegistrarteModal", "Ingresa un correo valido.");
        return;
      }
      if (!password || password !== confirmar) {
        mostrarError("errorRegistrarteModal", "Las contrasenas no coinciden.");
        return;
      }
      if (!terminos) {
        mostrarError("errorRegistrarteModal", "Debes aceptar los terminos para continuar.");
        return;
      }

      ocultarError("errorRegistrarteModal");
      window.dlAuth.iniciarSesion(email, nombre + " " + apellido);
      sesionIniciada();
    });
  }

  function abrir(callback) {
    if (!refs) refs = construirModal();
    callbackPendiente = callback || null;

    cambiarTab("acceder");
    refs.modal.classList.add("dl-auth-modal--abierto");
    refs.overlay.hidden = false;
    document.body.style.overflow = "hidden";
    refs.modal.setAttribute("aria-hidden", "false");
    document.getElementById("modalEmail").focus();
  }

  function cerrar() {
    if (!refs) return;
    refs.modal.classList.remove("dl-auth-modal--abierto");
    // Overlay compartido con drawer de carrito / panel mobile: solo ocultar
    // si esos tampoco estan abiertos, mismo criterio que carrito-drawer.js.
    var carrito = document.getElementById("drawerCarrito");
    var panelMobile = document.getElementById("panelMobile");
    var otroAbierto =
      (carrito && carrito.classList.contains("dl-drawer-carrito--abierto")) ||
      (panelMobile && panelMobile.classList.contains("dl-panel-mobile--abierto"));
    if (!otroAbierto) {
      refs.overlay.hidden = true;
      document.body.style.overflow = "";
    }
    refs.modal.setAttribute("aria-hidden", "true");
    callbackPendiente = null;
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.dlAuth) return;

    // Construccion diferida: el modal solo se arma la primera vez que se
    // abre (abrir()), no en cada carga de pagina — evita trabajo si el
    // usuario nunca hace click en "Iniciar Sesion".
    window.dlAuthModal = { abrir: abrir, cerrar: cerrar };
  });
})();
