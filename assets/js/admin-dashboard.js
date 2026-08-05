/* ==========================================================================
   Dreamlike — admin-dashboard.js
   Metricas y tablas del dashboard, desde productos (fallback embebido) y
   pedidos admin (auth.js). No depende del orden de ejecucion de
   admin-comun.js: el guard de sesion corre en su propio listener.
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

  function pintarMetricas(productos, pedidos) {
    var activos = pedidos.filter(function (p) {
      return p.estado === "En camino" || p.estado === "Pendiente de pago";
    }).length;
    var stockBajo = productos.filter(function (p) { return p.stock <= 20; }).length;

    document.getElementById("metricaPedidosActivos").textContent = activos;
    document.getElementById("metricaProductos").textContent = productos.length;
    document.getElementById("metricaStockBajo").textContent = stockBajo;
  }

  function pintarUltimosPedidos(pedidos) {
    var tbody = document.getElementById("tablaUltimosPedidos");
    tbody.innerHTML = pedidos.slice(0, 5).map(function (p) {
      return (
        "<tr>" +
          "<td><strong>" + p.id + "</strong></td>" +
          "<td>" + p.cliente + "</td>" +
          "<td>" + formatoFecha(p.fecha) + "</td>" +
          "<td><span class=\"dl-estado " + claseEstado(p.estado) + "\">" + p.estado + "</span></td>" +
          "<td>" + formatoCLP(p.total) + "</td>" +
        "</tr>"
      );
    }).join("");
  }

  function pintarStockBajo(productos) {
    var tbody = document.getElementById("tablaStockBajo");
    var ordenados = productos.slice().sort(function (a, b) { return a.stock - b.stock; }).slice(0, 5);
    tbody.innerHTML = ordenados.map(function (p) {
      return (
        "<tr>" +
          "<td><img src=\"" + p.imagen.replace("assets/", "../assets/") + "\" alt=\"\"></td>" +
          "<td>" + p.nombre + "</td>" +
          "<td>" + p.categoria + "</td>" +
          "<td>" + p.stock + " unidades</td>" +
        "</tr>"
      );
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var productos = window.DL_PRODUCTOS_FALLBACK || [];
    var pedidos = window.dlAuth ? window.dlAuth.leerPedidosAdmin() : [];

    pintarMetricas(productos, pedidos);
    pintarUltimosPedidos(pedidos);
    pintarStockBajo(productos);
  });
})();
