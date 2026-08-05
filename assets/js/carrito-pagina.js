/* ==========================================================================
   Dreamlike — carrito-pagina.js
   Renderiza carrito.html: cruza los items guardados en localStorage
   (sku, nombre, cantidad) con el catalogo para mostrar precio/imagen,
   y calcula subtotal/total.
   ========================================================================== */

(function () {
  "use strict";

  function formatoCLP(v) { return "$" + v.toLocaleString("es-CL"); }

  function buscarProducto(catalogo, sku) {
    return catalogo.find(function (p) { return p.sku === sku; }) || null;
  }

  function filaHTML(item, producto) {
    var precio = producto ? producto.precio : 0;
    var imagen = producto ? producto.imagen : "assets/img/productos/placeholder.svg";
    var nombre = producto ? producto.nombre : item.nombre;
    var subtotal = precio * item.cantidad;

    var hrefProducto = "producto.html?sku=" + encodeURIComponent(item.sku);

    return (
      "<tr data-sku=\"" + item.sku + "\">" +
        "<td><a href=\"" + hrefProducto + "\"><img src=\"" + imagen + "\" alt=\"\"></a></td>" +
        "<td><a href=\"" + hrefProducto + "\" style=\"color:var(--dl-gris-texto);font-weight:600\">" + nombre + "</a><br><span style=\"font-size:.78rem;color:var(--dl-gris-suave)\">SKU: " + item.sku + "</span></td>" +
        "<td>" + formatoCLP(precio) + "</td>" +
        "<td>" +
          "<div class=\"dl-cantidad__ctrl\" style=\"display:inline-flex\">" +
            "<button class=\"dl-cantidad__btn dl-fila-menos\" type=\"button\" aria-label=\"Restar\">−</button>" +
            "<input type=\"number\" class=\"dl-fila-input\" value=\"" + item.cantidad + "\" min=\"1\" style=\"width:52px;height:38px;text-align:center;border:0;border-left:1px solid var(--dl-gris-borde);border-right:1px solid var(--dl-gris-borde)\">" +
            "<button class=\"dl-cantidad__btn dl-fila-mas\" type=\"button\" aria-label=\"Sumar\">+</button>" +
          "</div>" +
        "</td>" +
        "<td><strong>" + formatoCLP(subtotal) + "</strong></td>" +
        "<td><button class=\"dl-fila-quitar\" type=\"button\" aria-label=\"Quitar\" style=\"color:#B91C1C;font-size:1.1rem\">×</button></td>" +
      "</tr>"
    );
  }

  function calcularTotal(items, catalogo) {
    return items.reduce(function (acc, item) {
      var producto = buscarProducto(catalogo, item.sku);
      return acc + (producto ? producto.precio : 0) * item.cantidad;
    }, 0);
  }

  function actualizarLinkWsp(items, catalogo) {
    var link = document.getElementById("btnCotizarCarritoWsp");
    if (!link) return;
    var resumen = items.map(function (item) {
      var producto = buscarProducto(catalogo, item.sku);
      return (item.cantidad + "x " + (producto ? producto.nombre : item.nombre));
    }).join(", ");
    var texto = "Hola, quiero cotizar mi carrito: " + resumen;
    link.href = "https://wa.me/56933713900?text=" + encodeURIComponent(texto);
  }

  function render() {
    var catalogo = window.DL_PRODUCTOS_FALLBACK || [];
    var items = window.dlCarrito.leer();

    var conItems = document.getElementById("carritoConItems");
    var vacio = document.getElementById("carritoVacio");

    if (!items.length) {
      conItems.hidden = true;
      vacio.hidden = false;
      return;
    }

    conItems.hidden = false;
    vacio.hidden = true;

    var tbody = document.getElementById("tablaCarrito");
    tbody.innerHTML = items.map(function (item) {
      return filaHTML(item, buscarProducto(catalogo, item.sku));
    }).join("");

    var total = calcularTotal(items, catalogo);
    document.getElementById("resumenSubtotal").textContent = formatoCLP(total);
    document.getElementById("resumenTotal").textContent = formatoCLP(total);
    actualizarLinkWsp(items, catalogo);

    // Delegacion de eventos sobre la tabla recien pintada
    tbody.querySelectorAll("tr").forEach(function (fila) {
      var sku = fila.getAttribute("data-sku");
      var input = fila.querySelector(".dl-fila-input");

      fila.querySelector(".dl-fila-menos").addEventListener("click", function () {
        var v = Math.max(1, parseInt(input.value, 10) - 1);
        window.dlCarrito.actualizarCantidad(sku, v);
        render();
      });
      fila.querySelector(".dl-fila-mas").addEventListener("click", function () {
        var v = parseInt(input.value, 10) + 1;
        window.dlCarrito.actualizarCantidad(sku, v);
        render();
      });
      input.addEventListener("change", function () {
        var v = Math.max(1, parseInt(input.value, 10) || 1);
        window.dlCarrito.actualizarCantidad(sku, v);
        render();
      });
      fila.querySelector(".dl-fila-quitar").addEventListener("click", function () {
        window.dlCarrito.quitar(sku);
        render();
      });
    });
  }

  /* --- Solicitar cotizacion: exige sesion, registra pedido, vacia carrito --- */

  function totalCarrito() {
    var catalogo = window.DL_PRODUCTOS_FALLBACK || [];
    var items = window.dlCarrito.leer();
    return {
      total: calcularTotal(items, catalogo),
      cantidadItems: items.reduce(function (acc, it) { return acc + it.cantidad; }, 0)
    };
  }

  function enviarCotizacion(btn) {
    var items = window.dlCarrito.leer();
    if (!items.length) return;

    var resumen = totalCarrito();
    var pedido = window.dlAuth.agregarPedido({ total: resumen.total, items: resumen.cantidadItems });

    // Mostrar la confirmacion ANTES de vaciar/re-renderizar: vaciar el carrito
    // hace que render() oculte #carritoConItems (que contiene este boton) si
    // se llama primero, y el mensaje de "enviada" nunca llega a verse.
    var textoOriginal = btn.textContent.trim();
    btn.disabled = true;
    btn.textContent = "Cotizacion " + pedido.id + " enviada ✓";

    window.dlCarrito.vaciar();

    window.setTimeout(function () {
      window.location.href = "mi-cuenta.html#pedidos";
    }, 1400);
  }

  function initSolicitarCotizacion() {
    var btn = document.getElementById("btnSolicitarCotizacion");
    if (!btn || !window.dlAuth) return;

    btn.addEventListener("click", function () {
      if (!window.dlAuth.leerSesion()) {
        // Sin sesion: abre el modal de auth y dispara la cotizacion apenas
        // loguea, sin navegar de pagina (antes: login.html?redirect=...).
        if (window.dlAuthModal) {
          window.dlAuthModal.abrir(function () { enviarCotizacion(btn); });
        } else {
          window.location.href = "login.html?redirect=carrito.html&accion=cotizar";
        }
        return;
      }
      enviarCotizacion(btn);
    });

    // Si volvimos de login con ?accion=cotizar y ya hay sesion, disparar solo
    var params = new URLSearchParams(window.location.search);
    if (params.get("accion") === "cotizar" && window.dlAuth.leerSesion()) {
      enviarCotizacion(btn);
    }
  }

  // Boton "Comprar": placeholder de la pasarela de pago (MercadoPago via
  // plugin de WordPress, a integrar cuando el sitio se monte ahi). Hoy no
  // procesa ningun pago — solo deja explicito que la funcion esta prevista,
  // sin fingir un checkout que no existe.
  function initComprar() {
    var btn = document.getElementById("btnComprar");
    var aviso = document.getElementById("avisoComprar");
    if (!btn || !aviso) return;

    btn.addEventListener("click", function () {
      if (!window.dlCarrito.leer().length) return;
      aviso.hidden = false;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    initSolicitarCotizacion();
    initComprar();
  });
})();
