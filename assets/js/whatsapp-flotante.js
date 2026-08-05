/* ==========================================================================
   Dreamlike — whatsapp-flotante.js
   Burbuja flotante de WhatsApp, fija en la esquina inferior derecha, visible
   en todas las paginas publicas mientras se navega/hace scroll. Mismo numero
   que el resto del sitio (+56933713900) — no duplica logica, solo un link
   directo a wa.me con mensaje pre-armado.
   ========================================================================== */

(function () {
  "use strict";

  var NUMERO = "56933713900";
  var MENSAJE = "Hola! Quiero cotizar productos de Dreamlike Electricidad.";

  function construir() {
    var boton = document.createElement("a");
    boton.className = "dl-wsp-flotante";
    boton.href = "https://wa.me/" + NUMERO + "?text=" + encodeURIComponent(MENSAJE);
    boton.target = "_blank";
    boton.rel = "noopener";
    boton.setAttribute("aria-label", "Escribinos por WhatsApp");
    boton.innerHTML =
      '<svg class="dl-ico" viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.55L3 20l1.05-5.4A8.5 8.5 0 1 1 21 11.5Z"/></svg>';
    document.body.appendChild(boton);
  }

  document.addEventListener("DOMContentLoaded", construir);
})();
