/* ============================================================
   INTRO — entrada del hero
   ------------------------------------------------------------
   Divide el título y arranca el typewriter del rol cuando está
   permitida la animación. El contenido aparece sin pantalla de carga.
   ============================================================ */
"use strict";

Portfolio.Intro = class {
  constructor({ textSplit }) {
    this.config = Portfolio.config;
    this.textSplit = textSplit;
    this.body = document.body;
    this.heroTitle = this.utils.$(".hero__title");
    this.roleEl = this.utils.$("#hero-role");
  }

  heroIntro() {
    if (this.heroTitle) this.textSplit.split(this.heroTitle);
    if (!this.roleEl || this.config.reducedMotion) return;

    const roles = [
      "Desarrollo web",
      "IA aplicada",
      "Soporte técnico",
    ];
    let ri = 0, ci = roles[0].length, deleting = true;
    this.roleEl.textContent = roles[0];
    const step = () => {
      const word = roles[ri];
      if (deleting) ci--;
      else ci++;
      this.roleEl.textContent = word.slice(0, ci);
      let delay = deleting ? 40 : 95;
      if (!deleting && ci === word.length) {
        deleting = true;
        delay = 2100;
      } else if (deleting && ci === 0) {
        deleting = false;
        ri = (ri + 1) % roles.length;
        delay = 400;
      }
      setTimeout(step, delay);
    };
    setTimeout(step, 2100);
  }

  init() {
    this.body.classList.add("is-loaded");
    this.heroIntro();
  }
};
