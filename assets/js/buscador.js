/* ==========================================================================
   Dreamlike — buscador.js
   Autocompletar del buscador del header: a partir de 2 caracteres, sugiere
   productos del catalogo (por nombre, sku o marca). Mismo patron
   fetch-con-fallback que productos-home.js. Compartido por todas las
   paginas que tienen .dl-buscador en el header.

   Expone window.dlBuscador.iniciar(form) para enganchar el mismo
   autocompletar sobre un .dl-buscador agregado despues del DOMContentLoaded
   inicial (ej. el panel mobile, construido async por mega-menu.js).
   ========================================================================== */

(function () {
  "use strict";

  var MIN_CHARS = 2;
  var MAX_SUGERENCIAS = 6;

  function formatoCLP(v) { return "$" + Number(v).toLocaleString("es-CL"); }

  function coincide(producto, q) {
    return (
      producto.nombre.toLowerCase().indexOf(q) !== -1 ||
      producto.sku.toLowerCase().indexOf(q) !== -1 ||
      producto.marca.toLowerCase().indexOf(q) !== -1
    );
  }

  function itemHTML(p) {
    var href = "producto.html?sku=" + encodeURIComponent(p.sku);
    return (
      '<a class="dl-buscador__item" href="' + href + '">' +
        '<img src="' + p.imagen + '" alt="">' +
        '<span class="dl-buscador__item-info">' +
          '<span class="dl-buscador__item-nombre">' + p.nombre + "</span>" +
          '<span class="dl-buscador__item-marca">' + p.marca + "</span>" +
        "</span>" +
        '<span class="dl-buscador__item-precio">' + formatoCLP(p.precio) + "</span>" +
      "</a>"
    );
  }

  function initBuscador(form, productos) {
    var input = form.querySelector("input[type=search]");
    if (!input) return;

    var panel = document.createElement("div");
    panel.className = "dl-buscador__sugerencias";
    form.appendChild(panel);

    function cerrar() {
      panel.classList.remove("dl-buscador__sugerencias--abierto");
      panel.innerHTML = "";
    }

    function buscar() {
      var q = input.value.trim().toLowerCase();
      if (q.length < MIN_CHARS) { cerrar(); return; }

      var resultados = productos.filter(function (p) { return coincide(p, q); }).slice(0, MAX_SUGERENCIAS);

      if (!resultados.length) {
        panel.innerHTML = '<p class="dl-buscador__vacio">Sin resultados para "' + input.value.trim() + '"</p>';
      } else {
        panel.innerHTML = resultados.map(itemHTML).join("");
      }
      panel.classList.add("dl-buscador__sugerencias--abierto");
    }

    input.addEventListener("input", buscar);
    input.addEventListener("focus", function () { if (input.value.trim().length >= MIN_CHARS) buscar(); });

    document.addEventListener("click", function (e) {
      if (!form.contains(e.target)) cerrar();
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") cerrar();
    });
  }

  function cargarProductos() {
    return fetch("assets/data/productos.json")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .catch(function () { return window.DL_PRODUCTOS_FALLBACK || []; });
  }

  // Cache simple: si ya se cargo el catalogo para el buscador del header,
  // reusarlo en vez de volver a pedirlo cuando se engancha el del panel mobile.
  var productosCache = null;
  function conProductos(cb) {
    if (productosCache) { cb(productosCache); return; }
    cargarProductos().then(function (productos) {
      productosCache = productos;
      cb(productos);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var formularios = document.querySelectorAll(".dl-buscador");
    if (!formularios.length) return;

    conProductos(function (productos) {
      formularios.forEach(function (form) { initBuscador(form, productos); });
    });
  });

  window.dlBuscador = {
    iniciar: function (form) { conProductos(function (productos) { initBuscador(form, productos); }); }
  };
})();
