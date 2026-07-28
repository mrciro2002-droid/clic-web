/**
 * CLIC — Cámara Universitaria de Libre Competencia
 * Script principal: menú móvil, header sticky, animaciones de scroll y año dinámico.
 */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Menú móvil
     --------------------------------------------------------------------- */
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      nav.classList.toggle("is-open", open);
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Cerrar al elegir un enlace
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    // Cerrar con Escape
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    // Reiniciar estado al pasar a escritorio
    const desktop = window.matchMedia("(min-width: 861px)");
    desktop.addEventListener("change", (event) => {
      if (event.matches) setOpen(false);
    });
  }

  /* ---------------------------------------------------------------------
     Sombra del header al hacer scroll
     --------------------------------------------------------------------- */
  const header = document.getElementById("site-header");

  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Revelado progresivo al entrar en pantalla
     --------------------------------------------------------------------- */
  const revealables = document.querySelectorAll(".reveal");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!revealables.length) {
    // nada que hacer
  } else if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
          el.classList.add("is-visible");
          observer.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );

    revealables.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------------------
     Año actual en el pie de página
     --------------------------------------------------------------------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
