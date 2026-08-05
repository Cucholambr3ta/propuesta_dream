/* ==========================================================================
   Dreamlike — carrito.js
   Carrito simulado en localStorage. Solo actualiza el badge del header.
   Prototipo: no hay checkout ni pago real.
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE = "dl_carrito";

  function leer() {
    try {
      var raw = localStorage.getItem(CLAVE);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function guardar(items) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(items));
    } catch (e) {
      /* localStorage no disponible (modo privado, etc.) — se ignora silenciosamente */
    }
  }

  function totalUnidades(items) {
    return items.reduce(function (acc, it) { return acc + (it.cantidad || 1); }, 0);
  }

  function pintarBadge() {
    var el = document.getElementById("carritoContador");
    if (!el) return;
    el.textContent = String(totalUnidades(leer()));
  }

  function agregar(sku, nombre, cantidad) {
    cantidad = cantidad || 1;
    var items = leer();
    var existente = items.find(function (it) { return it.sku === sku; });
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      items.push({ sku: sku, nombre: nombre, cantidad: cantidad });
    }
    guardar(items);
    pintarBadge();
  }

  function quitar(sku) {
    var items = leer().filter(function (it) { return it.sku !== sku; });
    guardar(items);
    pintarBadge();
  }

  function actualizarCantidad(sku, cantidad) {
    var items = leer();
    var existente = items.find(function (it) { return it.sku === sku; });
    if (existente) {
      existente.cantidad = Math.max(1, cantidad);
      guardar(items);
      pintarBadge();
    }
  }

  function vaciar() {
    guardar([]);
    pintarBadge();
  }

  // API minima expuesta para otros scripts (producto.js, productos-home.js, carrito-pagina.js)
  window.dlCarrito = {
    agregar: agregar,
    quitar: quitar,
    actualizarCantidad: actualizarCantidad,
    vaciar: vaciar,
    leer: leer,
    pintarBadge: pintarBadge
  };

  document.addEventListener("DOMContentLoaded", pintarBadge);
})();
