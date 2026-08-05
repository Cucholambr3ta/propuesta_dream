/* ==========================================================================
   Dreamlike — admin-pedidos.js
   Tabla de pedidos del panel admin con filtro por estado (local, sin backend).
   ========================================================================== */

(function () {
  "use strict";

  function formatoCLP(v) { return "$" + v.toLocaleString("es-CL"); }

  function formatoFecha(iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
  }

  function claseEstado(estado) {
    var mapa = {
      "Entregado": "dl-estado--entregado",
      "En camino": "dl-estado--camino",
      "Cotizacion enviada": "dl-estado--cotizacion",
      "Pendiente de pago": "dl-estado--pendiente"
    };
    return mapa[estado] || "dl-estado--pendiente";
  }

  function filaHTML(p) {
    return (
      "<tr>" +
        "<td><strong>" + p.id + "</strong></td>" +
        "<td>" + p.cliente + "</td>" +
        "<td>" + formatoFecha(p.fecha) + "</td>" +
        "<td><span class=\"dl-estado " + claseEstado(p.estado) + "\">" + p.estado + "</span></td>" +
        "<td>" + formatoCLP(p.total) + "</td>" +
        "<td><a href=\"#\" style=\"font-size:.85rem;font-weight:700\">Ver detalle</a></td>" +
      "</tr>"
    );
  }

  function pintar(pedidos) {
    document.getElementById("tablaPedidosAdmin").innerHTML = pedidos.map(filaHTML).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var pedidos = window.dlAuth ? window.dlAuth.leerPedidosAdmin() : [];
    pintar(pedidos);

    var botones = document.querySelectorAll(".dl-filtro-estado");
    botones.forEach(function (btn) {
      btn.addEventListener("click", function () {
        botones.forEach(function (b) { b.classList.remove("dl-activo"); });
        btn.classList.add("dl-activo");
        var estado = btn.getAttribute("data-estado");
        pintar(estado ? pedidos.filter(function (p) { return p.estado === estado; }) : pedidos);
      });
    });
  });
})();
