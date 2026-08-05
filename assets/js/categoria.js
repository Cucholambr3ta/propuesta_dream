/* ==========================================================================
   Dreamlike — categoria.js
   Pagina de categoria (categoria.html?slug=X): lee el slug de la URL, busca
   el nombre real en categorias.json/fallback, filtra productos.json por
   categoriaSlug y pinta el grid — mismo componente .dl-card que index.html.

   Sin ?slug= o slug invalido: cae a la primera categoria del catalogo
   (nunca deja la pagina en blanco — prototipo, no un 404 real).
   ========================================================================== */

(function () {
  "use strict";

  function slugDeUrl() {
    return new URLSearchParams(window.location.search).get("slug");
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

  function cargarJSON(ruta, fallback) {
    return fetch(ruta)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .catch(function () { return fallback || []; });
  }

  function pintar(slug, categorias, productos) {
    var categoria = categorias.find(function (c) { return c.slug === slug; }) || categorias[0];
    if (!categoria) return; // catalogo/categorias vacios: nada que mostrar

    document.getElementById("breadcrumbCategoria").textContent = categoria.nombre;
    document.getElementById("categoriaTitulo").textContent = categoria.nombre;
    document.title = categoria.nombre + " — Dreamlike Electricidad";

    var banner = document.getElementById("categoriaBanner");
    if (banner && categoria.banner) {
      banner.style.backgroundImage = "url('" + categoria.banner + "')";
    }

    var delaCategoria = productos.filter(function (p) { return p.categoriaSlug === categoria.slug; });

    var contador = document.getElementById("categoriaContador");
    var grid = document.getElementById("gridCategoria");
    var vacio = document.getElementById("categoriaVacia");

    if (!delaCategoria.length) {
      contador.textContent = "0 productos";
      grid.hidden = true;
      vacio.hidden = false;
      return;
    }

    contador.textContent = delaCategoria.length + (delaCategoria.length === 1 ? " producto" : " productos");
    grid.hidden = false;
    vacio.hidden = true;
    grid.innerHTML = delaCategoria.map(tarjetaHTML).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var slug = slugDeUrl();

    Promise.all([
      cargarJSON("assets/data/categorias.json", window.DL_CATEGORIAS_FALLBACK),
      cargarJSON("assets/data/productos.json", window.DL_PRODUCTOS_FALLBACK)
    ]).then(function (resultados) {
      pintar(slug, resultados[0], resultados[1]);
    });
  });
})();
