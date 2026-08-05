/* ==========================================================================
   Dreamlike — mega-menu.js
   Reemplaza nav.js (carrusel de pills + hamburguesa placeholder).

   Cubre, desde una sola fuente de datos (assets/data/categorias.json +
   assets/js/categorias-fallback.js, mismo patron fetch-con-fallback que
   productos.json/productos-fallback.js):

   1. Mega-menu desktop (>=1024px): barra de triggers que abren un panel
      multi-columna al hover/focus. Un solo panel abierto a la vez.
   2. Panel mobile (<1024px) con acordeon: el boton hamburguesa (#btnMenuMobile,
      ya existente en el header) abre un panel deslizante lateral generado
      desde los mismos datos.

   Nota: cada item de columna es un producto REAL del catalogo (categorias.json
   se genera desde productos.json — ver el script en README.md). El link de
   cada item apunta directo a producto.html?sku=X; solo "Ver todo {categoria}"
   apunta a categoria.html?slug=X (listado completo de esa categoria).
   ========================================================================== */

(function () {
  "use strict";

  var MEDIA_DESKTOP = "(min-width: 1024px)";
  var DELAY_CIERRE_MS = 150;

  // Prefijo relativo segun la profundidad de la pagina (raiz vs admin/*.html),
  // detectado a partir de la propia URL del script — evita depender de que
  // el fetch falle "por casualidad" en admin/ para caer al fallback.
  function prefijoAssets() {
    return window.location.pathname.indexOf("/admin/") !== -1 ? "../" : "";
  }

  function cargarCategorias() {
    return fetch(prefijoAssets() + "assets/data/categorias.json")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .catch(function () {
        return window.DL_CATEGORIAS_FALLBACK || [];
      });
  }

  /* --- Construccion del mega-menu desktop ------------------------------------ */

  function construirMegaDesktop(categorias, listaEl) {
    listaEl.innerHTML = categorias.map(function (cat, i) {
      var panelId = "mega-" + cat.slug;
      var columnas = cat.columnas.map(function (col) {
        var links = col.items.map(function (item) {
          return '<li><a href="' + prefijoAssets() + 'producto.html?sku=' + encodeURIComponent(item.sku) + '">' + item.nombre + "</a></li>";
        }).join("");
        return (
          '<div class="dl-mega__col">' +
            '<h3 class="dl-mega__titulo">' + col.titulo + "</h3>" +
            "<ul>" + links + "</ul>" +
          "</div>"
        );
      }).join("");

      return (
        '<li class="dl-nav__cat">' +
          '<button class="dl-nav__trigger" aria-expanded="false" aria-controls="' + panelId + '" data-slug="' + cat.slug + '">' +
            cat.nombre +
          "</button>" +
          '<div class="dl-mega" id="' + panelId + '" role="region" aria-label="Subcategorias de ' + cat.nombre + '">' +
            '<div class="dl-mega__grid">' + columnas + "</div>" +
            '<a class="dl-mega__vertodo" href="' + prefijoAssets() + 'categoria.html?slug=' + cat.slug + '">Ver todo ' + cat.nombre + " →</a>" +
          "</div>" +
        "</li>"
      );
    }).join("");
  }

  function initMegaDesktop(listaEl) {
    var triggers = listaEl.querySelectorAll(".dl-nav__trigger");
    var cerrarTimer = null;

    function cerrarTodos(excepto) {
      triggers.forEach(function (t) {
        if (t === excepto) return;
        t.setAttribute("aria-expanded", "false");
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.classList.remove("dl-mega--abierto");
      });
    }

    function abrir(trigger) {
      window.clearTimeout(cerrarTimer);
      cerrarTodos(trigger);
      trigger.setAttribute("aria-expanded", "true");
      var panel = document.getElementById(trigger.getAttribute("aria-controls"));
      if (panel) {
        // Animacion "globo": el panel escala desde el punto horizontal del
        // trigger que lo abrio, no siempre desde el centro — ver --dl-mega-origen-x
        // en main.css. contenedor es .dl-nav__in, mismo containing block del panel.
        var contenedor = listaEl.closest(".dl-nav__in");
        if (contenedor) {
          var rectTrigger = trigger.getBoundingClientRect();
          var rectContenedor = contenedor.getBoundingClientRect();
          var centroTrigger = rectTrigger.left + rectTrigger.width / 2 - rectContenedor.left;
          var porcentaje = (centroTrigger / rectContenedor.width) * 100;
          panel.style.setProperty("--dl-mega-origen-x", porcentaje + "%");
        }
        panel.classList.add("dl-mega--abierto");
      }
    }

    function programarCierre() {
      cerrarTimer = window.setTimeout(function () { cerrarTodos(null); }, DELAY_CIERRE_MS);
    }

    triggers.forEach(function (trigger) {
      var li = trigger.closest(".dl-nav__cat");
      var panel = document.getElementById(trigger.getAttribute("aria-controls"));

      li.addEventListener("mouseenter", function () { abrir(trigger); });
      li.addEventListener("mouseleave", programarCierre);

      trigger.addEventListener("focus", function () { abrir(trigger); });
      trigger.addEventListener("click", function (ev) {
        ev.preventDefault();
        var abierto = trigger.getAttribute("aria-expanded") === "true";
        if (abierto) { cerrarTodos(null); } else { abrir(trigger); }
      });

      if (panel) {
        panel.addEventListener("mouseenter", function () { window.clearTimeout(cerrarTimer); });
        panel.addEventListener("mouseleave", programarCierre);
      }
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        cerrarTodos(null);
        var activo = document.activeElement;
        if (activo && activo.classList.contains("dl-nav__trigger")) activo.blur();
      }
    });

    // Cierra si el foco sale del nav (navegacion por teclado hacia el resto de la pagina)
    listaEl.addEventListener("focusout", function () {
      window.setTimeout(function () {
        if (!listaEl.contains(document.activeElement)) cerrarTodos(null);
      }, 0);
    });
  }

  /* --- Construccion del panel mobile con acordeon ---------------------------- */

  function construirPanelMobile(categorias) {
    var panel = document.createElement("div");
    panel.className = "dl-panel-mobile";
    panel.id = "panelMobile";
    panel.setAttribute("aria-hidden", "true");

    // Menu mobile: SOLO nombres de categoria, cada uno un link directo a
    // categoria.html?slug=X — nunca se muestran productos ni subcategorias
    // aqui (pedido explicito del cliente), la flecha es solo decorativa.
    var items = categorias.map(function (cat) {
      return (
        '<li class="dl-acordeon__item">' +
          '<a class="dl-acordeon__nombre" href="' + prefijoAssets() + 'categoria.html?slug=' + cat.slug + '">' +
            cat.nombre +
            '<svg class="dl-ico dl-acordeon__flecha" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>' +
          "</a>" +
        "</li>"
      );
    }).join("");

    panel.innerHTML =
      '<div class="dl-panel-mobile__cabecera">' +
        "<span>Categorias</span>" +
        '<button class="dl-panel-mobile__cerrar" id="btnCerrarMenu" type="button">' +
          "Cerrar Menu" +
          '<svg class="dl-ico" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        "</button>" +
      "</div>" +
      '<form class="dl-buscador dl-panel-mobile__buscador" id="buscadorPanelMobile" action="index.html" method="get" role="search">' +
        '<svg class="dl-buscador__ico dl-ico" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>' +
        '<input type="search" name="q" placeholder="Buscar en Dreamlike..." aria-label="Buscar productos">' +
      "</form>" +
      '<ul class="dl-acordeon" id="acordeonCategorias">' + items + "</ul>";

    // Mismo autocompletar que el buscador del header (assets/js/buscador.js),
    // enganchado aparte porque este form se crea despues del DOMContentLoaded
    // inicial que buscador.js usa para encontrar los .dl-buscador de la pagina.
    if (window.dlBuscador) {
      window.dlBuscador.iniciar(panel.querySelector("#buscadorPanelMobile"));
    }

    var overlay = document.createElement("div");
    overlay.className = "dl-overlay";
    overlay.id = "overlayMenu";
    overlay.hidden = true;

    document.body.appendChild(panel);
    document.body.appendChild(overlay);
    return { panel: panel, overlay: overlay };
  }

  function initPanelMobile(refs) {
    var btnAbrir = document.getElementById("btnMenuMobile");
    var btnCerrar = document.getElementById("btnCerrarMenu");
    if (!btnAbrir) return;

    function abrirPanel() {
      refs.panel.classList.add("dl-panel-mobile--abierto");
      refs.overlay.hidden = false;
      document.body.style.overflow = "hidden";
      refs.panel.setAttribute("aria-hidden", "false");
      btnAbrir.setAttribute("aria-expanded", "true");
      if (btnCerrar) btnCerrar.focus();
    }

    function cerrarPanel() {
      refs.panel.classList.remove("dl-panel-mobile--abierto");
      refs.overlay.hidden = true;
      document.body.style.overflow = "";
      refs.panel.setAttribute("aria-hidden", "true");
      btnAbrir.setAttribute("aria-expanded", "false");
      btnAbrir.focus();
    }

    btnAbrir.addEventListener("click", abrirPanel);
    if (btnCerrar) btnCerrar.addEventListener("click", cerrarPanel);
    refs.overlay.addEventListener("click", cerrarPanel);

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && refs.panel.classList.contains("dl-panel-mobile--abierto")) {
        cerrarPanel();
      }
    });
  }

  /* --- Carrusel de categorias en index.html (compat, si existe) -------------- */
  /* index.html ya no usa dl-nav__pista (reemplazado por mega-menu), pero se deja
     esta funcion vacia intencionalmente removida: no aplica en el rediseño. */

  /* --- Fade de desborde: 10 categorias no siempre caben en 1280px, esto
     avisa que hay mas a la derecha con scroll horizontal (ver .dl-nav__in::after
     en main.css) en vez de cortar la ultima categoria sin ningun indicio. --- */
  function initFadeDesborde(listaEl) {
    var contenedor = listaEl.closest(".dl-nav__in");
    if (!contenedor) return;

    function actualizar() {
      var haySobrante = listaEl.scrollWidth - listaEl.clientWidth - listaEl.scrollLeft > 4;
      contenedor.classList.toggle("dl-nav__in--desborda", haySobrante);
    }

    actualizar();
    listaEl.addEventListener("scroll", actualizar);
    window.addEventListener("resize", actualizar);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var listaDesktop = document.getElementById("megaLista");
    if (!listaDesktop) return; // pagina sin nav de categorias

    cargarCategorias().then(function (categorias) {
      construirMegaDesktop(categorias, listaDesktop);
      initMegaDesktop(listaDesktop);
      initFadeDesborde(listaDesktop);

      var refs = construirPanelMobile(categorias);
      initPanelMobile(refs);
    });
  });
})();
