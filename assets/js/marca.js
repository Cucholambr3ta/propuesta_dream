/* ==========================================================================
   Dreamlike — marca.js
   Pagina de marca (marca.html?nombre=X): lee el nombre de marca de la URL,
   filtra productos.json por p.marca y pinta el grid — mismo componente
   .dl-card y mismo patron fetch-con-fallback que categoria.js.

   Sin ?nombre= o marca sin productos: cae a la primera marca real del
   catalogo (nunca deja la pagina en blanco — prototipo, no un 404 real).
   ========================================================================== */

(function () {
  "use strict";

  function marcaDeUrl() {
    return new URLSearchParams(window.location.search).get("nombre");
  }

  function formatoCLP(v) { return "$" + v.toLocaleString("es-CL"); }

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

  function cargarProductos() {
    return fetch("assets/data/productos.json")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .catch(function () { return window.DL_PRODUCTOS_FALLBACK || []; });
  }

  function pintar(nombreBuscado, productos) {
    var marcasReales = productos.map(function (p) { return p.marca; });
    var marca = marcasReales.indexOf(nombreBuscado) !== -1 ? nombreBuscado : marcasReales[0];
    if (!marca) return; // catalogo vacio: nada que mostrar

    document.getElementById("breadcrumbMarca").textContent = marca;
    document.getElementById("marcaTitulo").textContent = marca;
    document.title = marca + " — Dreamlike Electricidad";

    var deLaMarca = productos.filter(function (p) { return p.marca === marca; });

    var contador = document.getElementById("marcaContador");
    var grid = document.getElementById("gridMarca");
    var vacio = document.getElementById("marcaVacia");

    if (!deLaMarca.length) {
      contador.textContent = "0 productos";
      grid.hidden = true;
      vacio.hidden = false;
      return;
    }

    contador.textContent = deLaMarca.length + (deLaMarca.length === 1 ? " producto" : " productos");
    grid.hidden = false;
    vacio.hidden = true;
    grid.innerHTML = deLaMarca.map(tarjetaHTML).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var nombre = marcaDeUrl();
    cargarProductos().then(function (productos) {
      pintar(nombre, productos);
    });
  });
})();
