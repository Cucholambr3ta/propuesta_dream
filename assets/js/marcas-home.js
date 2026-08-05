/* ==========================================================================
   Dreamlike — marcas-home.js
   Renderiza el carrusel de "Marcas que trabajamos" en index.html desde las
   marcas reales del catalogo (assets/data/productos.json), en el mismo
   orden en que aparecen — cada tile es un link a marca.html?nombre=X.
   Mismo patron fetch-con-fallback que productos-home.js.
   ========================================================================== */

(function () {
  "use strict";

  function marcasUnicas(productos) {
    var vistas = {};
    var lista = [];
    productos.forEach(function (p) {
      if (!vistas[p.marca]) {
        vistas[p.marca] = true;
        lista.push(p.marca);
      }
    });
    return lista;
  }

  function tileHTML(marca) {
    return (
      '<a class="dl-marca" href="marca.html?nombre=' + encodeURIComponent(marca) + '">' +
        marca +
      "</a>"
    );
  }

  /* Autoplay: desplaza el carrusel de a poco de forma continua, en loop,
     con pausa mientras el mouse esta encima (igual criterio que hero.js).
     Respeta prefers-reduced-motion — sin eso, no se mueve solo. */
  function initAutoplay(carrusel) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Menos de 2 tiles visibles a la vez: no hay nada que desplazar
    if (carrusel.scrollWidth <= carrusel.clientWidth) return;

    var PX_POR_TICK = 1;
    var INTERVALO_MS = 20;
    var timer = null;

    function tick() {
      var maxScroll = carrusel.scrollWidth - carrusel.clientWidth;
      if (carrusel.scrollLeft >= maxScroll - 1) {
        carrusel.scrollTo({ left: 0, behavior: "smooth" }); // loop al inicio
      } else {
        carrusel.scrollLeft += PX_POR_TICK;
      }
    }

    function iniciar() {
      detener();
      carrusel.classList.add("dl-marcas--auto");
      timer = window.setInterval(tick, INTERVALO_MS);
    }
    function detener() {
      if (timer) { window.clearInterval(timer); timer = null; }
      carrusel.classList.remove("dl-marcas--auto");
    }

    carrusel.addEventListener("mouseenter", detener);
    carrusel.addEventListener("mouseleave", iniciar);
    // Tambien pausa si el usuario esta scrolleando con el dedo/mouse a mano
    carrusel.addEventListener("touchstart", detener, { passive: true });
    carrusel.addEventListener("touchend", iniciar, { passive: true });

    iniciar();
  }

  function pintar(productos) {
    var carrusel = document.getElementById("carruselMarcas");
    if (!carrusel) return;
    carrusel.innerHTML = marcasUnicas(productos).map(tileHTML).join("");
    initAutoplay(carrusel);
  }

  document.addEventListener("DOMContentLoaded", function () {
    fetch("assets/data/productos.json")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(pintar)
      .catch(function () {
        if (window.DL_PRODUCTOS_FALLBACK) pintar(window.DL_PRODUCTOS_FALLBACK);
      });
  });
})();
