/* ==========================================================================
   Dreamlike — hero.js
   Slider del hero: dots + flechas + autoplay con pausa en hover.
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var pista = document.getElementById("heroPista");
    if (!pista) return;

    var slides = pista.querySelectorAll(".dl-hero__slide");
    var dotsWrap = document.getElementById("heroDots");
    var btnPrev = document.getElementById("heroPrev");
    var btnNext = document.getElementById("heroNext");
    var actual = 0;
    var AUTOPLAY_MS = 5500;
    var timer = null;

    // Genera los dots dinamicamente segun cantidad real de slides
    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.className = "dl-hero__dot" + (i === 0 ? " dl-hero__dot--activo" : "");
      dot.setAttribute("aria-label", "Ir al slide " + (i + 1));
      dot.addEventListener("click", function () { ir(i); });
      dotsWrap.appendChild(dot);
    });

    var dots = dotsWrap.querySelectorAll(".dl-hero__dot");

    function ir(i) {
      actual = (i + slides.length) % slides.length;
      pista.style.transform = "translateX(-" + (actual * 100) + "%)";
      dots.forEach(function (d, idx) {
        d.classList.toggle("dl-hero__dot--activo", idx === actual);
      });
    }

    function siguiente() { ir(actual + 1); }
    function anterior() { ir(actual - 1); }

    function iniciarAutoplay() {
      detenerAutoplay();
      timer = window.setInterval(siguiente, AUTOPLAY_MS);
    }
    function detenerAutoplay() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }

    if (btnNext) btnNext.addEventListener("click", function () { siguiente(); iniciarAutoplay(); });
    if (btnPrev) btnPrev.addEventListener("click", function () { anterior(); iniciarAutoplay(); });

    var hero = pista.closest(".dl-hero");
    if (hero) {
      hero.addEventListener("mouseenter", detenerAutoplay);
      hero.addEventListener("mouseleave", iniciarAutoplay);
    }

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      iniciarAutoplay();
    }
  });
})();
