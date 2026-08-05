/* ==========================================================================
   Dreamlike — mapa-modal.js
   Click en la direccion del footer abre un modal con Google Maps embebido
   (iframe publico, sin API key), animando una expansion desde el punto de
   click. Cierra con X, click en overlay, o Escape.

   Requiere que el elemento clickeable tenga la clase .dl-footer__mapa-trigger
   (agregada al <li> de direccion en el footer de cada pagina que lo use).
   ========================================================================== */

(function () {
  "use strict";

  var DIRECCION = "Av. El Ventisquero 1225 Bod. 49, Renca, Chile";
  var MAPA_SRC = "https://www.google.com/maps?q=" + encodeURIComponent(DIRECCION) + "&output=embed";

  function construirModal() {
    var overlay = document.createElement("div");
    overlay.className = "dl-mapa-overlay";
    overlay.id = "mapaOverlay";

    var modal = document.createElement("div");
    modal.className = "dl-mapa-modal";
    modal.id = "mapaModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Ubicacion de Dreamlike Electricidad");

    modal.innerHTML =
      '<div class="dl-mapa-modal__cabecera">' +
        '<div class="dl-mapa-modal__titulo">' +
          "<div>" +
            '<span class="dl-mapa-modal__eyebrow">Ubicacion actual</span>' +
            '<svg class="dl-ico" viewBox="0 0 24 24" style="display:inline;vertical-align:-4px;margin-right:6px"><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>' +
            "Dreamlike Electricidad" +
          "</div>" +
        "</div>" +
        '<button class="dl-mapa-modal__cerrar" id="btnCerrarMapa" aria-label="Cerrar mapa" type="button">' +
          '<svg class="dl-ico" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        "</button>" +
      "</div>" +
      '<iframe class="dl-mapa-modal__mapa" id="mapaIframe" title="Mapa: ' + DIRECCION + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>' +
      '<div class="dl-mapa-modal__pie">' +
        '<span class="dl-mapa-modal__coords">' + DIRECCION + "</span>" +
        '<a class="dl-btn dl-btn--secundario dl-btn--sm" href="https://maps.google.com/?q=' + encodeURIComponent(DIRECCION) + '" target="_blank" rel="noopener">Abrir en Google Maps</a>' +
      "</div>";

    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    return { overlay: overlay, modal: modal };
  }

  document.addEventListener("DOMContentLoaded", function () {
    var triggers = document.querySelectorAll(".dl-footer__mapa-trigger");
    if (!triggers.length) return;

    var refs = construirModal();
    var iframeCargado = false;
    var ultimoFoco = null;

    function abrir(origenX, origenY) {
      // transform-origin dinamico: el modal "crece" desde el punto de click
      refs.modal.style.transformOrigin = origenX + "px " + origenY + "px";

      if (!iframeCargado) {
        document.getElementById("mapaIframe").src = MAPA_SRC;
        iframeCargado = true;
      }

      refs.overlay.classList.add("dl-mapa-overlay--abierto");
      refs.modal.classList.add("dl-mapa-modal--abierto");
      document.body.style.overflow = "hidden";
      document.getElementById("btnCerrarMapa").focus();
    }

    function cerrar() {
      refs.overlay.classList.remove("dl-mapa-overlay--abierto");
      refs.modal.classList.remove("dl-mapa-modal--abierto");
      document.body.style.overflow = "";
      if (ultimoFoco) ultimoFoco.focus();
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function (ev) {
        ev.preventDefault();
        ultimoFoco = trigger;
        abrir(ev.clientX, ev.clientY);
      });
    });

    refs.overlay.addEventListener("click", cerrar);
    document.getElementById("btnCerrarMapa").addEventListener("click", cerrar);

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && refs.modal.classList.contains("dl-mapa-modal--abierto")) {
        cerrar();
      }
    });
  });
})();
