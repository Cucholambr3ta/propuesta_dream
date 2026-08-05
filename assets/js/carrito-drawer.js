/* ==========================================================================
   Dreamlike — carrito-drawer.js
   Panel lateral (drawer) desde la derecha: click en el icono de carrito del
   header lo abre en vez de navegar directo a carrito.html. Vista rapida
   (items, cantidad, quitar, subtotal) + "Ver carrito completo", "Solicitar
   cotizacion" (exige sesion, igual que en carrito.html) y "Cotizar por
   WhatsApp".

   Reusa .dl-overlay (mismo patron que el panel mobile de mega-menu.js) y
   window.dlCarrito (assets/js/carrito.js) para leer/mutar el carrito.
   Requiere assets/js/productos-fallback.js cargado antes (misma fuente de
   catalogo que el resto del sitio).
   ========================================================================== */

(function () {
  "use strict";

  function prefijoAssets() {
    return window.location.pathname.indexOf("/admin/") !== -1 ? "../" : "";
  }

  function formatoCLP(v) { return "$" + v.toLocaleString("es-CL"); }

  function buscarProducto(catalogo, sku) {
    return catalogo.find(function (p) { return p.sku === sku; }) || null;
  }

  function construirDrawer() {
    var drawer = document.createElement("div");
    drawer.className = "dl-drawer-carrito";
    drawer.id = "drawerCarrito";
    drawer.setAttribute("aria-hidden", "true");
    drawer.innerHTML =
      '<div class="dl-drawer-carrito__cabecera">' +
        "<span>Tu carrito</span>" +
        '<button class="dl-drawer-carrito__cerrar" id="btnCerrarDrawer" aria-label="Cerrar carrito" type="button">' +
          '<svg class="dl-ico" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        "</button>" +
      "</div>" +
      '<div class="dl-drawer-carrito__lista" id="drawerLista"></div>' +
      '<div class="dl-drawer-sugeridos" id="drawerSugeridos"></div>' +
      '<div class="dl-drawer-carrito__pie" id="drawerPie"></div>';

    var overlay = document.getElementById("overlayMenu") || document.createElement("div");
    if (!overlay.id) {
      overlay.className = "dl-overlay";
      overlay.id = "overlayMenu";
      overlay.hidden = true;
      document.body.appendChild(overlay);
    }

    document.body.appendChild(drawer);
    return { drawer: drawer, overlay: overlay };
  }

  function itemHTML(item, producto) {
    var imagen = producto ? producto.imagen : (prefijoAssets() + "assets/img/productos/placeholder.svg");
    var nombre = producto ? producto.nombre : item.nombre;
    var precio = producto ? producto.precio : 0;

    var hrefProducto = "producto.html?sku=" + encodeURIComponent(item.sku);

    return (
      '<div class="dl-drawer-item" data-sku="' + item.sku + '">' +
        '<a href="' + hrefProducto + '"><img class="dl-drawer-item__img" src="' + imagen + '" alt=""></a>' +
        '<div class="dl-drawer-item__info">' +
          '<a class="dl-drawer-item__nombre" href="' + hrefProducto + '" style="color:var(--dl-gris-texto)">' + nombre + "</a>" +
          '<div class="dl-drawer-item__precio">' + formatoCLP(precio) + "</div>" +
          '<div class="dl-drawer-item__acciones">' +
            '<div class="dl-drawer-item__cantidad">' +
              '<button class="dl-drawer-menos" type="button" aria-label="Restar">−</button>' +
              "<span>" + item.cantidad + "</span>" +
              '<button class="dl-drawer-mas" type="button" aria-label="Sumar">+</button>' +
            "</div>" +
            '<button class="dl-drawer-item__quitar" type="button" aria-label="Quitar">×</button>' +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  // Sugeridos por categoria de lo que ya esta en el carrito, excluyendo lo
  // ya agregado — mismo criterio que "Productos relacionados" en la PDP
  // (assets/js/producto.js:213), para no inventar un segundo criterio.
  function sugeridoHTML(p) {
    var href = "producto.html?sku=" + encodeURIComponent(p.sku);
    return (
      '<a class="dl-drawer-sugerido" href="' + href + '">' +
        '<img src="' + p.imagen + '" alt="">' +
        '<span class="dl-drawer-sugerido__info">' +
          '<span class="dl-drawer-sugerido__nombre">' + p.nombre + "</span>" +
          '<span class="dl-drawer-sugerido__precio">' + formatoCLP(p.precio) + "</span>" +
        "</span>" +
      "</a>"
    );
  }

  function renderSugeridos(catalogo, items) {
    var cont = document.getElementById("drawerSugeridos");
    if (!cont) return;

    if (!items.length) { cont.innerHTML = ""; return; }

    var skusEnCarrito = items.map(function (i) { return i.sku; });
    var categoriasEnCarrito = items
      .map(function (i) { return buscarProducto(catalogo, i.sku); })
      .filter(Boolean)
      .map(function (p) { return p.categoria; });

    var sugeridos = catalogo
      .filter(function (p) {
        return skusEnCarrito.indexOf(p.sku) === -1 && categoriasEnCarrito.indexOf(p.categoria) !== -1;
      })
      .slice(0, 3);

    if (!sugeridos.length) { cont.innerHTML = ""; return; }

    cont.innerHTML =
      '<p class="dl-drawer-sugeridos__titulo">Tambien te puede interesar</p>' +
      sugeridos.map(sugeridoHTML).join("");
  }

  function render() {
    var lista = document.getElementById("drawerLista");
    var pie = document.getElementById("drawerPie");
    if (!lista || !pie) return;

    var catalogo = window.DL_PRODUCTOS_FALLBACK || [];
    var items = window.dlCarrito.leer();

    renderSugeridos(catalogo, items);

    if (!items.length) {
      lista.innerHTML =
        '<div class="dl-drawer-carrito__vacio">' +
          '<svg class="dl-ico" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1.2"/><circle cx="18" cy="21" r="1.2"/><path d="M2 3h3l2.6 12.4A2 2 0 0 0 9.5 17H18a2 2 0 0 0 2-1.6L21.5 7H6"/></svg>' +
          "<p>Tu carrito esta vacio.</p>" +
        "</div>";
      pie.innerHTML =
        '<a class="dl-btn dl-btn--primario dl-btn--bloque" href="' + prefijoAssets() + 'index.html">Ver productos</a>';
      return;
    }

    lista.innerHTML = items.map(function (item) {
      return itemHTML(item, buscarProducto(catalogo, item.sku));
    }).join("");

    var total = items.reduce(function (acc, item) {
      var p = buscarProducto(catalogo, item.sku);
      return acc + (p ? p.precio : 0) * item.cantidad;
    }, 0);

    pie.innerHTML =
      '<div class="dl-drawer-carrito__total"><span>Total</span><span>' + formatoCLP(total) + "</span></div>" +
      '<div class="dl-drawer-carrito__acciones">' +
        '<button class="dl-btn dl-btn--primario dl-btn--bloque" id="btnComprarDrawer" type="button">' +
          '<svg class="dl-ico" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>' +
          "Comprar" +
        "</button>" +
        '<a class="dl-btn dl-btn--secundario dl-btn--bloque" href="' + prefijoAssets() + 'carrito.html">Ver carrito completo</a>' +
        '<button class="dl-btn dl-btn--secundario dl-btn--bloque" id="btnSolicitarCotizacionDrawer" type="button">' +
          '<svg class="dl-ico" viewBox="0 0 24 24"><path d="M9 12h6M9 16h6M9 8h3"/><rect x="4" y="3" width="16" height="18" rx="2"/></svg>' +
          "Solicitar cotizacion" +
        "</button>" +
        '<a class="dl-btn dl-btn--wsp dl-btn--bloque" href="https://wa.me/56933713900" target="_blank" rel="noopener">' +
          '<svg class="dl-ico" viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.55L3 20l1.05-5.4A8.5 8.5 0 1 1 21 11.5Z"/></svg>' +
          "Cotizar por WhatsApp" +
        "</a>" +
        '<p class="dl-carrito__aviso-pago" id="avisoComprarDrawer" hidden>' +
          "Pago en linea disponible pronto. Mientras tanto, cotiza por WhatsApp o solicita tu cotizacion." +
        "</p>" +
      "</div>";

    var btnComprar = document.getElementById("btnComprarDrawer");
    if (btnComprar) {
      btnComprar.addEventListener("click", function () {
        document.getElementById("avisoComprarDrawer").hidden = false;
      });
    }

    var btnCotizar = document.getElementById("btnSolicitarCotizacionDrawer");
    if (btnCotizar) {
      btnCotizar.addEventListener("click", function () {
        var destino = prefijoAssets() + "carrito.html?accion=cotizar";
        if (!window.dlAuth || !window.dlAuth.leerSesion()) {
          // Sin sesion: abre el modal de auth (sin navegar) y, apenas loguea,
          // recien ahi va a carrito.html?accion=cotizar — mismo destino que
          // antes, pero ya no pasa por login.html como pagina intermedia.
          if (window.dlAuthModal) {
            window.dlAuthModal.abrir(function () { window.location.href = destino; });
          } else {
            window.location.href = prefijoAssets() + "login.html?redirect=carrito.html&accion=cotizar";
          }
          return;
        }
        // Con sesion: se apoya en carrito.html (ya sabe leer ?accion=cotizar
        // y disparar el envio solo) en vez de duplicar esa logica aqui.
        window.location.href = destino;
      });
    }

    // Delegacion de eventos sobre los items recien pintados
    lista.querySelectorAll(".dl-drawer-item").forEach(function (fila) {
      var sku = fila.getAttribute("data-sku");
      fila.querySelector(".dl-drawer-menos").addEventListener("click", function () {
        var actual = items.find(function (i) { return i.sku === sku; });
        window.dlCarrito.actualizarCantidad(sku, Math.max(1, actual.cantidad - 1));
        render();
      });
      fila.querySelector(".dl-drawer-mas").addEventListener("click", function () {
        var actual = items.find(function (i) { return i.sku === sku; });
        window.dlCarrito.actualizarCantidad(sku, actual.cantidad + 1);
        render();
      });
      fila.querySelector(".dl-drawer-item__quitar").addEventListener("click", function () {
        window.dlCarrito.quitar(sku);
        render();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var iconoCarrito = document.querySelector(".dl-carrito");
    if (!iconoCarrito || !window.dlCarrito) return;

    var refs = construirDrawer();

    function abrir() {
      render();
      refs.drawer.classList.add("dl-drawer-carrito--abierto");
      refs.overlay.hidden = false;
      document.body.style.overflow = "hidden";
      refs.drawer.setAttribute("aria-hidden", "false");
      document.getElementById("btnCerrarDrawer").focus();
    }

    function cerrar() {
      refs.drawer.classList.remove("dl-drawer-carrito--abierto");
      // El overlay se comparte con el panel mobile: solo ocultar si ese
      // tampoco esta abierto, para no pisar su estado.
      var panelMobile = document.getElementById("panelMobile");
      var mobileAbierto = panelMobile && panelMobile.classList.contains("dl-panel-mobile--abierto");
      if (!mobileAbierto) {
        refs.overlay.hidden = true;
        document.body.style.overflow = "";
      }
      refs.drawer.setAttribute("aria-hidden", "true");
      iconoCarrito.focus();
    }

    iconoCarrito.addEventListener("click", function (ev) {
      ev.preventDefault();
      abrir();
    });

    refs.overlay.addEventListener("click", function () {
      if (refs.drawer.classList.contains("dl-drawer-carrito--abierto")) cerrar();
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && refs.drawer.classList.contains("dl-drawer-carrito--abierto")) {
        cerrar();
      }
    });

    document.getElementById("btnCerrarDrawer").addEventListener("click", cerrar);
  });
})();
