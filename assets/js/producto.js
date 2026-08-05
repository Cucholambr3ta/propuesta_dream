/* ==========================================================================
   Dreamlike — producto.js
   PDP dinamica: lee ?sku=XXX de la URL, busca el producto en productos.json
   (fetch con fallback embebido, mismo patron que el resto del sitio) y puebla
   toda la pagina desde ahi — titulo, precio, stock, breadcrumb, specs,
   descripcion, galeria, boton de WhatsApp y relacionados por categoria.

   Sin ?sku= o SKU no encontrado: usa el primer producto del catalogo como
   demo (nunca deja la pagina vacia — es un prototipo, no un 404 real).
   ========================================================================== */

(function () {
  "use strict";

  var STOCK_MAX = 9999;
  var producto = null;

  function formatoCLP(valor) {
    return "$" + valor.toLocaleString("es-CL");
  }

  function skuDeUrl() {
    return new URLSearchParams(window.location.search).get("sku");
  }

  function buscarProducto(catalogo, sku) {
    if (sku) {
      var encontrado = catalogo.find(function (p) { return p.sku === sku; });
      if (encontrado) return encontrado;
    }
    return catalogo[0] || null;
  }

  /* --- Poblar la pagina con el producto resuelto ----------------------------- */

  function pintarProducto(p) {
    document.title = p.nombre + " — Dreamlike Electricidad";

    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", p.nombre + " — " + p.marca + ". " + p.descripcion);

    // Breadcrumb: categoria real del producto, enlaza a su pagina de categoria
    var breadcrumbCat = document.getElementById("breadcrumbCategoria");
    if (breadcrumbCat) {
      breadcrumbCat.textContent = p.categoria;
      breadcrumbCat.href = "categoria.html?slug=" + encodeURIComponent(p.categoriaSlug);
    }
    var breadcrumbNombre = document.getElementById("breadcrumbNombre");
    if (breadcrumbNombre) breadcrumbNombre.textContent = p.nombre;

    // Galeria: el catalogo demo solo trae 1 imagen por producto; se repite
    // en las 3 miniaturas para no dejar el patron de galeria vacio.
    var principal = document.getElementById("galeriaPrincipal");
    if (principal) {
      principal.src = p.imagen;
      principal.alt = p.nombre + " — vista principal";
    }
    document.querySelectorAll(".dl-mini").forEach(function (mini) {
      mini.setAttribute("data-img", p.imagen);
      var img = mini.querySelector("img");
      if (img) img.src = p.imagen;
    });

    // Bloque de compra
    document.getElementById("compraMarca").textContent = p.marca;
    document.getElementById("compraTitulo").textContent = p.nombre;
    document.getElementById("compraSku").textContent = "SKU: " + p.sku;
    document.getElementById("compraPrecio").textContent = formatoCLP(p.precio);

    var stockEl = document.getElementById("compraStock");
    var badge = p.stock > 20
      ? '<span class="dl-badge dl-badge--stock">En stock · ' + p.stock + " unidades</span>"
      : '<span class="dl-badge dl-badge--pocas">Ultimas unidades · ' + p.stock + " disponibles</span>";
    stockEl.innerHTML = badge;

    var inputCantidad = document.getElementById("inputCantidad");
    if (inputCantidad) inputCantidad.max = p.stock;

    // Boton WhatsApp: mensaje prellenado con el producto real
    var btnWsp = document.getElementById("btnCotizarWsp");
    if (btnWsp) {
      var texto = "Hola, quiero cotizar: " + p.nombre + " (SKU " + p.sku + ")";
      btnWsp.href = "https://wa.me/56933713900?text=" + encodeURIComponent(texto);
    }

    // Tabs: descripcion + tabla de specs generada desde el objeto specs{}
    var descEl = document.getElementById("tabDescripcionTexto");
    if (descEl) descEl.textContent = p.descripcion;

    var specsBody = document.getElementById("specsBody");
    if (specsBody && p.specs) {
      specsBody.innerHTML = Object.keys(p.specs).map(function (clave) {
        return "<tr><th>" + clave + "</th><td>" + p.specs[clave] + "</td></tr>";
      }).join("");
    }
  }

  /* --- Galeria de miniaturas ---------------------------------------------- */
  function initGaleria() {
    var principal = document.getElementById("galeriaPrincipal");
    var minis = document.querySelectorAll(".dl-mini");
    if (!principal || !minis.length) return;

    minis.forEach(function (mini) {
      mini.addEventListener("click", function () {
        principal.src = mini.getAttribute("data-img");
        minis.forEach(function (m) { m.classList.remove("dl-mini--activa"); });
        mini.classList.add("dl-mini--activa");
      });
    });
  }

  /* --- Selector de cantidad ------------------------------------------------ */
  function initCantidad() {
    var input = document.getElementById("inputCantidad");
    var btnMenos = document.getElementById("btnMenos");
    var btnMas = document.getElementById("btnMas");
    if (!input || !btnMenos || !btnMas) return;

    function clamp(v) {
      var max = parseInt(input.max, 10) || STOCK_MAX;
      v = parseInt(v, 10);
      if (isNaN(v) || v < 1) v = 1;
      if (v > max) v = max;
      return v;
    }

    btnMenos.addEventListener("click", function () {
      input.value = clamp(parseInt(input.value, 10) - 1);
    });
    btnMas.addEventListener("click", function () {
      input.value = clamp(parseInt(input.value, 10) + 1);
    });
    input.addEventListener("change", function () {
      input.value = clamp(input.value);
    });
  }

  /* --- Agregar al carro ----------------------------------------------------- */
  function initAgregarCarro() {
    var btn = document.getElementById("btnAgregarCarro");
    var input = document.getElementById("inputCantidad");
    if (!btn || !window.dlCarrito) return;

    btn.addEventListener("click", function () {
      if (!producto) return;
      var cantidad = input ? parseInt(input.value, 10) || 1 : 1;
      window.dlCarrito.agregar(producto.sku, producto.nombre, cantidad);

      var textoOriginal = btn.textContent.trim();
      btn.textContent = "Agregado ✓";
      window.setTimeout(function () {
        btn.innerHTML =
          '<svg class="dl-ico" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1.2"/><circle cx="18" cy="21" r="1.2"/><path d="M2 3h3l2.6 12.4A2 2 0 0 0 9.5 17H18a2 2 0 0 0 2-1.6L21.5 7H6"/></svg> ' +
          textoOriginal;
      }, 1600);
    });
  }

  /* --- Tabs ------------------------------------------------------------------ */
  function initTabs() {
    var botones = document.querySelectorAll(".dl-tabs__btn");
    if (!botones.length) return;

    botones.forEach(function (btn) {
      btn.addEventListener("click", function () {
        botones.forEach(function (b) {
          b.setAttribute("aria-selected", "false");
          var panel = document.getElementById(b.getAttribute("aria-controls"));
          if (panel) panel.hidden = true;
        });
        btn.setAttribute("aria-selected", "true");
        var panelActivo = document.getElementById(btn.getAttribute("aria-controls"));
        if (panelActivo) panelActivo.hidden = false;
      });
    });
  }

  /* --- Relacionados: mismos productos de la MISMA categoria ------------------ */
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

  function pintarRelacionados(catalogo) {
    var grid = document.getElementById("gridRelacionados");
    var titulo = document.getElementById("tituloRelacionados");
    if (!grid || !producto) return;

    // Prioriza la misma categoria; si no hay suficientes, completa con el resto
    var mismaCategoria = catalogo.filter(function (p) {
      return p.sku !== producto.sku && p.categoriaSlug === producto.categoriaSlug;
    });
    var otros = catalogo.filter(function (p) {
      return p.sku !== producto.sku && p.categoriaSlug !== producto.categoriaSlug;
    });
    var relacionados = mismaCategoria.concat(otros).slice(0, 4);

    if (titulo) {
      titulo.textContent = mismaCategoria.length
        ? "Mas de " + producto.categoria
        : "Productos relacionados";
    }
    grid.innerHTML = relacionados.map(tarjetaHTML).join("");
  }

  /* --- Carga del catalogo y resolucion del producto --------------------------- */

  function cargarCatalogo() {
    return fetch("assets/data/productos.json")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .catch(function () {
        return window.DL_PRODUCTOS_FALLBACK || [];
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    cargarCatalogo().then(function (catalogo) {
      producto = buscarProducto(catalogo, skuDeUrl());
      if (!producto) return;

      pintarProducto(producto);
      pintarRelacionados(catalogo);

      initGaleria();
      initCantidad();
      initAgregarCarro();
      initTabs();
    });
  });
})();
