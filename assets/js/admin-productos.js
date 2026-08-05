/* ==========================================================================
   Dreamlike — admin-productos.js
   CRUD real de productos contra la API PHP (api/productos/*): listar, crear,
   editar, actualizar stock inline, eliminar, importar CSV/XML, publicar
   catalogo hacia productos.json. Reemplaza la tabla de solo lectura del
   prototipo anterior.
   ========================================================================== */

(function () {
  "use strict";

  var productosActuales = [];

  function formatoCLP(v) { return "$" + Number(v).toLocaleString("es-CL"); }

  /* --- Helper de fetch: { ok, data } | { ok:false, error } uniforme desde la API --- */
  function llamarAPI(url, opciones) {
    return fetch(url, opciones)
      .then(function (res) {
        return res.json().then(function (body) {
          if (!res.ok || !body.ok) throw new Error(body.error || "Error de red");
          return body.data;
        });
      });
  }

  /* --- Tabla ------------------------------------------------------------- */

  function filaHTML(p) {
    return (
      "<tr data-sku=\"" + p.sku + "\">" +
        "<td><img src=\"" + p.imagen.replace("assets/", "../assets/") + "\" alt=\"\"></td>" +
        "<td>" + p.sku + "</td>" +
        "<td>" + p.nombre + "</td>" +
        "<td>" + p.marca + "</td>" +
        "<td><span class=\"dl-badge dl-badge--cat\">" + p.categoria + "</span></td>" +
        "<td>" + formatoCLP(p.precio) + "</td>" +
        "<td>" +
          "<div class=\"dl-stock-inline\">" +
            "<input type=\"number\" min=\"0\" value=\"" + p.stock + "\" data-stock-input>" +
            "<button class=\"dl-btn dl-btn--secundario dl-btn--sm\" type=\"button\" data-guardar-stock>Guardar</button>" +
          "</div>" +
        "</td>" +
        "<td style=\"white-space:nowrap\">" +
          "<a href=\"../producto.html?sku=" + encodeURIComponent(p.sku) + "\" target=\"_blank\" rel=\"noopener\" style=\"font-size:.85rem;font-weight:700;margin-right:10px\">Ver</a>" +
          "<button class=\"dl-btn dl-btn--secundario dl-btn--sm\" type=\"button\" data-editar>Editar</button> " +
          "<button class=\"dl-btn dl-btn--secundario dl-btn--sm\" type=\"button\" data-eliminar>Eliminar</button>" +
        "</td>" +
      "</tr>"
    );
  }

  function pintar(productos) {
    document.getElementById("tablaProductos").innerHTML = productos.map(filaHTML).join("");
  }

  function recargar() {
    return llamarAPI("../api/productos/listar.php").then(function (productos) {
      productosActuales = productos;
      pintar(productosActuales);
    });
  }

  /* --- Buscador ------------------------------------------------------------ */

  function initBuscador() {
    var buscador = document.getElementById("buscarProducto");
    if (!buscador) return;
    buscador.addEventListener("input", function () {
      var q = buscador.value.trim().toLowerCase();
      var filtrados = productosActuales.filter(function (p) {
        return p.nombre.toLowerCase().indexOf(q) !== -1 || p.sku.toLowerCase().indexOf(q) !== -1;
      });
      pintar(filtrados);
    });
  }

  /* --- Modal generico: abrir/cerrar por overlay ----------------------------- */

  function abrirModal(idOverlay) {
    document.getElementById(idOverlay).classList.add("dl-modal-overlay--abierto");
  }
  function cerrarModal(idOverlay) {
    document.getElementById(idOverlay).classList.remove("dl-modal-overlay--abierto");
  }

  function initCerrarModales() {
    document.querySelectorAll("[data-cerrar-modal]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        cerrarModal(btn.getAttribute("data-cerrar-modal"));
      });
    });
    document.querySelectorAll(".dl-modal-overlay").forEach(function (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) overlay.classList.remove("dl-modal-overlay--abierto");
      });
    });
  }

  /* --- Categorias para el <select> ------------------------------------------ */

  function poblarSelectCategorias(categorias, seleccionActual) {
    var select = document.getElementById("fCategoria");
    select.innerHTML = categorias.map(function (c) {
      return "<option value=\"" + c.nombre + "\" data-slug=\"" + c.slug + "\">" + c.nombre + "</option>";
    }).join("");
    if (seleccionActual) select.value = seleccionActual;
  }

  function cargarCategorias() {
    return fetch("../assets/data/categorias.json")
      .then(function (res) { if (!res.ok) throw new Error(); return res.json(); })
      .catch(function () { return window.DL_CATEGORIAS_FALLBACK || []; });
  }

  /* --- Editor de specs (pares clave-valor) ----------------------------------- */

  function filaSpecHTML(clave, valor) {
    return (
      "<div class=\"dl-specs-fila\">" +
        "<input type=\"text\" placeholder=\"Nombre (ej. Seccion)\" value=\"" + (clave || "") + "\" data-spec-clave>" +
        "<input type=\"text\" placeholder=\"Valor (ej. 2.5 mm²)\" value=\"" + (valor || "") + "\" data-spec-valor>" +
        "<button class=\"dl-btn dl-btn--secundario dl-btn--sm\" type=\"button\" data-quitar-spec>&times;</button>" +
      "</div>"
    );
  }

  function pintarSpecs(specs) {
    var cont = document.getElementById("specsFilas");
    cont.innerHTML = "";
    var entradas = specs ? Object.keys(specs).map(function (k) { return [k, specs[k]]; }) : [];
    if (!entradas.length) entradas = [["", ""]];
    entradas.forEach(function (par) {
      cont.insertAdjacentHTML("beforeend", filaSpecHTML(par[0], par[1]));
    });
  }

  function leerSpecsDelForm() {
    var specs = {};
    document.querySelectorAll("#specsFilas .dl-specs-fila").forEach(function (fila) {
      var clave = fila.querySelector("[data-spec-clave]").value.trim();
      var valor = fila.querySelector("[data-spec-valor]").value.trim();
      if (clave) specs[clave] = valor;
    });
    return specs;
  }

  function initSpecs() {
    document.getElementById("btnAgregarSpec").addEventListener("click", function () {
      document.getElementById("specsFilas").insertAdjacentHTML("beforeend", filaSpecHTML("", ""));
    });
    document.getElementById("specsFilas").addEventListener("click", function (e) {
      if (e.target.matches("[data-quitar-spec]")) e.target.closest(".dl-specs-fila").remove();
    });
  }

  /* --- Modal de producto: crear / editar ------------------------------------- */

  var skuEnEdicion = null; // null = creando, string = editando ese SKU

  function abrirModalNuevo() {
    skuEnEdicion = null;
    document.getElementById("tituloModalProducto").textContent = "Nuevo producto";
    document.getElementById("formProducto").reset();
    document.getElementById("fSku").disabled = false;
    document.getElementById("errorProducto").style.display = "none";
    pintarSpecs(null);
    cargarCategorias().then(function (cats) { poblarSelectCategorias(cats, null); });
    abrirModal("overlayProducto");
  }

  function abrirModalEditar(p) {
    skuEnEdicion = p.sku;
    document.getElementById("tituloModalProducto").textContent = "Editar producto";
    document.getElementById("errorProducto").style.display = "none";
    document.getElementById("fSku").value = p.sku;
    document.getElementById("fSku").disabled = true; // SKU es la clave, no se edita
    document.getElementById("fNombre").value = p.nombre;
    document.getElementById("fMarca").value = p.marca;
    document.getElementById("fPrecio").value = p.precio;
    document.getElementById("fStock").value = p.stock;
    document.getElementById("fDescripcion").value = p.descripcion || "";
    document.getElementById("fImagenArchivo").value = "";
    pintarSpecs(p.specs);
    cargarCategorias().then(function (cats) { poblarSelectCategorias(cats, p.categoria); });
    abrirModal("overlayProducto");
  }

  function mostrarErrorProducto(msg) {
    var el = document.getElementById("errorProducto");
    el.textContent = msg;
    el.style.display = "block";
  }

  function subirImagenSiCorresponde(sku) {
    var archivo = document.getElementById("fImagenArchivo").files[0];
    if (!archivo) return Promise.resolve(null);

    var formData = new FormData();
    formData.append("sku", sku);
    formData.append("imagen", archivo);
    return llamarAPI("../api/productos/imagen.php", { method: "POST", body: formData })
      .then(function (data) { return data.ruta; });
  }

  function initFormProducto() {
    document.getElementById("btnNuevoProducto").addEventListener("click", abrirModalNuevo);

    document.getElementById("formProducto").addEventListener("submit", function (e) {
      e.preventDefault();
      var boton = document.getElementById("btnGuardarProducto");
      boton.disabled = true;

      var sku = document.getElementById("fSku").value.trim();
      var categoriaSelect = document.getElementById("fCategoria");
      var categoriaSlug = categoriaSelect.selectedOptions[0] ? categoriaSelect.selectedOptions[0].getAttribute("data-slug") : "";

      subirImagenSiCorresponde(sku)
        .then(function (rutaImagen) {
          var producto = {
            sku: sku,
            nombre: document.getElementById("fNombre").value.trim(),
            marca: document.getElementById("fMarca").value.trim(),
            categoria: categoriaSelect.value,
            categoriaSlug: categoriaSlug,
            precio: Number(document.getElementById("fPrecio").value),
            stock: Number(document.getElementById("fStock").value),
            descripcion: document.getElementById("fDescripcion").value.trim(),
            specs: leerSpecsDelForm()
          };
          if (rutaImagen) producto.imagen = rutaImagen;

          var url = skuEnEdicion ? "../api/productos/actualizar.php" : "../api/productos/crear.php";
          return llamarAPI(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(producto)
          });
        })
        .then(function () {
          cerrarModal("overlayProducto");
          return recargar();
        })
        .catch(function (err) { mostrarErrorProducto(err.message); })
        .finally(function () { boton.disabled = false; });
    });
  }

  /* --- Stock inline + editar + eliminar (delegado desde la tabla) ------------ */

  function initAccionesTabla() {
    document.getElementById("tablaProductos").addEventListener("click", function (e) {
      var fila = e.target.closest("tr[data-sku]");
      if (!fila) return;
      var sku = fila.getAttribute("data-sku");
      var producto = productosActuales.filter(function (p) { return p.sku === sku; })[0];

      if (e.target.matches("[data-editar]") && producto) {
        abrirModalEditar(producto);
      }

      if (e.target.matches("[data-eliminar]")) {
        if (!window.confirm("¿Eliminar el producto " + sku + "? Esta accion no se puede deshacer.")) return;
        llamarAPI("../api/productos/eliminar.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sku: sku })
        }).then(recargar).catch(function (err) { window.alert(err.message); });
      }

      if (e.target.matches("[data-guardar-stock]")) {
        var input = fila.querySelector("[data-stock-input]");
        llamarAPI("../api/productos/actualizar.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sku: sku, stock: Number(input.value) })
        }).then(recargar).catch(function (err) { window.alert(err.message); });
      }
    });
  }

  /* --- Importar CSV/XML -------------------------------------------------- */

  function initImportar() {
    document.getElementById("btnImportar").addEventListener("click", function () {
      document.getElementById("archivoImportar").value = "";
      document.getElementById("resultadoImportar").innerHTML = "";
      abrirModal("overlayImportar");
    });

    document.getElementById("btnEjecutarImportar").addEventListener("click", function () {
      var archivo = document.getElementById("archivoImportar").files[0];
      var resultado = document.getElementById("resultadoImportar");
      if (!archivo) { resultado.innerHTML = "Selecciona un archivo primero."; return; }

      var esXML = /\.xml$/i.test(archivo.name);
      var endpoint = esXML ? "../api/productos/importar-xml.php" : "../api/productos/importar-csv.php";

      var formData = new FormData();
      formData.append("archivo", archivo);

      resultado.innerHTML = "Importando…";
      llamarAPI(endpoint, { method: "POST", body: formData })
        .then(function (data) {
          var html = "<strong>" + data.creados + "</strong> creados, <strong>" + data.actualizados + "</strong> actualizados.";
          if (data.errores.length) {
            html += "<br><span style=\"color:var(--dl-alerta)\">" + data.errores.length + " fila(s) con error:</span>" +
              "<ul style=\"margin:6px 0 0 18px\">" + data.errores.map(function (e) { return "<li>" + e + "</li>"; }).join("") + "</ul>";
          }
          resultado.innerHTML = html;
          recargar();
        })
        .catch(function (err) { resultado.innerHTML = "<span style=\"color:var(--dl-alerta)\">" + err.message + "</span>"; });
    });
  }

  /* --- Publicar catalogo (BD -> productos.json + fallback) --------------------- */

  function initPublicar() {
    document.getElementById("btnPublicar").addEventListener("click", function () {
      var estado = document.getElementById("publicarEstado");
      var boton = document.getElementById("btnPublicar");
      boton.disabled = true;
      estado.textContent = "Publicando…";

      llamarAPI("../api/productos/publicar.php", { method: "POST" })
        .then(function (data) {
          estado.textContent = data.productos + " productos publicados a las " + new Date(data.publicadoEn).toLocaleTimeString("es-CL");
        })
        .catch(function (err) { estado.textContent = "Error: " + err.message; })
        .finally(function () { boton.disabled = false; });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initBuscador();
    initCerrarModales();
    initSpecs();
    initFormProducto();
    initAccionesTabla();
    initImportar();
    initPublicar();
    recargar().catch(function (err) {
      document.getElementById("tablaProductos").innerHTML =
        "<tr><td colspan=\"8\">Error cargando productos: " + err.message + "</td></tr>";
    });
  });
})();
