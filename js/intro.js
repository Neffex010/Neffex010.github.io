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
    if (!this.roleEl) return;

    const rolesEs = ["Desarrollo web", "IA aplicada", "Soporte técnico"];
    const rolesEn = ["Web development", "Applied AI", "Technical support"];
    let roles = Portfolio.language && Portfolio.language.current === "en" ? rolesEn : rolesEs;
    let ri = 0, ci = roles[0].length, deleting = true, timer;
    this.roleEl.textContent = roles[0];
    if (this.config.reducedMotion) {
      document.addEventListener("portfolio:languagechange", (event) => {
        this.roleEl.textContent = event.detail.language === "en" ? rolesEn[0] : rolesEs[0];
      });
      return;
    }
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
      timer = setTimeout(step, delay);
    };
    timer = setTimeout(step, 2100);
    document.addEventListener("portfolio:languagechange", (event) => {
      clearTimeout(timer);
      roles = event.detail.language === "en" ? rolesEn : rolesEs;
      ri = 0; ci = roles[0].length; deleting = true;
      this.roleEl.textContent = roles[0];
      timer = setTimeout(step, 2100);
    });
  }

  init() {
    this.body.classList.add("is-loaded");
    this.heroIntro();
  }
};
