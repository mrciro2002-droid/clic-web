/**
 * CLIC — Cámara Universitaria de Libre Competencia
 *
 * Script principal. Sin dependencias, sin build.
 *
 * Hace seis cosas:
 *   1. Menú móvil accesible.
 *   2. Encabezado: sombra, compactado y barra de progreso de lectura.
 *   3. Revelado escalonado de secciones al entrar en pantalla.
 *   4. Contadores animados en las cifras del hero.
 *   5. Subrayado de la sección activa en la navegación.
 *   6. Parallax muy leve del halo del hero, y año dinámico en el pie.
 *
 * Principios que respeta todo lo de abajo:
 *   - `prefers-reduced-motion` desactiva cualquier movimiento, incluso si se
 *     activa con la página ya abierta.
 *   - Solo se tocan `transform` y `opacity`; nada de top/left/height.
 *   - El contenido visible es el estado por defecto (ver sección 12 del CSS).
 *   - Un único bucle de requestAnimationFrame atiende todo el scroll.
 */
(function () {
  "use strict";

  var root = document.documentElement;
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var desktopQuery = window.matchMedia("(min-width: 861px)");

  /** ¿La persona pidió menos movimiento? Se consulta en vivo, no se cachea. */
  function reduced() {
    return motionQuery.matches;
  }

  /* =======================================================================
     1. Menú móvil
     ======================================================================= */
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("primary-nav");
  var menuOpen = false;

  if (toggle && nav) {
    var setOpen = function (open) {
      menuOpen = open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      nav.classList.toggle("is-open", open);
    };

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Cerrar al elegir un enlace
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    // Cerrar con Escape
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    // Reiniciar estado al pasar a escritorio
    desktopQuery.addEventListener("change", function (event) {
      if (event.matches) setOpen(false);
    });
  }

  /* =======================================================================
     2. Encabezado: alto real, sombra, compactado y progreso
     ======================================================================= */
  var header = document.getElementById("site-header");
  var hero = document.querySelector(".hero");
  var progressBar = document.querySelector(".scroll-progress__bar");

  /**
   * Publica el alto real del encabezado en --header-h. De ahí lo leen
   * `scroll-padding-top` (para que los anclajes no queden tapados por el
   * header fijo) y el panel del menú móvil.
   */
  var lastHeaderHeight = 0;

  function syncHeaderHeight() {
    if (!header) return;
    var h = Math.round(header.getBoundingClientRect().height);
    // Solo se escribe si cambió: evita recalcular estilos de más y cerrar el
    // círculo con el ResizeObserver que llama a esta misma función.
    if (h > 0 && h !== lastHeaderHeight) {
      lastHeaderHeight = h;
      root.style.setProperty("--header-h", h + "px");
    }
  }

  /* Medidas que solo cambian al redimensionar. Se cachean para no forzar al
     navegador a recalcular el layout en cada fotograma de scroll. */
  var maxScroll = 0;
  var heroBottom = 0;

  function measure() {
    maxScroll = Math.max(root.scrollHeight - window.innerHeight, 0);
    heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 0;
    syncHeaderHeight();
  }

  var parallaxOn = false;

  function updateOnScroll() {
    var y = window.scrollY || window.pageYOffset || 0;

    if (header) {
      header.classList.toggle("is-stuck", y > 8);
      // El compactado solo aplica en escritorio (ver nota en el CSS).
      header.classList.toggle(
        "is-compact",
        desktopQuery.matches && !menuOpen && y > 140
      );
    }

    // Barra de progreso: un scaleX, sin tocar el ancho. La variable se escribe
    // en la propia barra, no en :root, para no invalidar el estilo de toda la
    // página en cada fotograma.
    if (progressBar) {
      progressBar.style.setProperty(
        "--scroll-progress",
        maxScroll > 0 ? Math.min(y / maxScroll, 1).toFixed(4) : "0"
      );
    }

    // Parallax del halo: 8% de la velocidad del scroll y solo mientras el hero
    // sigue en pantalla. Más que esto se nota barato.
    if (parallaxOn && hero && y < heroBottom + 200) {
      hero.style.setProperty("--parallax", (y * 0.08).toFixed(1) + "px");
    }
  }

  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      updateOnScroll();
    });
  }

  function refreshParallax() {
    parallaxOn = !reduced() && window.matchMedia("(min-width: 760px)").matches;
    if (!parallaxOn && hero) hero.style.removeProperty("--parallax");
  }

  measure();
  refreshParallax();
  updateOnScroll();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    measure();
    refreshParallax();
    updateOnScroll();
  });
  window.addEventListener("load", measure);

  // El alto del encabezado cambia al compactarse: mantenerlo sincronizado.
  if (header && "ResizeObserver" in window) {
    new ResizeObserver(syncHeaderHeight).observe(header);
  }

  /* =======================================================================
     3. Revelado escalonado al entrar en pantalla
     ======================================================================= */
  var revealables = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function showAllReveals() {
    revealables.forEach(function (el) {
      el.style.removeProperty("--reveal-delay");
      el.classList.add("is-visible");
    });
  }

  /**
   * Reparte el retardo por grupos: los elementos que comparten padre —las
   * tarjetas de una grilla, los bloques de una lista— entran uno tras otro.
   * Un encabezado suelto no tiene hermanos, así que entra sin retardo.
   */
  function assignStagger() {
    var counts = new Map();
    revealables.forEach(function (el) {
      var parent = el.parentElement;
      var index = counts.get(parent) || 0;
      counts.set(parent, index + 1);
      el.style.setProperty("--reveal-delay", Math.min(index * 85, 340) + "ms");
    });
  }

  var revealObserver = null;

  if (revealables.length) {
    if (reduced() || !("IntersectionObserver" in window)) {
      showAllReveals();
    } else {
      assignStagger();

      revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.1 }
      );

      revealables.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  /* =======================================================================
     4. Contadores del hero
     ======================================================================= */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  var formatter = new Intl.NumberFormat("es-CL");

  function renderCount(el, value) {
    var decimals = parseInt(el.getAttribute("data-count-decimals") || "0", 10);
    var text = decimals
      ? value.toFixed(decimals).replace(".", ",")
      : formatter.format(Math.round(value));
    el.textContent =
      (el.getAttribute("data-count-prefix") || "") +
      text +
      (el.getAttribute("data-count-suffix") || "");
  }

  function finishCounter(el) {
    renderCount(el, parseFloat(el.getAttribute("data-count")));
  }

  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;

    if (reduced()) {
      renderCount(el, target);
      return;
    }

    var duration = parseInt(el.getAttribute("data-count-duration") || "1200", 10);
    var start = null;

    var step = function (now) {
      if (start === null) start = now;
      var t = Math.min((now - start) / duration, 1);
      // easeOutCubic: sube rápido y se posa suave, sin pasarse del objetivo.
      renderCount(el, target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }

  if (counters.length) {
    if (reduced() || !("IntersectionObserver" in window)) {
      counters.forEach(finishCounter);
    } else {
      counters.forEach(function (el) {
        renderCount(el, 0);
      });

      var countObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            countObserver.unobserve(entry.target);
            runCounter(entry.target);
          });
        },
        { threshold: 0.6 }
      );

      counters.forEach(function (el) {
        countObserver.observe(el);
      });
    }
  }

  /* =======================================================================
     5. Sección activa en la navegación
     ======================================================================= */
  var spy = [];

  if (nav) {
    Array.prototype.forEach.call(nav.querySelectorAll('a[href^="#"]'), function (link) {
      if (link.classList.contains("btn")) return;
      var id = link.getAttribute("href");
      if (!id || id.length < 2) return;
      var section = document.querySelector(id);
      if (section) spy.push({ link: link, section: section });
    });
  }

  if (spy.length && "IntersectionObserver" in window) {
    var onScreen = [];

    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var i = onScreen.indexOf(entry.target);
          if (entry.isIntersecting && i === -1) onScreen.push(entry.target);
          if (!entry.isIntersecting && i !== -1) onScreen.splice(i, 1);
        });

        // Gana la primera sección visible en orden de documento.
        var current = null;
        spy.forEach(function (item) {
          if (!current && onScreen.indexOf(item.section) !== -1) current = item;
        });

        spy.forEach(function (item) {
          item.link.classList.toggle("is-current", item === current);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    spy.forEach(function (item) {
      spyObserver.observe(item.section);
    });
  }

  /* =======================================================================
     6. Año en el pie de página
     ======================================================================= */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* =======================================================================
     Si la preferencia de movimiento cambia con la página ya abierta
     ======================================================================= */
  motionQuery.addEventListener("change", function () {
    refreshParallax();
    if (reduced()) {
      if (revealObserver) revealObserver.disconnect();
      showAllReveals();
      counters.forEach(finishCounter);
    }
    updateOnScroll();
  });
})();
