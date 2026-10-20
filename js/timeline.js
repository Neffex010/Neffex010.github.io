/* ============================================================
   TIMELINE — la línea de Formación se "dibuja" al entrar al viewport
   ============================================================ */
"use strict";

Portfolio.Timeline = class {
  constructor() {
    this.utils = Portfolio.utils;
    this.config = Portfolio.config;
    this.line = this.utils.$(".timeline__line");
  }

  init() {
    if (!this.line) return;

    if (!this.config.reducedMotion && typeof IntersectionObserver !== "undefined") {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      obs.observe(this.line);
    } else {
      // Reduced motion o sin IO: línea visible de inmediato.
      this.line.classList.add("is-in");
    }
  }
};