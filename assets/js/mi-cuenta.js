/* ==========================================================================
   Dreamlike — mi-cuenta.js
   Pinta perfil, pedidos y direcciones desde datos demo en localStorage
   (ver assets/js/auth.js). Tabs por hash, sin router externo.
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
      "Cotizacion enviada": "dl-estado--cotizacion"
    };
    return mapa[estado] || "dl-estado--pendiente";
  }

  function iniciales(nombre) {
    var partes = nombre.trim().split(/\s+/);
    var ini = partes[0].charAt(0);
    if (partes.length > 1) ini += partes[partes.length - 1].charAt(0);
    return ini.toUpperCase();
  }

  function pintarSidebar(sesion) {
    document.getElementById("sidebarNombre").textContent = sesion.nombre;
    document.getElementById("sidebarEmail").textContent = sesion.email;
    document.getElementById("avatarIniciales").textContent = iniciales(sesion.nombre);
  }

  function pintarPerfil(sesion) {
    var partes = sesion.nombre.trim().split(/\s+/);
    document.getElementById("pNombre").value = partes.shift() || "";
    document.getElementById("pApellido").value = partes.join(" ");
    document.getElementById("pNombreVisible").value = sesion.nombre;
    document.getElementById("pEmail").value = sesion.email;
  }

  function pintarBienvenida(sesion) {
    document.getElementById("tituloBienvenida").textContent = "Hola, " + sesion.nombre.split(/\s+/)[0];
  }

  function pintarPedidos() {
    var tbody = document.getElementById("tablaPedidos");
    var pedidos = window.dlAuth.leerPedidos();
    document.getElementById("sinPedidos").hidden = pedidos.length > 0;
    tbody.closest("table").hidden = pedidos.length === 0;
    tbody.innerHTML = pedidos.map(function (p) {
      return (
        "<tr>" +
          "<td><strong>" + p.id + "</strong></td>" +
          "<td>" + formatoFecha(p.fecha) + "</td>" +
          "<td><span class=\"dl-estado " + claseEstado(p.estado) + "\">" + p.estado + "</span></td>" +
          "<td>" + p.items + "</td>" +
          "<td>" + formatoCLP(p.total) + "</td>" +
        "</tr>"
      );
    }).join("");
  }

  function pintarDirecciones() {
    var direcciones = window.dlAuth.leerDirecciones();
    var facturacion = direcciones.find(function (d) { return d.tipo === "facturacion"; });
    var envio = direcciones.find(function (d) { return d.principal; }) || direcciones[0];

    function contenido(direccion, tipo) {
      var etiqueta = tipo === "facturacion" ? "facturación" : "envío";
      if (!direccion) {
        return (
          '<a class="dl-direccion-tipo__agregar" href="#" data-agregar-direccion="' + tipo + '">' +
            "Añadir dirección de " + etiqueta +
          "</a>" +
          '<p class="dl-direccion-tipo__vacio">Aún no has configurado este tipo de dirección.</p>'
        );
      }
      return (
        '<p class="dl-direccion-tipo__nombre">' + direccion.etiqueta + "</p>" +
        '<p class="dl-direccion-tipo__texto">' + direccion.direccion + "<br>" + direccion.comuna + "</p>" +
        '<a class="dl-direccion-tipo__editar" href="#" data-agregar-direccion="' + tipo + '">Editar dirección de ' + etiqueta + "</a>"
      );
    }

    document.getElementById("direccionFacturacion").innerHTML = contenido(facturacion, "facturacion");
    document.getElementById("direccionEnvio").innerHTML = contenido(envio, "envio");
  }

  function activarTab(nombre) {
    document.querySelectorAll(".dl-panel__nav a[data-tab]").forEach(function (a) {
      a.classList.toggle("dl-activo", a.getAttribute("data-tab") === nombre);
    });
    document.querySelectorAll(".dl-tab-panel").forEach(function (s) { s.hidden = true; });
    var mapa = {
      escritorio: "tabEscritorio",
      pedidos: "tabPedidos",
      descargas: "tabDescargas",
      direcciones: "tabDirecciones",
      detalles: "tabDetalles"
    };
    var panel = document.getElementById(mapa[nombre] || "tabEscritorio");
    if (panel) panel.hidden = false;
  }

  function initTabs() {
    document.querySelectorAll(".dl-panel__nav a[data-tab]").forEach(function (a) {
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        var nombre = a.getAttribute("data-tab");
        window.location.hash = nombre;
        activarTab(nombre);
      });
    });
    document.querySelectorAll("[data-acceso-tab]").forEach(function (acceso) {
      acceso.addEventListener("click", function () {
        activarTab(acceso.getAttribute("data-acceso-tab"));
      });
    });
    document.querySelectorAll("[data-agregar-direccion]").forEach(function (enlace) {
      enlace.addEventListener("click", function (ev) {
        ev.preventDefault();
      });
    });
    var inicial = (window.location.hash || "#escritorio").replace("#", "");
    activarTab(inicial);
  }

  function initFormPerfil() {
    var form = document.getElementById("formPerfil");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var confirmar = document.getElementById("pPasswordConfirmar");
      var nueva = document.getElementById("pPasswordNueva").value;
      confirmar.setCustomValidity("");
      if (nueva && nueva !== confirmar.value) {
        confirmar.setCustomValidity("Las contraseñas no coinciden.");
        confirmar.reportValidity();
        return;
      }
      var nombreCompleto = (
        document.getElementById("pNombre").value.trim() + " " +
        document.getElementById("pApellido").value.trim()
      ).trim();
      var sesion = window.dlAuth.actualizarSesion({
        nombre: nombreCompleto,
        email: document.getElementById("pEmail").value.trim()
      });
      if (sesion) {
        pintarSidebar(sesion);
        pintarBienvenida(sesion);
      }
      var btn = form.querySelector("button[type=submit]");
      var textoOriginal = btn.textContent;
      btn.textContent = "Guardado ✓";
      window.setTimeout(function () { btn.textContent = textoOriginal; }, 1600);
    });
  }

  function initCerrarSesion() {
    document.getElementById("btnCerrarSesion").addEventListener("click", function () {
      window.dlAuth.cerrarSesion();
      window.location.href = "index.html";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var sesion = window.dlAuth.exigirSesion();
    if (!sesion) return; // exigirSesion ya redirige a login.html

    pintarSidebar(sesion);
    pintarPerfil(sesion);
    pintarBienvenida(sesion);
    pintarPedidos();
    pintarDirecciones();
    initTabs();
    initFormPerfil();
    initCerrarSesion();
  });
})();
