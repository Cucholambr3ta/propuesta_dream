/* ==========================================================================
   Dreamlike — productos-home.js
   Renderiza el grid de "Productos destacados" en index.html desde
   assets/data/productos.json.

   Nota tecnica: fetch() de un JSON local falla bajo file:// por la politica
   CORS del navegador (no hay servidor que responda). Para que el prototipo
   funcione tanto abierto con doble clic como servido por HTTP/cPanel, se usa
   fetch() como via principal y, si falla, se recurre a una copia embebida de
   los mismos datos como respaldo (window.DL_PRODUCTOS_FALLBACK, cargada por
   assets/js/productos-fallback.js).
   ========================================================================== */

(function () {
  "use strict";

  function formatoCLP(valor) {
    return "$" + valor.toLocaleString("es-CL");
  }

  function tarjetaHTML(p) {
    var badge = p.stock > 20
      ? '<span class="dl-badge dl-badge--stock">En stock</span>'
      : '<span class="dl-badge dl-badge--pocas">Ultimas unidades</span>';
    var href = "producto.html?sku=" + encodeURIComponent(p.sku);

    return (
      '<article class="dl-card">' +
        '<a class="dl-card__img" href="' + href + '" aria-label="Ver ' + p.nombre + '">' +
          '<img src="' + p.imagen + '" alt="' + p.nombre + '" loading="lazy">' +
          '<span class="dl-card__pill">' +
            '<span class="dl-card__nombre">' + p.nombre + "</span>" +
            '<span class="dl-card__precio">' + formatoCLP(p.precio) + "</span>" +
          "</span>" +
        "</a>" +
        '<div class="dl-card__cuerpo">' +
          '<span class="dl-card__marca">' + p.marca + "</span>" +
          '<span class="dl-card__iva">IVA incluido</span>' +
          '<div class="dl-card__pie">' + badge + "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function pintar(productos) {
    var grid = document.getElementById("gridProductos");
    if (!grid) return;
    // Destacados: primeros 8 del catalogo demo
    grid.innerHTML = productos.slice(0, 8).map(tarjetaHTML).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    fetch("assets/data/productos.json")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(pintar)
      .catch(function () {
        // Sin servidor HTTP (file://) o error de red: usa el respaldo embebido
        if (window.DL_PRODUCTOS_FALLBACK) {
          pintar(window.DL_PRODUCTOS_FALLBACK);
        }
      });
  });
})();
