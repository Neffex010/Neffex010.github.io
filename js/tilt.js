/* ============================================================
   TILT — 3D + sombra dura desplazada en tarjetas de proyectos
   ------------------------------------------------------------
   - La luz "es" el puntero: la sombra se va en sentido contrario
     (CSS usa --sx/--sy). Sin glow, sin radial-gradient, sin blur.
   - Solo desktop + puntero fino + sin reduced motion.
   - Se activa únicamente cuando la tarjeta ya terminó su reveal
     ([data-reveal] fuera): no pelea con el clip-path ni con el
     translateY inicial del efecto de entrada.
   ============================================================ */
"use strict";

Portfolio.Tilt = class {
  constructor() {
    this.utils = Portfolio.utils;
    this.config = Portfolio.config;
    this.TILT_Y = 14; // grados máx. por eje
    this.TILT_X = 12;
  }

  init() {
    const grid = this.utils.$(".projects__grid");

    if (
      !grid ||
      this.config.reducedMotion ||
      !this.config.desktop.matches ||
      !this.config.fine.matches
    ) {
      return;
    }

    const reset = () =>
      grid
        .querySelectorAll(".is-tilt")
        .forEach((c) => c.classList.remove("is-tilt"));

    document.addEventListener(
      "pointermove",
      (e) => {
        const card = e.target.closest ? e.target.closest(".project-card") : null;
        if (!card || card.hasAttribute("data-reveal")) {
          reset();
          return;
        }
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--rx", `${((0.5 - py) * this.TILT_X).toFixed(2)}deg`);
        card.style.setProperty("--ry", `${((px - 0.5) * this.TILT_Y).toFixed(2)}deg`);
        // Sombra dura en sentido contrario al puntero (luz = puntero)
        const sx = this.utils.clamp(8 + (0.5 - px) * 16, 2, 14);
        const sy = this.utils.clamp(8 + (0.5 - py) * 16, 2, 14);
        card.style.setProperty("--sx", `${sx.toFixed(1)}px`);
        card.style.setProperty("--sy", `${sy.toFixed(1)}px`);
        card.classList.add("is-tilt");
      },
      { passive: true }
    );

    // Al salir de una tarjeta y detener el ratón tampoco llega otro
    // pointermove: hay que soltar el tilt en el propio pointerleave.
    grid.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-tilt");
      });
    });

    // Al salir de la ventana no llega pointermove: sin este reset la
    // última tarjeta quedaba inclinada (y su texto torcido).
    window.addEventListener(
      "pointerout",
      (e) => {
        if (!e.relatedTarget) reset();
      },
      { passive: true }
    );
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) reset();
    });
  }
};