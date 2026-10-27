/* ============================================================
   APP — bootstrap: instancia y conecta todos los módulos POO.
   ------------------------------------------------------------
   Orden de carga en index.html (scripts clásicos, sin módulos
   ES para funcionar también vía file://):

   core → theme → smooth → nav → contact → split → reveal →
   marquee → motion → cursor → tilt → progress → timeline →
   scramble → intro → app

   Cada clase define un único init(); esta clase solo las
   instancia en el orden correcto según sus dependencias.
   ============================================================ */
"use strict";

Portfolio.App = class {
  init() {
    const { reducedMotion, desktop, fine } = Portfolio.config;

    // Tema (clasificado primero: resuelve dataset.theme + aria-pressed).
    const theme = new Portfolio.Theme();
    theme.init();

    // Smooth scroll solo en desktop con puntero fino (mismo gate).
    const smooth =
      !reducedMotion && desktop.matches && fine.matches
        ? new Portfolio.SmoothScroll()
        : null;
    if (smooth) smooth.init();

    const nav = new Portfolio.Nav({ smooth });
    nav.init();

    const contact = new Portfolio.Contact();
    contact.init();

    // TextSplit es compartido por Reveal (títulos de sección) e
    // Intro (título del hero).
    const textSplit = new Portfolio.TextSplit();

    const reveal = new Portfolio.Reveal({ textSplit });
    reveal.init();

    const motion = new Portfolio.Motion({ smooth });
    motion.init();

    const cursor = new Portfolio.Cursor();
    cursor.init();

    const tilt = new Portfolio.Tilt();
    tilt.init();

    const progress = new Portfolio.ScrollProgress();
    progress.init();

    const timeline = new Portfolio.Timeline();
    timeline.init();

    const scramble = new Portfolio.Scramble();
    scramble.init();

    const intro = new Portfolio.Intro({ textSplit });
    intro.init();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const app = new Portfolio.App();
  app.init();
});