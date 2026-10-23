/* ============================================================
   INTRO — preloader + entrada del hero
   ------------------------------------------------------------
   - Preloader: overlay fijo con contador (easeOutCubic) y barra.
   - Al terminar hace wipe con clip-path (.is-done) y añade
     body.is-loaded; la animación del hero la dispara el CSS.
   - Después divide el título del hero (TextSplit) y arranca el
     typewriter del rol (#hero-role).
   - Reduced motion: contenido directo, sin preloader.
   ============================================================ */
"use strict";

Portfolio.Intro = class {
  constructor({ textSplit }) {
    this.utils = Portfolio.utils;
    this.config = Portfolio.config;
    this.textSplit = textSplit;
    this.html = document.documentElement;
    this.body = document.body;
    this.heroTitle = this.utils.$(".hero__title");
    this.roleEl = this.utils.$("#hero-role");
  }

  heroIntro() {
    if (this.heroTitle) this.textSplit.split(this.heroTitle);
    if (!this.roleEl || this.config.reducedMotion) return;

    const roles = [
      "Front-end & IA",
      "Integración de IA",
      "Redes y Nube",
      "Back-end .NET",
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
    if (this.config.reducedMotion) {
      this.body.classList.add("is-loaded");
      this.heroIntro();
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "preloader";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML =
      '<div class="preloader__inner">' +
      '<span class="preloader__count">000</span>' +
      '<span class="preloader__label">PORTFOLIO © ' +
      new Date().getFullYear() +
      "</span>" +
      '<span class="preloader__bar"><span class="preloader__bar-fill"></span></span>' +
      "</div>";
    this.body.appendChild(overlay);
    this.html.classList.add("is-loading");

    const count = this.utils.$(".preloader__count", overlay);
    const fill = this.utils.$(".preloader__bar-fill", overlay);
    const total = 600;
    const t0 = performance.now();
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      this.html.classList.remove("is-loading");
      overlay.classList.add("is-done");
      this.body.classList.add("is-loaded");
      this.heroIntro();
      overlay.addEventListener(
        "transitionend",
        () => overlay.remove(),
        { once: true }
      );
      // Red de seguridad: si un transitionend se pierde, se limpia.
      setTimeout(() => {
        if (overlay.isConnected) overlay.remove();
      }, 1200);
    };

    const tick = (now) => {
      const t = Math.min(1, (now - t0) / total);
      const e = 1 - Math.pow(1 - t, 3);
      count.textContent = String(Math.round(e * 100)).padStart(3, "0");
      fill.style.transform = "scaleX(" + e.toFixed(3) + ")";
      if (t < 1) requestAnimationFrame(tick);
      else setTimeout(finish, 200);
    };
    requestAnimationFrame(tick);

    // Garantía dura: jamás quedarse más de 2s.
    setTimeout(() => {
      if (!done) finish();
    }, 2000);
  }
};