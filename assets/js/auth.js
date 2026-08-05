/* ==========================================================================
   Dreamlike — auth.js
   Sesion SIMULADA en localStorage. Prototipo visual: acepta cualquier
   email/password, no valida credenciales contra ningun backend.
   Sin esto no hay auth real: NO usar en produccion.
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE_SESION = "dl_sesion";
  var CLAVE_SESION_ADMIN = "dl_sesion_admin";
  var CLAVE_PEDIDOS = "dl_pedidos_demo";
  var CLAVE_DIRECCIONES = "dl_direcciones_demo";
  var CLAVE_PEDIDOS_ADMIN = "dl_pedidos_admin_demo";

  var PEDIDOS_DEMO = [
    { id: "DL-10234", fecha: "2026-07-18", estado: "Entregado", total: 128900, items: 3 },
    { id: "DL-10198", fecha: "2026-07-02", estado: "En camino", total: 46900, items: 1 },
    { id: "DL-10121", fecha: "2026-06-15", estado: "Cotizacion enviada", total: 890000, items: 12 }
  ];

  var DIRECCIONES_DEMO = [
    { etiqueta: "Bodega principal", direccion: "Av. El Ventisquero 1225 Bod. 49, Renca", comuna: "Renca", principal: true },
    { etiqueta: "Oficina", direccion: "Av. Providencia 1234, of. 501", comuna: "Providencia", principal: false }
  ];

  // Pedidos de TODOS los clientes, para la vista de admin (distinto del historial
  // de un cliente individual en CLAVE_PEDIDOS)
  var PEDIDOS_ADMIN_DEMO = [
    { id: "DL-10234", cliente: "Juan Perez", fecha: "2026-07-18", estado: "Entregado", total: 128900 },
    { id: "DL-10198", cliente: "Constructora Andes SpA", fecha: "2026-07-02", estado: "En camino", total: 46900 },
    { id: "DL-10121", cliente: "Juan Perez", fecha: "2026-06-15", estado: "Cotizacion enviada", total: 890000 },
    { id: "DL-10087", cliente: "Electricidad del Sur Ltda.", fecha: "2026-06-09", estado: "Pendiente de pago", total: 234500 },
    { id: "DL-10055", cliente: "Maria Gonzalez", fecha: "2026-05-28", estado: "Entregado", total: 18900 },
    { id: "DL-10012", cliente: "Constructora Andes SpA", fecha: "2026-05-14", estado: "Entregado", total: 512000 }
  ];

  function leerSesion() {
    try {
      var raw = localStorage.getItem(CLAVE_SESION);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function iniciarSesion(email, nombre) {
    var sesion = { email: email, nombre: nombre || email.split("@")[0], desde: new Date().toISOString() };
    try { localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion)); } catch (e) {}
    // Sembrar datos demo si es la primera vez
    if (!localStorage.getItem(CLAVE_PEDIDOS)) {
      try { localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(PEDIDOS_DEMO)); } catch (e) {}
    }
    if (!localStorage.getItem(CLAVE_DIRECCIONES)) {
      try { localStorage.setItem(CLAVE_DIRECCIONES, JSON.stringify(DIRECCIONES_DEMO)); } catch (e) {}
    }
    return sesion;
  }

  function cerrarSesion() {
    try { localStorage.removeItem(CLAVE_SESION); } catch (e) {}
  }

  function actualizarSesion(datos) {
    var sesion = leerSesion();
    if (!sesion) return null;
    var actualizada = Object.assign({}, sesion, datos);
    try { localStorage.setItem(CLAVE_SESION, JSON.stringify(actualizada)); } catch (e) {}
    return actualizada;
  }

  function leerPedidos() {
    try {
      var raw = localStorage.getItem(CLAVE_PEDIDOS);
      return raw ? JSON.parse(raw) : PEDIDOS_DEMO;
    } catch (e) { return PEDIDOS_DEMO; }
  }

  // Agrega una cotizacion/pedido nuevo al historial del cliente logueado.
  // datos: { total, items } — el resto (id, fecha, estado) se genera aqui.
  // Devuelve el pedido creado.
  function agregarPedido(datos) {
    var pedidos = leerPedidos();
    var pedido = {
      id: "DL-" + Math.floor(10000 + Math.random() * 89999),
      fecha: new Date().toISOString().slice(0, 10),
      estado: "Cotizacion enviada",
      total: datos.total || 0,
      items: datos.items || 0
    };
    pedidos.unshift(pedido);
    try { localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(pedidos)); } catch (e) {}
    return pedido;
  }

  function leerDirecciones() {
    try {
      var raw = localStorage.getItem(CLAVE_DIRECCIONES);
      return raw ? JSON.parse(raw) : DIRECCIONES_DEMO;
    } catch (e) { return DIRECCIONES_DEMO; }
  }

  // Protege una pagina: si no hay sesion, redirige a login.html
  function exigirSesion() {
    if (!leerSesion()) {
      window.location.href = "login.html";
      return null;
    }
    return leerSesion();
  }

  /* --- Sesion de admin (independiente de la sesion de cliente) --------------- */

  function leerSesionAdmin() {
    try {
      var raw = localStorage.getItem(CLAVE_SESION_ADMIN);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function iniciarSesionAdmin(email, nombre) {
    var sesion = { email: email, nombre: nombre || email.split("@")[0], desde: new Date().toISOString() };
    try { localStorage.setItem(CLAVE_SESION_ADMIN, JSON.stringify(sesion)); } catch (e) {}
    if (!localStorage.getItem(CLAVE_PEDIDOS_ADMIN)) {
      try { localStorage.setItem(CLAVE_PEDIDOS_ADMIN, JSON.stringify(PEDIDOS_ADMIN_DEMO)); } catch (e) {}
    }
    return sesion;
  }

  function cerrarSesionAdmin() {
    try { localStorage.removeItem(CLAVE_SESION_ADMIN); } catch (e) {}
  }

  function leerPedidosAdmin() {
    try {
      var raw = localStorage.getItem(CLAVE_PEDIDOS_ADMIN);
      return raw ? JSON.parse(raw) : PEDIDOS_ADMIN_DEMO;
    } catch (e) { return PEDIDOS_ADMIN_DEMO; }
  }

  // Protege una pagina de admin: si no hay sesion admin, redirige a admin/login.html
  // rutaLogin permite ajustar la ruta relativa segun la profundidad de la pagina
  function exigirSesionAdmin(rutaLogin) {
    if (!leerSesionAdmin()) {
      window.location.href = rutaLogin || "login.html";
      return null;
    }
    return leerSesionAdmin();
  }

  // Actualiza el bloque "Iniciar Sesion" / "Hola, Nombre" del header en index/producto.
  // Sin sesion: abre el modal de auth (assets/js/auth-modal.js) en vez de navegar a
  // login.html, si el modal esta disponible en la pagina — login.html sigue siendo
  // el href real (fallback si el modal no cargo, y para quien navegue ahi directo).
  function pintarHeaderCuenta() {
    var el = document.getElementById("headerCuenta");
    if (!el) return;
    var sesion = leerSesion();
    if (sesion) {
      el.href = "mi-cuenta.html";
      el.onclick = null;
      el.innerHTML =
        '<svg class="dl-ico" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>' +
        "<span>Hola, " + sesion.nombre + "</span>";
    } else {
      el.href = "login.html";
      el.onclick = window.dlAuthModal
        ? function (ev) { ev.preventDefault(); window.dlAuthModal.abrir(); }
        : null;
      el.innerHTML =
        '<svg class="dl-ico" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>' +
        "<span>Iniciar Sesion</span>";
    }
  }

  window.dlAuth = {
    leerSesion: leerSesion,
    iniciarSesion: iniciarSesion,
    actualizarSesion: actualizarSesion,
    cerrarSesion: cerrarSesion,
    leerPedidos: leerPedidos,
    agregarPedido: agregarPedido,
    leerDirecciones: leerDirecciones,
    exigirSesion: exigirSesion,
    pintarHeaderCuenta: pintarHeaderCuenta,
    leerSesionAdmin: leerSesionAdmin,
    iniciarSesionAdmin: iniciarSesionAdmin,
    cerrarSesionAdmin: cerrarSesionAdmin,
    leerPedidosAdmin: leerPedidosAdmin,
    exigirSesionAdmin: exigirSesionAdmin
  };

  document.addEventListener("DOMContentLoaded", pintarHeaderCuenta);
})();
